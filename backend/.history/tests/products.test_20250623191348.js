const request = require('supertest');
const express = require('express');
const cors = require('cors');
const productRoutes = require('../routes/productRoutes');

// Configurar la aplicación de prueba
const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/products', productRoutes);

describe('Pruebas de Integración - Productos', () => {
  
  describe('CASO004 - Gestión de Productos', () => {
    test('Paso 1: Obtener lista de productos', async () => {
      const response = await request(app)
        .get('/api/products');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    test('Paso 2: Crear nuevo producto', async () => {
      const productData = {
        name: 'Producto de Prueba',
        description: 'Descripción del producto de prueba',
        price: 99.99,
        category: 'Herramientas',
        stock: 10
      };

      const response = await request(app)
        .post('/api/products')
        .send(productData);

      expect(response.status).toBe(201);
      expect(response.body.name).toBe(productData.name);
    });

    test('Paso 3: Obtener producto por ID', async () => {
      // Primero crear un producto
      const productData = {
        name: 'Producto Test ID',
        description: 'Test',
        price: 50.00,
        category: 'Test',
        stock: 5
      };

      const createResponse = await request(app)
        .post('/api/products')
        .send(productData);

      const productId = createResponse.body.id;

      // Luego obtenerlo por ID
      const response = await request(app)
        .get(`/api/products/${productId}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(productId);
    });

    test('Paso 4: Actualizar producto existente', async () => {
      // Crear producto
      const productData = {
        name: 'Producto Original',
        description: 'Descripción original',
        price: 100.00,
        category: 'Original',
        stock: 15
      };

      const createResponse = await request(app)
        .post('/api/products')
        .send(productData);

      const productId = createResponse.body.id;

      // Actualizar producto
      const updateData = {
        name: 'Producto Actualizado',
        price: 150.00
      };

      const response = await request(app)
        .put(`/api/products/${productId}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.name).toBe(updateData.name);
      expect(response.body.price).toBe(updateData.price);
    });

    test('Paso 5: Eliminar producto', async () => {
      // Crear producto
      const productData = {
        name: 'Producto a Eliminar',
        description: 'Para eliminar',
        price: 25.00,
        category: 'Temporal',
        stock: 1
      };

      const createResponse = await request(app)
        .post('/api/products')
        .send(productData);

      const productId = createResponse.body.id;

      // Eliminar producto
      const response = await request(app)
        .delete(`/api/products/${productId}`);

      expect(response.status).toBe(200);
    });

    test('Paso 6: Error al obtener producto inexistente', async () => {
      const response = await request(app)
        .get('/api/products/99999');

      expect(response.status).toBe(404);
    });
  });
}); 