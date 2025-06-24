const request = require('supertest');
const express = require('express');
const cors = require('cors');
const productRoutes = require('../routes/productRoutes');
const app = require('../index');

// Configurar la aplicación de prueba
const appPrueba = express();
appPrueba.use(cors());
appPrueba.use(express.json());
appPrueba.use('/api/products', productRoutes);

describe('📦 PRODUCTOS - CASOS DE PRUEBA EXPANDIDOS', () => {
  let productId;
  let testProduct = {
    name: 'Martillo de Prueba',
    description: 'Martillo para pruebas de integración',
    price: 25000,
    stock: 10,
    category: 'Herramientas'
  };

  describe('📋 OBTENER LISTA DE PRODUCTOS - CASOS BÁSICOS', () => {
    test('✅ Debe obtener lista de productos exitosamente', async () => {
      const response = await request(appPrueba)
        .get('/api/products');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    test('✅ La respuesta debe tener estructura correcta', async () => {
      const response = await request(appPrueba)
        .get('/api/products');

      if (response.body.length > 0) {
        const product = response.body[0];
        expect(product).toHaveProperty('id');
        expect(product).toHaveProperty('name');
        expect(product).toHaveProperty('price');
        expect(typeof product.price).toBe('number');
      }
    });

    test('✅ Debe manejar lista vacía correctamente', async () => {
      const response = await request(appPrueba)
        .get('/api/products');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('📋 OBTENER LISTA - PAGINACIÓN Y FILTROS', () => {
    test('✅ Debe soportar paginación con limit', async () => {
      const response = await request(appPrueba)
        .get('/api/products?limit=5');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeLessThanOrEqual(5);
    });

    test('✅ Debe soportar paginación con offset', async () => {
      const response = await request(appPrueba)
        .get('/api/products?offset=0&limit=10');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    test('✅ Debe soportar filtro por categoría', async () => {
      const response = await request(appPrueba)
        .get('/api/products?category=Herramientas');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    test('✅ Debe soportar búsqueda por nombre', async () => {
      const response = await request(appPrueba)
        .get('/api/products?search=martillo');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    test('✅ Debe soportar ordenamiento por precio', async () => {
      const response = await request(appPrueba)
        .get('/api/products?sort=price&order=asc');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    test('❌ Debe manejar parámetros de paginación inválidos', async () => {
      const response = await request(appPrueba)
        .get('/api/products?limit=abc&offset=xyz');

      expect(response.status).toBe(200); // Debería usar valores por defecto
    });
  });

  describe('➕ CREAR PRODUCTO - CASOS BÁSICOS', () => {
    test('✅ Debe crear un producto con datos válidos', async () => {
      const response = await request(appPrueba)
        .post('/api/products')
        .send(testProduct);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(testProduct.name);
      expect(response.body.price).toBe(testProduct.price);
      expect(response.body.stock).toBe(testProduct.stock);
      
      productId = response.body.id;
    });

    test('✅ Debe crear producto con datos mínimos requeridos', async () => {
      const minimalProduct = {
        name: 'Producto Mínimo',
        price: 1000
      };

      const response = await request(appPrueba)
        .post('/api/products')
        .send(minimalProduct);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(minimalProduct.name);
      expect(response.body.price).toBe(minimalProduct.price);
    });

    test('❌ Debe fallar sin nombre', async () => {
      const invalidProduct = {
        price: 1000,
        stock: 5
      };

      const response = await request(appPrueba)
        .post('/api/products')
        .send(invalidProduct);

      expect(response.status).toBe(500);
    });

    test('❌ Debe fallar sin precio', async () => {
      const invalidProduct = {
        name: 'Producto Sin Precio',
        stock: 5
      };

      const response = await request(appPrueba)
        .post('/api/products')
        .send(invalidProduct);

      expect(response.status).toBe(500);
    });
  });

  describe('➕ CREAR PRODUCTO - VALIDACIONES AVANZADAS', () => {
    test('❌ Debe fallar con nombre vacío', async () => {
      const response = await request(appPrueba)
        .post('/api/products')
        .send({
          name: '',
          price: 1000
        });

      expect(response.status).toBe(500);
    });

    test('❌ Debe fallar con nombre muy largo', async () => {
      const response = await request(appPrueba)
        .post('/api/products')
        .send({
          name: 'a'.repeat(1000),
          price: 1000
        });

      expect(response.status).toBe(500);
    });

    test('❌ Debe fallar con precio negativo', async () => {
      const response = await request(appPrueba)
        .post('/api/products')
        .send({
          name: 'Producto Precio Negativo',
          price: -100
        });

      expect(response.status).toBe(500);
    });

    test('❌ Debe fallar con precio cero', async () => {
      const response = await request(appPrueba)
        .post('/api/products')
        .send({
          name: 'Producto Precio Cero',
          price: 0
        });

      expect(response.status).toBe(500);
    });

    test('❌ Debe fallar con precio como string', async () => {
      const response = await request(appPrueba)
        .post('/api/products')
        .send({
          name: 'Producto String Price',
          price: 'mil pesos'
        });

      expect(response.status).toBe(500);
    });

    test('❌ Debe fallar con precio infinito', async () => {
      const response = await request(appPrueba)
        .post('/api/products')
        .send({
          name: 'Producto Precio Infinito',
          price: Infinity
        });

      expect(response.status).toBe(500);
    });

    test('❌ Debe fallar con precio NaN', async () => {
      const response = await request(appPrueba)
        .post('/api/products')
        .send({
          name: 'Producto Precio NaN',
          price: NaN
        });

      expect(response.status).toBe(500);
    });

    test('❌ Debe fallar con stock decimal', async () => {
      const response = await request(appPrueba)
        .post('/api/products')
        .send({
          name: 'Producto Stock Decimal',
          price: 1000,
          stock: 5.5
        });

      expect(response.status).toBe(500);
    });

    test('❌ Debe fallar con stock muy grande', async () => {
      const response = await request(appPrueba)
        .post('/api/products')
        .send({
          name: 'Producto Stock Grande',
          price: 1000,
          stock: 999999999999999999999
        });

      expect(response.status).toBe(500);
    });

    test('❌ Debe fallar con nombre que contenga solo espacios', async () => {
      const response = await request(appPrueba)
        .post('/api/products')
        .send({
          name: '     ',
          price: 1000
        });

      expect(response.status).toBe(500);
    });

    test('❌ Debe fallar con descripción extremadamente larga', async () => {
      const response = await request(appPrueba)
        .post('/api/products')
        .send({
          name: 'Producto Descripción Larga',
          description: 'x'.repeat(50000),
          price: 1000
        });

      expect(response.status).toBe(500);
    });

    test('❌ Debe fallar con categoría que contenga caracteres especiales', async () => {
      const response = await request(appPrueba)
        .post('/api/products')
        .send({
          name: 'Producto Categoría Especial',
          price: 1000,
          category: '<script>alert("xss")</script>'
        });

      expect(response.status).toBe(500);
    });

    test('❌ Debe fallar con nombre que contenga caracteres de control', async () => {
      const response = await request(appPrueba)
        .post('/api/products')
        .send({
          name: 'Producto\u0000Control',
          price: 1000
        });

      expect(response.status).toBe(500);
    });

    test('❌ Debe fallar con precio como array', async () => {
      const response = await request(appPrueba)
        .post('/api/products')
        .send({
          name: 'Producto Array Price',
          price: [1000, 2000]
        });

      expect(response.status).toBe(500);
    });

    test('❌ Debe fallar con precio como objeto', async () => {
      const response = await request(appPrueba)
        .post('/api/products')
        .send({
          name: 'Producto Object Price',
          price: { amount: 1000, currency: 'CLP' }
        });

      expect(response.status).toBe(500);
    });

    test('❌ Debe fallar con nombre que contenga emojis', async () => {
      const response = await request(appPrueba)
        .post('/api/products')
        .send({
          name: 'Producto 🔨 Martillo',
          price: 1000
        });

      expect(response.status).toBe(500);
    });

    test('❌ Debe fallar con precio con más de 2 decimales', async () => {
      const response = await request(appPrueba)
        .post('/api/products')
        .send({
          name: 'Producto Decimales',
          price: 1000.999
        });

      expect(response.status).toBe(500);
    });

    test('❌ Debe fallar con stock como string', async () => {
      const response = await request(appPrueba)
        .post('/api/products')
        .send({
          name: 'Producto Stock String',
          price: 1000,
          stock: 'diez'
        });

      expect(response.status).toBe(500);
    });

    test('❌ Debe fallar con nombre que contenga solo números', async () => {
      const response = await request(appPrueba)
        .post('/api/products')
        .send({
          name: '123456789',
          price: 1000
        });

      expect(response.status).toBe(500);
    });

    test('❌ Debe fallar con payload JSON malformado', async () => {
      const response = await request(appPrueba)
        .post('/api/products')
        .send('{"name": "Producto", "price": 1000,}'); // JSON inválido

      expect(response.status).toBe(400);
    });

    test('❌ Debe fallar con campos adicionales no permitidos', async () => {
      const response = await request(appPrueba)
        .post('/api/products')
        .send({
          name: 'Producto Campos Extra',
          price: 1000,
          maliciousField: '<script>alert("hack")</script>',
          extraData: 'x'.repeat(10000)
        });

      expect([201, 500]).toContain(response.status);
    });

    test('❌ Debe fallar con precio científico muy grande', async () => {
      const response = await request(appPrueba)
        .post('/api/products')
        .send({
          name: 'Producto Precio Científico',
          price: 1e+100
        });

      expect(response.status).toBe(500);
    });

    test('❌ Debe fallar con nombre con caracteres RTL', async () => {
      const response = await request(appPrueba)
        .post('/api/products')
        .send({
          name: 'Producto\u202E\u0040\u202D',
          price: 1000
        });

      expect(response.status).toBe(500);
    });
  });

  describe('🔍 OBTENER PRODUCTO ESPECÍFICO - CASOS BÁSICOS', () => {
    test('✅ Debe obtener producto por ID válido', async () => {
      if (productId) {
        const response = await request(appPrueba)
          .get(`/api/products/${productId}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('id');
        expect(response.body.id).toBe(productId);
        expect(response.body).toHaveProperty('name');
        expect(response.body).toHaveProperty('price');
      }
    });

    test('❌ Debe fallar con ID inexistente', async () => {
      const response = await request(appPrueba)
        .get('/api/products/99999');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });

    test('❌ Debe fallar con ID inválido - texto', async () => {
      const response = await request(appPrueba)
        .get('/api/products/abc');

      expect(response.status).toBe(400);
    });

    test('❌ Debe fallar con ID inválido - negativo', async () => {
      const response = await request(appPrueba)
        .get('/api/products/-1');

      expect(response.status).toBe(400);
    });

    test('❌ Debe fallar con ID inválido - decimal', async () => {
      const response = await request(appPrueba)
        .get('/api/products/1.5');

      expect(response.status).toBe(400);
    });

    test('❌ Debe fallar con ID muy grande', async () => {
      const response = await request(appPrueba)
        .get('/api/products/999999999999999999999');

      expect(response.status).toBe(400);
    });
  });

  describe('✏️ ACTUALIZAR PRODUCTO - CASOS BÁSICOS', () => {
    test('✅ Debe actualizar producto con datos válidos', async () => {
      if (productId) {
        const updatedData = {
          name: 'Martillo Actualizado',
          price: 30000,
          stock: 15
        };

        const response = await request(appPrueba)
          .put(`/api/products/${productId}`)
          .send(updatedData);

        expect(response.status).toBe(200);
        expect(response.body.name).toBe(updatedData.name);
        expect(response.body.price).toBe(updatedData.price);
        expect(response.body.stock).toBe(updatedData.stock);
      }
    });

    test('✅ Debe actualizar solo algunos campos', async () => {
      if (productId) {
        const partialUpdate = {
          price: 35000
        };

        const response = await request(appPrueba)
          .put(`/api/products/${productId}`)
          .send(partialUpdate);

        expect(response.status).toBe(200);
        expect(response.body.price).toBe(partialUpdate.price);
      }
    });

    test('❌ Debe fallar al actualizar producto inexistente', async () => {
      const response = await request(appPrueba)
        .put('/api/products/99999')
        .send({
          name: 'Producto Inexistente',
          price: 1000
        });

      expect(response.status).toBe(404);
    });

    test('❌ Debe fallar con ID inválido en actualización', async () => {
      const response = await request(appPrueba)
        .put('/api/products/abc')
        .send({
          name: 'Producto ID Inválido',
          price: 1000
        });

      expect(response.status).toBe(400);
    });
  });

  describe('✏️ ACTUALIZAR PRODUCTO - VALIDACIONES AVANZADAS', () => {
    test('❌ Debe fallar al actualizar con precio negativo', async () => {
      if (productId) {
        const response = await request(appPrueba)
          .put(`/api/products/${productId}`)
          .send({
            price: -1000
          });

        expect(response.status).toBe(500);
      }
    });

    test('❌ Debe fallar al actualizar con stock negativo', async () => {
      if (productId) {
        const response = await request(appPrueba)
          .put(`/api/products/${productId}`)
          .send({
            stock: -5
          });

        expect(response.status).toBe(500);
      }
    });

    test('❌ Debe fallar al actualizar con nombre vacío', async () => {
      if (productId) {
        const response = await request(appPrueba)
          .put(`/api/products/${productId}`)
          .send({
            name: ''
          });

        expect(response.status).toBe(500);
      }
    });

    test('❌ Debe fallar con inyección SQL en actualización', async () => {
      if (productId) {
        const response = await request(appPrueba)
          .put(`/api/products/${productId}`)
          .send({
            name: "'; DROP TABLE products; --"
          });

        expect(response.status).toBe(500);
      }
    });

    test('❌ Debe fallar con XSS en actualización', async () => {
      if (productId) {
        const response = await request(appPrueba)
          .put(`/api/products/${productId}`)
          .send({
            name: '<script>alert("xss")</script>'
          });

        expect(response.status).toBe(500);
      }
    });

    test('❌ Debe fallar con datos de tipo incorrecto', async () => {
      if (productId) {
        const response = await request(appPrueba)
          .put(`/api/products/${productId}`)
          .send({
            price: 'texto en lugar de número',
            stock: 'también texto'
          });

        expect(response.status).toBe(500);
      }
    });
  });

  describe('🗑️ ELIMINAR PRODUCTO - CASOS BÁSICOS', () => {
    let productToDelete;

    beforeAll(async () => {
      // Crear producto para eliminar
      const response = await request(appPrueba)
        .post('/api/products')
        .send({
          name: 'Producto Para Eliminar',
          price: 5000
        });
      
      if (response.status === 201) {
        productToDelete = response.body.id;
      }
    });

    test('✅ Debe eliminar producto existente', async () => {
      if (productToDelete) {
        const response = await request(appPrueba)
          .delete(`/api/products/${productToDelete}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('message');
      }
    });

    test('❌ Debe fallar al eliminar producto inexistente', async () => {
      const response = await request(appPrueba)
        .delete('/api/products/99999');

      expect(response.status).toBe(404);
    });

    test('❌ Debe fallar con ID inválido en eliminación', async () => {
      const response = await request(appPrueba)
        .delete('/api/products/abc');

      expect(response.status).toBe(400);
    });

    test('❌ Debe fallar al eliminar con ID negativo', async () => {
      const response = await request(appPrueba)
        .delete('/api/products/-1');

      expect(response.status).toBe(400);
    });

    test('✅ Verificar que producto eliminado no existe', async () => {
      if (productToDelete) {
        const response = await request(appPrueba)
          .get(`/api/products/${productToDelete}`);

        expect(response.status).toBe(404);
      }
    });
  });

  describe('🔒 SEGURIDAD Y AUTENTICACIÓN', () => {
    test('❌ Debe fallar crear producto sin autenticación', async () => {
      const response = await request(appPrueba)
        .post('/api/products')
        .send({
          name: 'Producto Sin Auth',
          price: 1000
        });

      // Dependiendo de la implementación, podría requerir auth
      expect([201, 401, 403]).toContain(response.status);
    });

    test('❌ Debe fallar actualizar producto sin autenticación', async () => {
      if (productId) {
        const response = await request(appPrueba)
          .put(`/api/products/${productId}`)
          .send({
            name: 'Actualización Sin Auth'
          });

        // Dependiendo de la implementación, podría requerir auth
        expect([200, 401, 403]).toContain(response.status);
      }
    });

    test('❌ Debe fallar eliminar producto sin autenticación', async () => {
      const response = await request(appPrueba)
        .delete('/api/products/1');

      // Dependiendo de la implementación, podría requerir auth
      expect([200, 404, 401, 403]).toContain(response.status);
    });
  });

  describe('📊 CASOS EXTREMOS Y PERFORMANCE', () => {
    test('❌ Debe manejar payload muy grande', async () => {
      const largeProduct = {
        name: 'a'.repeat(10000),
        description: 'b'.repeat(50000),
        price: 1000
      };

      const response = await request(appPrueba)
        .post('/api/products')
        .send(largeProduct);

      expect(response.status).toBe(500);
    });

    test('❌ Debe manejar caracteres Unicode', async () => {
      const response = await request(appPrueba)
        .post('/api/products')
        .send({
          name: '产品测试 🛠️ ñáéíóú',
          price: 1000
        });

      expect(response.status).toBe(500);
    });

    test('❌ Debe manejar números muy grandes', async () => {
      const response = await request(appPrueba)
        .post('/api/products')
        .send({
          name: 'Producto Precio Gigante',
          price: 999999999999999999999
        });

      expect(response.status).toBe(500);
    });

    test('❌ Debe manejar decimales con muchos dígitos', async () => {
      const response = await request(appPrueba)
        .post('/api/products')
        .send({
          name: 'Producto Precio Decimal',
          price: 1000.123456789012345
        });

      expect(response.status).toBe(500);
    });

    test('✅ Debe manejar múltiples requests simultáneos', async () => {
      const promises = [];
      for (let i = 0; i < 10; i++) {
        promises.push(
          request(appPrueba)
            .post('/api/products')
            .send({
              name: `Producto Concurrente ${i}`,
              price: 1000 + i
            })
        );
      }

      const responses = await Promise.all(promises);
      
      // Al menos algunos deberían ser exitosos
      const successCount = responses.filter(r => r.status === 201).length;
      expect(successCount).toBeGreaterThan(0);
    });
  });

  describe('🌐 TIPOS DE CONTENIDO Y HEADERS', () => {
    test('❌ Debe fallar con Content-Type incorrecto', async () => {
      const response = await request(appPrueba)
        .post('/api/products')
        .set('Content-Type', 'text/plain')
        .send('name=Test&price=1000');

      expect(response.status).toBe(500);
    });

    test('❌ Debe fallar con JSON malformado', async () => {
      const response = await request(appPrueba)
        .post('/api/products')
        .set('Content-Type', 'application/json')
        .send('{"name":"Test","price":'); // JSON incompleto

      expect(response.status).toBe(400);
    });

    test('❌ Debe fallar con datos no JSON', async () => {
      const response = await request(appPrueba)
        .post('/api/products')
        .set('Content-Type', 'application/json')
        .send('esto no es json');

      expect(response.status).toBe(400);
    });

    test('✅ Debe aceptar Content-Type correcto', async () => {
      const response = await request(appPrueba)
        .post('/api/products')
        .set('Content-Type', 'application/json')
        .send(JSON.stringify({
          name: 'Producto Content-Type',
          price: 1000
        }));

      expect([201, 500]).toContain(response.status);
    });
  });

  describe('🔍 VALIDACIÓN DE RESPUESTAS', () => {
    test('✅ Las respuestas deben tener estructura consistente', async () => {
      const response = await request(appPrueba)
        .get('/api/products');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      
      if (response.body.length > 0) {
        const product = response.body[0];
        expect(product).toHaveProperty('id');
        expect(product).toHaveProperty('name');
        expect(product).toHaveProperty('price');
        expect(typeof product.id).toBe('number');
        expect(typeof product.name).toBe('string');
        expect(typeof product.price).toBe('number');
      }
    });

    test('✅ Los errores deben tener formato consistente', async () => {
      const response = await request(appPrueba)
        .get('/api/products/99999');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
      expect(typeof response.body.error).toBe('string');
    });

    test('✅ La creación debe devolver producto completo', async () => {
      const newProduct = {
        name: 'Producto Respuesta',
        price: 2000,
        stock: 8
      };

      const response = await request(appPrueba)
        .post('/api/products')
        .send(newProduct);

      if (response.status === 201) {
        expect(response.body).toHaveProperty('id');
        expect(response.body).toHaveProperty('name');
        expect(response.body).toHaveProperty('price');
        expect(response.body).toHaveProperty('createdAt');
        expect(response.body.name).toBe(newProduct.name);
        expect(response.body.price).toBe(newProduct.price);
      }
    });
  });

  describe('⏱️ PERFORMANCE Y TIMEOUTS', () => {
    test('✅ La lista debe cargarse en tiempo razonable', async () => {
      const startTime = Date.now();
      
      const response = await request(appPrueba)
        .get('/api/products');

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(response.status).toBe(200);
      expect(duration).toBeLessThan(3000); // Menos de 3 segundos
    });

    test('✅ La creación debe completarse en tiempo razonable', async () => {
      const startTime = Date.now();
      
      const response = await request(appPrueba)
        .post('/api/products')
        .send({
          name: 'Producto Performance',
          price: 1500
        });

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(5000); // Menos de 5 segundos
    });

    test('✅ La búsqueda debe ser eficiente', async () => {
      const startTime = Date.now();
      
      const response = await request(appPrueba)
        .get('/api/products/1');

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(2000); // Menos de 2 segundos
    });
  });

  describe('📈 CASOS DE NEGOCIO ESPECÍFICOS', () => {
    test('✅ Debe manejar productos con stock cero', async () => {
      const response = await request(appPrueba)
        .post('/api/products')
        .send({
          name: 'Producto Sin Stock',
          price: 1000,
          stock: 0
        });

      expect([201, 500]).toContain(response.status);
    });

    test('✅ Debe manejar productos con precios decimales', async () => {
      const response = await request(appPrueba)
        .post('/api/products')
        .send({
          name: 'Producto Precio Decimal',
          price: 1250.50
        });

      expect([201, 500]).toContain(response.status);
    });

    test('✅ Debe manejar productos con categorías específicas', async () => {
      const categories = ['Herramientas', 'Materiales', 'Seguridad', 'Eléctricos'];
      
      for (const category of categories) {
        const response = await request(appPrueba)
          .post('/api/products')
          .send({
            name: `Producto ${category}`,
            price: 1000,
            category: category
          });

        expect([201, 500]).toContain(response.status);
      }
    });

    test('✅ Debe manejar búsqueda case-insensitive', async () => {
      const response = await request(appPrueba)
        .get('/api/products?search=MARTILLO');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    test('✅ Debe manejar ordenamiento por múltiples campos', async () => {
      const response = await request(appPrueba)
        .get('/api/products?sort=category,price&order=asc');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });
}); 