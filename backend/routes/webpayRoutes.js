const express = require('express');
const router = express.Router();
const webpayController = require('../controllers/webpayController');

// Ruta para crear una transacción
router.post('/create', webpayController.createTransaction);

// Ruta para confirmar una transacción
router.post('/confirm', webpayController.confirmTransaction);

module.exports = router; 