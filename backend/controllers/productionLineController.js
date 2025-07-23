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

exports.getUsersForLine = async (req, res) => {
    // Decodifica o nome da linha que vem da URL (ex: "TRIM%201" vira "TRIM 1")
    const { lineName } = req.params;
    const decodedLineName = decodeURIComponent(lineName);

    try {
        const lineWithUsers = await prisma.productionLine.findUnique({
            where: { name: decodedLineName },
            include: {
                users: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true
                    },
                    orderBy: {
                        name: 'asc'
                    }
                }
            }
        });

        if (!lineWithUsers) {
            return res.status(404).json({ message: "Linha de produção não encontrada." });
        }

        res.status(200).json(lineWithUsers.users);
    } catch (error) {
        res.status(500).json({ message: "Erro ao buscar usuários da linha de produção.", error: error.message });
    }
};