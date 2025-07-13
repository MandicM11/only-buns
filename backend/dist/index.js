"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const postRoutes_1 = __importDefault(require("./routes/postRoutes"));
const commentRoutes_1 = __importDefault(require("./routes/commentRoutes"));
const likeRoutes_1 = __importDefault(require("./routes/likeRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use('/uploads', express_1.default.static('/home/mirko/Documents/only-buns/backend/uploads'));
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.use(express_1.default.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded
// Routes
app.use('/auth', authRoutes_1.default);
app.use(postRoutes_1.default);
app.use(commentRoutes_1.default);
app.use(likeRoutes_1.default);
app.use(userRoutes_1.default);
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});
// Global error handler
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err.stack || err.message || err);
    res.status(err.status || 500).json({
        error: {
            message: err.message || 'Internal Server Error',
            details: err.details || null,
        },
    });
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server radi na portu ${PORT}`);
});
