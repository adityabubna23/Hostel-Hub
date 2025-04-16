"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_route_1 = __importDefault(require("./routes/auth.route"));
const user_route_1 = __importDefault(require("./routes/user.route"));
const admin_route_1 = __importDefault(require("./routes/admin.route"));
const messageRouter_1 = __importDefault(require("./routes/messageRouter"));
const student_route_1 = __importDefault(require("./routes/student.route"));
const PORT = process.env.PORT || 5000;
dotenv_1.default.config();
const app = (0, express_1.default)();
// Apply CORS middleware globally with the correct configuration
app.use((0, cors_1.default)({
    origin: "*", // Allow the frontend's origin
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true, // Allow credentials (cookies, authorization headers, etc.)
}));
app.use(express_1.default.json());
app.use("/api/auth", auth_route_1.default);
app.use("/api/users", user_route_1.default);
app.use("/api/admin", admin_route_1.default);
app.use("/api/message", messageRouter_1.default);
app.use("/api/student", student_route_1.default);
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
