// backend/controllers/evaluationController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Criar uma nova avaliação
exports.createEvaluation = async (req, res) => {
  const { userId } = req.params;
  const data = req.body; // O body agora terá os campos com _score e _notes

  try {
    const evaluation = await prisma.evaluation.create({
      data: {
        userId: userId,
        ...data,
      },
    });
    res.status(201).json(evaluation);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao criar avaliação.', error: error.message });
  }
};

// ATUALIZAR UMA AVALIAÇÃO
exports.updateEvaluation = async (req, res) => {
  const { id } = req.params;
  const data = req.body;
  try {
    const updatedEvaluation = await prisma.evaluation.update({
      where: { id: id },
      data: data,
    });
    res.status(200).json(updatedEvaluation);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar avaliação.', error: error.message });
  }
};

// Buscar todas as avaliações de um usuário
exports.getEvaluationsByUser = async (req, res) => {
  const { userId } = req.params;
  try {
    const evaluations = await prisma.evaluation.findMany({
      where: { userId: userId },
      orderBy: { createdAt: 'desc' },
    });
    res.status(200).json(evaluations);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar avaliações.' });
  }
};

// Obter estatísticas do sistema
exports.getSystemStats = async (req, res) => {
  try {
    const userCount = await prisma.user.count();
    const evaluationCount = await prisma.evaluation.count();
    const oeeAverages = await prisma.evaluation.aggregate({
      _avg: {
        availability: true,
        performance: true,
        quality: true,
      },
    });

    const avgAvailability = oeeAverages._avg.availability || 0;
    const avgPerformance = oeeAverages._avg.performance || 0;
    const avgQuality = oeeAverages._avg.quality || 0;
    const overallOEE = (avgAvailability / 100) * (avgPerformance / 100) * (avgQuality / 100);

    res.status(200).json({
      userCount,
      evaluationCount,
      averageOEE: (overallOEE * 100).toFixed(2),
    });

  } catch (error) {
    res.status(500).json({ message: 'Erro ao calcular estatísticas.', error: error.message });
  }
};

// Obter dados de OEE por usuário para gráficos
exports.getOEEByUser = async (req, res) => {
  try {
    const evaluations = await prisma.evaluation.findMany({
      include: {
        user: {
          select: { name: true },
        },
      },
    });
    const userEvals = evaluations.reduce((acc, eval) => {
      const userName = eval.user.name;
      if (!acc[userName]) {
        acc[userName] = [];
      }
      acc[userName].push(eval);
      return acc;
    }, {});
    const dataForChart = Object.keys(userEvals).map(userName => {
      const evals = userEvals[userName];
      const avgAvailability = evals.reduce((sum, e) => sum + e.availability, 0) / evals.length;
      const avgPerformance = evals.reduce((sum, e) => sum + e.performance, 0) / evals.length;
      const avgQuality = evals.reduce((sum, e) => sum + e.quality, 0) / evals.length;
      const oee = (avgAvailability / 100) * (avgPerformance / 100) * (avgQuality / 100);
      return {
        name: userName,
        oee: parseFloat((oee * 100).toFixed(2)),
      };
    });
    res.status(200).json(dataForChart);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar dados de OEE por usuário.', error: error.message });
  }
};

// BUSCAR UMA AVALIAÇÃO ESPECÍFICA POR ID
exports.getEvaluationById = async (req, res) => {
  const { id } = req.params;
  try {
    const evaluation = await prisma.evaluation.findUnique({
      where: { id: id },
    });
    if (!evaluation) {
      return res.status(404).json({ message: 'Avaliação não encontrada.' });
    }
    res.status(200).json(evaluation);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar avaliação.', error: error.message });
  }
};

// EXCLUIR UMA AVALIAÇÃO
exports.deleteEvaluation = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.evaluation.delete({
      where: { id: id },
    });
    res.status(204).send();
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Avaliação não encontrada.' });
    }
    res.status(500).json({ message: 'Erro ao excluir avaliação.', error: error.message });
  }
};