require('dotenv').config({ path: '.env.test' });

// Configuración global para las pruebas
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_jwt_secret';

// Configurar timeouts
jest.setTimeout(30000); 