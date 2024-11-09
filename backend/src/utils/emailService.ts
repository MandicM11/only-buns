import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

export const sendActivationEmail = async (email, token) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",  // Gmail SMTP server
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const url = `http://localhost:3000/activate/${token}`;

  try {
    console.log("Sending activation email...");
    await transporter.sendMail({
      from: process.env.FROM_EMAIL,  // Email sa kojeg šaljemo
      to: email,                     // Email kome šaljemo
      subject: "Account Activation",
      html: `<p>Click <a href="${url}">here</a> to activate your account.</p>`,
    });
    console.log("Activation email sent successfully.");
  } catch (error) {
    console.error("Error sending activation email:", error);
  }
};
