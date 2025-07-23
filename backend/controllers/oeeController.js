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

exports.getOeeOverviewForAllLines = async (req, res) => {
    try {
        console.log(`\n--- BUSCANDO OVERVIEW DE OEE PARA TODAS AS LINHAS ---`);

        const latestDateEntry = await prisma.dailyOeeResult.findFirst({
            orderBy: { date: 'desc' }
        });

        if (!latestDateEntry) {
            console.log("Nenhum dado de OEE pré-calculado encontrado.");
            return res.status(200).json([]);
        }

        const latestDate = latestDateEntry.date;
        console.log(`Dados mais recentes encontrados para a data: ${latestDate.toISOString()}`);

        const results = await prisma.dailyOeeResult.findMany({
            where: { date: { equals: latestDate } }
        });

        // Agrupar e calcular a média dos indicadores por linha
        const overviewByLine = results.reduce((acc, curr) => {
            if (!acc[curr.lineDesc]) {
                acc[curr.lineDesc] = {
                    count: 0,
                    availability: 0,
                    performance: 0,
                    quality: 0,
                };
            }
            acc[curr.lineDesc].count++;
            acc[curr.lineDesc].availability += curr.availability;
            acc[curr.lineDesc].performance += curr.performance;
            acc[curr.lineDesc].quality += curr.quality;
            return acc;
        }, {});

        const formattedResults = Object.keys(overviewByLine).map(lineName => {
            const data = overviewByLine[lineName];
            const avgAvailability = data.availability / data.count;
            const avgPerformance = data.performance / data.count;
            const avgQuality = data.quality / data.count;
            const oee = (avgAvailability / 100) * (avgPerformance / 100) * (avgQuality / 100);

            return {
                name: lineName,
                // Mantém os componentes para o gráfico agrupado
                Disponibilidade: parseFloat(avgAvailability.toFixed(2)),
                Performance: parseFloat(avgPerformance.toFixed(2)),
                Qualidade: parseFloat(avgQuality.toFixed(2)),
                // OEE calculado para referência
                oee: parseFloat((oee * 100).toFixed(2)),
            };
        }).sort((a, b) => a.name.localeCompare(b.name)); // Ordena por nome da linha

        console.log("Overview de OEE por linha gerado:", formattedResults);
        res.status(200).json(formattedResults);

    } catch (error) {
        console.error("Erro detalhado no controller de OEE (Overview):", error);
        res.status(500).json({ message: 'Erro ao buscar overview de OEE.' });
    }
};