// backend/services/schedulerService.js
const cron = require('node-cron');
const { PrismaClient } = require('@prisma/client');
const { calculatePerformance, calculateAvailability, calculateQuality } = require('./productionDbService'); // Importe a nova função

const prisma = new PrismaClient();
const shiftMap = { 1: 2, 2: 3, 3: 1 };

const updateOeeData = async () => {
    console.log('--- Iniciando tarefa agendada: Atualização de dados de OEE ---');
    const allLines = await prisma.productionLine.findMany();
    if (allLines.length === 0) {
        console.log('Nenhuma linha de produção encontrada para processar.');
        return;
    }

    for (const line of allLines) {
        for (const shift of [1, 2, 3]) {
            const lineDesc = line.name;
            const shiftId = shiftMap[shift];
            try {
                
                const performanceResult = await calculatePerformance(lineDesc, shiftId);
                const availabilityResult = await calculateAvailability(lineDesc, shiftId);
                const qualityResult = await calculateQuality(lineDesc, shiftId); 

                const availability = availabilityResult.availability || 0;
                const performance = performanceResult.performance || 0;
                const quality = qualityResult.quality || 0; 

                const oee = (availability / 100) * (performance / 100) * (quality / 100);

                const today = new Date();
                today.setHours(0, 0, 0, 0);

                await prisma.dailyOeeResult.upsert({
                    where: { date_lineDesc_shift: { date: today, lineDesc, shift } },
                    update: { availability, performance, quality, oee: parseFloat((oee * 100).toFixed(2)) },
                    create: { date: today, lineDesc, shift, availability, performance, quality, oee: parseFloat((oee * 100).toFixed(2)) },
                });
                console.log(`Dados para ${lineDesc} - Turno ${shift} atualizados com sucesso.`);
            } catch (error) {
                console.error(`Falha ao processar dados para ${lineDesc} - Turno ${shift}:`, error.message);
            }
        }
    }
    console.log('--- Tarefa agendada finalizada ---');
};

const startScheduler = () => {
    cron.schedule('0 9 * * *', updateOeeData, {
        scheduled: true,
        timezone: "America/Sao_Paulo"
    });
    console.log('Agendador de tarefas iniciado. A tarefa rodará todos os dias às 09:00.');

    // Roda a tarefa uma vez ao iniciar para testes
   // console.log('A tarefa de atualização de OEE será executada em 10 segundos...');
  //  setTimeout(updateOeeData, 10000); 
};

module.exports = { startScheduler };