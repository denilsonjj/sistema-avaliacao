// backend/controllers/goalController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Criar nova meta
exports.createGoal = async (req, res) => {
  const { userId, title, description, dueDate } = req.body;
  const authorId = req.user.userId; // Autor é quem está logado

  try {
    const goal = await prisma.goal.create({
      data: { userId, authorId, title, description, dueDate },
    });
    res.status(201).json(goal);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao criar meta.' });
  }
};

// Buscar metas de um usuário
exports.getGoalsForUser = async (req, res) => {
  const { userId } = req.params;
  try {
    const goals = await prisma.goal.findMany({
      where: { userId: userId },
      orderBy: { createdAt: 'desc' },
      include: { author: { select: { name: true } } },
    });
    res.status(200).json(goals);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar metas.' });
  }
};

// Atualizar status de uma meta
exports.updateGoalStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body; // PENDENTE, EM_ANDAMENTO, CONCLUIDA
    try {
        const updatedGoal = await prisma.goal.update({
            where: { id },
            data: { status },
        });
        res.status(200).json(updatedGoal);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao atualizar status da meta.' });
    }
};