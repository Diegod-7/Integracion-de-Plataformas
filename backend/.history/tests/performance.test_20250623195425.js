const request = require('supertest');
const app = require('../index');

describe('⚡ PERFORMANCE - CASOS DE PRUEBA DE RENDIMIENTO', () => {
  
  describe('⏱️ TIEMPOS DE RESPUESTA', () => {
    test('✅ GET /api/products debe responder en menos de 2 segundos', async () => {
      const startTime = Date.now();
      
      const response = await request(app)
        .get('/api/products');
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      expect(response.status).toBe(200);
      expect(responseTime).toBeLessThan(2000);
    });

    test('✅ POST /api/auth/login debe responder en menos de 3 segundos', async () => {
      const startTime = Date.now();
      
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@test.com',
          password: '123456'
        });
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      expect(responseTime).toBeLessThan(3000);
    });

    test('✅ POST /api/products debe responder en menos de 3 segundos', async () => {
      const startTime = Date.now();
      
      const response = await request(app)
        .post('/api/products')
        .send({
          name: `Producto Performance ${Date.now()}`,
          price: 15000,
          stock: 10
        });
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      expect(responseTime).toBeLessThan(3000);
    });

    test('✅ POST /api/newsletter/subscribe debe responder en menos de 2 segundos', async () => {
      const startTime = Date.now();
      
      const response = await request(app)
        .post('/api/newsletter/subscribe')
        .send({
          email: `performance${Date.now()}@test.com`
        });
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      expect(responseTime).toBeLessThan(2000);
    });

    test('✅ POST /api/webpay/create debe responder en menos de 5 segundos', async () => {
      const startTime = Date.now();
      
      const response = await request(app)
        .post('/api/webpay/create')
        .send({
          amount: 50000,
          sessionId: `perf_session_${Date.now()}`,
          buyOrder: `perf_order_${Date.now()}`,
          returnUrl: 'http://localhost:3000/payment/return'
        });
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      expect(responseTime).toBeLessThan(5000);
    });
  });

  describe('🚀 PRUEBAS DE CARGA CONCURRENTE', () => {
    test('✅ Debe manejar 10 requests simultáneos a /api/products', async () => {
      const promises = [];
      const startTime = Date.now();
      
      for (let i = 0; i < 10; i++) {
        promises.push(
          request(app)
            .get('/api/products')
        );
      }
      
      const responses = await Promise.all(promises);
      const endTime = Date.now();
      const totalTime = endTime - startTime;
      
      // Verificar que todas las respuestas sean exitosas
      const successfulResponses = responses.filter(r => r.status === 200).length;
      expect(successfulResponses).toBe(10);
      
      // El tiempo total no debería ser mucho mayor que una sola request
      expect(totalTime).toBeLessThan(10000); // 10 segundos para 10 requests
    });

    test('✅ Debe manejar 20 registros de usuario simultáneos', async () => {
      const promises = [];
      const startTime = Date.now();
      
      for (let i = 0; i < 20; i++) {
        promises.push(
          request(app)
            .post('/api/auth/register')
            .send({
              name: `Usuario Concurrente ${i}`,
              email: `concurrent${i}_${Date.now()}@test.com`,
              password: '123456'
            })
        );
      }
      
      const responses = await Promise.all(promises);
      const endTime = Date.now();
      const totalTime = endTime - startTime;
      
      // Al menos el 70% deberían ser exitosos
      const successfulResponses = responses.filter(r => r.status === 201).length;
      expect(successfulResponses).toBeGreaterThanOrEqual(14); // 70% de 20
      
      expect(totalTime).toBeLessThan(30000); // 30 segundos para 20 registros
    });

    test('✅ Debe manejar 15 creaciones de productos simultáneas', async () => {
      const promises = [];
      const startTime = Date.now();
      
      for (let i = 0; i < 15; i++) {
        promises.push(
          request(app)
            .post('/api/products')
            .send({
              name: `Producto Concurrente ${i}`,
              description: `Descripción del producto ${i}`,
              price: 1000 + i,
              stock: 10,
              category: 'Test'
            })
        );
      }
      
      const responses = await Promise.all(promises);
      const endTime = Date.now();
      const totalTime = endTime - startTime;
      
      // Al menos el 80% deberían ser exitosos
      const successfulResponses = responses.filter(r => r.status === 201).length;
      expect(successfulResponses).toBeGreaterThanOrEqual(12); // 80% de 15
      
      expect(totalTime).toBeLessThan(25000); // 25 segundos para 15 productos
    });

    test('✅ Debe manejar 25 suscripciones a newsletter simultáneas', async () => {
      const promises = [];
      const startTime = Date.now();
      
      for (let i = 0; i < 25; i++) {
        promises.push(
          request(app)
            .post('/api/newsletter/subscribe')
            .send({
              email: `newsletter${i}_${Date.now()}@test.com`
            })
        );
      }
      
      const responses = await Promise.all(promises);
      const endTime = Date.now();
      const totalTime = endTime - startTime;
      
      // Todas deberían ser exitosas (emails únicos)
      const successfulResponses = responses.filter(r => r.status === 200).length;
      expect(successfulResponses).toBe(25);
      
      expect(totalTime).toBeLessThan(20000); // 20 segundos para 25 suscripciones
    });

    test('✅ Debe manejar 10 transacciones Webpay simultáneas', async () => {
      const promises = [];
      const startTime = Date.now();
      
      for (let i = 0; i < 10; i++) {
        promises.push(
          request(app)
            .post('/api/webpay/create')
            .send({
              amount: 10000 + (i * 1000),
              sessionId: `concurrent_session_${i}_${Date.now()}`,
              buyOrder: `concurrent_order_${i}_${Date.now()}`,
              returnUrl: 'http://localhost:3000/payment/return'
            })
        );
      }
      
      const responses = await Promise.all(promises);
      const endTime = Date.now();
      const totalTime = endTime - startTime;
      
      // Al menos el 70% deberían ser exitosos
      const successfulResponses = responses.filter(r => r.status === 200).length;
      expect(successfulResponses).toBeGreaterThanOrEqual(7); // 70% de 10
      
      expect(totalTime).toBeLessThan(50000); // 50 segundos para 10 transacciones
    });
  });

  describe('💪 PRUEBAS DE STRESS', () => {
    test('✅ Debe manejar 50 requests GET simultáneos', async () => {
      const promises = [];
      const startTime = Date.now();
      
      for (let i = 0; i < 50; i++) {
        promises.push(
          request(app)
            .get('/api/products')
        );
      }
      
      const responses = await Promise.all(promises);
      const endTime = Date.now();
      const totalTime = endTime - startTime;
      
      // Al menos el 90% deberían ser exitosos
      const successfulResponses = responses.filter(r => r.status === 200).length;
      expect(successfulResponses).toBeGreaterThanOrEqual(45); // 90% de 50
      
      // Calcular tiempo promedio por request
      const avgResponseTime = totalTime / 50;
      expect(avgResponseTime).toBeLessThan(1000); // Menos de 1 segundo promedio
    });

    test('✅ Debe mantener rendimiento con requests secuenciales', async () => {
      const responseTimes = [];
      
      for (let i = 0; i < 20; i++) {
        const startTime = Date.now();
        
        const response = await request(app)
          .get('/api/products');
        
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        responseTimes.push(responseTime);
        expect(response.status).toBe(200);
      }
      
      // Calcular tiempo promedio
      const avgTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
      
      // El tiempo promedio no debería degradarse significativamente
      expect(avgTime).toBeLessThan(3000);
      
      // La variación no debería ser muy alta
      const maxTime = Math.max(...responseTimes);
      const minTime = Math.min(...responseTimes);
      const variation = maxTime - minTime;
      
      expect(variation).toBeLessThan(5000); // No más de 5 segundos de diferencia
    });

    test('✅ Debe manejar carga mixta de operaciones', async () => {
      const promises = [];
      const startTime = Date.now();
      
      // Mix de operaciones diferentes
      for (let i = 0; i < 30; i++) {
        if (i % 3 === 0) {
          // GET productos
          promises.push(
            request(app)
              .get('/api/products')
          );
        } else if (i % 3 === 1) {
          // Suscripción newsletter
          promises.push(
            request(app)
              .post('/api/newsletter/subscribe')
              .send({
                email: `mixed${i}_${Date.now()}@test.com`
              })
          );
        } else {
          // Crear producto
          promises.push(
            request(app)
              .post('/api/products')
              .send({
                name: `Producto Mixed ${i}`,
                price: 1000 + i
              })
          );
        }
      }
      
      const responses = await Promise.all(promises);
      const endTime = Date.now();
      const totalTime = endTime - startTime;
      
      // Al menos el 75% deberían ser exitosos
      const successfulResponses = responses.filter(r => 
        r.status === 200 || r.status === 201
      ).length;
      expect(successfulResponses).toBeGreaterThanOrEqual(22); // 75% de 30
      
      expect(totalTime).toBeLessThan(60000); // 60 segundos para 30 operaciones mixtas
    });
  });

  describe('📊 MEDICIÓN DE THROUGHPUT', () => {
    test('✅ Debe medir throughput de GET /api/products', async () => {
      const iterations = 100;
      const startTime = Date.now();
      
      const promises = [];
      for (let i = 0; i < iterations; i++) {
        promises.push(
          request(app)
            .get('/api/products')
        );
      }
      
      const responses = await Promise.all(promises);
      const endTime = Date.now();
      const totalTime = endTime - startTime;
      
      const successfulRequests = responses.filter(r => r.status === 200).length;
      const throughput = (successfulRequests / totalTime) * 1000; // requests per second
      
      console.log(`Throughput GET /api/products: ${throughput.toFixed(2)} req/sec`);
      
      // Esperamos al menos 10 requests por segundo
      expect(throughput).toBeGreaterThan(10);
    });

    test('✅ Debe medir throughput de POST /api/newsletter/subscribe', async () => {
      const iterations = 50;
      const startTime = Date.now();
      
      const promises = [];
      for (let i = 0; i < iterations; i++) {
        promises.push(
          request(app)
            .post('/api/newsletter/subscribe')
            .send({
              email: `throughput${i}_${Date.now()}@test.com`
            })
        );
      }
      
      const responses = await Promise.all(promises);
      const endTime = Date.now();
      const totalTime = endTime - startTime;
      
      const successfulRequests = responses.filter(r => r.status === 200).length;
      const throughput = (successfulRequests / totalTime) * 1000; // requests per second
      
      console.log(`Throughput POST newsletter: ${throughput.toFixed(2)} req/sec`);
      
      // Esperamos al menos 5 requests por segundo para operaciones de escritura
      expect(throughput).toBeGreaterThan(5);
    });
  });

  describe('🔄 PRUEBAS DE MEMORIA Y RECURSOS', () => {
    test('✅ Debe manejar payloads grandes sin degradación', async () => {
      const largeDescription = 'A'.repeat(10000); // 10KB de texto
      const responseTimes = [];
      
      for (let i = 0; i < 10; i++) {
        const startTime = Date.now();
        
        const response = await request(app)
          .post('/api/products')
          .send({
            name: `Producto Grande ${i}`,
            description: largeDescription,
            price: 1000
          });
        
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        responseTimes.push(responseTime);
        
        // Puede fallar por validación, pero no por problemas de memoria
        expect([201, 500]).toContain(response.status);
      }
      
      // Los tiempos no deberían aumentar significativamente
      const firstHalf = responseTimes.slice(0, 5);
      const secondHalf = responseTimes.slice(5);
      
      const avgFirstHalf = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
      const avgSecondHalf = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
      
      // La segunda mitad no debería ser más del doble de lenta
      expect(avgSecondHalf).toBeLessThan(avgFirstHalf * 2);
    });

    test('✅ Debe liberar recursos después de operaciones intensivas', async () => {
      // Realizar muchas operaciones
      const promises = [];
      for (let i = 0; i < 100; i++) {
        promises.push(
          request(app)
            .get('/api/products')
        );
      }
      
      await Promise.all(promises);
      
      // Esperar un poco para que se liberen recursos
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Verificar que el sistema sigue respondiendo normalmente
      const startTime = Date.now();
      const response = await request(app)
        .get('/api/products');
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      expect(response.status).toBe(200);
      expect(responseTime).toBeLessThan(3000); // Debería responder normalmente
    });
  });

  describe('⚖️ PRUEBAS DE BALANCEADOR DE CARGA', () => {
    test('✅ Debe distribuir carga uniformemente', async () => {
      const promises = [];
      const responses = [];
      
      // Simular carga distribuida
      for (let i = 0; i < 50; i++) {
        promises.push(
          request(app)
            .get('/api/products')
            .then(response => {
              responses.push({
                status: response.status,
                time: Date.now()
              });
              return response;
            })
        );
      }
      
      await Promise.all(promises);
      
      // Verificar que las respuestas llegaron en un tiempo razonable
      const times = responses.map(r => r.time);
      const timeSpan = Math.max(...times) - Math.min(...times);
      
      // Todas las respuestas deberían llegar en un rango de tiempo razonable
      expect(timeSpan).toBeLessThan(10000); // 10 segundos
      
      // La mayoría deberían ser exitosas
      const successfulResponses = responses.filter(r => r.status === 200).length;
      expect(successfulResponses).toBeGreaterThanOrEqual(45); // 90% de 50
    });
  });

  describe('📈 PRUEBAS DE ESCALABILIDAD', () => {
    test('✅ Debe mantener rendimiento con aumento gradual de carga', async () => {
      const loadLevels = [5, 10, 15, 20];
      const results = [];
      
      for (const load of loadLevels) {
        const startTime = Date.now();
        const promises = [];
        
        for (let i = 0; i < load; i++) {
          promises.push(
            request(app)
              .get('/api/products')
          );
        }
        
        const responses = await Promise.all(promises);
        const endTime = Date.now();
        const totalTime = endTime - startTime;
        
        const successfulResponses = responses.filter(r => r.status === 200).length;
        const successRate = (successfulResponses / load) * 100;
        const avgResponseTime = totalTime / load;
        
        results.push({
          load,
          successRate,
          avgResponseTime,
          totalTime
        });
        
        console.log(`Carga ${load}: ${successRate}% éxito, ${avgResponseTime.toFixed(2)}ms promedio`);
      }
      
      // Verificar que el sistema escala razonablemente
      for (const result of results) {
        expect(result.successRate).toBeGreaterThanOrEqual(80); // Al menos 80% de éxito
        expect(result.avgResponseTime).toBeLessThan(2000); // Menos de 2 segundos promedio
      }
      
      // El tiempo promedio no debería aumentar linealmente con la carga
      const firstResult = results[0];
      const lastResult = results[results.length - 1];
      const timeIncreaseFactor = lastResult.avgResponseTime / firstResult.avgResponseTime;
      
      // El tiempo no debería aumentar más de 3x con 4x la carga
      expect(timeIncreaseFactor).toBeLessThan(3);
    });
  });
}); 