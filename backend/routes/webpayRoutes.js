const express = require('express');
const router = express.Router();
const webpayController = require('../controllers/webpayController');

// Crear una nueva transacción
router.post('/create', webpayController.createTransaction);

// Confirmar una transacción
router.post('/confirm/:token', webpayController.confirmTransaction);

module.exports = router; 