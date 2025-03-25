const express = require('express');
const router = express.Router();
const { Newsletter } = require('../models/Newsletter');

router.post('/subscribe', async (req, res) => {
  try {
    const { email } = req.body;

    // Validar el email
    if (!email || !/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/.test(email)) {
      return res.status(400).json({
        error: 'Invalid email',
        message: 'Por favor, proporciona un correo electrónico válido'
      });
    }

    // Verificar si el email ya está suscrito
    const existingSubscription = await Newsletter.findOne({ where: { email } });
    if (existingSubscription) {
      return res.status(400).json({
        error: 'Already subscribed',
        message: 'Este correo electrónico ya está suscrito'
      });
    }

    // Crear nueva suscripción
    await Newsletter.create({ email });

    res.status(201).json({
      message: '¡Gracias por suscribirte!'
    });
  } catch (error) {
    console.error('Error in newsletter subscription:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Error al procesar la suscripción'
    });
  }
});

module.exports = router; 