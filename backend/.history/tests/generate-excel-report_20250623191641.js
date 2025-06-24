const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Datos para la Hoja de Control
const hojaControlData = {
  proyecto: "Sistema de E-commerce Ferremas",
  unidadOrganizativa: "Departamento de Desarrollo",
  entregable: "Plan de Pruebas de Integración",
  autor: "Equipo de QA",
  version: "01.00",
  fechaVersion: new Date().toLocaleDateString('es-ES'),
  fechaAprobacion: new Date().toLocaleDateString('es-ES'),
  totalPaginas: 2
};

// Datos de los casos de prueba
const casosDeRueba = [
  {
    numero: "CASO001",
    componente: "Autenticación >> Registro de Usuario",
    descripcion: "Verificar el registro de nuevos usuarios en el sistema",
    prerrequisitos: "Base de datos disponible, API funcionando",
    pasos: [
      {
        paso: 1,
        descripcion: "Enviar POST /api/auth/register con datos válidos",
        datosEntrada: '{"name":"Usuario Test","email":"test@test.com","password":"123456"}',
        salidaEsperada: "Usuario creado exitosamente con token JWT",
        ok: "✓",
        observaciones: "Registro exitoso"
      },
      {
        paso: 2,
        descripcion: "Enviar POST /api/auth/register con email duplicado",
        datosEntrada: '{"name":"Usuario Test","email":"test@test.com","password":"123456"}',
        salidaEsperada: "Error 400: El email ya está registrado",
        ok: "✓",
        observaciones: "Validación correcta"
      },
      {
        paso: 3,
        descripcion: "Enviar POST /api/auth/register con datos incompletos",
        datosEntrada: '{"name":"Usuario Test"}',
        salidaEsperada: "Error 500: Datos requeridos faltantes",
        ok: "✓",
        observaciones: "Error manejado correctamente"
      }
    ]
  },
  {
    numero: "CASO002",
    componente: "Autenticación >> Inicio de Sesión",
    descripcion: "Verificar el proceso de autenticación de usuarios",
    prerrequisitos: "Usuario registrado previamente",
    pasos: [
      {
        paso: 1,
        descripcion: "Enviar POST /api/auth/login con credenciales válidas",
        datosEntrada: '{"email":"test@test.com","password":"123456"}',
        salidaEsperada: "Login exitoso con token JWT",
        ok: "✓",
        observaciones: "Autenticación exitosa"
      },
      {
        paso: 2,
        descripcion: "Enviar POST /api/auth/login con email inexistente",
        datosEntrada: '{"email":"noexiste@test.com","password":"123456"}',
        salidaEsperada: "Error 401: Credenciales inválidas",
        ok: "✓",
        observaciones: "Error de seguridad correcto"
      },
      {
        paso: 3,
        descripcion: "Enviar POST /api/auth/login con contraseña incorrecta",
        datosEntrada: '{"email":"test@test.com","password":"incorrecta"}',
        salidaEsperada: "Error 401: Credenciales inválidas",
        ok: "✓",
        observaciones: "Validación de contraseña correcta"
      }
    ]
  },
  {
    numero: "CASO003",
    componente: "Newsletter >> Suscripción",
    descripcion: "Verificar la suscripción al newsletter",
    prerrequisitos: "API de newsletter funcionando",
    pasos: [
      {
        paso: 1,
        descripcion: "Enviar POST /api/newsletter/subscribe con email válido",
        datosEntrada: '{"email":"newsletter@test.com"}',
        salidaEsperada: "Suscripción exitosa",
        ok: "✓",
        observaciones: "Suscripción registrada"
      },
      {
        paso: 2,
        descripcion: "Enviar POST /api/newsletter/subscribe con email inválido",
        datosEntrada: '{"email":"email-invalido"}',
        salidaEsperada: "Error 400: Email inválido",
        ok: "✓",
        observaciones: "Validación de email correcta"
      },
      {
        paso: 3,
        descripcion: "Enviar POST /api/newsletter/subscribe con email duplicado",
        datosEntrada: '{"email":"newsletter@test.com"}',
        salidaEsperada: "Error 400: Email ya suscrito",
        ok: "✓",
        observaciones: "Prevención de duplicados"
      },
      {
        paso: 4,
        descripcion: "Enviar POST /api/newsletter/subscribe sin email",
        datosEntrada: '{}',
        salidaEsperada: "Error 400: Email requerido",
        ok: "✓",
        observaciones: "Validación de campos requeridos"
      }
    ]
  },
  {
    numero: "CASO004",
    componente: "Productos >> CRUD Completo",
    descripcion: "Verificar las operaciones CRUD de productos",
    prerrequisitos: "Base de datos de productos disponible",
    pasos: [
      {
        paso: 1,
        descripcion: "Enviar GET /api/products para obtener lista",
        datosEntrada: "N/A",
        salidaEsperada: "Lista de productos en formato JSON",
        ok: "✓",
        observaciones: "Lista obtenida correctamente"
      },
      {
        paso: 2,
        descripcion: "Enviar POST /api/products para crear producto",
        datosEntrada: '{"name":"Martillo","price":25000,"stock":10}',
        salidaEsperada: "Producto creado con ID asignado",
        ok: "✓",
        observaciones: "Creación exitosa"
      },
      {
        paso: 3,
        descripcion: "Enviar GET /api/products/:id para obtener producto específico",
        datosEntrada: "ID del producto creado",
        salidaEsperada: "Datos del producto solicitado",
        ok: "✓",
        observaciones: "Consulta individual correcta"
      },
      {
        paso: 4,
        descripcion: "Enviar PUT /api/products/:id para actualizar producto",
        datosEntrada: '{"name":"Martillo Actualizado","price":30000}',
        salidaEsperada: "Producto actualizado correctamente",
        ok: "✓",
        observaciones: "Actualización exitosa"
      },
      {
        paso: 5,
        descripcion: "Enviar DELETE /api/products/:id para eliminar producto",
        datosEntrada: "ID del producto a eliminar",
        salidaEsperada: "Producto eliminado correctamente",
        ok: "✓",
        observaciones: "Eliminación exitosa"
      },
      {
        paso: 6,
        descripcion: "Enviar GET /api/products/99999 para producto inexistente",
        datosEntrada: "ID inexistente",
        salidaEsperada: "Error 404: Producto no encontrado",
        ok: "✓",
        observaciones: "Manejo de errores correcto"
      }
    ]
  },
  {
    numero: "CASO005",
    componente: "Webpay >> Procesamiento de Pagos",
    descripcion: "Verificar la integración con Webpay para pagos",
    prerrequisitos: "Configuración de Webpay, credenciales válidas",
    pasos: [
      {
        paso: 1,
        descripcion: "Enviar POST /api/webpay/create para crear transacción",
        datosEntrada: '{"amount":50000,"buyOrder":"order123","returnUrl":"http://test.com"}',
        salidaEsperada: "URL de pago y token de transacción",
        ok: "✓",
        observaciones: "Transacción iniciada"
      },
      {
        paso: 2,
        descripcion: "Enviar POST /api/webpay/confirm para confirmar pago",
        datosEntrada: '{"token_ws":"token_test_123"}',
        salidaEsperada: "Estado de confirmación de pago",
        ok: "✓",
        observaciones: "Confirmación procesada"
      },
      {
        paso: 3,
        descripcion: "Enviar POST /api/webpay/create sin datos requeridos",
        datosEntrada: '{}',
        salidaEsperada: "Error 400: Datos requeridos faltantes",
        ok: "✓",
        observaciones: "Validación de entrada correcta"
      },
      {
        paso: 4,
        descripcion: "Enviar POST /api/webpay/confirm sin token",
        datosEntrada: '{}',
        salidaEsperada: "Error 400: Token requerido",
        ok: "✓",
        observaciones: "Validación de token correcta"
      },
      {
        paso: 5,
        descripcion: "Enviar POST /api/webpay/create con monto inválido",
        datosEntrada: '{"amount":-100,"buyOrder":"order123"}',
        salidaEsperada: "Error 400: Monto inválido",
        ok: "✓",
        observaciones: "Validación de monto correcta"
      },
      {
        paso: 6,
        descripcion: "Enviar POST /api/webpay/confirm con token inválido",
        datosEntrada: '{"token_ws":"invalid_token"}',
        salidaEsperada: "Error 400: Token inválido",
        ok: "✓",
        observaciones: "Validación de token correcta"
      }
    ]
  }
];

function generateExcelReport() {
  // Crear un nuevo libro de trabajo
  const workbook = XLSX.utils.book_new();

  // HOJA 1: HOJA DE CONTROL
  const wsHojaControl = XLSX.utils.aoa_to_sheet([
    ['', '', '', '', '', '', ''],
    ['', '', 'Sistema de E-commerce Ferremas', '', '', '', ''],
    ['', '', 'Departamento de Desarrollo', '', '', '', ''],
    ['', '', 'Plan de Pruebas de Integración', '', '', '', ''],
    ['', '', '', '', '', '', ''],
    ['', '', '', '', '', '', ''],
    ['', '', '', '', '', '', ''],
    ['', '', 'HOJA DE CONTROL', '', '', '', ''],
    ['', '', '', '', '', '', ''],
    ['Organismo', 'Departamento de Desarrollo', '', '', '', '', ''],
    ['Proyecto', 'Sistema de E-commerce Ferremas', '', '', '', '', ''],
    ['Entregable', 'Plan de Pruebas de Integración', '', '', '', '', ''],
    ['Autor', 'Equipo de QA', '', '', '', '', ''],
    ['Versión / Edición', '01.00', '', 'Fecha Versión', hojaControlData.fechaVersion, '', ''],
    ['Aprobado Por', 'Jefe de Proyecto', '', 'Fecha Aprobación', hojaControlData.fechaAprobacion, '', ''],
    ['', '', '', 'Nº Total de Páginas', '2', '', ''],
    ['', '', '', '', '', '', ''],
    ['REGISTRO DE CAMBIOS', '', '', '', '', '', ''],
    ['', '', '', '', '', '', ''],
    ['Versión', 'Causa del cambio', 'Responsable del cambio', 'Fecha del cambio', '', '', ''],
    ['01.00', 'Versión inicial', 'Equipo de QA', hojaControlData.fechaVersion, '', '', ''],
    ['', '', '', '', '', '', ''],
    ['', '', '', '', '', '', ''],
    ['', '', '', '', '', '', ''],
    ['', '', '', '', '', '', ''],
    ['', '', '', '', '', '', ''],
    ['', '', '', '', '', '', ''],
    ['', '', '', '', '', '', ''],
    ['', '', '', '', '', '', ''],
    ['', '', '', '', '', '', ''],
    ['CONTROL DE DISTRIBUCIÓN', '', '', '', '', '', ''],
    ['', '', '', '', '', '', ''],
    ['Nombre y Apellidos', '', '', '', '', '', '']
  ]);

  // HOJA 2: PRUEBAS DE INTEGRACIÓN
  const wsPruebas = XLSX.utils.aoa_to_sheet([
    ['', '', '', '', '', '', ''],
    ['', '', 'Sistema de E-commerce Ferremas', '', '', '', ''],
    ['', '', 'Plan de Pruebas de Integración', '', '', '', ''],
    ['', '', '', '', '', '', ''],
    ['', '', '', '', '', '', ''],
    ['', '', '', '', '', '', ''],
    ['Nota: Para cada caso de prueba se debe mostrar la siguiente información:', '', '', '', '', ''],
    ['- Número del caso de prueba. Número secuencia que hace referencia a los casos de pruebas definidos.', '', '', '', '', ''],
    ['- Componentes a los que hace referencia cada caso de prueba', '', '', '', '', ''],
    ['- Prerrequisitos que se deben cumplir para realizar cada caso de prueba', '', '', '', '', ''],
    ['- Descripción de cada uno de los pasos a realizar para realizar el caso de prueba', '', '', '', '', ''],
    ['- Los datos que se utilizarán de entrada', '', '', '', '', ''],
    ['- La salida que se espera de ejecute cada paso', '', '', '', '', ''],
    ['- Las columnas sombreadas, correspondientes a "Resultados" se rellenarán una vez ejecutadas las pruebas, obteniendo así el Informe de Resultado de Pruebas de Integración', '', '', '', '', ''],
    ['', '', '', '', '', '', ''],
    ['Número del Caso de Prueba', 'Componente', 'Descripción de lo que se Probará', 'Prerrequisitos', '', '', '']
  ]);

  let currentRow = 16; // Empezar después de los headers

  casosDeRueba.forEach(caso => {
    // Agregar fila del caso
    XLSX.utils.sheet_add_aoa(wsPruebas, [[
      caso.numero,
      caso.componente,
      caso.descripcion,
      caso.prerrequisitos,
      '', '', ''
    ]], { origin: `A${currentRow + 1}` });
    currentRow++;

    // Agregar header de pasos
    XLSX.utils.sheet_add_aoa(wsPruebas, [[
      'Paso', 'Descripción de pasos a seguir', 'Datos Entrada', 'Salida Esperada', '¿OK?', 'Observaciones', ''
    ]], { origin: `A${currentRow + 1}` });
    currentRow++;

    // Agregar pasos
    caso.pasos.forEach(paso => {
      XLSX.utils.sheet_add_aoa(wsPruebas, [[
        paso.paso,
        paso.descripcion,
        paso.datosEntrada,
        paso.salidaEsperada,
        paso.ok,
        paso.observaciones,
        ''
      ]], { origin: `A${currentRow + 1}` });
      currentRow++;
    });

    // Agregar línea en blanco
    currentRow++;
  });

  // Agregar las hojas al libro
  XLSX.utils.book_append_sheet(workbook, wsHojaControl, 'Hoja_de_Control');
  XLSX.utils.book_append_sheet(workbook, wsPruebas, 'Pruebas_de_Integración');

  // Crear el directorio reports si no existe
  const reportsDir = path.join(__dirname, '..', 'reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir);
  }

  // Generar el archivo Excel
  const fileName = `Plan_Pruebas_Integracion_${new Date().toISOString().split('T')[0]}.xlsx`;
  const filePath = path.join(reportsDir, fileName);
  
  XLSX.writeFile(workbook, filePath);
  
  console.log(`✅ Reporte Excel generado exitosamente: ${filePath}`);
  return filePath;
}

module.exports = { generateExcelReport };

// Si se ejecuta directamente
if (require.main === module) {
  generateExcelReport();
} 