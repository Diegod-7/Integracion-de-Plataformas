const request = require('supertest');
const express = require('express');
const cors = require('cors');
const newsletterRoutes = require('../routes/newsletterRoutes');

// Configurar la aplicación de prueba
const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/newsletter', newsletterRoutes);

describe('Pruebas de Integración - Newsletter', () => {
  
  describe('CASO003 - Suscripción al Newsletter', () => {
    test('Paso 1: Suscripción exitosa con email válido', async () => {
      const email = `newsletter${Date.now()}@test.com`;

      const response = await request(app)
        .post('/api/newsletter/subscribe')
        .send({ email });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('¡Gracias por suscribirte!');
    });

    test('Paso 2: Error con email inválido', async () => {
      const response = await request(app)
        .post('/api/newsletter/subscribe')
        .send({ email: 'email-invalido' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid email');
    });

    test('Paso 3: Error con email duplicado', async () => {
      const email = 'duplicate-newsletter@test.com';

      // Primera suscripción
      await request(app)
        .post('/api/newsletter/subscribe')
        .send({ email });

      // Segunda suscripción con mismo email
      const response = await request(app)
        .post('/api/newsletter/subscribe')
        .send({ email });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Already subscribed');
    });

    test('Paso 4: Error sin proporcionar email', async () => {
      const response = await request(app)
        .post('/api/newsletter/subscribe')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid email');
    });
  });
}); 