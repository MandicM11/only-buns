"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerUser = void 0;
const userService_1 = require("../services/userService");
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
