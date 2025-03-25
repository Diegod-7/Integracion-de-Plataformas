const WebpayPlus = require('transbank-sdk').WebpayPlus;
const { Transaction } = WebpayPlus;

// Configurar el ambiente de integración
WebpayPlus.configureForIntegration(
  process.env.WEBPAY_COMMERCE_CODE || '597055555532',
  process.env.WEBPAY_API_KEY || '579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C'
);

const createTransaction = async (req, res) => {
  try {
    const { buyOrder, sessionId, amount, returnUrl } = req.body;

    const createResponse = await Transaction.create(
      buyOrder,
      sessionId,
      amount,
      returnUrl
    );

    res.json({
      url: createResponse.url,
      token: createResponse.token
    });
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({
      error: 'Error creating transaction'
    });
  }
};

const confirmTransaction = async (req, res) => {
  try {
    const { token } = req.params;

    const commitResponse = await Transaction.commit(token);

    res.json(commitResponse);
  } catch (error) {
    console.error('Error confirming transaction:', error);
    res.status(500).json({
      error: 'Error confirming transaction'
    });
  }
};

module.exports = {
  createTransaction,
  confirmTransaction
}; 