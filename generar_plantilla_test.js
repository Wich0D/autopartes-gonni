require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const ExcelJS = require('exceljs');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Faltan las variables de entorno de Supabase.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function generarPlantilla() {
  console.log("Obteniendo datos de Supabase...");
  
  // Obtener Marcas y Categorias
  const [marcasRes, categoriasRes] = await Promise.all([
    supabase.from('marcas').select('id, nombre_marca').order('nombre_marca'),
    supabase.from('categorias').select('id, nombre_categoria').order('nombre_categoria')
  ]);

  if (marcasRes.error) {
    console.error("Error obteniendo marcas:", marcasRes.error);
    process.exit(1);
  }
  if (categoriasRes.error) {
    console.error("Error obteniendo categorias:", categoriasRes.error);
    process.exit(1);
  }

  const marcas = marcasRes.data.map(m => m.nombre_marca);
  const categorias = categoriasRes.data.map(c => c.nombre_categoria);

  console.log(`Se obtuvieron ${marcas.length} marcas y ${categorias.length} categorías.`);

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

  // Configurar Hoja Principal (Productos)
  
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
    { header: 'Código Proveedor', key: 'codigo_proveedor', width: 25 },
    { header: 'Descripción', key: 'descripcion', width: 40 },
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
  // Asumimos que el usuario llenará hasta 1000 filas
  const cantFilas = 1000;
  for (let i = 4; i <= cantFilas + 3; i++) {
    // Columna H (Marca) = 8
    sheet.getCell(i, 8).dataValidation = {
      type: 'list',
      allowBlank: true,
      // Referenciamos a la hoja DatosOcultos, rango A2:Ax
      formulae: [`'DatosOcultos'!$A$2:$A$${marcas.length + 1}`],
      showErrorMessage: false // Permitimos escribir valores nuevos
    };

    // Columna I (Categoría) = 9
    sheet.getCell(i, 9).dataValidation = {
      type: 'list',
      allowBlank: true,
      formulae: [`'DatosOcultos'!$B$2:$B$${categorias.length + 1}`],
      showErrorMessage: false // Permitimos escribir valores nuevos
    };
  }

  // Escribir el archivo
  const fileName = 'plantilla_productos.xlsx';
  await workbook.xlsx.writeFile(fileName);
  console.log(`\n¡Éxito! Plantilla generada como: ${fileName}`);
}

generarPlantilla().catch(console.error);
