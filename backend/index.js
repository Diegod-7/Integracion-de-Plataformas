const express = require('express');
const cors = require('cors');
require('dotenv').config();

const sequelize = require('./config/database');
const productRoutes = require('./routes/productRoutes');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/products', productRoutes);

// Ruta básica
app.get('/', (req, res) => {
  res.json({ message: 'API de Ferremas funcionando correctamente' });
});

// Sincronizar base de datos y iniciar servidor
async function startServer() {
  try {
    await sequelize.sync({ force: false });
    console.log('Base de datos sincronizada correctamente');
    
    app.listen(port, () => {
      console.log(`Servidor corriendo en http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
  }
}

startServer(); 