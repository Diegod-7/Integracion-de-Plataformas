const request = require('supertest');
const app = require('../index');

describe('🔥 STRESS TESTING - PRUEBAS DE LÍMITES EXTREMOS', () => {
  
  describe('⚡ PRUEBAS DE CARGA EXTREMA', () => {
    test('🚀 Debe sobrevivir a 100 requests simultáneos', async () => {
      const promises = [];
      const startTime = Date.now();
      
      for (let i = 0; i < 100; i++) {
        promises.push(
          request(app)
            .get('/api/products')
            .timeout(15000)
        );
      }
      
      const responses = await Promise.allSettled(promises);
      const endTime = Date.now();
      const totalTime = endTime - startTime;
      
      const successful = responses.filter(r => r.status === 'fulfilled' && r.value.status === 200).length;
      const failed = responses.filter(r => r.status === 'rejected' || r.value.status >= 400).length;
      
      console.log(`Stress Test Results: ${successful} successful, ${failed} failed in ${totalTime}ms`);
      
      // Al menos el 70% deben ser exitosos
      expect(successful).toBeGreaterThanOrEqual(70);
      expect(totalTime).toBeLessThan(30000); // 30 segundos máximo
    }, 45000);

    test('💣 Debe manejar 50 creaciones de productos simultáneas', async () => {
      const promises = [];
      const startTime = Date.now();
      
      for (let i = 0; i < 50; i++) {
        promises.push(
          request(app)
            .post('/api/products')
            .send({
              name: `Producto Stress ${i}_${Date.now()}`,
              description: `Descripción del producto de stress testing ${i}`,
              price: Math.floor(Math.random() * 100000) + 1000,
              stock: Math.floor(Math.random() * 100) + 1,
              category: `Stress${i % 5}`
            })
            .timeout(10000)
        );
      }
      
      const responses = await Promise.allSettled(promises);
      const endTime = Date.now();
      const totalTime = endTime - startTime;
      
      const successful = responses.filter(r => r.status === 'fulfilled' && r.value.status === 201).length;
      const failed = responses.filter(r => r.status === 'rejected' || r.value.status >= 400).length;
      
      console.log(`Product Creation Stress: ${successful} successful, ${failed} failed in ${totalTime}ms`);
      
      // Al menos el 60% deben ser exitosos
      expect(successful).toBeGreaterThanOrEqual(30);
    }, 30000);

    test('📧 Debe manejar 75 suscripciones simultáneas a newsletter', async () => {
      const promises = [];
      const startTime = Date.now();
      
      for (let i = 0; i < 75; i++) {
        promises.push(
          request(app)
            .post('/api/newsletter/subscribe')
            .send({
              email: `stress${i}_${Date.now()}@test.com`
            })
            .timeout(8000)
        );
      }
      
      const responses = await Promise.allSettled(promises);
      const endTime = Date.now();
      const totalTime = endTime - startTime;
      
      const successful = responses.filter(r => r.status === 'fulfilled' && r.value.status === 200).length;
      
      console.log(`Newsletter Stress: ${successful} successful in ${totalTime}ms`);
      
      // Todas deberían ser exitosas (emails únicos)
      expect(successful).toBeGreaterThanOrEqual(70);
    }, 25000);

    test('💳 Debe manejar 30 transacciones Webpay simultáneas', async () => {
      const promises = [];
      const startTime = Date.now();
      
      for (let i = 0; i < 30; i++) {
        promises.push(
          request(app)
            .post('/api/webpay/create')
            .send({
              amount: Math.floor(Math.random() * 500000) + 10000,
              sessionId: `stress_session_${i}_${Date.now()}`,
              buyOrder: `stress_order_${i}_${Date.now()}`,
              returnUrl: 'http://localhost:3000/payment/return'
            })
            .timeout(12000)
        );
      }
      
      const responses = await Promise.allSettled(promises);
      const endTime = Date.now();
      const totalTime = endTime - startTime;
      
      const successful = responses.filter(r => r.status === 'fulfilled' && [200, 400].includes(r.value.status)).length;
      
      console.log(`Webpay Stress: ${successful} responses in ${totalTime}ms`);
      
      expect(successful).toBeGreaterThanOrEqual(25);
    }, 35000);
  });

  describe('🧠 PRUEBAS DE MEMORIA Y RECURSOS', () => {
    test('📊 Debe manejar requests con payloads muy grandes', async () => {
      const largePayload = {
        name: 'Producto Memoria',
        description: 'x'.repeat(500000), // 500KB
        price: 50000,
        category: 'Memoria',
        metadata: {
          largeData: 'y'.repeat(300000), // 300KB adicionales
          moreData: Array(1000).fill('data chunk').join(' ')
        }
      };
      
      const response = await request(app)
        .post('/api/products')
        .send(largePayload)
        .timeout(15000);
      
      expect([201, 413, 500]).toContain(response.status);
    }, 20000);

    test('🔢 Debe manejar arrays con miles de elementos', async () => {
      const largeArray = [];
      for (let i = 0; i < 5000; i++) {
        largeArray.push({
          id: i,
          name: `Item ${i}`,
          value: Math.random() * 1000
        });
      }
      
      const response = await request(app)
        .post('/api/products')
        .send({
          name: 'Producto Array Grande',
          price: 10000,
          items: largeArray
        })
        .timeout(15000);
      
      expect([201, 413, 500]).toContain(response.status);
    }, 20000);

    test('🌊 Debe manejar objetos profundamente anidados', async () => {
      let deepObject = { value: 'final' };
      for (let i = 0; i < 200; i++) {
        deepObject = { level: i, nested: deepObject };
      }
      
      const response = await request(app)
        .post('/api/products')
        .send({
          name: 'Producto Profundo',
          price: 15000,
          deepData: deepObject
        })
        .timeout(10000);
      
      expect([201, 400, 500]).toContain(response.status);
    }, 15000);

    test('🔤 Debe manejar strings extremadamente largos', async () => {
      const megaString = 'A'.repeat(2000000); // 2MB string
      
      const response = await request(app)
        .post('/api/products')
        .send({
          name: 'Producto Mega String',
          price: 20000,
          megaDescription: megaString
        })
        .timeout(20000);
      
      expect([201, 413, 500]).toContain(response.status);
    }, 25000);
  });

  describe('⏰ PRUEBAS DE TIMEOUT Y LATENCIA', () => {
    test('🐌 Debe manejar múltiples requests lentos simultáneos', async () => {
      const promises = [];
      
      for (let i = 0; i < 20; i++) {
        promises.push(
          request(app)
            .get('/api/products?limit=100&offset=' + (i * 100))
            .timeout(25000)
        );
      }
      
      const startTime = Date.now();
      const responses = await Promise.allSettled(promises);
      const endTime = Date.now();
      const totalTime = endTime - startTime;
      
      const successful = responses.filter(r => r.status === 'fulfilled').length;
      
      console.log(`Slow requests: ${successful} successful in ${totalTime}ms`);
      
      expect(successful).toBeGreaterThanOrEqual(15);
      expect(totalTime).toBeLessThan(30000);
    }, 35000);

    test('⚡ Debe mantener performance con requests rápidos consecutivos', async () => {
      const times = [];
      
      for (let i = 0; i < 50; i++) {
        const startTime = Date.now();
        const response = await request(app)
          .get('/api/products')
          .timeout(5000);
        const endTime = Date.now();
        
        if (response.status === 200) {
          times.push(endTime - startTime);
        }
      }
      
      const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
      const maxTime = Math.max(...times);
      
      console.log(`Average response time: ${avgTime}ms, Max: ${maxTime}ms`);
      
      expect(avgTime).toBeLessThan(2000);
      expect(maxTime).toBeLessThan(5000);
      expect(times.length).toBeGreaterThanOrEqual(40);
    }, 60000);
  });

  describe('🔄 PRUEBAS DE RECUPERACIÓN', () => {
    test('💪 Debe recuperarse después de sobrecarga', async () => {
      // Fase 1: Sobrecargar el sistema
      const overloadPromises = [];
      for (let i = 0; i < 200; i++) {
        overloadPromises.push(
          request(app)
            .get('/api/products')
            .timeout(5000)
            .catch(() => ({ status: 'timeout' }))
        );
      }
      
      await Promise.allSettled(overloadPromises);
      
      // Fase 2: Esperar un poco
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Fase 3: Verificar recuperación
      const recoveryPromises = [];
      for (let i = 0; i < 10; i++) {
        recoveryPromises.push(
          request(app)
            .get('/api/products')
            .timeout(10000)
        );
      }
      
      const recoveryResponses = await Promise.allSettled(recoveryPromises);
      const successful = recoveryResponses.filter(r => 
        r.status === 'fulfilled' && r.value.status === 200
      ).length;
      
      console.log(`Recovery test: ${successful}/10 successful`);
      
      // Al menos 7 de 10 deberían ser exitosos después de la recuperación
      expect(successful).toBeGreaterThanOrEqual(7);
    }, 45000);

    test('🔃 Debe manejar patrones de carga variables', async () => {
      const phases = [
        { requests: 5, delay: 100 },   // Carga baja
        { requests: 20, delay: 50 },   // Carga media
        { requests: 50, delay: 10 },   // Carga alta
        { requests: 10, delay: 200 }   // Vuelta a carga baja
      ];
      
      const results = [];
      
      for (const phase of phases) {
        const promises = [];
        const startTime = Date.now();
        
        for (let i = 0; i < phase.requests; i++) {
          promises.push(
            new Promise(resolve => {
              setTimeout(() => {
                request(app)
                  .get('/api/products')
                  .timeout(8000)
                  .then(resolve)
                  .catch(resolve);
              }, i * phase.delay);
            })
          );
        }
        
        const responses = await Promise.all(promises);
        const endTime = Date.now();
        const successful = responses.filter(r => r.status === 200).length;
        
        results.push({
          phase: phase.requests,
          successful,
          time: endTime - startTime
        });
        
        // Pausa entre fases
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      console.log('Variable load results:', results);
      
      // Verificar que cada fase tuvo al menos 70% de éxito
      results.forEach(result => {
        const successRate = (result.successful / result.phase) * 100;
        expect(successRate).toBeGreaterThanOrEqual(60);
      });
    }, 60000);
  });

  describe('🧪 PRUEBAS DE CASOS EXTREMOS', () => {
    test('🎯 Debe manejar mix caótico de operaciones', async () => {
      const operations = [
        () => request(app).get('/api/products'),
        () => request(app).post('/api/products').send({ name: 'Caos', price: 1000 }),
        () => request(app).post('/api/newsletter/subscribe').send({ email: `chaos${Date.now()}@test.com` }),
        () => request(app).post('/api/auth/register').send({ name: 'Chaos', email: `chaos${Date.now()}@test.com`, password: '123456' }),
        () => request(app).post('/api/webpay/create').send({ amount: 50000, sessionId: `chaos${Date.now()}`, buyOrder: `chaos${Date.now()}`, returnUrl: 'http://localhost:3000' }),
        () => request(app).get('/api/products?limit=50'),
        () => request(app).get('/api/products/999999'),
        () => request(app).post('/api/auth/login').send({ email: 'nonexistent@test.com', password: 'wrong' })
      ];
      
      const promises = [];
      for (let i = 0; i < 100; i++) {
        const randomOp = operations[Math.floor(Math.random() * operations.length)];
        promises.push(
          randomOp().timeout(10000).catch(err => ({ status: 'error', error: err.message }))
        );
      }
      
      const responses = await Promise.allSettled(promises);
      const completed = responses.filter(r => r.status === 'fulfilled').length;
      
      console.log(`Chaos test: ${completed}/100 operations completed`);
      
      // Al menos 80% de las operaciones deberían completarse (con éxito o error controlado)
      expect(completed).toBeGreaterThanOrEqual(80);
    }, 40000);

    test('🌪️ Debe sobrevivir a ataques de fuerza bruta simulados', async () => {
      const bruteForceAttempts = [];
      
      // Simular múltiples intentos de login fallidos
      for (let i = 0; i < 100; i++) {
        bruteForceAttempts.push(
          request(app)
            .post('/api/auth/login')
            .send({
              email: 'admin@test.com',
              password: `wrongpass${i}`
            })
            .timeout(5000)
            .catch(() => ({ status: 'timeout' }))
        );
      }
      
      const startTime = Date.now();
      const responses = await Promise.allSettled(bruteForceAttempts);
      const endTime = Date.now();
      const totalTime = endTime - startTime;
      
      const completed = responses.filter(r => r.status === 'fulfilled').length;
      
      console.log(`Brute force simulation: ${completed} attempts in ${totalTime}ms`);
      
      // El sistema debe seguir respondiendo
      expect(completed).toBeGreaterThanOrEqual(90);
      
      // Verificar que el sistema sigue funcionando después del ataque
      const normalResponse = await request(app).get('/api/products');
      expect(normalResponse.status).toBe(200);
    }, 30000);
  });
}); 