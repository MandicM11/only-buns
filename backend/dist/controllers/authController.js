"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.activateAccount = exports.loginUser = exports.registerUser = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const client_1 = require("@prisma/client");
const emailService_1 = require("../utils/emailService");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma = new client_1.PrismaClient();
const registerUser = async (req, res) => {
    const { email, username, password, confirmPassword, name, address } = req.body;
    // Validacije
    if (!email || !username || !password || !confirmPassword || !name || !address) {
        res.status(400).json({ message: "All fields are required." });
        return;
    }
    if (password !== confirmPassword) {
        res.status(400).json({ message: "Passwords do not match." });
        return;
    }
    try {
        console.log("Register route called with data: ", req.body);
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        const user = await prisma.$transaction(async (tx) => {
            const existingUser = await tx.user.findUnique({
                where: { username },
            });
            if (existingUser) {
                throw new Error("Username is already taken.");
            }
            return await tx.user.create({
                data: {
                    email,
                    username,
                    password: hashedPassword,
                    name,
                    address,
                    isActive: false,
                },
            });
        });
        console.log("User registered: ", { email, username, name });
        const activationToken = jsonwebtoken_1.default.sign({ userId: user.id }, process.env.JWT_SECRET, {
            expiresIn: "1h",
        });
        await (0, emailService_1.sendActivationEmail)(user.email, activationToken);
        res.status(201).json({ message: "Registration successful. Check your email for activation link." });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};
exports.registerUser = registerUser;
const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !(await bcrypt_1.default.compare(password, user.password))) {
            res.status(401).json({ message: "Invalid email or password." });
            return;
        }
        if (!user.isActive) {
            res.status(403).json({ message: "Please activate your account first." });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: "1h" });
        res.json({ message: "Login successful", token });
    }
    catch (error) {
        res.status(500).json({ message: "An error occurred." });
    }
};
exports.loginUser = loginUser;
const activateAccount = async (req, res) => {
    const { token } = req.params;
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        await prisma.user.update({
            where: { id: decoded.userId },
            data: { isActive: true },
        });
        res.json({ message: "Account activated successfully." });
    }
    catch (error) {
        res.status(400).json({ message: "Invalid or expired activation token." });
    }
};
exports.activateAccount = activateAccount;
