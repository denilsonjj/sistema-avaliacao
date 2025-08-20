const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const { startScheduler } = require('./services/schedulerService');
const { errorHandler } = require('./middleware/errorHandler');

dotenv.config();

// Carregar Rotas
const authRoutes = require('./routes/authRoutes');
const evaluationRoutes = require('./routes/evaluationRoutes');
const selfAssessmentRoutes = require('./routes/selfAssessmentRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const goalRoutes = require('./routes/goalRoutes');
const oeeRoutes = require('./routes/oeeRoutes');
const productionLineRoutes = require('./routes/productionLineRoutes');
const reportRoutes = require('./routes/reportRoutes');
const testRoutes = require('./routes/testRoutes');

const app = express();

// Middlewares Globais
app.use(cors());
app.use(express.json());

// Configuração das Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/evaluations', evaluationRoutes);
app.use('/api/self-assessments', selfAssessmentRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/oee', oeeRoutes);
app.use('/api/production-lines', productionLineRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/test', testRoutes);

// Middleware de Tratamento de Erros (deve ser o último a ser carregado)
app.use(errorHandler);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`Servidor a rodar na porta ${PORT}`);
    // Inicia o agendador de tarefas depois de o servidor arrancar com sucesso
    startScheduler();
});