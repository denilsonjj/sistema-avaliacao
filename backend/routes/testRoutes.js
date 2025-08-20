const express = require('express');
const router = express.Router();
const { testConnection } = require('../services/productionDbService');

router.get('/db-connection', async (req, res) => {
  if (typeof testConnection !== 'function') {
    return res.status(500).json({ message: 'A função de teste de ligação não está disponível.' });
  }
  const result = await testConnection();
  if (result.success) {
    res.status(200).json(result);
  } else {
    res.status(500).json(result);
  }
});

module.exports = router;