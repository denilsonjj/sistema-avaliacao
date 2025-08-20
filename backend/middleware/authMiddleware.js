const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await prisma.user.findUnique({
                where: { id: decoded.id },
                select: { id: true, name: true, email: true, role: true }
            });
            if (!req.user) {
                 return res.status(401).json({ message: 'Não autorizado, utilizador não encontrado' });
            }
            next();
        } catch (error) {
            return res.status(401).json({ message: 'Não autorizado, o token falhou' });
        }
    }
    if (!token) {
        return res.status(401).json({ message: 'Não autorizado, sem token' });
    }
};

const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ 
                message: `Acesso negado: O perfil '${req.user.role}' não tem autorização para aceder a esta rota.` 
            });
        }
        next();
    };
};

module.exports = { 
    protect, 
    authorize 
};