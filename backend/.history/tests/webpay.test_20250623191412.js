const request = require('supertest');
const express = require('express');
const cors = require('cors');
const webpayRoutes = require('../routes/webpayRoutes');

// Configurar la aplicación de prueba
const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/webpay', webpayRoutes);

describe('Pruebas de Integración - Webpay', () => {
  
  describe('CASO005 - Procesamiento de Pagos', () => {
    test('Paso 1: Crear transacción de pago', async () => {
      const transactionData = {
        amount: 50000,
        sessionId: `session_${Date.now()}`,
        buyOrder: `order_${Date.now()}`,
        returnUrl: 'http://localhost:3000/return'
      };

      const response = await request(app)
        .post('/api/webpay/create')
        .send(transactionData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('url');
      expect(response.body).toHaveProperty('token');
    });

    test('Paso 2: Confirmar transacción exitosa', async () => {
      const confirmData = {
        token_ws: 'test_token_123'
      };

      const response = await request(app)
        .post('/api/webpay/confirm')
        .send(confirmData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status');
    });

    test('Paso 3: Error al crear transacción sin datos requeridos', async () => {
      const response = await request(app)
        .post('/api/webpay/create')
        .send({});

      expect(response.status).toBe(400);
    });

    test('Paso 4: Error al confirmar transacción sin token', async () => {
      const response = await request(app)
        .post('/api/webpay/confirm')
        .send({});

      expect(response.status).toBe(400);
    });

    test('Paso 5: Error con monto inválido', async () => {
      const transactionData = {
        amount: -100,
        sessionId: `session_${Date.now()}`,
        buyOrder: `order_${Date.now()}`,
        returnUrl: 'http://localhost:3000/return'
      };

      const response = await request(app)
        .post('/api/webpay/create')
        .send(transactionData);

      expect(response.status).toBe(400);
    });

    test('Paso 6: Error con token inválido en confirmación', async () => {
      const confirmData = {
        token_ws: 'invalid_token'
      };

      const response = await request(app)
        .post('/api/webpay/confirm')
        .send(confirmData);

      expect(response.status).toBe(400);
    });
  });
}); 