const { PrismaClient } = require('@prisma/client');
const ExcelJS = require('exceljs');
const prisma = new PrismaClient();

const getOeeOverviewForAllLines = async (req, res) => {
    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const results = await prisma.dailyOeeResult.findMany({
            where: { date: { gte: thirtyDaysAgo } },
            orderBy: { date: 'desc' },
        });
        if (!results || results.length === 0) return res.status(200).json([]);

        const overviewByLine = results.reduce((acc, curr) => {
            if (!acc[curr.lineDesc]) {
                acc[curr.lineDesc] = { count: 0, totalEfficiency: 0 };
            }
            acc[curr.lineDesc].count++;
            acc[curr.lineDesc].totalEfficiency += curr.oee;
            return acc;
        }, {});

        const formattedResults = Object.keys(overviewByLine).map(lineName => {
            const data = overviewByLine[lineName];
            const avgEfficiency = data.count > 0 ? data.totalEfficiency / data.count : 0;
            return {
                name: lineName,
                Eficiencia: parseFloat(avgEfficiency.toFixed(2)),
            };
        }).sort((a, b) => a.name.localeCompare(b.name));

        res.status(200).json(formattedResults);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar overview de eficiência.' });
    }
};

const getOeeDataForUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const userWithLines = await prisma.user.findUnique({
            where: { id: userId },
            include: { productionLines: true },
        });
        if (!userWithLines || userWithLines.productionLines.length === 0) {
            return res.status(200).json([]);
        }
        const lineNames = userWithLines.productionLines.map(line => line.name);
        const oeeResults = await prisma.dailyOeeResult.findMany({
            where: { lineDesc: { in: lineNames }, date: { gte: thirtyDaysAgo } },
            orderBy: { date: 'desc' },
        });
        res.status(200).json(oeeResults);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar dados de eficiência do utilizador.' });
    }
};

const exportOeeOverview = async (req, res) => {
    try {
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
        const results = await prisma.dailyOeeResult.findMany({
            where: { date: { gte: ninetyDaysAgo } },
            orderBy: [{ date: 'desc' }, { lineDesc: 'asc' }, { shift: 'asc' }],
        });
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Eficiencia_Planta');
        worksheet.columns = [
            { header: 'Data', key: 'date', width: 15 },
            { header: 'Linha', key: 'name', width: 30 },
            { header: 'Turno', key: 'shift', width: 10 },
            { header: 'Eficiência (%)', key: 'oee', width: 20, style: { numFmt: '0.00"%"' } },
        ];
        results.forEach(line => {
            worksheet.addRow({ date: new Date(line.date), name: line.lineDesc, shift: line.shift, oee: line.oee });
        });
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=Relatorio_Eficiencia.xlsx');
        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        res.status(500).json({ message: 'Erro ao exportar relatório de eficiência.' });
    }
};

module.exports = { getOeeOverviewForAllLines, getOeeDataForUser, exportOeeOverview };