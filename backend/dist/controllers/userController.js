"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserByIdController = exports.registerUser = void 0;
const userService_1 = require("../services/userService");
const userService_2 = require("../services/userService");
// Register user
const registerUser = async (req, res) => {
    try {
        const { email, username, password, name, address } = req.body;
        const newUser = await (0, userService_1.createUser)({ email, username, password, name, address });
        res.status(201).json(newUser);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to register user' });
    }
};
exports.registerUser = registerUser;
// Get user by ID
const getUserByIdController = async (req, res) => {
    const { id } = req.params; // Extract userId from request parameters
    try {
        const user = await (0, userService_2.getUserById)(Number(id)); // Call the service to fetch user by ID
        if (!user) {
            res.status(404).json({ message: 'User not found' }); // Return 404 if user is not found
            return;
        }
        res.json(user); // Return the user object if found
    }
    catch (error) {
        res.status(500).json({ error: 'Error retrieving user' }); // Return 500 error if something goes wrong
    }
};
exports.getUserByIdController = getUserByIdController;
