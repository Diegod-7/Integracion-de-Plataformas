module.exports = {
  // Entorno de pruebas
  testEnvironment: 'node',
  
  // Archivos de prueba
  testMatch: [
    '**/tests/**/*.test.js',
    '**/tests/**/*.spec.js'
  ],
  
  // Archivos a ignorar
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/build/',
    '/.history/'
  ],
  
  // Configuración de cobertura
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: [
    'text',
    'lcov',
    'html',
    'json'
  ],
  
  // Archivos para medir cobertura
  collectCoverageFrom: [
    'controllers/**/*.js',
    'routes/**/*.js',
    'models/**/*.js',
    'services/**/*.js',
    'middlewares/**/*.js',
    'index.js',
    '!**/node_modules/**',
    '!**/tests/**',
    '!**/coverage/**'
  ],
  
  // Umbrales de cobertura optimizados
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 70,
      lines: 75,
      statements: 75
    }
  },
  
  // Configuración de timeouts - aumentado para pruebas de stress
  testTimeout: 60000, // 60 segundos para pruebas que pueden ser muy lentas
  
  // Setup y teardown
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  
  // Configuración de módulos
  moduleFileExtensions: ['js', 'json'],
  
  // Transformaciones
  transform: {},
  
  // Variables de entorno para pruebas
  setupFiles: ['<rootDir>/tests/env-setup.js'],
  
  // Configuración de reportes mejorada
  reporters: [
    'default',
    [
      'jest-html-reporters',
      {
        publicPath: './reports',
        filename: 'jest-report.html',
        expand: true,
        hideIcon: false,
        pageTitle: 'Reporte Completo de Pruebas - Sistema E-commerce Ferremas',
        logoImgPath: undefined,
        inlineSource: false,
        includeFailureMsg: true,
        includeSuiteFailure: true
      }
    ]
  ],
  
  // Configuración verbose para más detalles
  verbose: true,
  
  // Configuración para pruebas en paralelo - optimizado para más pruebas
  maxWorkers: '75%', // Usar más workers para las pruebas adicionales
  
  // Configuración de caché
  cache: true,
  cacheDirectory: '<rootDir>/node_modules/.cache/jest',
  
  // Configuración de errores - no parar para ver todas las fallas
  bail: false,
  
  // Configuración de archivos de configuración
  clearMocks: true,
  restoreMocks: true,
  
  // Configuración de salida
  silent: false,
  
  // Configuración de pruebas específicas
  testSequencer: '<rootDir>/tests/custom-sequencer.js',
  
  // Configuración adicional para manejar pruebas de stress
  forceExit: true, // Forzar salida después de las pruebas
  detectOpenHandles: true, // Detectar handles abiertos
  
  // Configuración de memoria para pruebas pesadas
  maxConcurrency: 10 // Limitar concurrencia para pruebas pesadas
}; 