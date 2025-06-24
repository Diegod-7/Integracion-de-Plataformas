const request = require('supertest');
const express = require('express');
const cors = require('cors');
const authRoutes = require('../routes/authRoutes');

// Configurar la aplicación de prueba
const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);

describe('Pruebas de Integración - Autenticación', () => {
  
  describe('CASO001 - Registro de Usuario', () => {
    test('Paso 1: Registro exitoso con datos válidos', async () => {
      const userData = {
        name: 'Usuario Prueba',
        email: `test${Date.now()}@test.com`,
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('token');
      expect(response.body.name).toBe(userData.name);
      expect(response.body.email).toBe(userData.email);
    });

    test('Paso 2: Error al registrar email duplicado', async () => {
      const userData = {
        name: 'Usuario Prueba',
        email: 'duplicate@test.com',
        password: 'password123'
      };

      // Primer registro
      await request(app)
        .post('/api/auth/register')
        .send(userData);

      // Segundo registro con mismo email
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('El email ya está registrado');
    });

    test('Paso 3: Error con datos incompletos', async () => {
      const userData = {
        name: 'Usuario Prueba'
        // Faltan email y password
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(response.status).toBe(500);
    });
  });

  describe('CASO002 - Inicio de Sesión', () => {
    let testUser;

    beforeAll(async () => {
      // Crear usuario para las pruebas de login
      testUser = {
        name: 'Usuario Login',
        email: `login${Date.now()}@test.com`,
        password: 'password123'
      };

      await request(app)
        .post('/api/auth/register')
        .send(testUser);
    });

    test('Paso 1: Login exitoso con credenciales válidas', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body.email).toBe(testUser.email);
    });

    test('Paso 2: Error con email inexistente', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'noexiste@test.com',
          password: 'password123'
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Credenciales inválidas');
    });

    test('Paso 3: Error con contraseña incorrecta', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'passwordincorrecta'
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Credenciales inválidas');
    });
  });
}); 