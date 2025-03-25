const { Order } = require('../models');
const transbankService = require('../services/transbank.service');
const bancoCentralService = require('../services/banco-central.service');
const logger = require('../utils/logger');

/**
 * Iniciar un proceso de pago
 */
exports.initPayment = async (req, res) => {
  try {
    const { orderId, currency = 'CLP' } = req.body;
    
    // Obtener la orden
    const order = await Order.findByPk(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Orden no encontrada' });
    }
    
    let amount = order.totalAmount;
    let exchangeRate = null;
    
    // Si la moneda es diferente a CLP, hacer conversión
    if (currency !== 'CLP') {
      try {
        const conversion = await bancoCentralService.convertToCLP(amount, currency);
        amount = conversion.convertedAmount;
        exchangeRate = conversion.exchangeRate;
        
        // Actualizar el tipo de cambio en la orden
        await order.update({ exchangeRate });
        
        logger.info(`Conversión de moneda realizada: ${currency} a CLP. Tasa: ${exchangeRate}`);
      } catch (error) {
        logger.error(`Error en conversión de moneda: ${error.message}`);
        return res.status(400).json({ message: 'Error al procesar la conversión de moneda.' });
      }
    }
    
    // Iniciar transacción con Transbank
    const paymentData = {
      id: order.id,
      totalAmount: Math.round(amount), // Asegurar que el monto sea un entero
      buyOrder: `ORDEN-${order.id}`,
      returnUrl: `${process.env.BACKEND_URL}/api/payments/confirm`,
      finalUrl: `${process.env.FRONTEND_URL}/checkout/complete`
    };
    
    const transbankResponse = await transbankService.createTransaction(paymentData);
    
    // Almacenar el token en la orden
    await order.update({ 
      transbankToken: transbankResponse.token,
      paymentStatus: 'pending'
    });
    
    // Devolver URL de redirección y token
    return res.status(200).json({
      url: transbankResponse.url,
      token: transbankResponse.token
    });
    
  } catch (error) {
    logger.error(`Error al iniciar pago: ${error.message}`);
    return res.status(500).json({ 
      message: 'Error al procesar el pago.',
      error: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
};

/**
 * Confirmar un pago después de redireccionamiento
 */
exports.confirmPayment = async (req, res) => {
  try {
    const { token_ws } = req.body;
    
    if (!token_ws) {
      logger.warn('Intento de confirmación sin token');
      return res.status(400).json({ message: 'Token de transacción requerido' });
    }
    
    // Confirmar la transacción con Transbank
    const transbankResponse = await transbankService.confirmTransaction(token_ws);
    
    // Buscar la orden por el token
    const order = await Order.findOne({ where: { transbankToken: token_ws } });
    
    if (!order) {
      logger.warn(`No se encontró orden para el token: ${token_ws}`);
      return res.status(404).json({ message: 'Orden no encontrada para este pago' });
    }
    
    // Verificar estado del pago
    if (transbankResponse.response_code === 0) {
      // Pago exitoso
      await order.update({
        paymentStatus: 'completed',
        transbankAuthorizationCode: transbankResponse.authorization_code,
        transactionId: transbankResponse.buy_order,
        status: 'processing'
      });
      
      logger.info(`Pago completado exitosamente para orden ${order.id}`);
      
      // Redirigir al cliente a la página de confirmación
      return res.redirect(`${process.env.FRONTEND_URL}/checkout/success?orderId=${order.id}`);
    } else {
      // Pago rechazado
      await order.update({
        paymentStatus: 'failed',
        transbankAuthorizationCode: null,
        notes: `Pago rechazado: ${transbankResponse.response_code}`
      });
      
      logger.warn(`Pago rechazado para orden ${order.id}, código: ${transbankResponse.response_code}`);
      
      // Redirigir al cliente a la página de error
      return res.redirect(`${process.env.FRONTEND_URL}/checkout/failed?orderId=${order.id}`);
    }
    
  } catch (error) {
    logger.error(`Error al confirmar pago: ${error.message}`);
    return res.status(500).json({ 
      message: 'Error al confirmar el pago.',
      error: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
};

/**
 * Obtener estado de un pago
 */
exports.getPaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const order = await Order.findByPk(orderId);
    
    if (!order) {
      return res.status(404).json({ message: 'Orden no encontrada' });
    }
    
    // Si no hay token, el pago no se ha iniciado
    if (!order.transbankToken) {
      return res.status(200).json({
        orderId: order.id,
        status: 'not_initiated',
        paymentStatus: order.paymentStatus
      });
    }
    
    // Consultar estado en Transbank
    const transbankStatus = await transbankService.getTransactionStatus(order.transbankToken);
    
    return res.status(200).json({
      orderId: order.id,
      paymentStatus: order.paymentStatus,
      transbankStatus,
      orderStatus: order.status
    });
    
  } catch (error) {
    logger.error(`Error al obtener estado del pago: ${error.message}`);
    return res.status(500).json({ 
      message: 'Error al obtener el estado del pago.',
      error: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
};

/**
 * Anular un pago
 */
exports.refundPayment = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const order = await Order.findByPk(orderId);
    
    if (!order) {
      return res.status(404).json({ message: 'Orden no encontrada' });
    }
    
    // Verificar que la orden tenga un pago completado
    if (order.paymentStatus !== 'completed') {
      return res.status(400).json({ 
        message: 'No se puede anular un pago que no está completado'
      });
    }
    
    // Realizar la anulación en Transbank
    const refundData = {
      token: order.transbankToken,
      amount: parseFloat(order.totalAmount)
    };
    
    const transbankResponse = await transbankService.refundTransaction(refundData);
    
    // Actualizar estado de la orden
    await order.update({
      paymentStatus: 'refunded',
      status: 'cancelled',
      notes: `Pago anulado: ${new Date().toISOString()}`
    });
    
    logger.info(`Pago anulado para orden ${order.id}`);
    
    return res.status(200).json({
      message: 'Pago anulado correctamente',
      orderId: order.id,
      refundDetails: transbankResponse
    });
    
  } catch (error) {
    logger.error(`Error al anular pago: ${error.message}`);
    return res.status(500).json({ 
      message: 'Error al anular el pago.',
      error: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
};

/**
 * Obtener tipos de cambio actuales
 */
exports.getExchangeRates = async (req, res) => {
  try {
    const usdRate = await bancoCentralService.getExchangeRate('USD');
    const eurRate = await bancoCentralService.getExchangeRate('EUR');
    
    return res.status(200).json({
      baseCurrency: 'CLP',
      rates: {
        USD: typeof usdRate === 'string' ? parseFloat(usdRate.replace(',', '.')) : usdRate,
        EUR: typeof eurRate === 'string' ? parseFloat(eurRate.replace(',', '.')) : eurRate
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    logger.error(`Error al obtener tipos de cambio: ${error.message}`);
    return res.status(500).json({ 
      message: 'Error al obtener tipos de cambio.',
      error: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
}; 