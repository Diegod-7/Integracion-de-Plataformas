const Sequencer = require('@jest/test-sequencer').default;

class CustomSequencer extends Sequencer {
  sort(tests) {
    // Definir el orden de ejecución de las pruebas
    const testOrder = [
      'setup.test.js',          // Configuración inicial
      'auth.test.js',           // Autenticación primero
      'products.test.js',       // Productos
      'newsletter.test.js',     // Newsletter
      'webpay.test.js',         // Webpay
      'security.test.js',       // Pruebas de seguridad
      'performance.test.js',    // Pruebas de rendimiento
      'integration.test.js'     // Pruebas de integración al final
    ];

    // Función para obtener la prioridad de un archivo de prueba
    const getPriority = (testPath) => {
      const fileName = testPath.split('/').pop() || testPath.split('\\').pop();
      const index = testOrder.indexOf(fileName);
      return index === -1 ? testOrder.length : index;
    };

    // Ordenar las pruebas según la prioridad definida
    return tests.sort((testA, testB) => {
      const priorityA = getPriority(testA.path);
      const priorityB = getPriority(testB.path);
      
      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }
      
      // Si tienen la misma prioridad, ordenar alfabéticamente
      return testA.path.localeCompare(testB.path);
    });
  }
}

module.exports = CustomSequencer; 