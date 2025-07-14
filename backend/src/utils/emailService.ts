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

export const sendInactiveUserEmail = async (email: string, name: string, stats: any) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const { platformStats, userStats } = stats;

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Nedostajete nam, ${name}! 📱</h2>
      <p>Niste pristupili aplikaciji u poslednjih 7 dana. Evo šta se dešavalo:</p>
      
      <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>📊 Statistike platforme (poslednja nedelja):</h3>
        <ul>
          <li><strong>${platformStats.newPosts}</strong> novih objava</li>
          <li><strong>${platformStats.newComments}</strong> novih komentara</li>
          <li><strong>${platformStats.newLikes}</strong> novih lajkova</li>
          <li><strong>${platformStats.totalUsers}</strong> aktivnih korisnika</li>
        </ul>
      </div>
      
      <div style="background-color: #e8f4fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>👤 Vaša aktivnost:</h3>
        <ul>
          <li><strong>${userStats.totalPosts}</strong> objava ukupno</li>
          <li><strong>${userStats.likesReceived}</strong> lajkova na vašim objavama</li>
          <li><strong>${userStats.commentsReceived}</strong> komentara na vašim objavama</li>
          <li><strong>${userStats.totalLikes}</strong> lajkova koje ste dali</li>
          <li><strong>${userStats.totalComments}</strong> komentara koje ste napisali</li>
        </ul>
      </div>
      
      <p style="text-align: center; margin: 30px 0;">
        <a href="http://localhost:4200" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Vrati se u aplikaciju</a>
      </p>
      
      <p style="color: #666; font-size: 14px;">Vaš tim Only Buns</p>
    </div>
  `;

  try {
    console.log("Sending inactive user notification email...");
    await transporter.sendMail({
      from: process.env.FROM_EMAIL,
      to: email,
      subject: "Nedostajete nam! 📱 - Nedeljni pregled aktivnosti",
      html: htmlContent,
    });
    console.log("Inactive user notification email sent successfully.");
  } catch (error) {
    console.error("Error sending inactive user notification email:", error);
  }
};
