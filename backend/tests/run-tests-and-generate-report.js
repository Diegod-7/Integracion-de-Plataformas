const { spawn } = require('child_process');
const { generateExcelReport } = require('./excel-generator-improved');
const path = require('path');

console.log('🚀 Iniciando ejecución de pruebas de integración...\n');
console.log('👤 Ejecutado por: Diego Díaz');
console.log('📅 Fecha:', new Date().toLocaleDateString('es-ES'));
console.log('⏰ Hora:', new Date().toLocaleTimeString('es-ES'));
console.log('━'.repeat(60));

// Ejecutar las pruebas
const testProcess = spawn('npm', ['test'], {
  stdio: 'inherit',
  shell: true,
  cwd: path.join(__dirname, '..')
});

testProcess.on('close', (code) => {
  console.log('\n' + '━'.repeat(60));
  
  if (code === 0) {
    console.log('✅ Todas las pruebas completadas exitosamente!');
    console.log('\n📊 Generando reporte Excel mejorado...');
    
    try {
      const filePath = generateExcelReport();
      console.log('\n🎉 ¡Proceso completado exitosamente!');
      console.log('\n📋 RESUMEN FINAL:');
      console.log('• Pruebas ejecutadas: ✅ EXITOSAS');
      console.log('• Reporte generado: ✅ COMPLETADO');
      console.log('• Responsable: Diego Díaz');
      console.log('• Estado: APROBADO');
      console.log(`• Archivo: ${path.basename(filePath)}`);
      
    } catch (error) {
      console.error('❌ Error al generar el reporte Excel:', error.message);
      process.exit(1);
    }
  } else {
    console.log('❌ Las pruebas fallaron. No se generará el reporte.');
    console.log('🔍 Revisa los errores anteriores y corrige los problemas.');
    process.exit(code);
  }
});

testProcess.on('error', (error) => {
  console.error('❌ Error al ejecutar las pruebas:', error.message);
  process.exit(1);
}); 