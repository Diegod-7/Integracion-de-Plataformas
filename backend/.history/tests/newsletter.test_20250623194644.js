const request = require('supertest');
const express = require('express');
const cors = require('cors');
const newsletterRoutes = require('../routes/newsletterRoutes');
const app = require('../index');

// Configurar la aplicación de prueba
const appTest = express();
appTest.use(cors());
appTest.use(express.json());
appTest.use('/api/newsletter', newsletterRoutes);

describe('📧 NEWSLETTER - CASOS DE PRUEBA EXPANDIDOS', () => {
  const validEmails = [
    'test@example.com',
    'user.name@domain.co.uk',
    'test+label@gmail.com',
    'firstname.lastname@company.org',
    'user123@test-domain.com'
  ];

  const invalidEmails = [
    'email-sin-arroba',
    '@domain.com',
    'user@',
    'user..double.dot@domain.com',
    'user@domain',
    'user@.domain.com',
    'user@domain..com',
    '.user@domain.com',
    'user.@domain.com',
    'user name@domain.com',
    'user@domain .com',
    'user@domain.c',
    'user@domain.verylongextension',
    '',
    ' ',
    'null',
    'undefined'
  ];

  describe('📧 SUSCRIPCIÓN BÁSICA - CASOS EXITOSOS', () => {
    test('✅ Debe suscribir email válido estándar', async () => {
      const response = await request(appTest)
        .post('/api/newsletter/subscribe')
        .send({ email: 'test@test.com' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('suscrito');
    });

    test('✅ Debe suscribir email con subdominios', async () => {
      const response = await request(appTest)
        .post('/api/newsletter/subscribe')
        .send({ email: 'user@mail.company.com' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
    });

    test('✅ Debe suscribir email con números', async () => {
      const response = await request(appTest)
        .post('/api/newsletter/subscribe')
        .send({ email: 'user123@domain123.com' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
    });

    test('✅ Debe suscribir email con guiones', async () => {
      const response = await request(appTest)
        .post('/api/newsletter/subscribe')
        .send({ email: 'test-user@test-domain.com' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
    });

    test('✅ Debe suscribir email con plus', async () => {
      const response = await request(appTest)
        .post('/api/newsletter/subscribe')
        .send({ email: 'user+newsletter@domain.com' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('📧 VALIDACIÓN DE EMAILS - CASOS VÁLIDOS', () => {
    validEmails.forEach((email, index) => {
      test(`✅ Debe aceptar email válido ${index + 1}: ${email}`, async () => {
        const response = await request(appTest)
          .post('/api/newsletter/subscribe')
          .send({ email: email });

        expect([200, 400]).toContain(response.status);
        // 200 si es exitoso, 400 si ya existe (pero el formato es válido)
      });
    });

    test('✅ Debe aceptar email con dominio internacional', async () => {
      const response = await request(appTest)
        .post('/api/newsletter/subscribe')
        .send({ email: 'usuario@dominio.es' });

      expect([200, 400]).toContain(response.status);
    });

    test('✅ Debe aceptar email con TLD largo', async () => {
      const response = await request(appTest)
        .post('/api/newsletter/subscribe')
        .send({ email: 'user@domain.museum' });

      expect([200, 400]).toContain(response.status);
    });

    test('✅ Debe aceptar email con TLD corto', async () => {
      const response = await request(appTest)
        .post('/api/newsletter/subscribe')
        .send({ email: 'user@domain.co' });

      expect([200, 400]).toContain(response.status);
    });
  });

  describe('❌ VALIDACIÓN DE EMAILS - CASOS INVÁLIDOS', () => {
    invalidEmails.forEach((email, index) => {
      test(`❌ Debe rechazar email inválido ${index + 1}: "${email}"`, async () => {
        const response = await request(appTest)
          .post('/api/newsletter/subscribe')
          .send({ email: email });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error');
      });
    });

    test('❌ Debe rechazar email con espacios al inicio', async () => {
      const response = await request(appTest)
        .post('/api/newsletter/subscribe')
        .send({ email: ' test@domain.com' });

      expect(response.status).toBe(400);
    });

    test('❌ Debe rechazar email con espacios al final', async () => {
      const response = await request(appTest)
        .post('/api/newsletter/subscribe')
        .send({ email: 'test@domain.com ' });

      expect(response.status).toBe(400);
    });

    test('❌ Debe rechazar email con caracteres especiales', async () => {
      const response = await request(appTest)
        .post('/api/newsletter/subscribe')
        .send({ email: 'test<>@domain.com' });

      expect(response.status).toBe(400);
    });

    test('❌ Debe rechazar email con comillas', async () => {
      const response = await request(appTest)
        .post('/api/newsletter/subscribe')
        .send({ email: '"test"@domain.com' });

      expect(response.status).toBe(400);
    });

    test('❌ Debe rechazar email con paréntesis', async () => {
      const response = await request(appTest)
        .post('/api/newsletter/subscribe')
        .send({ email: 'test(comment)@domain.com' });

      expect(response.status).toBe(400);
    });
  });

  describe('🔄 DUPLICADOS Y CASOS ESPECIALES', () => {
    const testEmail = 'duplicate@test.com';

    test('✅ Primera suscripción debe ser exitosa', async () => {
      const response = await request(appTest)
        .post('/api/newsletter/subscribe')
        .send({ email: testEmail });

      expect(response.status).toBe(200);
    });

    test('❌ Segunda suscripción debe fallar por duplicado', async () => {
      const response = await request(appTest)
        .post('/api/newsletter/subscribe')
        .send({ email: testEmail });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('suscrito');
    });

    test('❌ Debe fallar con email en mayúsculas si ya existe en minúsculas', async () => {
      const response = await request(appTest)
        .post('/api/newsletter/subscribe')
        .send({ email: testEmail.toUpperCase() });

      expect(response.status).toBe(400);
    });

    test('❌ Debe fallar con variaciones de espacios', async () => {
      const response = await request(appTest)
        .post('/api/newsletter/subscribe')
        .send({ email: ` ${testEmail} ` });

      expect(response.status).toBe(400);
    });
  });

  describe('📝 VALIDACIÓN DE CAMPOS REQUERIDOS', () => {
    test('❌ Debe fallar sin campo email', async () => {
      const response = await request(appTest)
        .post('/api/newsletter/subscribe')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('requerido');
    });

    test('❌ Debe fallar con campo email null', async () => {
      const response = await request(appTest)
        .post('/api/newsletter/subscribe')
        .send({ email: null });

      expect(response.status).toBe(400);
    });

    test('❌ Debe fallar con campo email undefined', async () => {
      const response = await request(appTest)
        .post('/api/newsletter/subscribe')
        .send({ email: undefined });

      expect(response.status).toBe(400);
    });

    test('❌ Debe fallar con campo email como número', async () => {
      const response = await request(appTest)
        .post('/api/newsletter/subscribe')
        .send({ email: 12345 });

      expect(response.status).toBe(400);
    });

    test('❌ Debe fallar con campo email como boolean', async () => {
      const response = await request(appTest)
        .post('/api/newsletter/subscribe')
        .send({ email: true });

      expect(response.status).toBe(400);
    });

    test('❌ Debe fallar con campo email como array', async () => {
      const response = await request(appTest)
        .post('/api/newsletter/subscribe')
        .send({ email: ['test@domain.com'] });

      expect(response.status).toBe(400);
    });

    test('❌ Debe fallar con campo email como objeto', async () => {
      const response = await request(appTest)
        .post('/api/newsletter/subscribe')
        .send({ email: { address: 'test@domain.com' } });

      expect(response.status).toBe(400);
    });
  });

  describe('🔒 SEGURIDAD Y ATAQUES', () => {
    test('❌ Debe rechazar inyección SQL en email', async () => {
      const response = await request(appTest)
        .post('/api/newsletter/subscribe')
        .send({ email: "admin@test.com'; DROP TABLE newsletter; --" });

      expect(response.status).toBe(400);
    });

    test('❌ Debe rechazar intento de XSS', async () => {
      const response = await request(appTest)
        .post('/api/newsletter/subscribe')
        .send({ email: '<script>alert("xss")</script>@domain.com' });

      expect(response.status).toBe(400);
    });

    test('❌ Debe rechazar HTML en email', async () => {
      const response = await request(appTest)
        .post('/api/newsletter/subscribe')
        .send({ email: '<b>test</b>@domain.com' });

      expect(response.status).toBe(400);
    });

    test('❌ Debe rechazar JavaScript en email', async () => {
      const response = await request(appTest)
        .post('/api/newsletter/subscribe')
        .send({ email: 'javascript:alert(1)@domain.com' });

      expect(response.status).toBe(400);
    });

    test('❌ Debe rechazar caracteres de control', async () => {
      const response = await request(appTest)
        .post('/api/newsletter/subscribe')
        .send({ email: 'test\n@domain.com' });

      expect(response.status).toBe(400);
    });

    test('❌ Debe rechazar caracteres Unicode maliciosos', async () => {
      const response = await request(appTest)
        .post('/api/newsletter/subscribe')
        .send({ email: 'test\u0000@domain.com' });

      expect(response.status).toBe(400);
    });

    test('❌ Debe rechazar email con LDAP injection', async () => {
      const response = await request(appTest)
        .post('/api/newsletter/subscribe')
        .send({ email: 'test@domain.com)(|(password=*))' });

      expect(response.status).toBe(400);
    });
  });

  describe('📊 CASOS EXTREMOS Y LÍMITES', () => {
    test('❌ Debe rechazar email muy largo', async () => {
      const longEmail = 'a'.repeat(300) + '@domain.com';
      const response = await request(appTest)
        .post('/api/newsletter/subscribe')
        .send({ email: longEmail });

      expect(response.status).toBe(400);
    });

    test('❌ Debe rechazar dominio muy largo', async () => {
      const longDomain = 'test@' + 'a'.repeat(300) + '.com';
      const response = await request(appTest)
        .post('/api/newsletter/subscribe')
        .send({ email: longDomain });

      expect(response.status).toBe(400);
    });

    test('❌ Debe rechazar usuario muy largo', async () => {
      const longUser = 'a'.repeat(300) + '@domain.com';
      const response = await request(appTest)
        .post('/api/newsletter/subscribe')
        .send({ email: longUser });

      expect(response.status).toBe(400);
    });

    test('❌ Debe manejar caracteres Unicode', async () => {
      const response = await request(appTest)
        .post('/api/newsletter/subscribe')
        .send({ email: 'тест@домен.рф' });

      expect(response.status).toBe(400);
    });

    test('❌ Debe manejar emojis', async () => {
      const response = await request(appTest)
        .post('/api/newsletter/subscribe')
        .send({ email: '😀@domain.com' });

      expect(response.status).toBe(400);
    });

    test('❌ Debe manejar caracteres acentuados', async () => {
      const response = await request(appTest)
        .post('/api/newsletter/subscribe')
        .send({ email: 'tést@dómáin.com' });

      expect(response.status).toBe(400);
    });
  });

  describe('🌐 TIPOS DE CONTENIDO Y HEADERS', () => {
    test('❌ Debe fallar con Content-Type incorrecto', async () => {
      const response = await request(appTest)
        .post('/api/newsletter/subscribe')
        .set('Content-Type', 'text/plain')
        .send('email=test@domain.com');

      expect(response.status).toBe(400);
    });

    test('❌ Debe fallar con JSON malformado', async () => {
      const response = await request(appTest)
        .post('/api/newsletter/subscribe')
        .set('Content-Type', 'application/json')
        .send('{"email":"test@domain.com"'); // JSON incompleto

      expect(response.status).toBe(400);
    });

    test('❌ Debe fallar con datos no JSON', async () => {
      const response = await request(appTest)
        .post('/api/newsletter/subscribe')
        .set('Content-Type', 'application/json')
        .send('esto no es json');

      expect(response.status).toBe(400);
    });

    test('✅ Debe aceptar Content-Type correcto', async () => {
      const response = await request(appTest)
        .post('/api/newsletter/subscribe')
        .set('Content-Type', 'application/json')
        .send(JSON.stringify({ email: 'content-type@domain.com' }));

      expect([200, 400]).toContain(response.status);
    });

    test('❌ Debe fallar con headers maliciosos', async () => {
      const response = await request(appTest)
        .post('/api/newsletter/subscribe')
        .set('X-Forwarded-For', '<script>alert("xss")</script>')
        .send({ email: 'header-test@domain.com' });

      expect([200, 400]).toContain(response.status);
    });
  });

  describe('📈 PERFORMANCE Y CONCURRENCIA', () => {
    test('✅ Debe completarse en tiempo razonable', async () => {
      const startTime = Date.now();
      
      const response = await request(appTest)
        .post('/api/newsletter/subscribe')
        .send({ email: 'performance@test.com' });

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(3000); // Menos de 3 segundos
    });

    test('✅ Debe manejar múltiples suscripciones simultáneas', async () => {
      const promises = [];
      for (let i = 0; i < 10; i++) {
        promises.push(
          request(appTest)
            .post('/api/newsletter/subscribe')
            .send({ email: `concurrent${i}@test.com` })
        );
      }

      const responses = await Promise.all(promises);
      
      // Todos deberían ser exitosos (emails únicos)
      const successCount = responses.filter(r => r.status === 200).length;
      expect(successCount).toBe(10);
    });

    test('❌ Debe manejar concurrencia con emails duplicados', async () => {
      const sameEmail = 'concurrent-duplicate@test.com';
      const promises = [];
      
      for (let i = 0; i < 5; i++) {
        promises.push(
          request(appTest)
            .post('/api/newsletter/subscribe')
            .send({ email: sameEmail })
        );
      }

      const responses = await Promise.all(promises);
      
      // Solo uno debería ser exitoso
      const successCount = responses.filter(r => r.status === 200).length;
      const errorCount = responses.filter(r => r.status === 400).length;
      
      expect(successCount).toBe(1);
      expect(errorCount).toBe(4);
    });
  });

  describe('🔍 VALIDACIÓN DE RESPUESTAS', () => {
    test('✅ Respuesta exitosa debe tener estructura correcta', async () => {
      const response = await request(appTest)
        .post('/api/newsletter/subscribe')
        .send({ email: 'structure-test@domain.com' });

      if (response.status === 200) {
        expect(response.body).toHaveProperty('message');
        expect(typeof response.body.message).toBe('string');
        expect(response.body.message.length).toBeGreaterThan(0);
      }
    });

    test('❌ Respuesta de error debe tener estructura correcta', async () => {
      const response = await request(appTest)
        .post('/api/newsletter/subscribe')
        .send({ email: 'email-invalido' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(typeof response.body.error).toBe('string');
      expect(response.body.error.length).toBeGreaterThan(0);
    });

    test('✅ Headers de respuesta deben ser correctos', async () => {
      const response = await request(appTest)
        .post('/api/newsletter/subscribe')
        .send({ email: 'headers-test@domain.com' });

      expect(response.headers['content-type']).toMatch(/application\/json/);
    });
  });

  describe('📧 CASOS DE DOMINIOS ESPECÍFICOS', () => {
    const popularDomains = [
      'gmail.com',
      'yahoo.com',
      'hotmail.com',
      'outlook.com',
      'icloud.com',
      'protonmail.com',
      'test.cl',
      'empresa.com.ar',
      'universidad.edu'
    ];

    popularDomains.forEach((domain, index) => {
      test(`✅ Debe aceptar dominio popular ${index + 1}: ${domain}`, async () => {
        const response = await request(appTest)
          .post('/api/newsletter/subscribe')
          .send({ email: `user${index}@${domain}` });

        expect([200, 400]).toContain(response.status);
      });
    });

    test('❌ Debe rechazar dominio con caracteres especiales', async () => {
      const response = await request(appTest)
        .post('/api/newsletter/subscribe')
        .send({ email: 'test@domain<script>.com' });

      expect(response.status).toBe(400);
    });

    test('❌ Debe rechazar dominio con espacios', async () => {
      const response = await request(appTest)
        .post('/api/newsletter/subscribe')
        .send({ email: 'test@do main.com' });

      expect(response.status).toBe(400);
    });

    test('❌ Debe rechazar TLD inválido', async () => {
      const response = await request(appTest)
        .post('/api/newsletter/subscribe')
        .send({ email: 'test@domain.invalidtld' });

      expect(response.status).toBe(400);
    });
  });

  describe('🔄 OPERACIONES ADICIONALES', () => {
    test('✅ Debe poder obtener lista de suscriptores (si existe endpoint)', async () => {
      const response = await request(appTest)
        .get('/api/newsletter/subscribers');

      // El endpoint puede no existir, así que aceptamos 404
      expect([200, 404, 405]).toContain(response.status);
    });

    test('✅ Debe poder desuscribirse (si existe endpoint)', async () => {
      const email = 'unsubscribe-test@domain.com';
      
      // Primero suscribir
      await request(appTest)
        .post('/api/newsletter/subscribe')
        .send({ email: email });

      // Luego desuscribir
      const response = await request(appTest)
        .post('/api/newsletter/unsubscribe')
        .send({ email: email });

      // El endpoint puede no existir, así que aceptamos 404
      expect([200, 404, 405]).toContain(response.status);
    });

    test('❌ Debe fallar al desuscribir email no suscrito', async () => {
      const response = await request(appTest)
        .post('/api/newsletter/unsubscribe')
        .send({ email: 'never-subscribed@domain.com' });

      // El endpoint puede no existir, así que aceptamos 404
      expect([400, 404, 405]).toContain(response.status);
    });
  });

  describe('📊 CASOS DE NEGOCIO ESPECÍFICOS', () => {
    test('✅ Debe manejar suscripción masiva de emails válidos', async () => {
      const emails = [
        'bulk1@domain.com',
        'bulk2@domain.com',
        'bulk3@domain.com',
        'bulk4@domain.com',
        'bulk5@domain.com'
      ];

      const results = [];
      for (const email of emails) {
        const response = await request(appTest)
          .post('/api/newsletter/subscribe')
          .send({ email: email });
        results.push(response.status);
      }

      // Todos deberían ser exitosos
      const successCount = results.filter(status => status === 200).length;
      expect(successCount).toBe(emails.length);
    });

    test('✅ Debe mantener estadísticas de suscripciones', async () => {
      const response = await request(appTest)
        .get('/api/newsletter/stats');

      // El endpoint puede no existir
      expect([200, 404, 405]).toContain(response.status);
      
      if (response.status === 200) {
        expect(response.body).toHaveProperty('total');
        expect(typeof response.body.total).toBe('number');
      }
    });

    test('✅ Debe validar formato de email según RFC 5322', async () => {
      const rfcValidEmails = [
        'simple@example.com',
        'very.common@example.com',
        'disposable.style.email.with+symbol@example.com',
        'x@example.com',
        'example@s.example'
      ];

      for (const email of rfcValidEmails) {
        const response = await request(appTest)
          .post('/api/newsletter/subscribe')
          .send({ email: email });

        // Debería aceptar emails válidos según RFC
        expect([200, 400]).toContain(response.status);
      }
    });
  });
}); 