const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getProductionLines = async (req, res) => {
    try {
        const lines = await prisma.productionLine.findMany({ orderBy: { name: 'asc' } });
        res.status(200).json(lines);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar linhas de produção.' });
    }
};

const assignUserToLines = async (req, res) => {
    const { userId, lineIds } = req.body;
    try {
        const user = await prisma.user.update({
            where: { id: userId },
            data: {
                productionLines: {
                    set: lineIds.map(id => ({ id })),
                },
            },
        });
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao associar utilizador a linhas.' });
    }
};

module.exports = { getProductionLines, assignUserToLines };