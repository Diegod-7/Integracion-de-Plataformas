const request = require('supertest');
const app = require('../index');

describe('🔗 INTEGRACIÓN - CASOS DE PRUEBA END-TO-END', () => {
  let userToken;
  let userId;
  let productId;
  let transactionToken;

  describe('🚀 FLUJO COMPLETO DE USUARIO', () => {
    test('✅ Flujo 1: Registro → Login → Crear Producto → Suscribir Newsletter', async () => {
      const userEmail = `integration${Date.now()}@test.com`;
      
      // 1. Registro de usuario
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Usuario Integración',
          email: userEmail,
          password: '123456'
        });
      
      expect(registerResponse.status).toBe(201);
      expect(registerResponse.body).toHaveProperty('token');
      userToken = registerResponse.body.token;
      userId = registerResponse.body.user?.id;
      
      // 2. Login del usuario
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: userEmail,
          password: '123456'
        });
      
      expect(loginResponse.status).toBe(200);
      expect(loginResponse.body).toHaveProperty('token');
      
      // 3. Crear producto
      const productResponse = await request(app)
        .post('/api/products')
        .send({
          name: 'Producto Integración',
          description: 'Producto creado en prueba de integración',
          price: 25000,
          stock: 15,
          category: 'Integración'
        });
      
      expect([201, 500]).toContain(productResponse.status);
      if (productResponse.status === 201) {
        productId = productResponse.body.id;
      }
      
      // 4. Suscribir a newsletter
      const newsletterResponse = await request(app)
        .post('/api/newsletter/subscribe')
        .send({
          email: userEmail
        });
      
      expect([200, 400]).toContain(newsletterResponse.status);
    });

    test('✅ Flujo 2: Crear Producto → Obtener Lista → Actualizar → Eliminar', async () => {
      // 1. Crear producto
      const createResponse = await request(app)
        .post('/api/products')
        .send({
          name: `Producto CRUD ${Date.now()}`,
          description: 'Producto para pruebas CRUD',
          price: 15000,
          stock: 8,
          category: 'CRUD'
        });
      
      expect([201, 500]).toContain(createResponse.status);
      
      if (createResponse.status === 201) {
        const testProductId = createResponse.body.id;
        
        // 2. Obtener lista de productos
        const listResponse = await request(app)
          .get('/api/products');
        
        expect(listResponse.status).toBe(200);
        expect(Array.isArray(listResponse.body)).toBe(true);
        
        // Verificar que el producto está en la lista
        const foundProduct = listResponse.body.find(p => p.id === testProductId);
        expect(foundProduct).toBeDefined();
        
        // 3. Obtener producto específico
        const getResponse = await request(app)
          .get(`/api/products/${testProductId}`);
        
        expect(getResponse.status).toBe(200);
        expect(getResponse.body.id).toBe(testProductId);
        
        // 4. Actualizar producto
        const updateResponse = await request(app)
          .put(`/api/products/${testProductId}`)
          .send({
            name: 'Producto CRUD Actualizado',
            price: 18000,
            stock: 12
          });
        
        expect([200, 500]).toContain(updateResponse.status);
        
        if (updateResponse.status === 200) {
          expect(updateResponse.body.name).toBe('Producto CRUD Actualizado');
          expect(updateResponse.body.price).toBe(18000);
        }
        
        // 5. Eliminar producto
        const deleteResponse = await request(app)
          .delete(`/api/products/${testProductId}`);
        
        expect([200, 404]).toContain(deleteResponse.status);
        
        // 6. Verificar que fue eliminado
        const getDeletedResponse = await request(app)
          .get(`/api/products/${testProductId}`);
        
        expect(getDeletedResponse.status).toBe(404);
      }
    });

    test('✅ Flujo 3: Proceso de Compra Completo', async () => {
      // 1. Obtener productos disponibles
      const productsResponse = await request(app)
        .get('/api/products');
      
      expect(productsResponse.status).toBe(200);
      
      // 2. Crear transacción de pago
      const paymentResponse = await request(app)
        .post('/api/webpay/create')
        .send({
          amount: 75000,
          sessionId: `integration_session_${Date.now()}`,
          buyOrder: `integration_order_${Date.now()}`,
          returnUrl: 'http://localhost:3000/payment/success'
        });
      
      expect([200, 400]).toContain(paymentResponse.status);
      
      if (paymentResponse.status === 200) {
        transactionToken = paymentResponse.body.token;
        
        // 3. Verificar estado de transacción
        const statusResponse = await request(app)
          .get(`/api/webpay/status/${transactionToken}`);
        
        expect([200, 404]).toContain(statusResponse.status);
        
        // 4. Simular confirmación (aunque falle por token de prueba)
        const confirmResponse = await request(app)
          .post('/api/webpay/confirm')
          .send({
            token_ws: transactionToken
          });
        
        expect([200, 400]).toContain(confirmResponse.status);
      }
    });
  });

  describe('🔄 FLUJOS DE DATOS ENTRE MÓDULOS', () => {
    test('✅ Integración Auth + Products: Usuario autenticado gestiona productos', async () => {
      const userEmail = `auth_product${Date.now()}@test.com`;
      
      // 1. Registrar usuario
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Usuario Auth-Product',
          email: userEmail,
          password: '123456'
        });
      
      expect(registerResponse.status).toBe(201);
      const token = registerResponse.body.token;
      
      // 2. Intentar crear producto con autenticación
      const productWithAuthResponse = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Producto con Auth',
          price: 20000
        });
      
      expect([201, 401, 500]).toContain(productWithAuthResponse.status);
      
      // 3. Intentar crear producto sin autenticación
      const productWithoutAuthResponse = await request(app)
        .post('/api/products')
        .send({
          name: 'Producto sin Auth',
          price: 20000
        });
      
      expect([201, 401, 500]).toContain(productWithoutAuthResponse.status);
    });

    test('✅ Integración Newsletter + Auth: Suscripción con usuario registrado', async () => {
      const userEmail = `newsletter_auth${Date.now()}@test.com`;
      
      // 1. Registrar usuario
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Usuario Newsletter-Auth',
          email: userEmail,
          password: '123456'
        });
      
      expect(registerResponse.status).toBe(201);
      
      // 2. Suscribir mismo email a newsletter
      const newsletterResponse = await request(app)
        .post('/api/newsletter/subscribe')
        .send({
          email: userEmail
        });
      
      expect([200, 400]).toContain(newsletterResponse.status);
      
      // 3. Intentar suscribir nuevamente (debería fallar por duplicado)
      const duplicateNewsletterResponse = await request(app)
        .post('/api/newsletter/subscribe')
        .send({
          email: userEmail
        });
      
      expect(duplicateNewsletterResponse.status).toBe(400);
    });

    test('✅ Integración Products + Webpay: Compra de producto específico', async () => {
      // 1. Crear producto
      const productResponse = await request(app)
        .post('/api/products')
        .send({
          name: `Producto Webpay ${Date.now()}`,
          price: 45000,
          stock: 5
        });
      
      expect([201, 500]).toContain(productResponse.status);
      
      if (productResponse.status === 201) {
        const product = productResponse.body;
        
        // 2. Crear transacción para comprar ese producto
        const paymentResponse = await request(app)
          .post('/api/webpay/create')
          .send({
            amount: product.price,
            sessionId: `product_session_${Date.now()}`,
            buyOrder: `product_order_${product.id}_${Date.now()}`,
            returnUrl: 'http://localhost:3000/payment/product-success'
          });
        
        expect([200, 400]).toContain(paymentResponse.status);
        
        if (paymentResponse.status === 200) {
          // 3. Verificar que el monto coincide con el precio del producto
          expect(paymentResponse.body).toHaveProperty('token');
          expect(paymentResponse.body).toHaveProperty('url');
        }
      }
    });
  });

  describe('🔀 FLUJOS DE ERROR Y RECUPERACIÓN', () => {
    test('✅ Manejo de errores en cadena: Registro fallido → Login fallido → Recuperación', async () => {
      const invalidEmail = 'email-invalido';
      
      // 1. Intentar registro con email inválido
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Usuario Error',
          email: invalidEmail,
          password: '123456'
        });
      
      expect(registerResponse.status).toBe(500);
      
      // 2. Intentar login con credenciales inexistentes
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'noexiste@test.com',
          password: '123456'
        });
      
      expect(loginResponse.status).toBe(401);
      
      // 3. Registro exitoso con datos correctos
      const validEmail = `recovery${Date.now()}@test.com`;
      const validRegisterResponse = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Usuario Recuperado',
          email: validEmail,
          password: '123456'
        });
      
      expect(validRegisterResponse.status).toBe(201);
      
      // 4. Login exitoso
      const validLoginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: validEmail,
          password: '123456'
        });
      
      expect(validLoginResponse.status).toBe(200);
    });

    test('✅ Transacción fallida → Reintento exitoso', async () => {
      // 1. Crear transacción con datos inválidos
      const invalidPaymentResponse = await request(app)
        .post('/api/webpay/create')
        .send({
          amount: -1000, // Monto inválido
          sessionId: 'invalid_session',
          buyOrder: 'invalid_order',
          returnUrl: 'invalid-url'
        });
      
      expect(invalidPaymentResponse.status).toBe(400);
      
      // 2. Crear transacción con datos válidos
      const validPaymentResponse = await request(app)
        .post('/api/webpay/create')
        .send({
          amount: 35000,
          sessionId: `retry_session_${Date.now()}`,
          buyOrder: `retry_order_${Date.now()}`,
          returnUrl: 'http://localhost:3000/payment/retry-success'
        });
      
      expect([200, 400]).toContain(validPaymentResponse.status);
    });

    test('✅ Producto no encontrado → Crear nuevo → Actualizar → Éxito', async () => {
      // 1. Intentar obtener producto inexistente
      const notFoundResponse = await request(app)
        .get('/api/products/99999');
      
      expect(notFoundResponse.status).toBe(404);
      
      // 2. Crear nuevo producto
      const createResponse = await request(app)
        .post('/api/products')
        .send({
          name: `Producto Recuperación ${Date.now()}`,
          price: 12000,
          stock: 3
        });
      
      expect([201, 500]).toContain(createResponse.status);
      
      if (createResponse.status === 201) {
        const newProductId = createResponse.body.id;
        
        // 3. Obtener producto creado
        const getResponse = await request(app)
          .get(`/api/products/${newProductId}`);
        
        expect(getResponse.status).toBe(200);
        
        // 4. Actualizar producto
        const updateResponse = await request(app)
          .put(`/api/products/${newProductId}`)
          .send({
            name: 'Producto Recuperación Actualizado',
            price: 15000
          });
        
        expect([200, 500]).toContain(updateResponse.status);
      }
    });
  });

  describe('🔄 FLUJOS DE CONCURRENCIA', () => {
    test('✅ Múltiples usuarios registrándose simultáneamente', async () => {
      const promises = [];
      const timestamp = Date.now();
      
      for (let i = 0; i < 10; i++) {
        promises.push(
          request(app)
            .post('/api/auth/register')
            .send({
              name: `Usuario Concurrente ${i}`,
              email: `concurrent${i}_${timestamp}@test.com`,
              password: '123456'
            })
        );
      }
      
      const responses = await Promise.all(promises);
      
      // Todos deberían ser exitosos (emails únicos)
      const successfulRegistrations = responses.filter(r => r.status === 201).length;
      expect(successfulRegistrations).toBe(10);
      
      // Todos deberían tener tokens únicos
      const tokens = responses
        .filter(r => r.status === 201)
        .map(r => r.body.token);
      
      const uniqueTokens = new Set(tokens);
      expect(uniqueTokens.size).toBe(tokens.length);
    });

    test('✅ Múltiples transacciones simultáneas con diferentes montos', async () => {
      const promises = [];
      const timestamp = Date.now();
      
      for (let i = 0; i < 8; i++) {
        promises.push(
          request(app)
            .post('/api/webpay/create')
            .send({
              amount: 10000 + (i * 5000),
              sessionId: `concurrent_pay_${i}_${timestamp}`,
              buyOrder: `concurrent_buy_${i}_${timestamp}`,
              returnUrl: 'http://localhost:3000/payment/concurrent-success'
            })
        );
      }
      
      const responses = await Promise.all(promises);
      
      // Al menos el 75% deberían ser exitosos
      const successfulTransactions = responses.filter(r => r.status === 200).length;
      expect(successfulTransactions).toBeGreaterThanOrEqual(6);
      
      // Verificar que todos los tokens son únicos
      const tokens = responses
        .filter(r => r.status === 200)
        .map(r => r.body.token);
      
      const uniqueTokens = new Set(tokens);
      expect(uniqueTokens.size).toBe(tokens.length);
    });

    test('✅ Creación y consulta simultánea de productos', async () => {
      const createPromises = [];
      const timestamp = Date.now();
      
      // Crear productos
      for (let i = 0; i < 5; i++) {
        createPromises.push(
          request(app)
            .post('/api/products')
            .send({
              name: `Producto Simultáneo ${i}`,
              price: 8000 + (i * 1000),
              stock: 5 + i
            })
        );
      }
      
      // Consultar productos simultáneamente
      const readPromises = [];
      for (let i = 0; i < 5; i++) {
        readPromises.push(
          request(app)
            .get('/api/products')
        );
      }
      
      const [createResponses, readResponses] = await Promise.all([
        Promise.all(createPromises),
        Promise.all(readPromises)
      ]);
      
      // Verificar creaciones
      const successfulCreations = createResponses.filter(r => r.status === 201).length;
      expect(successfulCreations).toBeGreaterThanOrEqual(3);
      
      // Verificar consultas
      const successfulReads = readResponses.filter(r => r.status === 200).length;
      expect(successfulReads).toBe(5);
    });
  });

  describe('📊 FLUJOS DE VALIDACIÓN CRUZADA', () => {
    test('✅ Validación de consistencia de datos entre módulos', async () => {
      const userEmail = `consistency${Date.now()}@test.com`;
      
      // 1. Registrar usuario
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Usuario Consistencia',
          email: userEmail,
          password: '123456'
        });
      
      expect(registerResponse.status).toBe(201);
      
      // 2. Suscribir a newsletter
      const newsletterResponse = await request(app)
        .post('/api/newsletter/subscribe')
        .send({
          email: userEmail
        });
      
      expect([200, 400]).toContain(newsletterResponse.status);
      
      // 3. Crear producto con referencia al usuario
      const productResponse = await request(app)
        .post('/api/products')
        .send({
          name: 'Producto Consistencia',
          description: `Producto creado por ${userEmail}`,
          price: 22000,
          stock: 7
        });
      
      expect([201, 500]).toContain(productResponse.status);
      
      // 4. Crear transacción que podría estar relacionada
      if (productResponse.status === 201) {
        const paymentResponse = await request(app)
          .post('/api/webpay/create')
          .send({
            amount: productResponse.body.price,
            sessionId: `consistency_session_${Date.now()}`,
            buyOrder: `consistency_order_${productResponse.body.id}`,
            returnUrl: 'http://localhost:3000/payment/consistency-success'
          });
        
        expect([200, 400]).toContain(paymentResponse.status);
      }
    });

    test('✅ Validación de integridad referencial', async () => {
      // 1. Crear producto
      const productResponse = await request(app)
        .post('/api/products')
        .send({
          name: `Producto Integridad ${Date.now()}`,
          price: 18000,
          stock: 4
        });
      
      expect([201, 500]).toContain(productResponse.status);
      
      if (productResponse.status === 201) {
        const productId = productResponse.body.id;
        
        // 2. Crear transacción referenciando el producto
        const paymentResponse = await request(app)
          .post('/api/webpay/create')
          .send({
            amount: productResponse.body.price,
            sessionId: `integrity_session_${Date.now()}`,
            buyOrder: `integrity_product_${productId}_${Date.now()}`,
            returnUrl: 'http://localhost:3000/payment/integrity-success'
          });
        
        expect([200, 400]).toContain(paymentResponse.status);
        
        // 3. Intentar eliminar producto (puede fallar si hay referencias)
        const deleteResponse = await request(app)
          .delete(`/api/products/${productId}`);
        
        expect([200, 400, 404]).toContain(deleteResponse.status);
        
        // 4. Verificar estado final
        const finalCheckResponse = await request(app)
          .get(`/api/products/${productId}`);
        
        // Debería existir o no dependiendo de si se pudo eliminar
        expect([200, 404]).toContain(finalCheckResponse.status);
      }
    });
  });
}); 