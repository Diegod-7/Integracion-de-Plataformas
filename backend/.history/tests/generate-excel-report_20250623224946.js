const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

function generateExcelReport() {
  const workbook = XLSX.utils.book_new();
  
  // HOJA 1: HOJA DE CONTROL
  const wsHojaControl = XLSX.utils.aoa_to_sheet([
    ['', '', '', '', '', '', ''],
    ['', '', 'Sistema de E-commerce Ferremas', '', '', '', ''],
    ['', '', 'Departamento de Desarrollo', '', '', '', ''],
    ['', '', 'Plan de Pruebas de Integración', '', '', '', ''],
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
    ['CONTROL DE DISTRIBUCIÓN', '', '', '', '', '', ''],
    ['', '', '', '', '', '', ''],
    ['Nombre y Apellidos', '', '', '', '', '', '']
  ]);

  // HOJA 2: PRUEBAS DE INTEGRACIÓN
  const wsPruebas = XLSX.utils.aoa_to_sheet([
    ['', '', 'Sistema de E-commerce Ferremas', '', '', '', ''],
    ['', '', 'Plan de Pruebas de Integración', '', '', '', ''],
    ['', '', '', '', '', '', ''],
    ['Número del Caso de Prueba', 'Componente', 'Descripción de lo que se Probará', 'Prerrequisitos', '', '', ''],
    ['CASO001', 'Autenticación >> Registro de Usuario', 'Verificar el registro de nuevos usuarios', 'Base de datos disponible', '', '', ''],
    ['', '', '', '', '', '', ''],
    ['Paso', 'Descripción de pasos a seguir', 'Datos Entrada', 'Salida Esperada', '¿OK?', 'Observaciones', ''],
    ['1', 'POST /api/auth/register con datos válidos', '{\
name\:\Test\,\email\:\test@test.com\}', 'Usuario creado con token JWT', '', 'Registro exitoso', ''],
    ['2', 'POST /api/auth/register con email duplicado', '{\name\:\Test\,\email\:\test@test.com\}', 'Error 400: Email ya registrado', '', 'Validación correcta', ''],
    ['3', 'POST /api/auth/register con datos incompletos', '{\name\:\Test\}', 'Error 500: Datos faltantes', '', 'Error manejado', ''],
    ['', '', '', '', '', '', ''],
    ['CASO002', 'Autenticación >> Inicio de Sesión', 'Verificar el proceso de autenticación', 'Usuario registrado previamente', '', '', ''],
    ['', '', '', '', '', '', ''],
    ['Paso', 'Descripción de pasos a seguir', 'Datos Entrada', 'Salida Esperada', '¿OK?', 'Observaciones', ''],
    ['1', 'POST /api/auth/login con credenciales válidas', '{\email\:\test@test.com\,\password\:\123456\}', 'Login exitoso con token JWT', '', 'Autenticación exitosa', ''],
    ['2', 'POST /api/auth/login con email inexistente', '{\email\:\noexiste@test.com\}', 'Error 401: Credenciales inválidas', '', 'Error de seguridad correcto', ''],
    ['3', 'POST /api/auth/login con contraseña incorrecta', '{\email\:\test@test.com\,\password\:\mal\}', 'Error 401: Credenciales inválidas', '', 'Validación correcta', ''],
    ['', '', '', '', '', '', ''],
    ['CASO003', 'Newsletter >> Suscripción', 'Verificar la suscripción al newsletter', 'API de newsletter funcionando', '', '', ''],
    ['', '', '', '', '', '', ''],
    ['Paso', 'Descripción de pasos a seguir', 'Datos Entrada', 'Salida Esperada', '¿OK?', 'Observaciones', ''],
    ['1', 'POST /api/newsletter/subscribe con email válido', '{\email\:\newsletter@test.com\}', 'Suscripción exitosa', '', 'Suscripción registrada', ''],
    ['2', 'POST /api/newsletter/subscribe con email inválido', '{\email\:\email-invalido\}', 'Error 400: Email inválido', '', 'Validación correcta', ''],
    ['3', 'POST /api/newsletter/subscribe con email duplicado', '{\email\:\newsletter@test.com\}', 'Error 400: Email ya suscrito', '', 'Prevención de duplicados', ''],
    ['4', 'POST /api/newsletter/subscribe sin email', '{}', 'Error 400: Email requerido', '', 'Validación de campos', ''],
    ['', '', '', '', '', '', ''],
    ['CASO004', 'Productos >> CRUD Completo', 'Verificar operaciones CRUD de productos', 'Base de datos disponible', '', '', ''],
    ['', '', '', '', '', '', ''],
    ['Paso', 'Descripción de pasos a seguir', 'Datos Entrada', 'Salida Esperada', '¿OK?', 'Observaciones', ''],
    ['1', 'GET /api/products para obtener lista', 'N/A', 'Lista de productos JSON', '', 'Lista obtenida', ''],
    ['2', 'POST /api/products para crear producto', '{\name\:\Martillo\,\price\:25000}', 'Producto creado con ID', '', 'Creación exitosa', ''],
    ['3', 'GET /api/products/:id para producto específico', 'ID del producto', 'Datos del producto', '', 'Consulta correcta', ''],
    ['4', 'PUT /api/products/:id para actualizar', '{\name\:\Martillo
Nuevo\}', 'Producto actualizado', '', 'Actualización exitosa', ''],
    ['5', 'DELETE /api/products/:id para eliminar', 'ID del producto', 'Producto eliminado', '', 'Eliminación exitosa', ''],
    ['6', 'GET /api/products/99999 producto inexistente', 'ID inexistente', 'Error 404: No encontrado', '', 'Manejo de errores', ''],
    ['', '', '', '', '', '', ''],
    ['CASO005', 'Webpay >> Procesamiento de Pagos', 'Verificar integración con Webpay', 'Configuración Webpay válida', '', '', ''],
    ['', '', '', '', '', '', ''],
    ['Paso', 'Descripción de pasos a seguir', 'Datos Entrada', 'Salida Esperada', '¿OK?', 'Observaciones', ''],
    ['1', 'POST /api/webpay/create para crear transacción', '{\amount\:50000,\buyOrder\:\order123\}', 'URL de pago y token', '', 'Transacción iniciada', ''],
    ['2', 'POST /api/webpay/confirm para confirmar pago', '{\token_ws\:\token_test_123\}', 'Estado de confirmación', '', 'Confirmación procesada', ''],
    ['3', 'POST /api/webpay/create sin datos requeridos', '{}', 'Error 400: Datos faltantes', '', 'Validación correcta', ''],
    ['4', 'POST /api/webpay/confirm sin token', '{}', 'Error 400: Token requerido', '', 'Validación de token', ''],
    ['5', 'POST /api/webpay/create con monto inválido', '{\amount\:-100}', 'Error 400: Monto inválido', '', 'Validación de monto', ''],
    ['6', 'POST /api/webpay/confirm con token inválido', '{\token_ws\:\invalid\}', 'Error 400: Token inválido', '', 'Validación correcta', '']
  ]);

  XLSX.utils.book_append_sheet(workbook, wsHojaControl, 'Hoja_de_Control');
  XLSX.utils.book_append_sheet(workbook, wsPruebas, 'Pruebas_de_Integración');

  const reportsDir = path.join(__dirname, '..', 'reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir);
  }

  const fileName = \Plan_Pruebas_Integracion_\.xlsx\;
  const filePath = path.join(reportsDir, fileName);
  
  XLSX.writeFile(workbook, filePath);
  
  console.log(\ Reporte Excel generado exitosamente: \\);
  return filePath;
}

module.exports = { generateExcelReport };

if (require.main === module) {
  generateExcelReport();
}
