"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.geocodeAddress = exports.getUserById = exports.createUser = void 0;
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const axios_1 = __importDefault(require("axios"));
const prisma = new client_1.PrismaClient();
const createUser = async (userData) => {
    const hashedPassword = await bcrypt_1.default.hash(userData.password, 10);
    // Geocode the address to get latitude and longitude
    const coordinates = await (0, exports.geocodeAddress)(userData.address);
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
exports.createUser = createUser;
const getUserById = async (userId) => {
    return prisma.user.findUnique({
        where: { id: userId }, // Find user by ID
        include: {
            posts: true, // Include the posts of the user
            comments: true, // Optionally, include comments if you want
            likes: true, // Optionally, include likes if needed
        },
    });
};
exports.getUserById = getUserById;
// Function to geocode an address using Nominatim API
const geocodeAddress = async (address) => {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;
    const response = await axios_1.default.get(url);
    if (response.data && response.data.length > 0) {
        const { lat, lon } = response.data[0];
        return { lat: parseFloat(lat), lng: parseFloat(lon) };
    }
    else {
        throw new Error('Geocoding failed: Address not found');
    }
};
exports.geocodeAddress = geocodeAddress;
