const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const evaluationRoutes = require('./routes/evaluationRoutes'); 
const selfAssessmentRoutes = require('./routes/selfAssessmentRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/evaluations', evaluationRoutes); 
app.use('/api/self-assessment', selfAssessmentRoutes); 
app.use('/api/feedbacks', feedbackRoutes);
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});