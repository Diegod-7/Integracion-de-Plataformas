const { execSync } = require('child_process');
const { generateExcelReport } = require('./excel-generator');

async function runTestsAndGenerateReport() {
  console.log('🚀 Iniciando ejecución de pruebas de integración...\n');

  try {
    // Ejecutar las pruebas
    console.log('📋 Ejecutando pruebas...');
    execSync('npm test', { stdio: 'inherit' });
    console.log('✅ Todas las pruebas completadas exitosamente!\n');

    // Generar reporte Excel
    console.log('📊 Generando reporte Excel...');
    const filePath = generateExcelReport();
    console.log(`\n🎉 Proceso completado! El reporte Excel se ha generado en: ${filePath}`);

    console.log('\n📋 Resumen de casos de prueba ejecutados:');
    console.log('- CASO001: Registro de Usuario ✓');
    console.log('- CASO002: Inicio de Sesión ✓');
    console.log('- CASO003: Suscripción al Newsletter ✓');
    console.log('- CASO004: Gestión de Productos (CRUD) ✓');
    console.log('- CASO005: Procesamiento de Pagos (Webpay) ✓');

    console.log('\n📄 El archivo Excel contiene:');
    console.log('- Hoja 1: Hoja de Control con información del proyecto');
    console.log('- Hoja 2: Pruebas de Integración con todos los casos de prueba detallados');

  } catch (error) {
    console.error('❌ Error durante la ejecución:', error.message);
    
    // Generar reporte incluso si las pruebas fallan
    console.log('\n📊 Generando reporte Excel con resultados parciales...');
    generateExcelReport();
    
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  runTestsAndGenerateReport();
}

module.exports = { runTestsAndGenerateReport }; 