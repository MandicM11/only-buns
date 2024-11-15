import { Request, Response } from 'express';
import { createUser } from '../services/userService';
import { getUserById } from '../services/userService';

// Register user
export const registerUser = async (req: Request, res: Response) => {
  try {
    const { email, username, password, name, address } = req.body;
    const newUser = await createUser({ email, username, password, name, address });
    res.status(201).json(newUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to register user' });
  }
};

// Get user by ID
export const getUserByIdController = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;  // Extract userId from request parameters
  try {
    const user = await getUserById(Number(id));  // Call the service to fetch user by ID

    if (!user) {
      res.status(404).json({ message: 'User not found' });  // Return 404 if user is not found
      return;
    }

    res.json(user);  // Return the user object if found
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving user' });  // Return 500 error if something goes wrong
  }
};
