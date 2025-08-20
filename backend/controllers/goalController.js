const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createGoal = async (req, res) => {
    const { userId, title, description, status } = req.body;
    try {
        const goal = await prisma.goal.create({ data: { userId, title, description, status } });
        res.status(201).json(goal);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao criar meta.' });
    }
};

const getGoalsByUserId = async (req, res) => {
    try {
        const { userId } = req.params;
        const goals = await prisma.goal.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
        res.status(200).json(goals);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar metas.' });
    }
};

const updateGoalStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const goal = await prisma.goal.update({ where: { id }, data: { status } });
        res.status(200).json(goal);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao atualizar meta.' });
    }
};

module.exports = { createGoal, getGoalsByUserId, updateGoalStatus };