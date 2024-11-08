import nodemailer from "nodemailer";

export const sendActivationEmail = async (email: string, token: string) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.office365.com",  // Office 365 SMTP server
    port: 587,                  // STARTTLS port za Office 365
    secure: false,              // Koristimo STARTTLS
    auth: {
      user: process.env.SmtpUser,   // Email korisničko ime (tvoj email)
      pass: process.env.SmtpPassword, // Aplikaciona lozinka ili obična lozinka
    },
  });

  const url = `http://localhost:3000/activate/${token}`;

  try {
    console.log("Sending activation email...");
    await transporter.sendMail({
      from: process.env.FromEmail,  // Email sa kojeg šaljemo
      to: email,                   // Email kome šaljemo
      subject: "Account Activation",
      html: `<p>Click <a href="${url}">here</a> to activate your account.</p>`,
    });
    console.log("Activation email sent successfully.");
  } catch (error) {
    console.error("Error sending activation email:", error);
  }
};
