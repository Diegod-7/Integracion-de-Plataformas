const WebpayPlus = require('transbank-sdk').WebpayPlus;

// Configurar el ambiente de integración
WebpayPlus.configureForTesting();

const createTransaction = async (req, res) => {
  try {
    const { buyOrder, sessionId, amount, returnUrl } = req.body;

    console.log('Creating transaction with:', { buyOrder, sessionId, amount, returnUrl });

    // Validar los datos requeridos
    if (!buyOrder || !sessionId || !amount || !returnUrl) {
      console.error('Missing required fields:', { buyOrder, sessionId, amount, returnUrl });
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Todos los campos son requeridos'
      });
    }

    // Validar el monto
    const parsedAmount = parseInt(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      console.error('Invalid amount:', amount);
      return res.status(400).json({
        error: 'Invalid amount',
        message: 'El monto debe ser un número mayor a 0'
      });
    }

    // Validar la URL de retorno
    if (!returnUrl.startsWith('http')) {
      console.error('Invalid return URL:', returnUrl);
      return res.status(400).json({
        error: 'Invalid return URL',
        message: 'La URL de retorno debe ser una URL válida'
      });
    }

    console.log('Creating Webpay transaction...');
    const tx = new WebpayPlus.Transaction();
    console.log('Transaction instance created');

    const createResponse = await tx.create(
      buyOrder,
      sessionId,
      parsedAmount,
      returnUrl
    );

    console.log('Transaction created successfully:', createResponse);

    res.json({
      url: createResponse.url,
      token: createResponse.token
    });
  } catch (error) {
    console.error('Error creating transaction:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      error: 'Error creating transaction',
      message: 'Error al crear la transacción. Por favor intente nuevamente.',
      details: error.message,
      stack: error.stack
    });
  }
};

const confirmTransaction = async (req, res) => {
  try {
    console.log('Request query:', req.query);
    console.log('Request body:', req.body);
    
    // Intentar obtener el token de diferentes fuentes
    const token = req.query.token_ws || req.body.token_ws;
    const tbkToken = req.query.TBK_TOKEN || req.body.TBK_TOKEN;
    const tbkOrdenCompra = req.query.TBK_ORDEN_COMPRA || req.body.TBK_ORDEN_COMPRA;
    const tbkIdSesion = req.query.TBK_ID_SESION || req.body.TBK_ID_SESION;

    console.log('Parsed confirmation params:', { token, tbkToken, tbkOrdenCompra, tbkIdSesion });

    // Validar que tengamos un token
    if (!token && !tbkToken) {
      console.error('No token provided in query or body');
      return res.status(400).json({
        error: 'No token provided',
        message: 'No se proporcionó un token de transacción'
      });
    }

    // Manejar diferentes flujos como en el ejemplo
    if (token && !tbkToken) {
      // Flujo normal
      console.log('Normal flow - committing transaction with token:', token);
      const tx = new WebpayPlus.Transaction();
      const commitResponse = await tx.commit(token);
      console.log('Transaction confirmed successfully:', commitResponse);
      return res.json(commitResponse);
    } 
    else if (!token && !tbkToken) {
      // Timeout
      console.log('Timeout flow detected');
      return res.status(408).json({
        error: 'Payment timeout',
        message: 'El pago fue anulado por tiempo de espera (+10 minutos)'
      });
    }
    else if (!token && tbkToken) {
      // Pago abortado por usuario
      console.log('Payment aborted by user');
      return res.status(400).json({
        error: 'Payment aborted',
        message: 'El pago fue anulado por el usuario'
      });
    }
    else {
      // Caso inválido
      console.log('Invalid payment case detected');
      return res.status(400).json({
        error: 'Invalid payment',
        message: 'El pago es inválido'
      });
    }
  } catch (error) {
    console.error('Error confirming transaction:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      error: 'Error confirming transaction',
      message: 'Error al confirmar la transacción. Por favor intente nuevamente.',
      details: error.message,
      stack: error.stack
    });
  }
};

module.exports = {
  createTransaction,
  confirmTransaction
}; 