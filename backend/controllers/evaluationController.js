const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.createEvaluation = async (req, res) => {
  const { userId } = req.params;
  const data = req.body;

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
    // Contagem de usuários e avaliações em paralelo
    const userCount = await prisma.user.count();
    const evaluationCount = await prisma.evaluation.count();

    // Agregação para calcular as médias de OEE
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

    // OEE é o produto das médias (em decimal)
    const overallOEE = (avgAvailability / 100) * (avgPerformance / 100) * (avgQuality / 100);

    res.status(200).json({
      userCount,
      evaluationCount,
      // Retorna a média em porcentagem, com duas casas decimais
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

    // Agrupa as avaliações por usuário
    const userEvals = evaluations.reduce((acc, eval) => {
      const userName = eval.user.name;
      if (!acc[userName]) {
        acc[userName] = [];
      }
      acc[userName].push(eval);
      return acc;
    }, {});

    // Calcula a média de OEE para cada usuário
    const dataForChart = Object.keys(userEvals).map(userName => {
      const evals = userEvals[userName];
      const avgAvailability = evals.reduce((sum, e) => sum + e.availability, 0) / evals.length;
      const avgPerformance = evals.reduce((sum, e) => sum + e.performance, 0) / evals.length;
      const avgQuality = evals.reduce((sum, e) => sum + e.quality, 0) / evals.length;
      
      const oee = (avgAvailability / 100) * (avgPerformance / 100) * (avgQuality / 100);

      return {
        name: userName, // Nome do usuário para o eixo X
        oee: parseFloat((oee * 100).toFixed(2)), // Valor para o eixo Y
      };
    });

    res.status(200).json(dataForChart);

  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar dados de OEE por usuário.', error: error.message });
  }
};


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
exports.deleteEvaluation = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.evaluation.delete({
      where: { id: id },
    });
    res.status(204).send(); // 204 No Content - sucesso, sem corpo de resposta
  } catch (error) {
    // P2025 é o código de erro do Prisma para "registro não encontrado"
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Avaliação não encontrada.' });
    }
    res.status(500).json({ message: 'Erro ao excluir avaliação.', error: error.message });
  }
};