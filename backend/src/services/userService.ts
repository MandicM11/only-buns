import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import axios from 'axios';

const prisma = new PrismaClient();

export const createUser = async (userData: {
  email: string;
  username: string;
  password: string;
  name: string;
  address: string;
 

}) => {
  const hashedPassword = await bcrypt.hash(userData.password, 10);

  // Geocode the address to get latitude and longitude
  const coordinates = await geocodeAddress(userData.address);

  const newUser = await prisma.user.create({
    data: {
      email: userData.email,
      username: userData.username,
      password: hashedPassword,
      name: userData.name,
      address: userData.address,
      latitude: coordinates.lat,
      longitude: coordinates.lng,
    },
  });
  return newUser;
};

export const getUserById = async (userId: number) => {
  return prisma.user.findUnique({
    where: { id: userId }, // Find user by ID
    include: {
      posts: true, // Include the posts of the user
      comments: true, // Optionally, include comments if you want
      likes: true, // Optionally, include likes if needed
    },
  });
};

// Function to geocode an address using Nominatim API
export const geocodeAddress = async (address: string) => {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
    address
  )}`;
  const response = await axios.get(url);

  if (response.data && response.data.length > 0) {
    const { lat, lon } = response.data[0];
    return { lat: parseFloat(lat), lng: parseFloat(lon) };
  } else {
    throw new Error('Geocoding failed: Address not found');
  }
};
