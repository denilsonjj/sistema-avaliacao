const express = require('express');
const router = express.Router();
const evaluationController = require('../controllers/evaluationController');
const authMiddleware = require('../middleware/authMiddleware');

// Rotas existentes
router.get('/stats', authMiddleware, evaluationController.getSystemStats);
router.get('/charts/oee-by-user', authMiddleware, evaluationController.getOEEByUser);
router.get('/user/:userId', authMiddleware, evaluationController.getEvaluationsByUser);
router.post('/user/:userId', authMiddleware, evaluationController.createEvaluation);

// --- NOVAS ROTAS PARA EDIÇÃO ---
router.get('/:id', authMiddleware, evaluationController.getEvaluationById);
router.put('/:id', authMiddleware, evaluationController.updateEvaluation);

//excluir
router.delete('/:id', authMiddleware, evaluationController.deleteEvaluation); 

module.exports = router;