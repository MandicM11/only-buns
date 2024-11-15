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

export const getUserById = async (userId: number) => {
  return prisma.user.findUnique({
    where: { id: userId },  // Find user by ID
    include: {
      posts: true,           // Include the posts of the user
      comments: true,        // Optionally, include comments if you want
      likes: true,           // Optionally, include likes if needed
    },
  });
};
