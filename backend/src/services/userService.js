"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUser = void 0;
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma = new client_1.PrismaClient();
const createUser = async (userData) => {
    const hashedPassword = await bcrypt_1.default.hash(userData.password, 10);
    const newUser = await prisma.user.create({
        data: {
            email: userData.email,
            username: userData.username,
            password: hashedPassword,
            name: userData.name,
            address: userData.address,
        },
    });
    return newUser;
};
exports.createUser = createUser;
