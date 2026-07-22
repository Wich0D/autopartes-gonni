import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';
import ExcelJS from 'exceljs';

export async function GET() {
  try {
    // Obtener Marcas y Categorias
    const [marcasRes, categoriasRes] = await Promise.all([
      supabase.from('marcas').select('id, nombre_marca').order('nombre_marca'),
      supabase.from('categorias').select('id, nombre_categoria').order('nombre_categoria')
    ]);

    if (marcasRes.error) throw marcasRes.error;
    if (categoriasRes.error) throw categoriasRes.error;

    const marcas = marcasRes.data.map(m => m.nombre_marca);
    const categorias = categoriasRes.data.map(c => c.nombre_categoria);

    // Crear el workbook
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Admin Gonni';
    workbook.created = new Date();

    // Hoja principal
    const sheet = workbook.addWorksheet('Productos', {
      properties: { tabColor: { argb: 'FF00FFFF' } }
    });

    // Hoja oculta para validaciones (Listas)
    const sheetDatos = workbook.addWorksheet('DatosOcultos', { state: 'hidden' });

    // Rellenar hoja oculta con las listas
    sheetDatos.getColumn('A').values = ['Listado de Marcas', ...marcas];
    sheetDatos.getColumn('B').values = ['Listado de Categorías', ...categorias];

    // Agregar instrucciones en la parte superior
    sheet.mergeCells('A1:I2');
    const instructionsCell = sheet.getCell('A1');
    instructionsCell.value = "INSTRUCCIONES IMPORTANTES:\n1. NO modifiques, elimines ni cambies de nombre los encabezados de las columnas (Fila 3).\n2. Si no tienes el dato para una columna opcional, simplemente déjala vacía.\n3. Las columnas obligatorias están marcadas con un asterisco (*).\n4. Si la Marca o Categoría no está en la lista, puedes escribirla nueva pero TOTALMENTE EN MAYÚSCULAS. Si la usas en varias filas, cópiala y pégala para evitar errores.\n5. ADVERTENCIA: Ten cuidado con espacios en blanco extras y saltos de línea. Asegúrate de no escribir de manera diferente un mismo dato (Ejemplo: NISSAN, Nissan).";
    instructionsCell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
    instructionsCell.font = { name: 'Arial', size: 9, bold: true, color: { argb: 'FF333333' } };
    instructionsCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFFF2CC' } // Amarillo suave
    };

    // Fila de encabezados (Fila 3)
    const columns = [
      { header: 'Código Original *', key: 'codigo_original', width: 25 },
      { header: 'Código Proveedor *', key: 'codigo_proveedor', width: 25 },
      { header: 'Descripción *', key: 'descripcion', width: 40 },
      { header: 'Modelo / Vehículo *', key: 'modelo', width: 30 },
      { header: 'Año Inicio', key: 'anio_inicio', width: 12 },
      { header: 'Año Fin', key: 'anio_fin', width: 12 },
      { header: 'Precio Proveedor', key: 'precio_proveedor', width: 20 },
      { header: 'Marca *', key: 'marca', width: 25 },
      { header: 'Categoría *', key: 'categoria', width: 25 }
    ];

    sheet.getRow(3).values = columns.map(col => col.header);
    
    // Ajustar anchos de columna
    columns.forEach((col, i) => {
      sheet.getColumn(i + 1).width = col.width;
    });

    // Estilos de la fila de encabezados
    const headerRow = sheet.getRow(3);
    headerRow.height = 30;
    headerRow.eachCell((cell) => {
      cell.font = {
        bold: true,
        color: { argb: 'FF000000' },
        size: 11
      };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF00FFFF' } // Fondo Cyan
      };
      cell.alignment = {
        vertical: 'middle',
        horizontal: 'center'
      };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });

    // Congelar la fila de encabezados
    sheet.views = [
      { state: 'frozen', xSplit: 0, ySplit: 3 }
    ];

    // Aplicar validación de datos a las columnas de Marca y Categoría
    const cantFilas = 1000;
    for (let i = 4; i <= cantFilas + 3; i++) {
      // Columna H (Marca) = 8
      sheet.getCell(i, 8).dataValidation = {
        type: 'list',
        allowBlank: true,
        formulae: [`'DatosOcultos'!$A$2:$A$${marcas.length + 1}`],
        showErrorMessage: false
      };

      // Columna I (Categoría) = 9
      sheet.getCell(i, 9).dataValidation = {
        type: 'list',
        allowBlank: true,
        formulae: [`'DatosOcultos'!$B$2:$B$${categorias.length + 1}`],
        showErrorMessage: false
      };
    }

    // Generar buffer
    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="plantilla_productos.xlsx"'
      }
    });
  } catch (error) {
    console.error('Error generando plantilla:', error);
    return NextResponse.json({ error: 'Error interno al generar la plantilla.' }, { status: 500 });
  }
}
