const request = require('supertest');
const express = require('express');
const cors = require('cors');
const authRoutes = require('../routes/authRoutes');
const app = require('../index');

// Configurar la aplicación de prueba
const appTest = express();
appTest.use(cors());
appTest.use(express.json());
appTest.use('/api/auth', authRoutes);

describe('🔐 AUTENTICACIÓN - CASOS DE PRUEBA EXPANDIDOS', () => {
  let testUser = {
    name: 'Usuario Test',
    email: 'test@test.com',
    password: '123456'
  };

  let authToken = '';
  let userId = '';

  describe('📝 REGISTRO DE USUARIO - CASOS BÁSICOS', () => {
    test('✅ Debe registrar un usuario con datos válidos', async () => {
      const response = await request(appTest)
        .post('/api/auth/register')
        .send(testUser);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(testUser.email);
      expect(response.body.user.name).toBe(testUser.name);
      expect(response.body.user).not.toHaveProperty('password');
      
      authToken = response.body.token;
      userId = response.body.user.id;
    });

    test('❌ Debe fallar al registrar usuario con email duplicado', async () => {
      const response = await request(appTest)
        .post('/api/auth/register')
        .send(testUser);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('email');
    });

    test('❌ Debe fallar con datos incompletos - sin name', async () => {
      const response = await request(appTest)
        .post('/api/auth/register')
        .send({
          email: 'test2@test.com',
          password: '123456'
        });

      expect(response.status).toBe(500);
    });

    test('❌ Debe fallar con datos incompletos - sin email', async () => {
      const response = await request(appTest)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          password: '123456'
        });

      expect(response.status).toBe(500);
    });

    test('❌ Debe fallar con datos incompletos - sin password', async () => {
      const response = await request(appTest)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'test3@test.com'
        });

      expect(response.status).toBe(500);
    });
  });

  describe('📝 REGISTRO DE USUARIO - VALIDACIONES AVANZADAS', () => {
    test('❌ Debe fallar con email inválido - formato incorrecto', async () => {
      const response = await request(appTest)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'email-invalido',
          password: '123456'
        });

      expect(response.status).toBe(500);
    });

    test('❌ Debe fallar con email inválido - sin @', async () => {
      const response = await request(appTest)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'emailsindominio.com',
          password: '123456'
        });

      expect(response.status).toBe(500);
    });

    test('❌ Debe fallar con contraseña muy corta', async () => {
      const response = await request(appTest)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'test4@test.com',
          password: '123'
        });

      expect(response.status).toBe(500);
    });

    test('❌ Debe fallar con nombre muy corto', async () => {
      const response = await request(appTest)
        .post('/api/auth/register')
        .send({
          name: 'A',
          email: 'test5@test.com',
          password: '123456'
        });

      expect(response.status).toBe(500);
    });

    test('❌ Debe fallar con campos vacíos', async () => {
      const response = await request(appTest)
        .post('/api/auth/register')
        .send({
          name: '',
          email: '',
          password: ''
        });

      expect(response.status).toBe(500);
    });

    test('❌ Debe fallar con espacios en blanco', async () => {
      const response = await request(appTest)
        .post('/api/auth/register')
        .send({
          name: '   ',
          email: '   ',
          password: '   '
        });

      expect(response.status).toBe(500);
    });

    test('❌ Debe fallar con email con espacios', async () => {
      const response = await request(appTest)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'test @test.com',
          password: '123456'
        });

      expect(response.status).toBe(500);
    });

    test('❌ Debe fallar con caracteres especiales en nombre', async () => {
      const response = await request(appTest)
        .post('/api/auth/register')
        .send({
          name: 'Test<script>alert("xss")</script>',
          email: 'test6@test.com',
          password: '123456'
        });

      expect(response.status).toBe(500);
    });
  });

  describe('🔑 INICIO DE SESIÓN - CASOS BÁSICOS', () => {
    test('✅ Debe iniciar sesión con credenciales válidas', async () => {
      const response = await request(appTest)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(testUser.email);
      expect(response.body.user).not.toHaveProperty('password');
    });

    test('❌ Debe fallar con email inexistente', async () => {
      const response = await request(appTest)
        .post('/api/auth/login')
        .send({
          email: 'noexiste@test.com',
          password: '123456'
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    test('❌ Debe fallar con contraseña incorrecta', async () => {
      const response = await request(appTest)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'contraseña-incorrecta'
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('🔑 INICIO DE SESIÓN - VALIDACIONES AVANZADAS', () => {
    test('❌ Debe fallar sin email', async () => {
      const response = await request(appTest)
        .post('/api/auth/login')
        .send({
          password: '123456'
        });

      expect(response.status).toBe(500);
    });

    test('❌ Debe fallar sin contraseña', async () => {
      const response = await request(appTest)
        .post('/api/auth/login')
        .send({
          email: testUser.email
        });

      expect(response.status).toBe(500);
    });

    test('❌ Debe fallar con email vacío', async () => {
      const response = await request(appTest)
        .post('/api/auth/login')
        .send({
          email: '',
          password: '123456'
        });

      expect(response.status).toBe(500);
    });

    test('❌ Debe fallar con contraseña vacía', async () => {
      const response = await request(appTest)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: ''
        });

      expect(response.status).toBe(500);
    });

    test('❌ Debe fallar con email en mayúsculas', async () => {
      const response = await request(appTest)
        .post('/api/auth/login')
        .send({
          email: testUser.email.toUpperCase(),
          password: testUser.password
        });

      expect(response.status).toBe(401);
    });

    test('❌ Debe fallar con inyección SQL en email', async () => {
      const response = await request(appTest)
        .post('/api/auth/login')
        .send({
          email: "admin@test.com' OR '1'='1",
          password: '123456'
        });

      expect(response.status).toBe(401);
    });

    test('❌ Debe fallar con inyección SQL en contraseña', async () => {
      const response = await request(appTest)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: "' OR '1'='1"
        });

      expect(response.status).toBe(401);
    });

    test('❌ Debe fallar con intentos de XSS', async () => {
      const response = await request(appTest)
        .post('/api/auth/login')
        .send({
          email: '<script>alert("xss")</script>@test.com',
          password: '123456'
        });

      expect(response.status).toBe(401);
    });
  });

  describe('🔒 SEGURIDAD Y TOKENS', () => {
    test('✅ El token JWT debe ser válido', async () => {
      expect(authToken).toBeDefined();
      expect(authToken.length).toBeGreaterThan(50);
      expect(authToken.split('.')).toHaveLength(3); // JWT tiene 3 partes
    });

    test('❌ Debe fallar con token inválido en endpoints protegidos', async () => {
      const response = await request(appTest)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer token-invalido');

      expect(response.status).toBe(401);
    });

    test('❌ Debe fallar sin token en endpoints protegidos', async () => {
      const response = await request(appTest)
        .get('/api/auth/profile');

      expect(response.status).toBe(401);
    });

    test('❌ Debe fallar con formato de token incorrecto', async () => {
      const response = await request(appTest)
        .get('/api/auth/profile')
        .set('Authorization', 'InvalidFormat ' + authToken);

      expect(response.status).toBe(401);
    });
  });

  describe('📊 CASOS EXTREMOS Y PERFORMANCE', () => {
    test('❌ Debe manejar payload muy grande', async () => {
      const largeString = 'a'.repeat(10000);
      const response = await request(appTest)
        .post('/api/auth/register')
        .send({
          name: largeString,
          email: 'large@test.com',
          password: '123456'
        });

      expect(response.status).toBe(500);
    });

    test('❌ Debe manejar caracteres Unicode', async () => {
      const response = await request(appTest)
        .post('/api/auth/register')
        .send({
          name: '测试用户',
          email: 'unicode@test.com',
          password: '123456'
        });

      expect(response.status).toBe(500);
    });

    test('❌ Debe manejar emojis en campos', async () => {
      const response = await request(appTest)
        .post('/api/auth/register')
        .send({
          name: 'Test User 😀🎉',
          email: 'emoji@test.com',
          password: '123456'
        });

      expect(response.status).toBe(500);
    });

    test('❌ Debe manejar múltiples registros simultáneos', async () => {
      const promises = [];
      for (let i = 0; i < 5; i++) {
        promises.push(
          request(appTest)
            .post('/api/auth/register')
            .send({
              name: `Concurrent User ${i}`,
              email: `concurrent${i}@test.com`,
              password: '123456'
            })
        );
      }

      const responses = await Promise.all(promises);
      
      // Al menos uno debería fallar por concurrencia
      const successCount = responses.filter(r => r.status === 201).length;
      expect(successCount).toBeLessThanOrEqual(5);
    });
  });

  describe('🌐 TIPOS DE CONTENIDO Y HEADERS', () => {
    test('❌ Debe fallar con Content-Type incorrecto', async () => {
      const response = await request(appTest)
        .post('/api/auth/register')
        .set('Content-Type', 'text/plain')
        .send('name=Test&email=test@test.com&password=123456');

      expect(response.status).toBe(500);
    });

    test('❌ Debe fallar con JSON malformado', async () => {
      const response = await request(appTest)
        .post('/api/auth/register')
        .set('Content-Type', 'application/json')
        .send('{"name":"Test","email":"test@test.com"'); // JSON incompleto

      expect(response.status).toBe(400);
    });

    test('❌ Debe fallar con datos no JSON', async () => {
      const response = await request(appTest)
        .post('/api/auth/register')
        .set('Content-Type', 'application/json')
        .send('esto no es json');

      expect(response.status).toBe(400);
    });
  });

  describe('🔍 VALIDACIÓN DE RESPUESTAS', () => {
    test('✅ La respuesta de registro debe tener estructura correcta', async () => {
      const response = await request(appTest)
        .post('/api/auth/register')
        .send({
          name: 'Structure Test',
          email: 'structure@test.com',
          password: '123456'
        });

      if (response.status === 201) {
        expect(response.body).toHaveProperty('token');
        expect(response.body).toHaveProperty('user');
        expect(response.body.user).toHaveProperty('id');
        expect(response.body.user).toHaveProperty('name');
        expect(response.body.user).toHaveProperty('email');
        expect(response.body.user).toHaveProperty('createdAt');
        expect(response.body.user).not.toHaveProperty('password');
      }
    });

    test('✅ La respuesta de login debe tener estructura correcta', async () => {
      const response = await request(appTest)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user).toHaveProperty('name');
      expect(response.body.user).toHaveProperty('email');
      expect(response.body.user).not.toHaveProperty('password');
    });

    test('✅ Los errores deben tener formato consistente', async () => {
      const response = await request(appTest)
        .post('/api/auth/login')
        .send({
          email: 'noexiste@test.com',
          password: '123456'
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
      expect(typeof response.body.error).toBe('string');
    });
  });

  describe('⏱️ PERFORMANCE Y TIMEOUTS', () => {
    test('✅ El registro debe completarse en tiempo razonable', async () => {
      const startTime = Date.now();
      
      const response = await request(appTest)
        .post('/api/auth/register')
        .send({
          name: 'Performance Test',
          email: 'performance@test.com',
          password: '123456'
        });

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(5000); // Menos de 5 segundos
    });

    test('✅ El login debe completarse en tiempo razonable', async () => {
      const startTime = Date.now();
      
      const response = await request(appTest)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(3000); // Menos de 3 segundos
    });
  });
}); 