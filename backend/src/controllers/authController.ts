import { Request, Response, RequestHandler } from "express";
import bcrypt from "bcrypt";
import { PrismaClient, Prisma } from "@prisma/client";
import { sendActivationEmail } from "../utils/emailService";
import jwt from "jsonwebtoken";
import { BloomFilter } from "bloom-filters";

const prisma = new PrismaClient();
const loginAttempts = new Map<string, { attempts: number; lastAttempt: Date }>();
const usernameFilter = new BloomFilter(1000,3);

export const registerUser: RequestHandler = async (req: Request, res: Response) => {
  const { email, username, password, confirmPassword, name, address } = req.body;

  // Validation
  if (!email || !username || !password || !confirmPassword || !name || !address) {
    res.status(400).json({ message: "All fields are required." });
    return;
  }
  if (password !== confirmPassword) {
    res.status(400).json({ message: "Passwords do not match." });
    return;
  }
  if (usernameFilter.has(username)) {
    res.status(400).json({ message: "Username might already be taken." });
    return;
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.$transaction(async (tx) => {
      const existingUser = await tx.user.findUnique({
        where: { email },
      });
      if (existingUser) {
        throw new Error("Username is already taken.");
      }
      // Simulate delay for testing
      await new Promise((resolve) => setTimeout(resolve, 1000));
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
    
    usernameFilter.add(email);
    // const activationToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
    //   expiresIn: "1h",
    // });
    //await sendActivationEmail(user.email, activationToken);

    res.status(201).json({ message: "Registration successful. Check your email for activation link." });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Check if the error is related to the unique constraint violation
      if (error.code === "P2002") {
        const field = error.meta?.target[0]; // Get the field that caused the unique constraint violation
        const message = field === "email" ? "Email is already taken." : "Username is already taken.";
        res.status(400).json({ message });
      } else {
        res.status(400).json({ message: "A known error occurred: " + error.message });
      }
    } else if (error instanceof Error) {
      res.status(400).json({ message: error.message || "An error occurred during registration." });
    } else {
      res.status(500).json({ message: "An unexpected error occurred." });
    }
  }
};

export const loginUser: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;
  const ip = req.ip;
  const currentAttemptTime = new Date();

  // Limit login attempts by IP
  const record = loginAttempts.get(ip) || { attempts: 0, lastAttempt: new Date(0) };
  const timeSinceLastAttempt = (currentAttemptTime.getTime() - record.lastAttempt.getTime()) / 1000;

  if (timeSinceLastAttempt < 60) {
    if (record.attempts >= 5) {
      res.status(429).json({ message: "Too many login attempts. Please try again later." });
      return;
    }
    record.attempts++;
  } else {
    record.attempts = 1; // Reset after 1 minute
  }
  record.lastAttempt = currentAttemptTime;
  loginAttempts.set(ip, record);

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      res.status(401).json({ message: "Invalid email or password." });
      return;
    }
    // if (!user.isActive) {
    //   res.status(403).json({ message: "Please activate your account first." });
    //   return;
    // }

    // Update last login time
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: "1h" });
    res.json({ message: "Login successful", token });
  } catch (error) {
    res.status(500).json({ message: "An error occurred during login." });
  }
};


export const activateAccount: RequestHandler = async (req: Request, res: Response) => {
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
