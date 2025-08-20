const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createEvaluation = async (req, res) => {
    const { userId, ...evaluationData } = req.body;
    if (!userId) return res.status(400).json({ message: "O ID do utilizador é obrigatório." });
    try {
        const numericData = {
            serviceQuality_score: parseInt(evaluationData.serviceQuality_score, 10),
            executionTimeframe_score: parseInt(evaluationData.executionTimeframe_score, 10),
            problemSolvingInitiative_score: parseInt(evaluationData.problemSolvingInitiative_score, 10),
            teamwork_score: parseInt(evaluationData.teamwork_score, 10),
            commitment_score: parseInt(evaluationData.commitment_score, 10),
            proactivity_score: parseInt(evaluationData.proactivity_score, 10),
            efficiency: parseFloat(evaluationData.efficiency)
        };
        const newEvaluation = await prisma.evaluation.create({
            data: {
                userId,
                technicalKnowledge_notes: evaluationData.technicalKnowledge_notes,
                certifications_notes: evaluationData.certifications_notes,
                experienceTime_notes: evaluationData.experienceTime_notes,
                ...numericData
            },
        });
        res.status(201).json(newEvaluation);
    } catch (error) {
        res.status(500).json({ message: 'Erro no servidor ao criar avaliação.' });
    }
};

const getAllEvaluations = async (req, res) => {
    try {
        const evaluations = await prisma.evaluation.findMany({
            include: { user: { select: { name: true } } },
            orderBy: { createdAt: 'desc' },
        });
        res.status(200).json(evaluations);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar avaliações.' });
    }
};

const getEvaluationsByUserId = async (req, res) => {
    try {
        const { userId } = req.params;
        const evaluations = await prisma.evaluation.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
        res.status(200).json(evaluations);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar avaliações do utilizador.' });
    }
};

module.exports = { createEvaluation, getAllEvaluations, getEvaluationsByUserId };