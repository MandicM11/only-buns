import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export const createUser = async (userData: {
  email: string;
  username: string;
  password: string;
  name: string;
  address: string;
}) => {
  const hashedPassword = await bcrypt.hash(userData.password, 10);
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
