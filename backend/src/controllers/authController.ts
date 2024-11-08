import { Request, Response, RequestHandler } from "express";
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";
import { sendActivationEmail } from "../utils/emailService";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export const registerUser: RequestHandler = async (req: Request, res: Response) => {
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
    const hashedPassword = await bcrypt.hash(password, 10);

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
    const activationToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
      expiresIn: "1h",
    });
    await sendActivationEmail(user.email, activationToken);

    res.status(201).json({ message: "Registration successful. Check your email for activation link." });
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

export const loginUser: RequestHandler = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      res.status(401).json({ message: "Invalid email or password." });
      return;
    }
    if (!user.isActive) {
      res.status(403).json({ message: "Please activate your account first." });
      return;
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: "1h" });
    res.json({ message: "Login successful", token });
  } catch (error) {
    res.status(500).json({ message: "An error occurred." });
  }
};


export const activateAccount = async (req: Request, res: Response) => {
  const { token } = req.params;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: number };
    await prisma.user.update({
      where: { id: decoded.userId },
      data: { isActive: true },
    });
    res.json({ message: "Account activated successfully." });
  } catch (error) {
    res.status(400).json({ message: "Invalid or expired activation token." });
  }
};
