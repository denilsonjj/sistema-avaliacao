// frontend/src/pages/ReportsPage/ReportsPage.jsx
import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Card from '../../components/Card/Card';
import EvaluationsLineChart from '../../components/charts/EvaluationsLineChart';
import styles from './ReportsPage.module.css';

function ReportsPage() {
  const [evaluationsData, setEvaluationsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

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

  // --- NOVA FUNÇÃO PARA LIDAR COM O DOWNLOAD ---
  const handleDownload = async () => {
    setDownloading(true);
    try {
      const response = await api.get('/reports/export/evaluations', {
        responseType: 'blob', // Importante: informa ao axios que esperamos um arquivo
      });

      // Cria um link temporário na memória para o arquivo recebido
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Relatorio_Avaliacoes.xlsx'); // Nome do arquivo
      
      // Adiciona o link ao corpo do documento, clica nele e depois o remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (error) {
      console.error("Erro ao baixar o relatório:", error);
      alert("Não foi possível baixar o relatório.");
    } finally {
      setDownloading(false);
    }
  };

  if (loading) return <p>Gerando relatórios...</p>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Relatórios</h1>
        {/* O link agora é um botão que chama a função handleDownload */}
        <button 
          onClick={handleDownload} 
          className={styles.downloadButton}
          disabled={downloading}
        >
          {downloading ? 'Baixando...' : 'Exportar para Excel'}
        </button>
      </div>
      <p>Análise de dados e performance do sistema.</p>

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