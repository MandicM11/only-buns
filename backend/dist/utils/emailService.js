"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendActivationEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const sendActivationEmail = async (email, token) => {
    const transporter = nodemailer_1.default.createTransport({
        service: "gmail", // Gmail SMTP server
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD,
        },
    });
    const url = `http://localhost:3000/activate/${token}`;
    try {
        console.log("Sending activation email...");
        await transporter.sendMail({
            from: process.env.FROM_EMAIL, // Email sa kojeg šaljemo
            to: email, // Email kome šaljemo
            subject: "Account Activation",
            html: `<p>Click <a href="${url}">here</a> to activate your account.</p>`,
        });
        console.log("Activation email sent successfully.");
    }
    catch (error) {
        console.error("Error sending activation email:", error);
    }
};
exports.sendActivationEmail = sendActivationEmail;
