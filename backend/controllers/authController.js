const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const registerUser = async (req, res) => {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) {
        return res.status(400).json({ message: 'Por favor, preencha todos os campos.' });
    }
    try {
        const userExists = await prisma.user.findUnique({ where: { email } });
        if (userExists) return res.status(400).json({ message: 'Utilizador já existe.' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const user = await prisma.user.create({ data: { name, email, password: hashedPassword, role } });
        
        if (user) {
            res.status(201).json({ _id: user.id, name: user.name, email: user.email, role: user.role, token: generateToken(user.id) });
        } else {
            res.status(400).json({ message: 'Dados de utilizador inválidos.' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Erro no servidor ao registar utilizador.' });
    }
};

const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (user && (await bcrypt.compare(password, user.password))) {
            res.json({ _id: user.id, name: user.name, email: user.email, role: user.role, token: generateToken(user.id) });
        } else {
            res.status(401).json({ message: 'Email ou password inválidos.' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Erro no servidor ao fazer login.' });
    }
};

const getMe = (req, res) => res.status(200).json(req.user);

const getAllUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany({ select: { id: true, name: true, email: true, role: true } });
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar utilizadores.' });
    }
};

const getUserById = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.params.id },
            select: { id: true, name: true, email: true, role: true, technicalSkills: true, certifications: true }
        });
        if (user) res.status(200).json(user);
        else res.status(404).json({ message: 'Utilizador não encontrado.' });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar utilizador.' });
    }
};

const updateUser = async (req, res) => {
    const { name, email, role, password } = req.body;
    const updateData = { name, email, role };
    if (password && password.length > 0) {
        const salt = await bcrypt.genSalt(10);
        updateData.password = await bcrypt.hash(password, salt);
    }
    try {
        const updatedUser = await prisma.user.update({
            where: { id: req.params.id }, data: updateData,
            select: { id: true, name: true, email: true, role: true }
        });
        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(404).json({ message: 'Utilizador não encontrado ou falha ao atualizar.' });
    }
};

const deleteUser = async (req, res) => {
    try {
        await prisma.$transaction(async (tx) => {
            await tx.evaluation.deleteMany({ where: { userId: req.params.id } });
            await tx.goal.deleteMany({ where: { userId: req.params.id } });
            await tx.feedback.deleteMany({ where: { OR: [{ authorId: req.params.id }, { recipientId: req.params.id }] } });
            await tx.selfAssessment.deleteMany({ where: { userId: req.params.id } });
            await tx.user.delete({ where: { id: req.params.id } });
        });
        res.status(200).json({ message: 'Utilizador apagado com sucesso.' });
    } catch (error) {
        res.status(404).json({ message: 'Utilizador não encontrado ou falha ao apagar.' });
    }
};

const updateUserProfile = async (req, res) => {
    const { name, email, password, technicalSkills, certifications } = req.body;
    try {
        const user = await prisma.user.findUnique({ where: { id: req.user.id } });
        if (user) {
            const updateData = {
                name: name !== undefined ? name : user.name,
                email: email !== undefined ? email : user.email,
                technicalSkills: technicalSkills !== undefined ? technicalSkills : user.technicalSkills,
                certifications: certifications !== undefined ? certifications : user.certifications,
            };
            if (password && password.length > 0) {
                const salt = await bcrypt.genSalt(10);
                updateData.password = await bcrypt.hash(password, salt);
            }
            const updatedUser = await prisma.user.update({
                where: { id: req.user.id }, data: updateData,
                select: { id: true, name: true, email: true, role: true, technicalSkills: true, certifications: true }
            });
            res.status(200).json(updatedUser);
        } else {
            res.status(404).json({ message: 'Utilizador não encontrado.' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Erro ao atualizar perfil.' });
    }
};

module.exports = { registerUser, loginUser, getMe, getAllUsers, getUserById, updateUser, deleteUser, updateUserProfile };