import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import ExcelJS from 'exceljs';

export async function POST(request) {
  try {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader ? authHeader.replace('Bearer ', '') : '';

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
        global: {
            headers: {
                ...(token && { Authorization: `Bearer ${token}` })
            }
        }
    });

    const formData = await request.formData();
    
    const file = formData.get('file');
    const isNewProvider = formData.get('isNewProvider') === 'true';
    let providerId = formData.get('selectedProvider');

    if (!file) {
      return NextResponse.json({ error: 'No se recibió ningún archivo.' }, { status: 400 });
    }

    // 1. Manejar el proveedor
    if (isNewProvider) {
      const newName = formData.get('newProviderName');
      const newWebsite = formData.get('providerWebsite') || null;
      
      if (!newName) {
         return NextResponse.json({ error: 'Falta el nombre del nuevo proveedor.' }, { status: 400 });
      }

      // Insertar nuevo proveedor
      const { data: provData, error: provError } = await supabase
        .from('proveedores')
        .insert([{ nombre_proveedor: newName, sitio_web: newWebsite }])
        .select()
        .single();

      if (provError) {
        throw new Error(`Error al crear proveedor: ${provError.message}`);
      }
      providerId = provData.id;
    } else {
      if (!providerId) {
        return NextResponse.json({ error: 'Debe seleccionar un proveedor existente.' }, { status: 400 });
      }
      providerId = parseInt(providerId, 10);
    }

    // 2. Leer archivo Excel
    const buffer = Buffer.from(await file.arrayBuffer());
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);
    const sheet = workbook.getWorksheet('Productos') || workbook.worksheets[0];
    
    if (!sheet) {
      return NextResponse.json({ error: 'No se encontró la hoja de cálculo en el archivo.' }, { status: 400 });
    }

    // 3. Obtener mapeo de Marcas y Categorías
    const [
        { data: marcasData },
        { data: categoriasData },
        { data: productosData }
    ] = await Promise.all([
        supabase.from('marcas').select('id, nombre_marca'),
        supabase.from('categorias').select('id, nombre_categoria'),
        supabase.from('productos').select('codigo_original') // Para saber cuáles existen
    ]);

    // Mapas para búsqueda rápida (en mayúsculas para evitar problemas de case)
    const marcasMap = new Map((marcasData || []).map(m => [m.nombre_marca.trim().toUpperCase(), m.id]));
    const categoriasMap = new Map((categoriasData || []).map(c => [c.nombre_categoria.trim().toUpperCase(), c.id]));
    
    // Set de códigos originales que ya existen en BD
    const existingCodes = new Set((productosData || []).filter(p => p.codigo_original).map(p => p.codigo_original.trim().toUpperCase()));

    // 4. Procesar filas
    const rowsToInsert = [];
    const errorRows = [];
    let rowNumber = 4;
    
    // Función auxiliar para insertar marca/categoría al vuelo si no existe
    const getOrInsertMarca = async (nombre) => {
        if (!nombre) return null;
        const key = nombre.trim().toUpperCase();
        if (marcasMap.has(key)) return marcasMap.get(key);
        
        // Insertar en Supabase
        const { data, error } = await supabase.from('marcas').insert([{ nombre_marca: nombre.trim() }]).select().single();
        if (error) throw new Error(`Error al crear marca "${nombre}": ${error.message}`);
        
        marcasMap.set(key, data.id);
        return data.id;
    };

    const getOrInsertCategoria = async (nombre) => {
        if (!nombre) return null;
        const key = nombre.trim().toUpperCase();
        if (categoriasMap.has(key)) return categoriasMap.get(key);
        
        // Insertar en Supabase
        const { data, error } = await supabase.from('categorias').insert([{ nombre_categoria: nombre.trim() }]).select().single();
        if (error) throw new Error(`Error al crear categoría "${nombre}": ${error.message}`);
        
        categoriasMap.set(key, data.id);
        return data.id;
    };

    while (true) {
        const row = sheet.getRow(rowNumber);
        
        // Guardar valores originales de las columnas 1 al 9 por si hay error
        const originalValues = [];
        for (let i = 1; i <= 9; i++) {
            originalValues.push(row.getCell(i).value);
        }

        const codOrig = row.getCell(1).text; 
        if (!codOrig || codOrig.trim() === '') {
            break; // Fin de datos
        }

        try {
            const codigo_original = codOrig.trim();
            const codigo_proveedor = row.getCell(2).text?.trim() || null;
            const descripcion = row.getCell(3).text?.trim() || null;
            const modelo = row.getCell(4).text?.trim();
            
            const anioInText = row.getCell(5).text?.trim();
            const anio_inicio = anioInText ? parseInt(anioInText, 10) : null;
            
            const anioFinText = row.getCell(6).text?.trim();
            const anio_final = anioFinText ? parseInt(anioFinText, 10) : null;
            
            const precioProvValue = row.getCell(7).value;
            let precio_proveedor = null;
            let precio = null;
            if (precioProvValue != null) {
                precio_proveedor = parseFloat(precioProvValue.toString().replace(/[^0-9.-]+/g,""));
                if (!isNaN(precio_proveedor)) {
                    // Cálculo de precio de venta: IVA (16%), Markup (90%), Redondeo a decena más cercana
                    const basePrice = precio_proveedor * 1.16;
                    const markupPrice = basePrice * 1.90;
                    precio = Math.round(markupPrice / 10) * 10;
                }
            }

            const marcaText = row.getCell(8).text?.trim();
            const categoriaText = row.getCell(9).text?.trim();

            if (!codigo_proveedor) throw new Error("Falta el Código del Proveedor.");
            if (!descripcion) throw new Error("Falta la Descripción.");
            if (!modelo) throw new Error("Falta el Modelo.");
            if (!marcaText) throw new Error("Falta la Marca.");
            if (!categoriaText) throw new Error("Falta la Categoría.");

            // Obtener IDs de marca y categoría (creándolos si son nuevos)
            const id_marca = await getOrInsertMarca(marcaText);
            const id_categoria = await getOrInsertCategoria(categoriaText);

            // Lógica de Visibilidad
            const keyCodOrig = codigo_original.toUpperCase();
            let visible = true;
            if (existingCodes.has(keyCodOrig)) {
                visible = false;
            } else {
                existingCodes.add(keyCodOrig);
            }

            rowsToInsert.push({
                codigo_original,
                codigo_proveedor,
                descripcion,
                modelo,
                anio_inicio,
                anio_final,
                precio_proveedor,
                id_marca,
                id_categoria,
                id_proveedor: providerId,
                visible_en_web: visible,
                precio: precio,
                imagen: null
            });
        } catch (e) {
            errorRows.push({
                values: originalValues,
                error: e.message
            });
        }

        rowNumber++;
    }

    if (rowsToInsert.length === 0 && errorRows.length === 0) {
      return NextResponse.json({ error: 'El archivo Excel no contiene productos.' }, { status: 400 });
    }

    // 5. Inserción Masiva de filas exitosas
    if (rowsToInsert.length > 0) {
        const { error: insertError } = await supabase
          .from('productos')
          .insert(rowsToInsert);

        if (insertError) {
          throw new Error(`Error al insertar productos: ${insertError.message}`);
        }
    }

    // 6. Generar archivo de errores si los hay
    let errorBase64 = null;
    if (errorRows.length > 0) {
        const errorWorkbook = new ExcelJS.Workbook();
        const errorSheet = errorWorkbook.addWorksheet('Productos');

        // Recrear instrucciones y cabeceras
        errorSheet.mergeCells('A1', 'I1');
        const instructionCell1 = errorSheet.getCell('A1');
        instructionCell1.value = 'Instrucciones: NO modificar el nombre de las columnas. Las columnas con * son OBLIGATORIAS. Si un campo no es obligatorio, déjalo vacío.';
        
        errorSheet.mergeCells('A2', 'I2');
        const instructionCell2 = errorSheet.getCell('A2');
        instructionCell2.value = 'Ten cuidado con espacios en blanco adicionales o saltos de línea al inicio o final de los textos (ej. "NISSAN" vs "NISSAN "). Si la marca o categoría no existe, escríbela en MAYÚSCULAS.';

        const columns = [
            { header: 'Código Original *', key: 'codigo_original', width: 25 },
            { header: 'Código Proveedor *', key: 'codigo_proveedor', width: 25 },
            { header: 'Descripción *', key: 'descripcion', width: 40 },
            { header: 'Modelo / Vehículo *', key: 'modelo', width: 30 },
            { header: 'Año Inicio', key: 'anio_inicio', width: 12 },
            { header: 'Año Fin', key: 'anio_fin', width: 12 },
            { header: 'Precio Proveedor', key: 'precio_proveedor', width: 20 },
            { header: 'Marca *', key: 'marca', width: 25 },
            { header: 'Categoría *', key: 'categoria', width: 25 },
            { header: 'Errores Encontrados (Corregir)', key: 'errores', width: 40 }
        ];

        const headerRow = errorSheet.getRow(3);
        headerRow.values = columns.map(c => c.header);
        
        errorSheet.columns = columns;

        // Estilos para cabeceras
        headerRow.eachCell((cell, colNumber) => {
            cell.font = { bold: true };
            if (colNumber <= 9) {
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF00FFFF' } }; // Cyan original
            } else {
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFCCCC' } }; // Rojo claro para errores
            }
        });

        // Escribir filas con error
        errorRows.forEach(item => {
            const newRow = errorSheet.addRow([...item.values, item.error]);
            const errorCell = newRow.getCell(10);
            errorCell.font = { color: { argb: 'FFCC0000' }, bold: true }; // Texto rojo
        });

        // Configurar validación de datos igual que la plantilla (opcional, para Marca y Categoria)
        // Para simplificar y dado que el archivo es de corrección, la omitimos en el archivo de error o podríamos añadirla si leemos Marcas/Categorias otra vez, pero no es estrictamente necesaria.
        
        const buffer = await errorWorkbook.xlsx.writeBuffer();
        errorBase64 = buffer.toString('base64');
    }

    return NextResponse.json({ 
        success: true, 
        totalProcesados: rowsToInsert.length + errorRows.length,
        insertados: rowsToInsert.length,
        errores: errorRows.length,
        errorBase64: errorBase64,
        newProviderId: isNewProvider ? providerId : null
    }, { status: 200 });

  } catch (error) {
    console.error('Error al procesar el Excel:', error);
    return NextResponse.json({ error: error.message || 'Error interno al procesar el archivo.' }, { status: 500 });
  }
}
