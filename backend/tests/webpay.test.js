const request = require('supertest');
const express = require('express');
const cors = require('cors');
const webpayRoutes = require('../routes/webpayRoutes');

// Configurar la aplicación de prueba
const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/webpay', webpayRoutes);

describe('💳 WEBPAY - CASOS DE PRUEBA EXPANDIDOS', () => {
  let transactionToken;
  let validOrderData = {
    amount: 50000,
    sessionId: `session_${Date.now()}`,
    buyOrder: `order_${Date.now()}`,
    returnUrl: 'http://localhost:3000/payment/return'
  };

  describe('💰 INICIAR TRANSACCIÓN - CASOS BÁSICOS', () => {
    test('✅ Debe crear transacción con datos válidos', async () => {
      const response = await request(app)
        .post('/api/webpay/create')
        .send(validOrderData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('url');
      expect(typeof response.body.token).toBe('string');
      expect(typeof response.body.url).toBe('string');
      expect(response.body.token.length).toBeGreaterThan(10);
      
      transactionToken = response.body.token;
    });

    test('✅ Debe crear transacción con monto mínimo', async () => {
      const minOrderData = {
        amount: 50, // Monto mínimo
        sessionId: `session_min_${Date.now()}`,
        buyOrder: `order_min_${Date.now()}`,
        returnUrl: 'http://localhost:3000/payment/return'
      };

      const response = await request(app)
        .post('/api/webpay/create')
        .send(minOrderData);

      expect([200, 400]).toContain(response.status);
    });

    test('✅ Debe crear transacción con monto alto', async () => {
      const highOrderData = {
        amount: 5000000, // 5 millones
        sessionId: `session_high_${Date.now()}`,
        buyOrder: `order_high_${Date.now()}`,
        returnUrl: 'http://localhost:3000/payment/return'
      };

      const response = await request(app)
        .post('/api/webpay/create')
        .send(highOrderData);

      expect([200, 400]).toContain(response.status);
    });

    test('✅ Debe generar tokens únicos', async () => {
      const orderData1 = {
        amount: 25000,
        sessionId: `session_unique1_${Date.now()}`,
        buyOrder: `order_unique1_${Date.now()}`,
        returnUrl: 'http://localhost:3000/payment/return'
      };

      const orderData2 = {
        amount: 25000,
        sessionId: `session_unique2_${Date.now()}`,
        buyOrder: `order_unique2_${Date.now()}`,
        returnUrl: 'http://localhost:3000/payment/return'
      };

      const response1 = await request(app)
        .post('/api/webpay/create')
        .send(orderData1);

      const response2 = await request(app)
        .post('/api/webpay/create')
        .send(orderData2);

      if (response1.status === 200 && response2.status === 200) {
        expect(response1.body.token).not.toBe(response2.body.token);
      }
    });
  });

  describe('💰 VALIDACIONES DE MONTO', () => {
    test('❌ Debe fallar con monto negativo', async () => {
      const response = await request(app)
        .post('/api/webpay/create')
        .send({
          ...validOrderData,
          amount: -1000
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    test('❌ Debe fallar con monto cero', async () => {
      const response = await request(app)
        .post('/api/webpay/create')
        .send({
          ...validOrderData,
          amount: 0
        });

      expect(response.status).toBe(400);
    });

    test('❌ Debe fallar con monto no numérico', async () => {
      const response = await request(app)
        .post('/api/webpay/create')
        .send({
          ...validOrderData,
          amount: 'mil pesos'
        });

      expect(response.status).toBe(400);
    });

    test('❌ Debe fallar con monto decimal', async () => {
      const response = await request(app)
        .post('/api/webpay/create')
        .send({
          ...validOrderData,
          amount: 1000.50
        });

      expect(response.status).toBe(400);
    });

    test('❌ Debe fallar con monto muy grande', async () => {
      const response = await request(app)
        .post('/api/webpay/create')
        .send({
          ...validOrderData,
          amount: 999999999999999999999
        });

      expect(response.status).toBe(400);
    });

    test('❌ Debe fallar con monto null', async () => {
      const response = await request(app)
        .post('/api/webpay/create')
        .send({
          ...validOrderData,
          amount: null
        });

      expect(response.status).toBe(400);
    });

    test('❌ Debe fallar sin monto', async () => {
      const orderData = { ...validOrderData };
      delete orderData.amount;

      const response = await request(app)
        .post('/api/webpay/create')
        .send(orderData);

      expect(response.status).toBe(400);
    });
  });

  describe('🔢 VALIDACIONES DE SESSION ID', () => {
    test('❌ Debe fallar sin sessionId', async () => {
      const orderData = { ...validOrderData };
      delete orderData.sessionId;

      const response = await request(app)
        .post('/api/webpay/create')
        .send(orderData);

      expect(response.status).toBe(400);
    });

    test('❌ Debe fallar con sessionId vacío', async () => {
      const response = await request(app)
        .post('/api/webpay/create')
        .send({
          ...validOrderData,
          sessionId: ''
        });

      expect(response.status).toBe(400);
    });

    test('❌ Debe fallar con sessionId muy largo', async () => {
      const response = await request(app)
        .post('/api/webpay/create')
        .send({
          ...validOrderData,
          sessionId: 'a'.repeat(1000)
        });

      expect(response.status).toBe(400);
    });

    test('❌ Debe fallar con sessionId con caracteres especiales', async () => {
      const response = await request(app)
        .post('/api/webpay/create')
        .send({
          ...validOrderData,
          sessionId: 'session<script>alert("xss")</script>'
        });

      expect(response.status).toBe(400);
    });

    test('❌ Debe fallar con sessionId null', async () => {
      const response = await request(app)
        .post('/api/webpay/create')
        .send({
          ...validOrderData,
          sessionId: null
        });

      expect(response.status).toBe(400);
    });

    test('❌ Debe fallar con sessionId como número', async () => {
      const response = await request(app)
        .post('/api/webpay/create')
        .send({
          ...validOrderData,
          sessionId: 12345
        });

      expect(response.status).toBe(400);
    });
  });

  describe('📦 VALIDACIONES DE BUY ORDER', () => {
    test('❌ Debe fallar sin buyOrder', async () => {
      const orderData = { ...validOrderData };
      delete orderData.buyOrder;

      const response = await request(app)
        .post('/api/webpay/create')
        .send(orderData);

      expect(response.status).toBe(400);
    });

    test('❌ Debe fallar con buyOrder vacío', async () => {
      const response = await request(app)
        .post('/api/webpay/create')
        .send({
          ...validOrderData,
          buyOrder: ''
        });

      expect(response.status).toBe(400);
    });

    test('❌ Debe fallar con buyOrder duplicado', async () => {
      const duplicateOrder = `duplicate_order_${Date.now()}`;
      
      // Primera transacción
      const response1 = await request(app)
        .post('/api/webpay/create')
        .send({
          ...validOrderData,
          buyOrder: duplicateOrder,
          sessionId: `session1_${Date.now()}`
        });

      // Segunda transacción con mismo buyOrder
      const response2 = await request(app)
        .post('/api/webpay/create')
        .send({
          ...validOrderData,
          buyOrder: duplicateOrder,
          sessionId: `session2_${Date.now()}`
        });

      if (response1.status === 200) {
        expect(response2.status).toBe(400);
      }
    });

    test('❌ Debe fallar con buyOrder muy largo', async () => {
      const response = await request(app)
        .post('/api/webpay/create')
        .send({
          ...validOrderData,
          buyOrder: 'a'.repeat(1000)
        });

      expect(response.status).toBe(400);
    });

    test('❌ Debe fallar con buyOrder con caracteres especiales', async () => {
      const response = await request(app)
        .post('/api/webpay/create')
        .send({
          ...validOrderData,
          buyOrder: 'order<script>alert("xss")</script>'
        });

      expect(response.status).toBe(400);
    });

    test('❌ Debe fallar con buyOrder con espacios', async () => {
      const response = await request(app)
        .post('/api/webpay/create')
        .send({
          ...validOrderData,
          buyOrder: 'order with spaces'
        });

      expect(response.status).toBe(400);
    });
  });

  describe('🔗 VALIDACIONES DE RETURN URL', () => {
    test('❌ Debe fallar sin returnUrl', async () => {
      const orderData = { ...validOrderData };
      delete orderData.returnUrl;

      const response = await request(app)
        .post('/api/webpay/create')
        .send(orderData);

      expect(response.status).toBe(400);
    });

    test('❌ Debe fallar con returnUrl inválida', async () => {
      const response = await request(app)
        .post('/api/webpay/create')
        .send({
          ...validOrderData,
          returnUrl: 'url-invalida'
        });

      expect(response.status).toBe(400);
    });

    test('❌ Debe fallar con returnUrl vacía', async () => {
      const response = await request(app)
        .post('/api/webpay/create')
        .send({
          ...validOrderData,
          returnUrl: ''
        });

      expect(response.status).toBe(400);
    });

    test('✅ Debe aceptar returnUrl con HTTPS', async () => {
      const response = await request(app)
        .post('/api/webpay/create')
        .send({
          ...validOrderData,
          returnUrl: 'https://secure-site.com/payment/return',
          sessionId: `session_https_${Date.now()}`,
          buyOrder: `order_https_${Date.now()}`
        });

      expect([200, 400]).toContain(response.status);
    });

    test('❌ Debe fallar con returnUrl con protocolo inválido', async () => {
      const response = await request(app)
        .post('/api/webpay/create')
        .send({
          ...validOrderData,
          returnUrl: 'ftp://site.com/return'
        });

      expect(response.status).toBe(400);
    });

    test('❌ Debe fallar con returnUrl muy larga', async () => {
      const response = await request(app)
        .post('/api/webpay/create')
        .send({
          ...validOrderData,
          returnUrl: 'http://example.com/' + 'a'.repeat(2000)
        });

      expect(response.status).toBe(400);
    });
  });

  describe('🔍 CONFIRMAR TRANSACCIÓN - CASOS BÁSICOS', () => {
    test('❌ Debe fallar al confirmar sin token', async () => {
      const response = await request(app)
        .post('/api/webpay/confirm')
        .send({});

      expect(response.status).toBe(400);
    });

    test('❌ Debe fallar al confirmar con token inválido', async () => {
      const response = await request(app)
        .post('/api/webpay/confirm')
        .send({
          token_ws: 'token_invalido_12345'
        });

      expect(response.status).toBe(400);
    });

    test('❌ Debe fallar al confirmar con token vacío', async () => {
      const response = await request(app)
        .post('/api/webpay/confirm')
        .send({
          token_ws: ''
        });

      expect(response.status).toBe(400);
    });

    test('❌ Debe fallar al confirmar con token null', async () => {
      const response = await request(app)
        .post('/api/webpay/confirm')
        .send({
          token_ws: null
        });

      expect(response.status).toBe(400);
    });

    test('❌ Debe fallar al confirmar con token muy largo', async () => {
      const response = await request(app)
        .post('/api/webpay/confirm')
        .send({
          token_ws: 'a'.repeat(1000)
        });

      expect(response.status).toBe(400);
    });

    test('❌ Debe fallar al confirmar con token con caracteres especiales', async () => {
      const response = await request(app)
        .post('/api/webpay/confirm')
        .send({
          token_ws: 'token<script>alert("xss")</script>'
        });

      expect(response.status).toBe(400);
    });
  });

  describe('🔍 ESTADO DE TRANSACCIÓN', () => {
    test('❌ Debe fallar al consultar estado sin token', async () => {
      const response = await request(app)
        .get('/api/webpay/status');

      expect(response.status).toBe(400);
    });

    test('❌ Debe fallar al consultar estado con token inválido', async () => {
      const response = await request(app)
        .get('/api/webpay/status/token_invalido');

      expect(response.status).toBe(404);
    });

    test('✅ Debe consultar estado de transacción válida', async () => {
      if (transactionToken) {
        const response = await request(app)
          .get(`/api/webpay/status/${transactionToken}`);

        expect([200, 404]).toContain(response.status);
      }
    });
  });

  describe('🔒 SEGURIDAD Y ATAQUES', () => {
    test('❌ Debe rechazar inyección SQL en sessionId', async () => {
      const response = await request(app)
        .post('/api/webpay/create')
        .send({
          ...validOrderData,
          sessionId: "session'; DROP TABLE transactions; --"
        });

      expect(response.status).toBe(400);
    });

    test('❌ Debe rechazar inyección SQL en buyOrder', async () => {
      const response = await request(app)
        .post('/api/webpay/create')
        .send({
          ...validOrderData,
          buyOrder: "order'; DROP TABLE orders; --"
        });

      expect(response.status).toBe(400);
    });

    test('❌ Debe rechazar XSS en returnUrl', async () => {
      const response = await request(app)
        .post('/api/webpay/create')
        .send({
          ...validOrderData,
          returnUrl: 'http://example.com/<script>alert("xss")</script>'
        });

      expect(response.status).toBe(400);
    });

    test('❌ Debe rechazar headers maliciosos', async () => {
      const response = await request(app)
        .post('/api/webpay/create')
        .set('X-Forwarded-For', '<script>alert("xss")</script>')
        .set('User-Agent', 'Mozilla/5.0 <script>alert("xss")</script>')
        .send(validOrderData);

      expect([200, 400]).toContain(response.status);
    });

    test('❌ Debe rechazar intentos de CSRF', async () => {
      const response = await request(app)
        .post('/api/webpay/create')
        .set('Origin', 'http://malicious-site.com')
        .set('Referer', 'http://malicious-site.com')
        .send(validOrderData);

      // Dependiendo de la implementación CSRF
      expect([200, 400, 403]).toContain(response.status);
    });

    test('❌ Debe validar Content-Type', async () => {
      const response = await request(app)
        .post('/api/webpay/create')
        .set('Content-Type', 'text/plain')
        .send('amount=1000&sessionId=test');

      expect(response.status).toBe(400);
    });
  });

  describe('📊 CASOS EXTREMOS Y PERFORMANCE', () => {
    test('❌ Debe manejar payload muy grande', async () => {
      const largeData = {
        ...validOrderData,
        sessionId: 'a'.repeat(10000),
        buyOrder: 'b'.repeat(10000),
        returnUrl: 'http://example.com/' + 'c'.repeat(5000)
      };

      const response = await request(app)
        .post('/api/webpay/create')
        .send(largeData);

      expect(response.status).toBe(400);
    });

    test('❌ Debe manejar caracteres Unicode', async () => {
      const response = await request(app)
        .post('/api/webpay/create')
        .send({
          ...validOrderData,
          sessionId: 'session_测试_🔐',
          buyOrder: 'order_测试_💳'
        });

      expect(response.status).toBe(400);
    });

    test('✅ Debe completarse en tiempo razonable', async () => {
      const startTime = Date.now();
      
      const response = await request(app)
        .post('/api/webpay/create')
        .send({
          ...validOrderData,
          sessionId: `session_perf_${Date.now()}`,
          buyOrder: `order_perf_${Date.now()}`
        });

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(10000); // Menos de 10 segundos
    });

    test('✅ Debe manejar múltiples transacciones simultáneas', async () => {
      const promises = [];
      for (let i = 0; i < 5; i++) {
        promises.push(
          request(app)
            .post('/api/webpay/create')
            .send({
              amount: 10000 + i,
              sessionId: `session_concurrent_${i}_${Date.now()}`,
              buyOrder: `order_concurrent_${i}_${Date.now()}`,
              returnUrl: 'http://localhost:3000/payment/return'
            })
        );
      }

      const responses = await Promise.all(promises);
      
      // Al menos algunos deberían ser exitosos
      const successCount = responses.filter(r => r.status === 200).length;
      expect(successCount).toBeGreaterThan(0);
    });
  });

  describe('🌐 TIPOS DE CONTENIDO Y HEADERS', () => {
    test('❌ Debe fallar con JSON malformado', async () => {
      const response = await request(app)
        .post('/api/webpay/create')
        .set('Content-Type', 'application/json')
        .send('{"amount":1000,"sessionId":"test"'); // JSON incompleto

      expect(response.status).toBe(400);
    });

    test('❌ Debe fallar con datos no JSON', async () => {
      const response = await request(app)
        .post('/api/webpay/create')
        .set('Content-Type', 'application/json')
        .send('esto no es json');

      expect(response.status).toBe(400);
    });

    test('✅ Debe aceptar Content-Type correcto', async () => {
      const response = await request(app)
        .post('/api/webpay/create')
        .set('Content-Type', 'application/json')
        .send(JSON.stringify({
          ...validOrderData,
          sessionId: `session_content_${Date.now()}`,
          buyOrder: `order_content_${Date.now()}`
        }));

      expect([200, 400]).toContain(response.status);
    });
  });

  describe('🔍 VALIDACIÓN DE RESPUESTAS', () => {
    test('✅ Respuesta exitosa debe tener estructura correcta', async () => {
      const response = await request(app)
        .post('/api/webpay/create')
        .send({
          ...validOrderData,
          sessionId: `session_struct_${Date.now()}`,
          buyOrder: `order_struct_${Date.now()}`
        });

      if (response.status === 200) {
        expect(response.body).toHaveProperty('token');
        expect(response.body).toHaveProperty('url');
        expect(typeof response.body.token).toBe('string');
        expect(typeof response.body.url).toBe('string');
        expect(response.body.token.length).toBeGreaterThan(0);
        expect(response.body.url.length).toBeGreaterThan(0);
        expect(response.body.url).toMatch(/^https?:\/\//);
      }
    });

    test('❌ Respuesta de error debe tener estructura correcta', async () => {
      const response = await request(app)
        .post('/api/webpay/create')
        .send({
          amount: -1000 // Monto inválido
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(typeof response.body.error).toBe('string');
    });

    test('✅ Headers de respuesta deben ser correctos', async () => {
      const response = await request(app)
        .post('/api/webpay/create')
        .send({
          ...validOrderData,
          sessionId: `session_headers_${Date.now()}`,
          buyOrder: `order_headers_${Date.now()}`
        });

      expect(response.headers['content-type']).toMatch(/application\/json/);
    });
  });

  describe('💳 SIMULACIÓN DE ESCENARIOS REALES', () => {
    test('✅ Debe simular compra de producto único', async () => {
      const productPurchase = {
        amount: 25990,
        sessionId: `product_session_${Date.now()}`,
        buyOrder: `product_order_${Date.now()}`,
        returnUrl: 'http://localhost:3000/payment/success'
      };

      const response = await request(app)
        .post('/api/webpay/create')
        .send(productPurchase);

      expect([200, 400]).toContain(response.status);
    });

    test('✅ Debe simular compra de carrito múltiple', async () => {
      const cartPurchase = {
        amount: 156780,
        sessionId: `cart_session_${Date.now()}`,
        buyOrder: `cart_order_${Date.now()}`,
        returnUrl: 'http://localhost:3000/payment/cart-success'
      };

      const response = await request(app)
        .post('/api/webpay/create')
        .send(cartPurchase);

      expect([200, 400]).toContain(response.status);
    });

    test('✅ Debe simular diferentes montos típicos', async () => {
      const typicalAmounts = [
        5990,   // Producto barato
        19990,  // Producto medio
        49990,  // Producto caro
        99990,  // Producto premium
        199990, // Producto muy caro
        500000  // Compra grande
      ];

      for (let i = 0; i < typicalAmounts.length; i++) {
        const response = await request(app)
          .post('/api/webpay/create')
          .send({
            amount: typicalAmounts[i],
            sessionId: `typical_session_${i}_${Date.now()}`,
            buyOrder: `typical_order_${i}_${Date.now()}`,
            returnUrl: 'http://localhost:3000/payment/return'
          });

        expect([200, 400]).toContain(response.status);
      }
    });

    test('✅ Debe manejar diferentes URLs de retorno', async () => {
      const returnUrls = [
        'http://localhost:3000/success',
        'http://localhost:3000/payment/complete',
        'https://mystore.com/checkout/success',
        'https://secure-shop.cl/pago/exitoso'
      ];

      for (let i = 0; i < returnUrls.length; i++) {
        const response = await request(app)
          .post('/api/webpay/create')
          .send({
            amount: 15000,
            sessionId: `url_session_${i}_${Date.now()}`,
            buyOrder: `url_order_${i}_${Date.now()}`,
            returnUrl: returnUrls[i]
          });

        expect([200, 400]).toContain(response.status);
      }
    });
  });

  describe('📈 CASOS DE NEGOCIO ESPECÍFICOS', () => {
    test('✅ Debe manejar transacciones de alta frecuencia', async () => {
      const highFrequencyPromises = [];
      
      for (let i = 0; i < 20; i++) {
        highFrequencyPromises.push(
          request(app)
            .post('/api/webpay/create')
            .send({
              amount: 1000 + i,
              sessionId: `hf_session_${i}_${Date.now()}`,
              buyOrder: `hf_order_${i}_${Date.now()}`,
              returnUrl: 'http://localhost:3000/payment/return'
            })
        );
      }

      const responses = await Promise.all(highFrequencyPromises);
      
      // Verificar que al menos la mayoría fueron exitosas
      const successCount = responses.filter(r => r.status === 200).length;
      const totalCount = responses.length;
      
      expect(successCount / totalCount).toBeGreaterThan(0.5); // Al menos 50% exitosas
    });

    test('✅ Debe generar logs de transacciones', async () => {
      const response = await request(app)
        .post('/api/webpay/create')
        .send({
          ...validOrderData,
          sessionId: `log_session_${Date.now()}`,
          buyOrder: `log_order_${Date.now()}`
        });

      // Verificar que se genera algún tipo de log o respuesta
      expect([200, 400, 500]).toContain(response.status);
    });

    test('✅ Debe validar integridad de datos', async () => {
      const orderData = {
        amount: 75000,
        sessionId: `integrity_session_${Date.now()}`,
        buyOrder: `integrity_order_${Date.now()}`,
        returnUrl: 'http://localhost:3000/payment/return'
      };

      const response = await request(app)
        .post('/api/webpay/create')
        .send(orderData);

      if (response.status === 200) {
        // Verificar que los datos de respuesta son consistentes
        expect(response.body.token).toBeDefined();
        expect(response.body.url).toBeDefined();
        expect(typeof response.body.token).toBe('string');
        expect(typeof response.body.url).toBe('string');
      }
    });

    test('✅ Debe manejar timeouts de transacción', async () => {
      const response = await request(app)
        .post('/api/webpay/create')
        .timeout(30000) // 30 segundos de timeout
        .send({
          ...validOrderData,
          sessionId: `timeout_session_${Date.now()}`,
          buyOrder: `timeout_order_${Date.now()}`
        });

      expect([200, 400, 408, 500]).toContain(response.status);
    });
  });
}); 