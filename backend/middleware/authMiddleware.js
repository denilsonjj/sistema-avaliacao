const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  const authHeader = req.header('Authorization');

  if (!authHeader) {
    return res.status(401).json({ message: 'Acesso negado. Nenhum token fornecido.' });
  }

  try {
    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Acesso negado. Token malformado.' });
    }

    const decoded = jwt.verify(token, 'SEU_SEGREDO_SUPER_SECRETO');
    req.user = decoded;
    next();
  } catch (ex) {
    res.status(400).json({ message: 'Token inválido.' });
  }
};