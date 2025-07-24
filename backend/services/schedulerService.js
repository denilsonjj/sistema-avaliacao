const cron = require('node-cron');
const { PrismaClient } = require('@prisma/client');
const { calculatePerformance, calculateAvailability, calculateQuality } = require('./productionDbService');

const prisma = new PrismaClient();
const shiftMap = { 1: 2, 2: 3, 3: 1 };

const updateOeeData = async () => {
    console.log('--- Iniciando tarefa agendada: Atualização de dados de OEE ---');
    
    const allLines = await prisma.productionLine.findMany();
    if (allLines.length === 0) {
        console.log('Nenhuma linha de produção encontrada para processar.');
        return;
    }

    const newOeeResults = [];
    let hasFailed = false;

    // 1. Limpa a tabela de staging
    await prisma.stagingOeeResult.deleteMany({});
    console.log('Tabela de staging limpa.');

    // 2. Calcula os novos dados e armazena em memória
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

                newOeeResults.push({
                    date: today,
                    lineDesc,
                    shift,
                    availability,
                    performance,
                    quality,
                    oee: parseFloat((oee * 100).toFixed(2)),
                });
            } catch (error) {
                console.error(`!!! FALHA CRÍTICA ao processar dados para ${lineDesc} - Turno ${shift}:`, error.message);
                hasFailed = true; // Marca que houve uma falha
                break; // Interrompe o processamento para esta linha
            }
        }
        if (hasFailed) break; // Interrompe o loop principal se uma linha falhou
    }

    // 3. Se todos os dados foram calculados com sucesso, atualiza a tabela principal
    if (!hasFailed && newOeeResults.length > 0) {
        try {
            console.log(`Todos os ${newOeeResults.length} registros foram calculados. Iniciando transação...`);
            
            // Salva primeiro na tabela de staging
            await prisma.stagingOeeResult.createMany({
                data: newOeeResults
            });

            // Inicia a transação atômica para atualizar a tabela principal
            await prisma.$transaction(async (tx) => {
                await tx.dailyOeeResult.deleteMany({}); // Limpa a tabela principal
                const stagingData = await tx.stagingOeeResult.findMany(); // Lê da staging
                await tx.dailyOeeResult.createMany({ data: stagingData }); // Copia para a principal
            });

            console.log('*** SUCESSO: Tabela DailyOeeResult foi atualizada atomicamente. ***');
        } catch (transactionError) {
            console.error('!!! ERRO na transação do banco de dados:', transactionError);
        }
    } else if (hasFailed) {
        console.log('--- Tarefa agendada abortada devido a erros. A tabela principal não foi alterada. ---');
    } else {
        console.log('Nenhum novo dado de OEE para atualizar.');
    }

    console.log('--- Tarefa agendada finalizada ---');
};

const startScheduler = () => {
    cron.schedule('35 9 * * *', updateOeeData, {
        scheduled: true,
        timezone: "America/Sao_Paulo"
    });
    console.log('Agendador de tarefas iniciado. A tarefa rodará todos os dias às 09:35.');
};

module.exports = { startScheduler };