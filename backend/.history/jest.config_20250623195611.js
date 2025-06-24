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
  
  // Umbrales de cobertura
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 70,
      lines: 75,
      statements: 75
    }
  },
  
  // Configuración de timeouts
  testTimeout: 30000, // 30 segundos para pruebas que pueden ser lentas
  
  // Setup y teardown
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  
  // Configuración de módulos
  moduleFileExtensions: ['js', 'json'],
  
  // Transformaciones
  transform: {},
  
  // Variables de entorno para pruebas
  setupFiles: ['<rootDir>/tests/env-setup.js'],
  
  // Configuración de reportes
  reporters: [
    'default',
    [
      'jest-html-reporters',
      {
        publicPath: './reports',
        filename: 'jest-report.html',
        expand: true,
        hideIcon: false,
        pageTitle: 'Reporte de Pruebas - Sistema E-commerce Ferremas',
        logoImgPath: undefined,
        inlineSource: false
      }
    ]
  ],
  
  // Configuración verbose para más detalles
  verbose: true,
  
  // Configuración para pruebas en paralelo
  maxWorkers: '50%',
  
  // Configuración de caché
  cache: true,
  cacheDirectory: '<rootDir>/node_modules/.cache/jest',
  
  // Configuración de errores
  bail: false, // No parar en el primer error
  
  // Configuración de archivos de configuración
  clearMocks: true,
  restoreMocks: true,
  
  // Configuración de salida
  silent: false,
  
  // Configuración de pruebas específicas
  testSequencer: '<rootDir>/tests/custom-sequencer.js'
}; 