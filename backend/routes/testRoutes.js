const express = require('express');
const router = express.Router();
const { 
    testConnection, 
    getProductionSummary, 
    calculatePerformance, calculateAvailability
} = require('../services/productionDbService');

//rota para calculo de performance
router.get('/performance/:lineDesc/:shift', async (req, res) => {
    const { lineDesc, shift } = req.params;
    
   
    let shiftId;
    const shiftNumber = parseInt(shift, 10);
  
    if (shiftNumber === 1) {
      shiftId = 2; // Turno 1
    } else if (shiftNumber === 2) {
      shiftId = 3; // Turno 2 
    } else if (shiftNumber === 3) {
      shiftId = 1; // Turno 3 
    } else {
      return res.status(400).json({ message: 'Turno inválido. Use 1, 2 ou 3.' });
    }
  
   
    const result = await calculatePerformance(lineDesc, shiftId);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(500).json(result);
    }
  });

router.get('/production-data', async (req, res) => {
    const result = await getProductionSummary();
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(500).json(result);
    }
});

//rota de disponibilidade
router.get('/availability/:lineDesc/:shift', async (req, res) => {
    const { lineDesc, shift } = req.params;
    
    let shiftId;
    const shiftNumber = parseInt(shift, 10);
  
    if (shiftNumber === 1) shiftId = 2;
    else if (shiftNumber === 2) shiftId = 3;
    else if (shiftNumber === 3) shiftId = 1;
    else {
      return res.status(400).json({ message: 'Turno inválido. Use 1, 2 ou 3.' });
    }
  
    const result = await calculateAvailability(lineDesc, shiftId);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(500).json(result);
    }
  });

router.get('/performance/:lineDesc', async (req, res) => {
  const { lineDesc } = req.params;

  
  const viewLineName = lineDesc.split(' ')[0];
  const viewName = `vw_Resumo_prod_${viewLineName}`;

  const result = await calculatePerformance(viewName, lineDesc);

  if (result.success) {
    res.status(200).json(result);
  } else {
    res.status(500).json(result);
  }
});

module.exports = router;