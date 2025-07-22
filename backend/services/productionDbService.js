const { request } = require('express');
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

// função testConnection 
async function testConnection() {
  try {
    console.log("Tentando conectar ao SQL Server da fábrica...");
    let pool = await sql.connect(config);
    console.log("Conexão com o SQL Server da fábrica bem-sucedida!");
    await pool.close();
    return { success: true, message: 'Conexão bem-sucedida!' };
  } catch (err) {
    console.error("Erro ao conectar com o SQL Server:", err);
    return { success: false, message: 'Falha na conexão.', error: err.message };
  }
}


// função getProductionSummary para testes
async function getProductionSummary() {
  try {
    let pool = await sql.connect(config);
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
  
    try {
      let pool = await sql.connect(config);
      const request = pool.request();
      
      request.input('line', sql.VarChar, lineDescription); 
      request.input('shift', sql.Int, shiftId);
  

      let result = await request.query(`
        SELECT TOP 1 TargProd, effectiveProd 
        FROM ${viewName}
        WHERE LineDesc = @line AND ShiftId = @shift
        ORDER BY EffectiveDate DESC
      `);
      await pool.close();
  
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
      console.log(`Cálculo de Performance para ${lineDescription}, Turno ${shiftId}: ${performance.toFixed(2)}%`);
      return { success: true, performance: parseFloat(performance.toFixed(2)) };
  
    } catch (err) {
      console.error(`Erro ao calcular performance para ${lineDescription}, Turno ${shiftId}:`, err);
      return { success: false, message: 'Falha ao calcular performance.', error: err.message };
    }
  }

  async function calculateAvailability(lineDescription, shiftId) {
    const viewName = 'vw_Lista_Estados_Montagem'; 
  
    try {
      let pool = await sql.connect(config);
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
      await pool.close();
  
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
  
      console.log(`Cálculo de Disponibilidade para ${lineDescription}, Turno ${shiftId}: ${availability.toFixed(2)}%`);
      return { success: true, availability: parseFloat(availability.toFixed(2)) };
  
    } catch (err) {
      console.error(`Erro ao calcular disponibilidade para ${lineDescription}, Turno ${shiftId}:`, err);
      return { success: false, message: 'Falha ao calcular disponibilidade.', error: err.message };
    }
  }

async function calculateQuality(lineDescription, shiftId) {
  const viewName = 'vw_Lista_Estados_Montagem'; 

  try {
      let pool = await sql.connect(config);
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
      await pool.close();

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

      console.log(`Cálculo de Qualidade para ${lineDescription}, Turno ${shiftId}: ${quality.toFixed(2)}%`);
      return { success: true, quality: parseFloat(quality.toFixed(2)) }; 

  } catch (err) {
      console.error(`Erro ao calcular Qualidade para ${lineDescription}, Turno ${shiftId}:`, err);
      return { success: false, message: 'Falha ao calcular qualidade.', error: err.message };
  }
}

module.exports = { testConnection, getProductionSummary, calculatePerformance, calculateAvailability, calculateQuality }