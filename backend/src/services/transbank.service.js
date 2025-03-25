const axios = require('axios');
const logger = require('../utils/logger');

// URL base para el ambiente de desarrollo/pruebas
const TRANSBANK_BASE_URL = process.env.TRANSBANK_ENVIRONMENT === 'PRODUCTION'
  ? 'https://webpay3g.transbank.cl'
  : 'https://webpay3gint.transbank.cl';

// Configuración de credenciales
const COMMERCE_CODE = process.env.TRANSBANK_COMMERCE_CODE;
const API_KEY = process.env.TRANSBANK_API_KEY;

/**
 * Iniciar una transacción con Webpay Plus
 * @param {Object} orderData Datos de la orden
 * @returns {Promise<Object>} Respuesta de Transbank
 */
const createTransaction = async (orderData) => {
  try {
    const { id, totalAmount, buyOrder, returnUrl, finalUrl } = orderData;
    
    const response = await axios.post(
      `${TRANSBANK_BASE_URL}/rswebpaytransaction/api/webpay/v1.2/transactions`,
      {
        buy_order: buyOrder || `ORDER-${id}`,
        session_id: id,
        amount: totalAmount,
        return_url: returnUrl || `${process.env.FRONTEND_URL}/payment/return`,
        final_url: finalUrl || `${process.env.FRONTEND_URL}/payment/complete`
      },
      {
        headers: {
          'Tbk-Api-Key-Id': COMMERCE_CODE,
          'Tbk-Api-Key-Secret': API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    logger.info(`Transacción iniciada: ${JSON.stringify(response.data)}`);
    return response.data;
  } catch (error) {
    logger.error(`Error al iniciar transacción con Transbank: ${error.message}`);
    throw new Error('Error al procesar el pago con Transbank.');
  }
};

/**
 * Confirmar una transacción
 * @param {string} token Token de la transacción
 * @returns {Promise<Object>} Respuesta de Transbank
 */
const confirmTransaction = async (token) => {
  try {
    const response = await axios.put(
      `${TRANSBANK_BASE_URL}/rswebpaytransaction/api/webpay/v1.2/transactions/${token}`,
      {},
      {
        headers: {
          'Tbk-Api-Key-Id': COMMERCE_CODE,
          'Tbk-Api-Key-Secret': API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    logger.info(`Transacción confirmada: ${JSON.stringify(response.data)}`);
    return response.data;
  } catch (error) {
    logger.error(`Error al confirmar transacción con Transbank: ${error.message}`);
    throw new Error('Error al confirmar el pago con Transbank.');
  }
};

/**
 * Obtener estado de una transacción
 * @param {string} token Token de la transacción
 * @returns {Promise<Object>} Respuesta de Transbank
 */
const getTransactionStatus = async (token) => {
  try {
    const response = await axios.get(
      `${TRANSBANK_BASE_URL}/rswebpaytransaction/api/webpay/v1.2/transactions/${token}`,
      {
        headers: {
          'Tbk-Api-Key-Id': COMMERCE_CODE,
          'Tbk-Api-Key-Secret': API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    logger.info(`Estado de transacción obtenido: ${JSON.stringify(response.data)}`);
    return response.data;
  } catch (error) {
    logger.error(`Error al obtener estado de transacción: ${error.message}`);
    throw new Error('Error al obtener estado del pago con Transbank.');
  }
};

/**
 * Anular/reversar una transacción
 * @param {Object} refundData Datos para la anulación
 * @returns {Promise<Object>} Respuesta de Transbank
 */
const refundTransaction = async (refundData) => {
  try {
    const { token, amount } = refundData;
    
    const response = await axios.post(
      `${TRANSBANK_BASE_URL}/rswebpaytransaction/api/webpay/v1.2/transactions/${token}/refunds`,
      {
        amount: amount
      },
      {
        headers: {
          'Tbk-Api-Key-Id': COMMERCE_CODE,
          'Tbk-Api-Key-Secret': API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    logger.info(`Transacción anulada: ${JSON.stringify(response.data)}`);
    return response.data;
  } catch (error) {
    logger.error(`Error al anular transacción: ${error.message}`);
    throw new Error('Error al anular el pago con Transbank.');
  }
};

module.exports = {
  createTransaction,
  confirmTransaction,
  getTransactionStatus,
  refundTransaction
}; 