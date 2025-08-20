const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const upsertSelfAssessment = async (req, res) => {
    const userId = req.user.id;
    const { answers } = req.body;
    if (!answers || typeof answers !== 'object') {
        return res.status(400).json({ message: 'As respostas são obrigatórias.' });
    }
    try {
        const selfAssessment = await prisma.selfAssessment.upsert({
            where: { userId },
            update: { answers },
            create: { userId, answers },
        });
        res.status(200).json(selfAssessment);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao salvar autoavaliação.' });
    }
};

const getSelfAssessment = async (req, res) => {
    try {
        const targetUserId = req.params.userId || req.user.id;
        const selfAssessment = await prisma.selfAssessment.findUnique({ where: { userId: targetUserId } });
        if (!selfAssessment) {
            return res.status(404).json({ message: 'Nenhuma autoavaliação encontrada.' });
        }
        res.status(200).json(selfAssessment);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar autoavaliação.' });
    }
};

module.exports = { upsertSelfAssessment, getSelfAssessment };