const sql = require('mssql');
require('dotenv').config();

const dbConfig = {
    user: process.env.PROD_DB_USER,
    password: process.env.PROD_DB_PASSWORD,
    server: process.env.PROD_DB_SERVER,
    database: process.env.PROD_DB_DATABASE,
    options: {
        encrypt: process.env.PROD_DB_ENCRYPT === 'true',
        trustServerCertificate: process.env.PROD_DB_TRUST_SERVER_CERTIFICATE === 'true'
    }
};

let poolPromise = null;

const getConnectedPool = () => {
    if (poolPromise) return poolPromise;
    poolPromise = new sql.ConnectionPool(dbConfig)
        .connect()
        .then(pool => {
            console.log('✅ Ligado com sucesso à Base de Dados de Produção (MSSQL)');
            return pool;
        })
        .catch(err => {
            console.error('❌ Falha na ligação à Base de Dados de Produção:', err.message);
            poolPromise = null; // Permite tentar novamente
            throw err;
        });
    return poolPromise;
};

const testConnection = async () => {
    try {
        await getConnectedPool();
        return { success: true, message: 'Ligação à base de dados de produção bem-sucedida.' };
    } catch (err) {
        return { success: false, message: 'Falha ao ligar à base de dados de produção.', error: err.message };
    }
};

const calculateEfficiency = async (lineDescription, shiftId) => {
    const viewName = 'vw_Resumo_prod_Montagem';
    try {
        const pool = await getConnectedPool();
        const request = pool.request();
        
        request.input('line', sql.VarChar, lineDescription);
        request.input('shift', sql.Int, shiftId);

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
            console.warn(`⚠️  Nenhum dado de produção encontrado para Linha: ${lineDescription}, Turno: ${shiftId}`);
            return { success: true, efficiency: 0 };
        }

        const data = result.recordset[0];
        const target = data.TargProd;
        const effective = data.effectiveProd;

        if (target === 0) return { success: true, efficiency: 0 };

        const efficiency = (effective / target) * 100;
        return { success: true, efficiency: parseFloat(efficiency.toFixed(2)) };

    } catch (err) {
        console.error(`❌ Erro ao calcular eficiência para ${lineDescription}, Turno ${shiftId}:`, err.message);
        throw err; // Lança o erro para que o schedulerService saiba que falhou
    }
};

module.exports = {
    calculateEfficiency,
    testConnection
};