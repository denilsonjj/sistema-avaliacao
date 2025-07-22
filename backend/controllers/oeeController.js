// backend/controllers/oeeController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Busca os dados de OEE pré-calculados para um usuário específico
exports.getOeeForUser = async (req, res) => {
    const { userId } = req.params;
    try {
        console.log(`\n--- BUSCANDO OEE PARA USUÁRIO: ${userId} ---`); // LOG 1

        const userWithLines = await prisma.user.findUnique({
            where: { id: userId },
            include: { productionLines: true },
        });

        if (!userWithLines || userWithLines.productionLines.length === 0) {
            console.log("Usuário não encontrado ou não possui linhas associadas."); // LOG 2
            return res.status(200).json([]);
        }

        const lineNames = userWithLines.productionLines.map(line => line.name);
        console.log("Linhas associadas encontradas:", lineNames); // LOG 3

        const latestDateEntry = await prisma.dailyOeeResult.findFirst({
            orderBy: { date: 'desc' }
        });

        if (!latestDateEntry) {
            console.log("Nenhum dado de OEE pré-calculado encontrado na tabela DailyOeeResult.");
            return res.status(200).json([]);
        }

        const oeeResults = await prisma.dailyOeeResult.findMany({
            where: {
                lineDesc: { in: lineNames },
                date: { equals: latestDateEntry.date }
            }
        });
        
        console.log("Resultados de OEE encontrados:", oeeResults); // LOG 4

        res.status(200).json(oeeResults);
    } catch (error) {
        console.error("Erro detalhado no controller de OEE:", error);
        res.status(500).json({ message: 'Erro ao buscar dados de OEE para o usuário.' });
    }
};