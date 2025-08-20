const sql = require('mssql');
require('dotenv').config();

// Configuração da conexão com o banco de dados de produção (MS SQL Server)
// As credenciais são lidas do arquivo .env
const dbConfig = {
    user: process.env.PROD_DB_USER,
    password: process.env.PROD_DB_PASSWORD,
    server: process.env.PROD_DB_SERVER,
    database: process.env.PROD_DB_DATABASE,
    options: {
        encrypt: process.env.PROD_DB_ENCRYPT === 'true', // Use true para Azure SQL Database, false para instâncias locais
        trustServerCertificate: process.env.PROD_DB_TRUST_SERVER_CERTIFICATE === 'true' // Altere para true para desenvolvimento local
    }
};

// Mantém um pool de conexões para reutilização e melhor performance
let poolPromise = null;

async function getConnectedPool() {
    if (poolPromise) {
        return poolPromise;
    }
    poolPromise = new sql.ConnectionPool(dbConfig)
        .connect()
        .then(pool => {
            console.log('Conectado ao Banco de Dados de Produção (MSSQL)');
            return pool;
        })
        .catch(err => {
            console.error('Falha na conexão com o Banco de Dados de Produção:', err);
            poolPromise = null; // Reseta a promise em caso de erro para permitir nova tentativa
            throw err;
        });
    return poolPromise;
}

/**
 * Testa a conexão com o banco de dados de produção.
 */
async function testConnection() {
    try {
        const pool = await getConnectedPool();
        // A conexão bem-sucedida já é um teste.
        return { success: true, message: 'Conexão com o banco de dados de produção bem-sucedida.' };
    } catch (err) {
        return { success: false, message: 'Falha ao conectar com o banco de dados de produção.', error: err.message };
    }
}

/**
 * Calcula a EFICIÊNCIA para uma linha e turno específicos.
 * Esta é a única métrica de produção que será calculada.
 */
async function calculateEfficiency(lineDescription, shiftId) {
    const viewName = 'vw_Resumo_prod_Montagem'; // Nome da sua view ou tabela
    let pool;
    try {
        pool = await getConnectedPool();
        const request = pool.request();
      
        request.input('line', sql.VarChar, lineDescription); 
        request.input('shift', sql.Int, shiftId);
  
        // Esta é a sua nova consulta para buscar produção alvo e efetiva
        const result = await request.query(`
            SELECT TOP 1 TargProd, effectiveProd 
            FROM ${viewName}
            WHERE 
                LineDesc = @line AND 
                ShiftId = @shift AND
                (LineDesc IN ('CHASSIS 4', 'CHASSIS1', 'CHASSIS2', 'CHASSIS3', 'CHASSIS5', 'DECKING DOWN', 'DECKING UP', 'FINAL1', 'FINAL2', 'GLAZING', 'GOMA', 'GOMP', 'TRIM 0', 'TRIM 1', 'TRIM 2')) AND
                (EffectiveDate NOT IN ('2025-02-28', '2025-03-01', '2025-03-02', '2025-03-03', '2025-03-04', '2025-03-05', '2025-03-06', '2025-03-07', '2025-03-08', '2025-03-09', '2025-03-10', '2025-05-01')) AND
                (EffectiveProd NOT IN (0, 1, 2, 3, 4, 5, 6, 7, 8, 9))
            ORDER BY EffectiveDate DESC
        `);
      
        if (result.recordset.length === 0) {
            console.warn(`Nenhum dado de produção encontrado para Linha: ${lineDescription}, Turno: ${shiftId}`);
            return { success: true, efficiency: 0 };
        }
  
        const data = result.recordset[0];
        const target = data.TargProd;
        const effective = data.effectiveProd;
  
        // Evita divisão por zero se a meta for 0
        if (target === 0) {
            return { success: true, efficiency: 0 };
        }
  
        const efficiency = (effective / target) * 100;
        return { success: true, efficiency: parseFloat(efficiency.toFixed(2)) };
  
    } catch (err) {
        console.error(`Erro ao calcular eficiência para ${lineDescription}, Turno ${shiftId}:`, err.message);
        return { success: false, message: 'Falha ao calcular eficiência.', error: err.message };
    }
    // A gestão do pool é feita pela promise, não fechamos a conexão aqui para que possa ser reutilizada
}


// As funções calculateAvailability e calculateQuality foram removidas.

module.exports = { 
    testConnection, 
    calculateEfficiency // Exporta apenas as funções necessárias
};