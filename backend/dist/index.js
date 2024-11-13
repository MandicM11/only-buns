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
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
// Routes
app.use('/auth', authRoutes_1.default);
app.use(postRoutes_1.default);
app.use(commentRoutes_1.default);
app.use(likeRoutes_1.default);
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server radi na portu ${PORT}`);
});
