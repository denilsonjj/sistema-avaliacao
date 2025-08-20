const cron = require('node-cron');
const { PrismaClient } = require('@prisma/client');
const { calculateEfficiency } = require('./productionDbService');

const prisma = new PrismaClient();
const shiftMap = { 1: 2, 2: 3, 3: 1 };

const updateOeeData = async () => {
    console.log('--- Iniciando tarefa agendada: Atualização de dados de EFICIÊNCIA ---');
    
    const allLines = await prisma.productionLine.findMany();
    if (allLines.length === 0) {
        console.log('Nenhuma linha de produção encontrada para processar.');
        return;
    }

    const newEfficiencyResults = [];
    let hasFailed = false;

    await prisma.stagingOeeResult.deleteMany({});
    console.log('Tabela de staging limpa.');

    for (const line of allLines) {
        for (const shift of [1, 2, 3]) {
            const lineDesc = line.name;
            const shiftId = shiftMap[shift];
            try {
                const efficiencyResult = await calculateEfficiency(lineDesc, shiftId);
                const efficiency = efficiencyResult.efficiency || 0;

                const today = new Date();
                today.setHours(0, 0, 0, 0);

                newEfficiencyResults.push({
                    date: today,
                    lineDesc,
                    shift,
                    // Preenchemos os campos para manter a estrutura do BD
                    availability: 100, // Valor fixo
                    performance: efficiency, // Eficiência vai aqui
                    quality: 100, // Valor fixo
                    oee: efficiency, // E a eficiência final também vai aqui
                });
            } catch (error) {
                console.error(`!!! FALHA CRÍTICA ao processar dados para ${lineDesc} - Turno ${shift}:`, error.message);
                hasFailed = true;
                break;
            }
        }
        if (hasFailed) break;
    }

    if (!hasFailed && newEfficiencyResults.length > 0) {
        try {
            console.log(`Todos os ${newEfficiencyResults.length} registros foram calculados. Iniciando transação...`);
            
            await prisma.stagingOeeResult.createMany({
                data: newEfficiencyResults
            });

            await prisma.$transaction(async (tx) => {
                await tx.dailyOeeResult.deleteMany({});
                const stagingData = await tx.stagingOeeResult.findMany();
                await tx.dailyOeeResult.createMany({ data: stagingData }); 
            });

            console.log('*** SUCESSO: Tabela DailyOeeResult foi atualizada atomicamente. ***');
        } catch (transactionError) {
            console.error('!!! ERRO na transação do banco de dados:', transactionError);
        }
    } else if (hasFailed) {
        console.log('--- Tarefa agendada abortada devido a erros. A tabela principal não foi alterada. ---');
    } else {
        console.log('Nenhum novo dado de eficiência para atualizar.');
    }

    console.log('--- Tarefa agendada finalizada ---');
};

const startScheduler = () => {
    // Roda todo dia às 09:35
    cron.schedule('35 9 * * *', updateOeeData, {
        scheduled: true,
        timezone: "America/Sao_Paulo"
    });
    // Executa uma vez ao iniciar para testes
    setTimeout(updateOeeData, 2000); 
    console.log('Agendador de tarefas iniciado. A tarefa rodará todos os dias às 09:35.');
};

module.exports = { startScheduler };