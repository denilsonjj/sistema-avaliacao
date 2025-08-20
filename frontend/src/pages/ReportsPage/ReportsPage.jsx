import React, { useState, useEffect } from 'react';
import { FaFileExcel, FaChartBar, FaUsers } from 'react-icons/fa';
import api from '../../services/api';
import Card from '../../components/Card/Card';
import styles from './ReportsPage.module.css';
import EvaluationsLineChart from '../../components/charts/EvaluationsLineChart';
import OeeBarChart from '../../components/charts/OeeBarChart'; 

function ReportsPage() {
  const [downloading, setDownloading] = useState({
    evaluations: false,
    users: false,
    oee: false,
  });
  const [chartData, setChartData] = useState({ evaluations: [], oee: [] });
  const [loadingCharts, setLoadingCharts] = useState(true);

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        // Renomeado o endpoint de 'oee' para 'efficiency' para clareza, mas a rota no backend é /oee
        const [evalRes, efficiencyRes] = await Promise.all([
          api.get('/evaluations'),
          api.get('/oee/overview-all-lines') 
        ]);

        const evaluationsWithDate = evalRes.data.map(e => ({
            ...e,
            date: new Date(e.createdAt).toLocaleDateString()
        }));
        
        setChartData({ evaluations: evaluationsWithDate, oee: efficiencyRes.data });
      } catch (error) {
        console.error("Erro ao buscar dados para os gráficos:", error);
      } finally {
        setLoadingCharts(false);
      }
    };

    fetchChartData();
  }, []);

  const handleDownload = async (reportType) => {
    setDownloading(prev => ({ ...prev, [reportType]: true }));
    try {
      const response = await api.get(`/reports/export/${reportType}`, {
        responseType: 'blob', // Importante para o download de arquivos
      });

      // Mapeamento de nomes de arquivos, atualizado para "Eficiência"
      const filenames = {
        evaluations: 'Relatorio_Completo_Avaliacoes.xlsx',
        users: 'Relatorio_Usuarios_Cadastrados.xlsx',
        oee: 'Relatorio_Eficiencia_Planta.xlsx' 
      };

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filenames[reportType]);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);

    } catch (error) {
      console.error(`Erro ao baixar o relatório de ${reportType}:`, error);
      alert(`Falha ao gerar o relatório. Tente novamente.`);
    } finally {
      setDownloading(prev => ({ ...prev, [reportType]: false }));
    }
  };

  return (
    <div className={styles.container}>
      <h1>Relatórios e Análises</h1>
      <p>Extraia dados consolidados e visualize tendências de desempenho do sistema.</p>

      <Card title="Exportar Dados Consolidados para Excel">
        <div className={styles.exportGrid}>
          <button onClick={() => handleDownload('evaluations')} className={styles.downloadButton} disabled={downloading.evaluations}>
            <FaUsers /> {downloading.evaluations ? 'Gerando...' : 'Exportar Avaliações'}
          </button>
          
          <button onClick={() => handleDownload('users')} className={styles.downloadButton} disabled={downloading.users}>
            <FaUsers /> {downloading.users ? 'Gerando...' : 'Exportar Usuários'}
          </button>

          {/* Botão e texto atualizados para Eficiência */}
          <button onClick={() => handleDownload('oee')} className={styles.downloadButton} disabled={downloading.oee}>
            <FaFileExcel /> {downloading.oee ? 'Gerando...' : 'Exportar Eficiência da Planta'}
          </button>
        </div>
      </Card>

      <div className={styles.chartsGrid}>
        <Card title="Evolução das Avaliações">
          {loadingCharts ? <p>Carregando gráfico...</p> : <EvaluationsLineChart data={chartData.evaluations} />}
        </Card>
        
        {/* Gráfico e título atualizados para Eficiência */}
        <Card title="Média de Eficiência por Linha">
          {loadingCharts ? <p>Carregando gráfico...</p> : <OeeBarChart data={chartData.oee} />}
        </Card>
      </div>
    </div>
  );
}

export default ReportsPage;