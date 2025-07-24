import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Card from '../../components/Card/Card';
import EvaluationsLineChart from '../../components/charts/EvaluationsLineChart';
import styles from './ReportsPage.module.css';
import { FaFileExcel } from 'react-icons/fa'; // Importar ícone

function ReportsPage() {
  const [evaluationsData, setEvaluationsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState({ evaluations: false, users: false, oee: false });

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await api.get('/reports/evaluations-over-time');
        setEvaluationsData(res.data);
      } catch (error) {
        console.error("Erro ao buscar dados do relatório:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  const handleDownload = async (reportType) => {
    setDownloading(prev => ({ ...prev, [reportType]: true }));
    
    const endpoints = {
      evaluations: '/reports/export/evaluations',
      users: '/auth/users/export',
      oee: '/oee/lines/overview/export'
    };
    
    const filenames = {
      evaluations: 'Relatorio_Avaliacoes.xlsx',
      users: 'Relatorio_Usuarios.xlsx',
      oee: 'Relatorio_OEE_Planta.xlsx'
    };

    try {
      const response = await api.get(endpoints[reportType], {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filenames[reportType]);
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error(`Erro ao baixar o relatório de ${reportType}:`, error);
      alert(`Não foi possível baixar o relatório de ${reportType}.`);
    } finally {
      setDownloading(prev => ({ ...prev, [reportType]: false }));
    }
  };

  if (loading) return <p>Gerando relatórios...</p>;

  return (
    <div className={styles.container}>
      <h1>Relatórios e Exportações</h1>
      <p>Análise de dados e extração de informações do sistema.</p>

      {/* Seção de Exportação */}
      <Card title="Exportar Dados para Excel">
        <div className={styles.exportGrid}>
          <button onClick={() => handleDownload('evaluations')} className={styles.downloadButton} disabled={downloading.evaluations}>
            <FaFileExcel /> {downloading.evaluations ? 'Baixando...' : 'Exportar Avaliações'}
          </button>
          <button onClick={() => handleDownload('users')} className={styles.downloadButton} disabled={downloading.users}>
            <FaFileExcel /> {downloading.users ? 'Baixando...' : 'Exportar Usuários'}
          </button>
          <button onClick={() => handleDownload('oee')} className={styles.downloadButton} disabled={downloading.oee}>
            <FaFileExcel /> {downloading.oee ? 'Baixando...' : 'Exportar OEE da Planta'}
          </button>
        </div>
      </Card>

      <div className={styles.reportCard}>
        <Card title="Volume de Avaliações ao Longo do Tempo">
          {evaluationsData.length > 0 ? (
            <EvaluationsLineChart data={evaluationsData} />
          ) : (
            <p>Não há dados suficientes para gerar este relatório.</p>
          )}
        </Card>
      </div>
    </div>
  );
}

export default ReportsPage;