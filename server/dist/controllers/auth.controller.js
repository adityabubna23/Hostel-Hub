"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma = new client_1.PrismaClient();
class AuthController {
}
_a = AuthController;
AuthController.loginAdmin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(400).json({ message: "Email and password are required." });
        return; // Explicitly return void
    }
    try {
        // Find admin user
        const admin = yield prisma.user.findUnique({
            where: { email },
            include: { role: true },
        });
        if (!admin || admin.role.name !== "Admin") {
            res.status(401).json({ message: "Unauthorized access!" });
            return; // Explicitly return void
        }
        // Verify password
        const isPasswordValid = yield bcrypt_1.default.compare(password, admin.password);
        if (!isPasswordValid) {
            res.status(401).json({ message: "Invalid credentials!" });
            return;
        }
        // Generate JWT Token
        const token = jsonwebtoken_1.default.sign({ userId: admin.id, role: admin.role.name }, process.env.JWT_SECRET, { expiresIn: "1d" });
        res.json({ message: "Login successful", token });
        return; // Explicit return to match Promise<void>
    }
    catch (error) {
        next(error); // Properly forward the error
    }
});
AuthController.login = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        // Find the user
        const user = yield prisma.user.findUnique({
            where: { email },
            include: { role: true },
        });
        if (!user) {
            res.status(401).json({ message: "Invalid credentials!" });
            return;
        }
        // Verify password
        const isPasswordValid = yield bcrypt_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            res.status(401).json({ message: "Invalid credentials!" });
            return;
        }
        // Generate JWT Token
        const token = jsonwebtoken_1.default.sign({ userId: user.id, role: user.role.name }, process.env.JWT_SECRET, { expiresIn: "1d" });
        res.json({
            message: "Login successful",
            token,
            role: user.role.name, // Return role so frontend can display correct sections
        });
    }
    catch (error) {
        next(error);
    }
});
AuthController.getCurrentUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Ensure `req.user` exists (set by middleware)
        if (!req.user || !req.user.id) {
            res.status(401).json({ message: "Invalid or missing token. Please log in again." });
            return;
        }
        // Fetch user details
        const user = yield prisma.user.findUnique({
            where: { id: req.user.id },
            select: {
                id: true,
                name: true,
                email: true,
                role: {
                    select: { name: true },
                },
                createdAt: true,
            },
        });
        if (!user) {
            res.status(404).json({ message: "User not found. Please check your account." });
            return;
        }
        // Respond with user details
        res.status(200).json({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role.name,
            createdAt: user.createdAt,
        });
    }
    catch (error) {
        console.error("Error in getCurrentUser:", error);
        res.status(500).json({ message: "An error occurred while fetching user details." });
    }
});
exports.default = AuthController;
