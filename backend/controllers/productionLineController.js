// backend/controllers/productionLineController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Lista todas as linhas de produção cadastradas
exports.getAllLines = async (req, res) => {
    try {
        const lines = await prisma.productionLine.findMany({
            orderBy: { name: 'asc' }
        });
        res.status(200).json(lines);
    } catch (error) {
        res.status(500).json({ message: "Erro ao buscar linhas de produção." });
    }
};

// Obtém as linhas associadas a um usuário específico
exports.getLinesForUser = async (req, res) => {
    const { userId } = req.params;
    try {
        const userWithLines = await prisma.user.findUnique({
            where: { id: userId },
            include: { productionLines: true }
        });
        res.status(200).json(userWithLines.productionLines);
    } catch (error) {
        res.status(500).json({ message: "Erro ao buscar as linhas do usuário." });
    }
};

// Atualiza as linhas de produção de um usuário
exports.updateUserLines = async (req, res) => {
    const { userId } = req.params;
    const { lineIds } = req.body; // Espera um array de IDs das linhas

    try {
        // O método 'set' do Prisma é perfeito para substituir as associações existentes
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                productionLines: {
                    set: lineIds.map(id => ({ id: id }))
                }
            },
            include: { productionLines: true }
        });
        res.status(200).json(updatedUser.productionLines);
    } catch (error) {
        res.status(500).json({ message: "Erro ao atualizar as linhas do usuário." });
    }
};