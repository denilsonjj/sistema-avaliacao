const { PrismaClient } = require('@prisma/client');
const ExcelJS = require('exceljs');
const prisma = new PrismaClient();

const exportReport = async (req, res) => {
    const { type } = req.params;
    try {
        const workbook = new ExcelJS.Workbook();
        if (type === 'evaluations') {
            const evaluations = await prisma.evaluation.findMany({
                include: { user: { select: { name: true, email: true } } },
                orderBy: { createdAt: 'desc' },
            });
            const worksheet = workbook.addWorksheet('Avaliações');
            worksheet.columns = [
                { header: 'Data', key: 'createdAt', width: 20 },
                { header: 'Nome', key: 'userName', width: 30 },
                { header: 'Email', key: 'userEmail', width: 30 },
                { header: 'Eficiência (%)', key: 'efficiency', width: 15 },
                { header: 'Qualidade Serviço', key: 'serviceQuality_score', width: 20 },
                { header: 'Prazo Execução', key: 'executionTimeframe_score', width: 20 },
                { header: 'Iniciativa', key: 'problemSolvingInitiative_score', width: 15 },
                { header: 'Equipa', key: 'teamwork_score', width: 15 },
                { header: 'Compromisso', key: 'commitment_score', width: 15 },
                { header: 'Proatividade', key: 'proactivity_score', width: 15 },
            ];
            evaluations.forEach(ev => worksheet.addRow({ ...ev, userName: ev.user.name, userEmail: ev.user.email }));
            res.setHeader('Content-Disposition', `attachment; filename=Relatorio_Avaliacoes.xlsx`);
        } else if (type === 'users') {
            const users = await prisma.user.findMany({ select: { name: true, email: true, role: true } });
            const worksheet = workbook.addWorksheet('Utilizadores');
            worksheet.columns = [
                { header: 'Nome', key: 'name', width: 30 },
                { header: 'Email', key: 'email', width: 30 },
                { header: 'Perfil', key: 'role', width: 15 },
            ];
            worksheet.addRows(users);
            res.setHeader('Content-Disposition', `attachment; filename=Relatorio_Utilizadores.xlsx`);
        } else {
            return res.status(400).json({ message: 'Tipo de relatório inválido.' });
        }
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        res.status(500).json({ message: `Erro ao exportar relatório de ${type}.` });
    }
};

module.exports = { exportReport };