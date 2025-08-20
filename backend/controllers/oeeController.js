const { PrismaClient } = require('@prisma/client');
const ExcelJS = require('exceljs');

const prisma = new PrismaClient();
exports.getOeeOverviewForAllLines = async (req, res) => {
    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        thirtyDaysAgo.setHours(0, 0, 0, 0);

        const results = await prisma.dailyOeeResult.findMany({
            where: {
                date: {
                    gte: thirtyDaysAgo,
                },
            },
            orderBy: {
                date: 'desc',
            },
        });

        if (!results || results.length === 0) {
            return res.status(200).json([]);
        }

        // Agrupa os resultados por linha e calcula a média de eficiência
        const overviewByLine = results.reduce((acc, curr) => {
            if (!acc[curr.lineDesc]) {
                acc[curr.lineDesc] = { count: 0, totalEfficiency: 0 };
            }
            acc[curr.lineDesc].count++;
            // O campo 'oee' agora armazena nossa Eficiência
            acc[curr.lineDesc].totalEfficiency += curr.oee;
            return acc;
        }, {});

        // Formata o resultado para o frontend
        const formattedResults = Object.keys(overviewByLine).map(lineName => {
            const data = overviewByLine[lineName];
            const avgEfficiency = data.count > 0 ? data.totalEfficiency / data.count : 0;

            return {
                name: lineName,
                // A única métrica que o frontend precisa é a Eficiência
                Eficiencia: parseFloat(avgEfficiency.toFixed(2)),
            };
        }).sort((a, b) => a.name.localeCompare(b.name));

        res.status(200).json(formattedResults);

    } catch (error) {
        console.error("Erro ao buscar overview de eficiência:", error);
        res.status(500).json({ message: 'Erro ao buscar overview de eficiência.', error: error.message });
    }
};

/**
 * Busca os dados de EFICIÊNCIA para um usuário específico, com base em suas linhas associadas.
 * Usado para o dashboard do Técnico e para preencher dados na tela de avaliação.
 */
exports.getOeeDataForUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const userWithLines = await prisma.user.findUnique({
            where: { id: parseInt(userId, 10) },
            include: { productionLines: true },
        });

        if (!userWithLines || userWithLines.productionLines.length === 0) {
            return res.status(200).json([]);
        }

        const lineNames = userWithLines.productionLines.map(line => line.name);

        const oeeResults = await prisma.dailyOeeResult.findMany({
            where: {
                lineDesc: {
                    in: lineNames,
                },
                date: {
                    gte: thirtyDaysAgo,
                },
            },
            orderBy: {
                date: 'desc',
            },
        });

        res.status(200).json(oeeResults);
    } catch (error) {
        console.error(`Erro ao buscar dados de eficiência para o usuário ${req.params.userId}:`, error);
        res.status(500).json({ message: 'Erro ao buscar dados de eficiência do usuário.', error: error.message });
    }
};


/**
 * Exporta um relatório detalhado de EFICIÊNCIA para um arquivo Excel.
 */
exports.exportOeeOverview = async (req, res) => {
  try {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const results = await prisma.dailyOeeResult.findMany({
        where: {
            date: {
                gte: ninetyDaysAgo,
            },
        },
        orderBy: [{ date: 'desc' }, { lineDesc: 'asc' }, { shift: 'asc' }],
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Eficiencia_Planta_Detalhado');

    worksheet.columns = [
      { header: 'Data', key: 'date', width: 15 },
      { header: 'Linha de Produção', key: 'name', width: 30 },
      { header: 'Turno', key: 'shift', width: 10 },
      { header: 'Eficiência (%)', key: 'oee', width: 20, style: { numFmt: '0.00"%"' } },
    ];
    
    // Estilo do cabeçalho
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFD3D3D3' }
    };
    worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };


    results.forEach(line => {
      worksheet.addRow({
          date: new Date(line.date),
          name: line.lineDesc,
          shift: line.shift,
          oee: line.oee, // O campo 'oee' agora contém a eficiência
      });
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=Relatorio_Eficiencia_Planta_Detalhado.xlsx');

    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error("Erro ao exportar relatório de eficiência:", error);
    res.status(500).json({ message: 'Erro ao exportar relatório de eficiência.', error: error.message });
  }
};