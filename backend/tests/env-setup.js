// Configuración de variables de entorno para pruebas
process.env.NODE_ENV = 'test';
process.env.PORT = '3001';
process.env.JWT_SECRET = 'test_jwt_secret_key_for_testing_only';
process.env.DB_HOST = 'localhost';
process.env.DB_PORT = '5432';
process.env.DB_NAME = 'ferremas_test';
process.env.DB_USER = 'postgres';
process.env.DB_PASS = 'password';

// Configuración específica para Webpay en modo test
process.env.WEBPAY_ENVIRONMENT = 'test';
process.env.WEBPAY_COMMERCE_CODE = 'test_commerce_code';
process.env.WEBPAY_API_KEY = 'test_api_key';

// Configuración de logging para pruebas
process.env.LOG_LEVEL = 'error'; // Solo mostrar errores durante las pruebas

// Configuración de timeouts
process.env.REQUEST_TIMEOUT = '30000';
process.env.DB_TIMEOUT = '10000';

// Configuración de seguridad para pruebas
process.env.BCRYPT_ROUNDS = '4'; // Usar menos rounds para que las pruebas sean más rápidas
process.env.RATE_LIMIT_WINDOW = '60000'; // 1 minuto
process.env.RATE_LIMIT_MAX = '1000'; // 1000 requests por minuto en pruebas

// Configuración de CORS para pruebas
process.env.CORS_ORIGIN = 'http://localhost:3000,http://localhost:3001';

// Configuración de email para pruebas (mock)
process.env.EMAIL_SERVICE = 'mock';
process.env.EMAIL_FROM = 'test@ferremas.com';

// Configuración de cache para pruebas
process.env.CACHE_TTL = '300'; // 5 minutos
process.env.CACHE_MAX_SIZE = '100';

console.log('🔧 Variables de entorno configuradas para pruebas');
console.log(`📊 Entorno: ${process.env.NODE_ENV}`);
console.log(`🚀 Puerto: ${process.env.PORT}`);
console.log(`🔐 JWT Secret configurado: ${process.env.JWT_SECRET ? '✅' : '❌'}`);
console.log(`💳 Webpay Environment: ${process.env.WEBPAY_ENVIRONMENT}`); 