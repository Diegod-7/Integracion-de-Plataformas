const axios = require('axios');
const logger = require('../utils/logger');

// URL base para el Banco Central de Chile
// Nota: Esta es una URL de ejemplo, debe ajustarse según la documentación oficial
const BANCO_CENTRAL_API_URL = 'https://api.sbif.cl/api-sbifv3/recursos_api';
const API_TOKEN = process.env.BANCO_CENTRAL_API_TOKEN;

/**
 * Obtener tipo de cambio actual para una moneda
 * @param {string} currency Código de moneda (USD, EUR, etc.)
 * @returns {Promise<number>} Tipo de cambio
 */
const getExchangeRate = async (currency = 'USD') => {
  try {
    // Formateamos la fecha actual en formato requerido (AAAA/MM/DD)
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    
    const formattedDate = `${year}/${month}/dias/${day}`;
    
    // Para dólar observado
    if (currency === 'USD') {
      const response = await axios.get(
        `${BANCO_CENTRAL_API_URL}/dolar/${formattedDate}?apikey=${API_TOKEN}&formato=json`
      );
      
      logger.info(`Tipo de cambio obtenido para USD: ${JSON.stringify(response.data)}`);
      
      // La estructura de respuesta puede variar, ajustar según documentación
      return response.data.Dolares[0].Valor;
    }
    
    // Para Euro
    if (currency === 'EUR') {
      const response = await axios.get(
        `${BANCO_CENTRAL_API_URL}/euro/${formattedDate}?apikey=${API_TOKEN}&formato=json`
      );
      
      logger.info(`Tipo de cambio obtenido para EUR: ${JSON.stringify(response.data)}`);
      
      return response.data.Euros[0].Valor;
    }
    
    // Para otras monedas, se debe implementar según la API
    throw new Error(`Moneda no soportada: ${currency}`);
    
  } catch (error) {
    logger.error(`Error al obtener tipo de cambio desde Banco Central: ${error.message}`);
    
    // En caso de error, usamos valores aproximados de respaldo
    // Esto es solo para desarrollo, en producción deberíamos manejar el error de otra manera
    if (currency === 'USD') return 900.0;  // Valor aproximado para USD
    if (currency === 'EUR') return 1000.0; // Valor aproximado para EUR
    
    throw new Error(`No se pudo obtener el tipo de cambio para ${currency}.`);
  }
};

/**
 * Convertir un monto desde CLP a otra moneda
 * @param {number} amountCLP Monto en pesos chilenos
 * @param {string} targetCurrency Moneda destino
 * @returns {Promise<Object>} Monto convertido y tasa usada
 */
const convertFromCLP = async (amountCLP, targetCurrency = 'USD') => {
  try {
    const exchangeRate = await getExchangeRate(targetCurrency);
    
    // Convertir de string a número si es necesario
    const rate = typeof exchangeRate === 'string' 
      ? parseFloat(exchangeRate.replace(',', '.')) 
      : exchangeRate;
    
    const convertedAmount = amountCLP / rate;
    
    return {
      originalAmount: amountCLP,
      convertedAmount: parseFloat(convertedAmount.toFixed(2)),
      currency: targetCurrency,
      exchangeRate: rate,
      date: new Date().toISOString()
    };
  } catch (error) {
    logger.error(`Error al convertir moneda: ${error.message}`);
    throw new Error('Error al realizar la conversión de moneda.');
  }
};

/**
 * Convertir un monto desde otra moneda a CLP
 * @param {number} amount Monto en la moneda origen
 * @param {string} sourceCurrency Moneda origen
 * @returns {Promise<Object>} Monto convertido y tasa usada
 */
const convertToCLP = async (amount, sourceCurrency = 'USD') => {
  try {
    const exchangeRate = await getExchangeRate(sourceCurrency);
    
    // Convertir de string a número si es necesario
    const rate = typeof exchangeRate === 'string' 
      ? parseFloat(exchangeRate.replace(',', '.')) 
      : exchangeRate;
    
    const convertedAmount = amount * rate;
    
    return {
      originalAmount: amount,
      convertedAmount: Math.round(convertedAmount),  // Redondeamos a un peso
      currency: 'CLP',
      exchangeRate: rate,
      date: new Date().toISOString()
    };
  } catch (error) {
    logger.error(`Error al convertir moneda: ${error.message}`);
    throw new Error('Error al realizar la conversión de moneda.');
  }
};

module.exports = {
  getExchangeRate,
  convertFromCLP,
  convertToCLP
}; 