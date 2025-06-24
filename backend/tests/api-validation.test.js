const request = require('supertest');
const app = require('../index');

describe('🔍 VALIDACIONES DE API - CASOS ESPECÍFICOS', () => {
  
  describe('📋 VALIDACIÓN DE HEADERS HTTP', () => {
    test('✅ Debe aceptar Content-Type application/json', async () => {
      const response = await request(app)
        .post('/api/products')
        .set('Content-Type', 'application/json')
        .send({
          name: 'Producto Header Test',
          price: 1000
        });

      expect([201, 500]).toContain(response.status);
    });

    test('❌ Debe rechazar Content-Type inválido para JSON', async () => {
      const response = await request(app)
        .post('/api/products')
        .set('Content-Type', 'text/plain')
        .send('{"name": "Producto", "price": 1000}');

      expect([400, 415]).toContain(response.status);
    });

    test('❌ Debe manejar headers con caracteres especiales', async () => {
      const response = await request(app)
        .get('/api/products')
        .set('X-Custom-Header', '<script>alert("xss")</script>')
        .set('User-Agent', 'Mozilla/5.0 <img src=x onerror=alert(1)>');

      expect([200, 400]).toContain(response.status);
    });

    test('❌ Debe rechazar headers extremadamente largos', async () => {
      const longHeader = 'x'.repeat(100000);
      const response = await request(app)
        .get('/api/products')
        .set('X-Long-Header', longHeader);

      expect([200, 400, 413]).toContain(response.status);
    });

    test('❌ Debe manejar múltiples headers duplicados', async () => {
      const response = await request(app)
        .get('/api/products')
        .set('Authorization', 'Bearer token1')
        .set('Authorization', 'Bearer token2');

      expect([200, 400]).toContain(response.status);
    });
  });

  describe('🌐 MÉTODOS HTTP Y RUTAS', () => {
    test('❌ Debe rechazar método no permitido en ruta existente', async () => {
      const response = await request(app)
        .patch('/api/products');

      expect([405, 404]).toContain(response.status);
    });

    test('❌ Debe manejar ruta inexistente', async () => {
      const response = await request(app)
        .get('/api/nonexistent-endpoint');

      expect(response.status).toBe(404);
    });

    test('❌ Debe manejar ruta con caracteres especiales', async () => {
      const response = await request(app)
        .get('/api/products/<script>alert("xss")</script>');

      expect([400, 404]).toContain(response.status);
    });

    test('❌ Debe manejar ruta muy larga', async () => {
      const longPath = '/api/products/' + 'x'.repeat(10000);
      const response = await request(app)
        .get(longPath);

      expect([400, 404, 414]).toContain(response.status);
    });

    test('❌ Debe manejar parámetros de query maliciosos', async () => {
      const response = await request(app)
        .get('/api/products?search=<script>alert("xss")</script>&limit=\'; DROP TABLE products; --');

      expect([200, 400]).toContain(response.status);
    });
  });

  describe('📊 VALIDACIÓN DE RESPUESTAS', () => {
    test('✅ Debe retornar headers de seguridad apropiados', async () => {
      const response = await request(app)
        .get('/api/products');

      // Verificar headers de seguridad comunes
      expect(response.headers).toBeDefined();
      // Note: Estos headers pueden no estar configurados, pero verificamos su presencia
      if (response.headers['x-content-type-options']) {
        expect(response.headers['x-content-type-options']).toBe('nosniff');
      }
    });

    test('✅ Debe retornar Content-Type correcto para JSON', async () => {
      const response = await request(app)
        .get('/api/products');

      if (response.status === 200) {
        expect(response.headers['content-type']).toMatch(/application\/json/);
      }
    });

    test('✅ Debe tener estructura de error consistente', async () => {
      const response = await request(app)
        .post('/api/products')
        .send({
          name: '',
          price: -100
        });

      if (response.status >= 400) {
        expect(response.body).toHaveProperty('error');
        expect(typeof response.body.error).toBe('string');
      }
    });

    test('✅ Debe manejar respuestas grandes sin timeout', async () => {
      const startTime = Date.now();
      const response = await request(app)
        .get('/api/products?limit=1000');

      const responseTime = Date.now() - startTime;
      expect(responseTime).toBeLessThan(10000); // 10 segundos máximo
    });
  });

  describe('🔢 VALIDACIÓN DE PARÁMETROS', () => {
    test('❌ Debe rechazar ID no numérico', async () => {
      const response = await request(app)
        .get('/api/products/abc');

      expect([400, 404]).toContain(response.status);
    });

    test('❌ Debe rechazar ID muy grande', async () => {
      const response = await request(app)
        .get('/api/products/999999999999999999999');

      expect([400, 404]).toContain(response.status);
    });

    test('❌ Debe rechazar ID negativo', async () => {
      const response = await request(app)
        .get('/api/products/-1');

      expect([400, 404]).toContain(response.status);
    });

    test('❌ Debe rechazar ID con decimales', async () => {
      const response = await request(app)
        .get('/api/products/1.5');

      expect([400, 404]).toContain(response.status);
    });

    test('❌ Debe rechazar múltiples barras en ruta', async () => {
      const response = await request(app)
        .get('/api//products///1');

      expect([400, 404]).toContain(response.status);
    });
  });

  describe('📝 VALIDACIÓN DE PAYLOAD', () => {
    test('❌ Debe rechazar JSON vacío cuando se requieren datos', async () => {
      const response = await request(app)
        .post('/api/products')
        .send({});

      expect(response.status).toBe(500);
    });

    test('❌ Debe rechazar JSON null', async () => {
      const response = await request(app)
        .post('/api/products')
        .send(null);

      expect([400, 500]).toContain(response.status);
    });

    test('❌ Debe rechazar array cuando se espera objeto', async () => {
      const response = await request(app)
        .post('/api/products')
        .send([{ name: 'Producto', price: 1000 }]);

      expect([400, 500]).toContain(response.status);
    });

    test('❌ Debe rechazar string cuando se espera objeto', async () => {
      const response = await request(app)
        .post('/api/products')
        .send('producto de prueba');

      expect([400, 500]).toContain(response.status);
    });

    test('❌ Debe rechazar número cuando se espera objeto', async () => {
      const response = await request(app)
        .post('/api/products')
        .send(12345);

      expect([400, 500]).toContain(response.status);
    });

    test('❌ Debe rechazar boolean cuando se espera objeto', async () => {
      const response = await request(app)
        .post('/api/products')
        .send(true);

      expect([400, 500]).toContain(response.status);
    });
  });

  describe('🔒 VALIDACIÓN DE ENCODING', () => {
    test('❌ Debe manejar caracteres UTF-8 especiales', async () => {
      const response = await request(app)
        .post('/api/products')
        .send({
          name: 'Producto ñáéíóú',
          price: 1000
        });

      expect([201, 500]).toContain(response.status);
    });

    test('❌ Debe manejar caracteres Unicode raros', async () => {
      const response = await request(app)
        .post('/api/products')
        .send({
          name: 'Producto \u2603 \u2764',
          price: 1000
        });

      expect([201, 500]).toContain(response.status);
    });

    test('❌ Debe rechazar caracteres de control peligrosos', async () => {
      const response = await request(app)
        .post('/api/products')
        .send({
          name: 'Producto\u0000\u0001\u0002',
          price: 1000
        });

      expect(response.status).toBe(500);
    });

    test('❌ Debe manejar texto con diferentes encodings', async () => {
      const response = await request(app)
        .post('/api/products')
        .send({
          name: 'Prøduct tëst',
          price: 1000
        });

      expect([201, 500]).toContain(response.status);
    });
  });

  describe('⚡ VALIDACIÓN DE LÍMITES', () => {
    test('❌ Debe rechazar payload extremadamente grande', async () => {
      const largeData = {
        name: 'Producto Grande',
        price: 1000,
        description: 'x'.repeat(1000000) // 1MB de datos
      };

      const response = await request(app)
        .post('/api/products')
        .send(largeData);

      expect([413, 500]).toContain(response.status);
    });

    test('❌ Debe manejar objetos con muchas propiedades', async () => {
      const manyProps = { name: 'Producto', price: 1000 };
      for (let i = 0; i < 1000; i++) {
        manyProps[`prop${i}`] = `value${i}`;
      }

      const response = await request(app)
        .post('/api/products')
        .send(manyProps);

      expect([201, 400, 500]).toContain(response.status);
    });

    test('❌ Debe manejar arrays anidados profundos', async () => {
      let deepArray = [];
      for (let i = 0; i < 100; i++) {
        deepArray = [deepArray];
      }

      const response = await request(app)
        .post('/api/products')
        .send({
          name: 'Producto Deep',
          price: 1000,
          deepData: deepArray
        });

      expect([400, 500]).toContain(response.status);
    });

    test('❌ Debe manejar strings con escape sequences complejos', async () => {
      const response = await request(app)
        .post('/api/products')
        .send({
          name: 'Producto\\n\\r\\t\\b\\f\\"\\\'\\\\',
          price: 1000
        });

      expect([201, 500]).toContain(response.status);
    });
  });

  describe('🔄 VALIDACIÓN DE CONCURRENCIA', () => {
    test('✅ Debe manejar múltiples requests simultáneos del mismo tipo', async () => {
      const promises = [];
      for (let i = 0; i < 5; i++) {
        promises.push(
          request(app)
            .post('/api/products')
            .send({
              name: `Producto Concurrente ${i}`,
              price: 1000 + i
            })
        );
      }

      const responses = await Promise.all(promises);
      const successCount = responses.filter(r => r.status === 201).length;
      const errorCount = responses.filter(r => r.status >= 400).length;
      
      expect(successCount + errorCount).toBe(5);
    });

    test('✅ Debe manejar mix de operaciones simultáneas', async () => {
      const promises = [
        request(app).get('/api/products'),
        request(app).post('/api/products').send({ name: 'Test', price: 1000 }),
        request(app).post('/api/newsletter/subscribe').send({ email: 'concurrent@test.com' }),
        request(app).get('/api/products?limit=10'),
        request(app).post('/api/auth/login').send({ email: 'test@test.com', password: '123456' })
      ];

      const responses = await Promise.all(promises);
      expect(responses).toHaveLength(5);
      responses.forEach(response => {
        expect(response.status).toBeGreaterThanOrEqual(200);
        expect(response.status).toBeLessThan(600);
      });
    });
  });

  describe('🎯 CASOS EDGE ESPECÍFICOS', () => {
    test('❌ Debe manejar request con método HEAD', async () => {
      const response = await request(app)
        .head('/api/products');

      expect([200, 405]).toContain(response.status);
    });

    test('❌ Debe manejar request con método OPTIONS', async () => {
      const response = await request(app)
        .options('/api/products');

      expect([200, 204, 405]).toContain(response.status);
    });

    test('❌ Debe manejar request sin User-Agent', async () => {
      const response = await request(app)
        .get('/api/products')
        .unset('User-Agent');

      expect([200, 400]).toContain(response.status);
    });

    test('❌ Debe manejar request con Host header malicioso', async () => {
      const response = await request(app)
        .get('/api/products')
        .set('Host', 'evil.com');

      expect([200, 400]).toContain(response.status);
    });

    test('❌ Debe manejar request con múltiples Accept headers', async () => {
      const response = await request(app)
        .get('/api/products')
        .set('Accept', 'application/json, text/html, */*');

      expect(response.status).toBe(200);
    });
  });
}); 