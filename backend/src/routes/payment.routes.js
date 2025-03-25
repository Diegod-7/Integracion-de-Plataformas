const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
// Aquí se importarían los middlewares de autenticación y autorización

// Ruta para iniciar un pago
router.post('/init', paymentController.initPayment);

// Ruta para confirmar un pago (usado por Transbank para redireccionar)
router.post('/confirm', paymentController.confirmPayment);

// Ruta para obtener el estado de un pago
router.get('/status/:orderId', paymentController.getPaymentStatus);

// Ruta para anular un pago (requeriría autenticación en producción)
router.post('/refund/:orderId', paymentController.refundPayment);

// Ruta para obtener tipos de cambio actuales
router.get('/exchange-rates', paymentController.getExchangeRates);

module.exports = router; 