// backend/services/productionDbService.js
const sql = require('mssql');

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  options: {
    encrypt: false,
    trustServerCertificate: true,
    requestTimeout: 30000
  }
};

// Função para criar e fechar a conexão de forma segura
async function getConnectedPool() {
  try {
    const pool = await sql.connect(config);
    return pool;
  } catch (err) {
    // Erro detalhado de conexão
    console.error("======================================================");
    console.error("FALHA CRÍTICA NA CONEXÃO COM O SQL SERVER:", err.message);
    console.error("Verifique as credenciais no arquivo .env, a conexão de rede (VPN, Firewall) e o status do servidor de banco de dados.");
    console.error("======================================================");
    // Lança o erro para que a função que chamou saiba que falhou
    throw new Error(`Falha na conexão com o SQL Server: ${err.message}`);
  }
}


// função testConnection
async function testConnection() {
  try {
    console.log("Tentando conectar ao SQL Server da fábrica...");
    let pool = await getConnectedPool();
    console.log("Conexão com o SQL Server da fábrica bem-sucedida!");
    await pool.close();
    return { success: true, message: 'Conexão bem-sucedida!' };
  } catch (err) {
    return { success: false, message: 'Falha na conexão.', error: err.message };
  }
}


// função getProductionSummary para testes
async function getProductionSummary() {
  try {
    let pool = await getConnectedPool();
    let result = await pool.request().query('SELECT TOP 100 * FROM vw_Resumo_prod_Montagem');
    await pool.close();
    
    console.log("Top 100 dados da produção buscados com sucesso!");
    return { success: true, data: result.recordset };

  } catch (err) {
    console.error("Erro ao buscar dados da produção:", err);
    return { success: false, message: 'Falha ao buscar dados da produção.', error: err.message };
  }
}

async function calculatePerformance(lineDescription, shiftId) {
    const viewName = 'vw_Resumo_prod_Montagem'; 
    let pool;
    try {
      pool = await getConnectedPool();
      const request = pool.request();
      
      request.input('line', sql.VarChar, lineDescription); 
      request.input('shift', sql.Int, shiftId);
  
      let result = await request.query(`
        SELECT TOP 1 TargProd, effectiveProd 
        FROM ${viewName}
        WHERE LineDesc = @line AND ShiftId = @shift
        ORDER BY EffectiveDate DESC
      `);
      
      if (result.recordset.length === 0) {
        console.warn(`Nenhum dado encontrado para a linha: ${lineDescription} e turno: ${shiftId}`);
        return { success: true, performance: 0 };
      }
  
      const data = result.recordset[0];
      const target = data.TargProd;
      const effective = data.effectiveProd;
  
      if (target === 0) {
        return { success: true, performance: 0 };
      }
  
      const performance = (effective / target) * 100;
      return { success: true, performance: parseFloat(performance.toFixed(2)) };
  
    } catch (err) {
      console.error(`Erro ao calcular performance para ${lineDescription}, Turno ${shiftId}:`, err.message);
      return { success: false, message: 'Falha ao calcular performance.', error: err.message };
    } finally {
        if (pool) {
            await pool.close();
        }
    }
  }

  async function calculateAvailability(lineDescription, shiftId) {
    const viewName = 'vw_Lista_Estados_Montagem'; 
    let pool;
    try {
      pool = await getConnectedPool();
      const request = pool.request();
      
      request.input('line', sql.VarChar, lineDescription); 
      request.input('shift', sql.Int, shiftId);
  
      let result = await request.query(`
        SELECT
          SUM(CASE WHEN StatusDesc IN (
            'Bypass', 'Mensagem de guia', 'Produção', 'Team Leader Alert',
            'degradado', 'impossivel carregar', 'impossivel descarregar'
          ) THEN duration ELSE 0 END) as productiveHours,
          
          SUM(CASE WHEN StatusDesc IN (
            'Falha/Parada', 'Falta carregamento', 'Falta descarregamento', 'Manual'
          ) THEN duration ELSE 0 END) as unproductiveHours
        FROM ${viewName}
        WHERE LineDesc = @line 
          AND ShiftId = @shift
          AND EffectiveDay = (
            SELECT MAX(EffectiveDay) FROM ${viewName} WHERE LineDesc = @line AND ShiftId = @shift
          )
      `);
      
      if (result.recordset.length === 0) {
        throw new Error('Nenhum dado de estados encontrado para a linha e turno especificados.');
      }
  
      const data = result.recordset[0];
      const productiveHours = data.productiveHours || 0;
      const unproductiveHours = data.unproductiveHours || 0;
      const totalTime = productiveHours + unproductiveHours;
  
      if (totalTime === 0) {
        return { success: true, availability: 0 };
      }
  
      const availability = (productiveHours / totalTime) * 100;
      return { success: true, availability: parseFloat(availability.toFixed(2)) };
  
    } catch (err) {
      console.error(`Erro ao calcular disponibilidade para ${lineDescription}, Turno ${shiftId}:`, err.message);
      return { success: false, message: 'Falha ao calcular disponibilidade.', error: err.message };
    } finally {
        if (pool) {
            await pool.close();
        }
    }
  }

async function calculateQuality(lineDescription, shiftId) {
  const viewName = 'vw_Lista_Estados_Montagem'; 
  let pool;
  try {
      pool = await getConnectedPool();
      const request = pool.request();
      
      request.input('line', sql.VarChar, lineDescription); 
      request.input('shift', sql.Int, shiftId);

      let result = await request.query(`
          SELECT
              SUM(CASE WHEN StatusDesc IN (
                  'Bypass', 'Mensagem de guia', 'Produção', 'Team Leader Alert',
                  'degradado', 'impossivel carregar', 'impossivel descarregar'
              ) THEN duration ELSE 0 END) as productiveHours,
              
              SUM(CASE WHEN StatusDesc IN (
                  'Anomalia de Qualidade'
              ) THEN duration ELSE 0 END) as qualityLossesTime
          FROM ${viewName}
          WHERE LineDesc = @line 
              AND ShiftId = @shift
              AND EffectiveDay = (
                  SELECT MAX(EffectiveDay) FROM ${viewName} WHERE LineDesc = @line AND ShiftId = @shift
              )
      `);

      if (result.recordset.length === 0) {
          throw new Error('Nenhum dado de estados encontrado para a linha e turno especificados.');
      }

      const data = result.recordset[0];
      const productiveTime = data.productiveHours || 0;
      const qualityLossTime = data.qualityLossesTime || 0;
      
      if (productiveTime === 0) {
          return { success: true, quality: 100 }; 
      }
      
      const quality = ((productiveTime - qualityLossTime) / productiveTime) * 100;
      return { success: true, quality: parseFloat(quality.toFixed(2)) }; 

  } catch (err) {
      console.error(`Erro ao calcular Qualidade para ${lineDescription}, Turno ${shiftId}:`, err.message);
      return { success: false, message: 'Falha ao calcular qualidade.', error: err.message };
  } finally {
      if (pool) {
          await pool.close();
      }
  }
}

module.exports = { testConnection, getProductionSummary, calculatePerformance, calculateAvailability, calculateQuality }