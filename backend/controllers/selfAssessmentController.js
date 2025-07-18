// backend/controllers/selfAssessmentController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Criar ou atualizar uma autoavaliação
exports.createOrUpdateSelfAssessment = async (req, res) => {
  const { userId } = req.params;
  const { strengths, improvementPoints, professionalGoals } = req.body;

  try {
    // Tenta encontrar uma avaliação existente para o usuário
    const existingAssessment = await prisma.selfAssessment.findFirst({
      where: { userId: userId },
    });

    let assessment;
    if (existingAssessment) {
      // Se existir, atualiza
      assessment = await prisma.selfAssessment.update({
        where: { id: existingAssessment.id },
        data: { strengths, improvementPoints, professionalGoals },
      });
    } else {
      // Se não, cria uma nova
      assessment = await prisma.selfAssessment.create({
        data: { userId, strengths, improvementPoints, professionalGoals },
      });
    }
    res.status(200).json(assessment);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao salvar autoavaliação.', error: error.message });
  }
};

// Buscar a autoavaliação de um usuário
exports.getSelfAssessment = async (req, res) => {
  const { userId } = req.params;
  try {
    const assessment = await prisma.selfAssessment.findFirst({
      where: { userId: userId },
    });
    res.status(200).json(assessment); // Retorna a avaliação ou null se não existir
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar autoavaliação.' });
  }
};