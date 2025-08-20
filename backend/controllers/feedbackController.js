const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createFeedback = async (req, res) => {
    const { recipientId, content, isAnonymous } = req.body;
    const authorId = req.user.id;
    try {
        const feedback = await prisma.feedback.create({
            data: { content, isAnonymous, authorId, recipientId },
        });
        res.status(201).json(feedback);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao criar feedback.' });
    }
};

const getReceivedFeedback = async (req, res) => {
    const recipientId = req.user.id;
    try {
        const feedbacks = await prisma.feedback.findMany({
            where: { recipientId },
            include: { author: { select: { id: true, name: true } } },
            orderBy: { createdAt: 'desc' },
        });
        const processedFeedbacks = feedbacks.map(fb => {
            if (fb.isAnonymous) {
                return { ...fb, author: { id: null, name: 'Anónimo' } };
            }
            return fb;
        });
        res.status(200).json(processedFeedbacks);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar feedbacks recebidos.' });
    }
};

module.exports = { createFeedback, getReceivedFeedback };