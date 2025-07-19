// backend/controllers/reportController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const ExcelJS = require('exceljs');

// Relatório: Contagem de avaliações ao longo do tempo
exports.getEvaluationsOverTime = async (req, res) => {
  try {
    const evaluations = await prisma.evaluation.findMany({
      orderBy: {
        createdAt: 'asc',
      },
      select: {
        createdAt: true,
      },
    });

    const countsByDate = evaluations.reduce((acc, eval) => {
      const date = new Date(eval.createdAt).toLocaleDateString('pt-BR');
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    const chartData = Object.keys(countsByDate).map(date => ({
      date,
      count: countsByDate[date],
    }));

    res.status(200).json(chartData);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao gerar relatório de avaliações.', error: error.message });
  }
};

// Exportar para Excel
exports.exportEvaluations = async (req, res) => {
  try {
    const evaluations = await prisma.evaluation.findMany({
      include: {
        user: { select: { name: true, email: true } },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Avaliações');

    worksheet.columns = [
      { header: 'ID Avaliação', key: 'id', width: 30 },
      { header: 'Data', key: 'createdAt', width: 15 },
      { header: 'Nome do Colaborador', key: 'userName', width: 30 },
      { header: 'Email', key: 'userEmail', width: 30 },
      { header: 'Qualidade (Nota)', key: 'serviceQuality_score', width: 15 },
      { header: 'Prazo (Nota)', key: 'executionTimeframe_score', width: 15 },
      { header: 'Iniciativa (Nota)', key: 'problemSolvingInitiative_score', width: 15 },
      { header: 'Equipe (Nota)', key: 'teamwork_score', width: 15 },
      { header: 'Comprometimento (Nota)', key: 'commitment_score', width: 20 },
      { header: 'Proatividade (Nota)', key: 'proactivity_score', width: 18 },
      { header: 'Disponibilidade (%)', key: 'availability', width: 20 },
      { header: 'Performance (%)', key: 'performance', width: 18 },
      { header: 'Qualidade (%)', key: 'quality', width: 15 },
    ];

    evaluations.forEach(eval => {
      worksheet.addRow({
        id: eval.id,
        createdAt: new Date(eval.createdAt).toLocaleDateString('pt-BR'),
        userName: eval.user.name,
        userEmail: eval.user.email,
        serviceQuality_score: eval.serviceQuality_score,
        executionTimeframe_score: eval.executionTimeframe_score,
        problemSolvingInitiative_score: eval.problemSolvingInitiative_score,
        teamwork_score: eval.teamwork_score,
        commitment_score: eval.commitment_score,
        proactivity_score: eval.proactivity_score,
        availability: eval.availability,
        performance: eval.performance,
        quality: eval.quality,
      });
    });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=' + 'Relatorio_Avaliacoes.xlsx'
    );

    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    res.status(500).json({ message: 'Erro ao exportar relatório.', error: error.message });
  }
};