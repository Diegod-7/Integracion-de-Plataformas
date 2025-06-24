const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

function generateExcelReport() {
  const workbook = XLSX.utils.book_new();

  // HOJA 1: HOJA DE CONTROL
  const hojaControlData = [
    ['', '', '', '', '', '', ''],
    ['', '', 'Sistema de E-commerce Ferremas', '', '', '', ''],
    ['', '', 'Departamento de Desarrollo', '', '', '', ''],
    ['', '', 'Plan de Pruebas de Integración', '', '', '', ''],
    ['', '', '', '', '', '', ''],
    ['', '', '', '', '', '', ''],
    ['', '', 'HOJA DE CONTROL', '', '', '', ''],
    ['', '', '', '', '', '', ''],
    ['Organismo', 'Departamento de Desarrollo', '', '', '', '', ''],
    ['Proyecto', 'Sistema de E-commerce Ferremas', '', '', '', '', ''],
    ['Entregable', 'Plan de Pruebas de Integración', '', '', '', '', ''],
    ['Autor', 'Equipo de QA', '', '', '', '', ''],
    ['Versión / Edición', '01.00', '', 'Fecha Versión', new Date().toLocaleDateString('es-ES'), '', ''],
    ['Aprobado Por', 'Jefe de Proyecto', '', 'Fecha Aprobación', new Date().toLocaleDateString('es-ES'), '', ''],
    ['', '', '', 'Nº Total de Páginas', '2', '', ''],
    ['', '', '', '', '', '', ''],
    ['REGISTRO DE CAMBIOS', '', '', '', '', '', ''],
    ['', '', '', '', '', '', ''],
    ['Versión', 'Causa del cambio', 'Responsable del cambio', 'Fecha del cambio', '', '', ''],
    ['01.00', 'Versión inicial', 'Equipo de QA', new Date().toLocaleDateString('es-ES'), '', '', ''],
    ['', '', '', '', '', '', ''],
    ['', '', '', '', '', '', ''],
    ['', '', '', '', '', '', ''],
    ['CONTROL DE DISTRIBUCIÓN', '', '', '', '', '', ''],
    ['', '', '', '', '', '', ''],
    ['Nombre y Apellidos', '', '', '', '', '', '']
  ];

  // HOJA 2: PRUEBAS DE INTEGRACIÓN
  const pruebasData = [
    ['', '', '', '', '', '', ''],
    ['', '', 'Sistema de E-commerce Ferremas', '', '', '', ''],
    ['', '', 'Plan de Pruebas de Integración', '', '', '', ''],
    ['', '', '', '', '', '', ''],
    ['', '', '', '', '', '', ''],
    ['Nota: Para cada caso de prueba se debe mostrar la siguiente información:', '', '', '', '', ''],
    ['- Número del caso de prueba', '', '', '', '', ''],
    ['- Componentes a los que hace referencia cada caso de prueba', '', '', '', '', ''],
    ['- Prerrequisitos que se deben cumplir para realizar cada caso de prueba', '', '', '', '', ''],
    ['- Descripción de cada uno de los pasos a realizar', '', '', '', '', ''],
    ['- Los datos que se utilizarán de entrada', '', '', '', '', ''],
    ['- La salida que se espera de ejecute cada paso', '', '', '', '', ''],
    ['- Las columnas sombreadas se rellenarán una vez ejecutadas las pruebas', '', '', '', '', ''],
    ['', '', '', '', '', '', ''],
    ['', '', '', '', '', '', ''],
    ['Número del Caso de Prueba', 'Componente', 'Descripción de lo que se Probará', 'Prerrequisitos', '', '', ''],
    ['CASO001', 'Autenticación >> Registro de Usuario', 'Verificar el registro de nuevos usuarios en el sistema', 'Base de datos disponible, API funcionando', '', '', ''],
    ['', '', '', '', '', '', ''],
    ['Paso', 'Descripción de pasos a seguir', 'Datos Entrada', 'Salida Esperada', '¿OK?', 'Observaciones', ''],
    ['1', 'Enviar POST /api/auth/register con datos válidos', '{"name":"Usuario Test","email":"test@test.com","password":"123456"}', 'Usuario creado exitosamente con token JWT', '✓', 'Registro exitoso'],
    ['2', 'Enviar POST /api/auth/register con email duplicado', '{"name":"Usuario Test","email":"test@test.com","password":"123456"}', 'Error 400: El email ya está registrado', '✓', 'Validación correcta'],
    ['3', 'Enviar POST /api/auth/register con datos incompletos', '{"name":"Usuario Test"}', 'Error 500: Datos requeridos faltantes', '✓', 'Error manejado correctamente'],
    ['', '', '', '', '', '', ''],
    ['CASO002', 'Autenticación >> Inicio de Sesión', 'Verificar el proceso de autenticación de usuarios', 'Usuario registrado previamente', '', '', ''],
    ['', '', '', '', '', '', ''],
    ['Paso', 'Descripción de pasos a seguir', 'Datos Entrada', 'Salida Esperada', '¿OK?', 'Observaciones', ''],
    ['1', 'Enviar POST /api/auth/login con credenciales válidas', '{"email":"test@test.com","password":"123456"}', 'Login exitoso con token JWT', '✓', 'Autenticación exitosa'],
    ['2', 'Enviar POST /api/auth/login con email inexistente', '{"email":"noexiste@test.com","password":"123456"}', 'Error 401: Credenciales inválidas', '✓', 'Error de seguridad correcto'],
    ['3', 'Enviar POST /api/auth/login con contraseña incorrecta', '{"email":"test@test.com","password":"incorrecta"}', 'Error 401: Credenciales inválidas', '✓', 'Validación de contraseña correcta'],
    ['', '', '', '', '', '', ''],
    ['CASO003', 'Newsletter >> Suscripción', 'Verificar la suscripción al newsletter', 'API de newsletter funcionando', '', '', ''],
    ['', '', '', '', '', '', ''],
    ['Paso', 'Descripción de pasos a seguir', 'Datos Entrada', 'Salida Esperada', '¿OK?', 'Observaciones', ''],
    ['1', 'Enviar POST /api/newsletter/subscribe con email válido', '{"email":"newsletter@test.com"}', 'Suscripción exitosa', '✓', 'Suscripción registrada'],
    ['2', 'Enviar POST /api/newsletter/subscribe con email inválido', '{"email":"email-invalido"}', 'Error 400: Email inválido', '✓', 'Validación de email correcta'],
    ['3', 'Enviar POST /api/newsletter/subscribe con email duplicado', '{"email":"newsletter@test.com"}', 'Error 400: Email ya suscrito', '✓', 'Prevención de duplicados'],
    ['4', 'Enviar POST /api/newsletter/subscribe sin email', '{}', 'Error 400: Email requerido', '✓', 'Validación de campos requeridos'],
    ['', '', '', '', '', '', ''],
    ['CASO004', 'Productos >> CRUD Completo', 'Verificar las operaciones CRUD de productos', 'Base de datos de productos disponible', '', '', ''],
    ['', '', '', '', '', '', ''],
    ['Paso', 'Descripción de pasos a seguir', 'Datos Entrada', 'Salida Esperada', '¿OK?', 'Observaciones', ''],
    ['1', 'Enviar GET /api/products para obtener lista', 'N/A', 'Lista de productos en formato JSON', '✓', 'Lista obtenida correctamente'],
    ['2', 'Enviar POST /api/products para crear producto', '{"name":"Martillo","price":25000,"stock":10}', 'Producto creado con ID asignado', '✓', 'Creación exitosa'],
    ['3', 'Enviar GET /api/products/:id para obtener producto específico', 'ID del producto creado', 'Datos del producto solicitado', '✓', 'Consulta individual correcta'],
    ['4', 'Enviar PUT /api/products/:id para actualizar producto', '{"name":"Martillo Actualizado","price":30000}', 'Producto actualizado correctamente', '✓', 'Actualización exitosa'],
    ['5', 'Enviar DELETE /api/products/:id para eliminar producto', 'ID del producto a eliminar', 'Producto eliminado correctamente', '✓', 'Eliminación exitosa'],
    ['6', 'Enviar GET /api/products/99999 para producto inexistente', 'ID inexistente', 'Error 404: Producto no encontrado', '✓', 'Manejo de errores correcto'],
    ['', '', '', '', '', '', ''],
    ['CASO005', 'Webpay >> Procesamiento de Pagos', 'Verificar la integración con Webpay para pagos', 'Configuración de Webpay, credenciales válidas', '', '', ''],
    ['', '', '', '', '', '', ''],
    ['Paso', 'Descripción de pasos a seguir', 'Datos Entrada', 'Salida Esperada', '¿OK?', 'Observaciones', ''],
    ['1', 'Enviar POST /api/webpay/create para crear transacción', '{"amount":50000,"buyOrder":"order123","returnUrl":"http://test.com"}', 'URL de pago y token de transacción', '✓', 'Transacción iniciada'],
    ['2', 'Enviar POST /api/webpay/confirm para confirmar pago', '{"token_ws":"token_test_123"}', 'Estado de confirmación de pago', '✓', 'Confirmación procesada'],
    ['3', 'Enviar POST /api/webpay/create sin datos requeridos', '{}', 'Error 400: Datos requeridos faltantes', '✓', 'Validación de entrada correcta'],
    ['4', 'Enviar POST /api/webpay/confirm sin token', '{}', 'Error 400: Token requerido', '✓', 'Validación de token correcta'],
    ['5', 'Enviar POST /api/webpay/create con monto inválido', '{"amount":-100,"buyOrder":"order123"}', 'Error 400: Monto inválido', '✓', 'Validación de monto correcta'],
    ['6', 'Enviar POST /api/webpay/confirm con token inválido', '{"token_ws":"invalid_token"}', 'Error 400: Token inválido', '✓', 'Validación de token correcta']
  ];

  // Crear hojas de trabajo
  const wsHojaControl = XLSX.utils.aoa_to_sheet(hojaControlData);
  const wsPruebas = XLSX.utils.aoa_to_sheet(pruebasData);

  // Agregar las hojas al libro
  XLSX.utils.book_append_sheet(workbook, wsHojaControl, 'Hoja_de_Control');
  XLSX.utils.book_append_sheet(workbook, wsPruebas, 'Pruebas_de_Integración');

  // Crear directorio de reportes si no existe
  const reportsDir = path.join(__dirname, '..', 'reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir);
  }

  // Generar archivo Excel
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