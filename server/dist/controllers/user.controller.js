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
const emailService_1 = __importDefault(require("../utils/emailService"));
const prisma = new client_1.PrismaClient();
class UserController {
    static createUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { name, email, password, role } = req.body;
            try {
                const validRoles = ["Warden", "Student", "Accountant"];
                if (!validRoles.includes(role)) {
                    res.status(400).json({ message: "Invalid role specified!" });
                    return;
                }
                const existingUser = yield prisma.user.findUnique({ where: { email } });
                if (existingUser) {
                    res.status(400).json({ message: "Email already in use!" });
                    return;
                }
                const hashedPassword = yield bcrypt_1.default.hash(password, 10);
                const newUser = yield prisma.user.create({
                    data: {
                        name,
                        email,
                        password: hashedPassword,
                        role: {
                            connect: { name: role },
                        },
                    },
                });
                const emailSubject = "Your Hostel Management System Account";
                const emailBody = `
        Hello ${name},<br><br>
        Your account has been created with the following details:<br>
        <b>Email:</b> ${email}<br>
        <b>Password:</b> ${password}<br>
        <b>Role:</b> ${role}<br><br>
        Please login and change your password immediately.<br><br>
        Regards,<br>
        Admin Team
      `;
                yield (0, emailService_1.default)(email, emailSubject, emailBody);
                res.status(201).json({
                    message: `User created successfully as ${role}!`,
                    userId: newUser.id,
                });
                return; // ✅ Explicitly return void
            }
            catch (error) {
                console.error(error);
                res.status(500).json({ message: "Internal server error", error });
                return; // ✅ Explicitly return void in catch block
            }
        });
    }
    static getAllUsers(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const users = yield prisma.user.findMany({
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                        createdAt: true,
                    },
                });
                res.status(200).json(users);
            }
            catch (error) {
                console.error(error);
                res.status(500).json({ message: "Internal server error" });
            }
        });
    }
    static getUserById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            try {
                const user = yield prisma.user.findUnique({ where: { id } });
                if (!user) {
                    res.status(404).json({ message: "User not found" });
                    return;
                }
                res.status(200).json(user);
            }
            catch (error) {
                console.error(error);
                res.status(500).json({ message: "Internal server error" });
            }
        });
    }
    static updateUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const { name, email, role } = req.body;
            try {
                // Validate role
                const validRoles = ["Warden", "Student", "Accountant"];
                if (role && !validRoles.includes(role)) {
                    res.status(400).json({ message: "Invalid role specified!" });
                    return;
                }
                // Update user
                const updatedUser = yield prisma.user.update({
                    where: { id },
                    data: { name, email, role },
                });
                res.status(200).json({
                    message: "User updated successfully",
                    user: updatedUser,
                });
            }
            catch (error) {
                console.error(error);
                res.status(500).json({ message: "Internal server error" });
            }
        });
    }
    static deleteUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            try {
                yield prisma.user.delete({ where: { id } });
                res.status(200).json({ message: "User deleted successfully" });
            }
            catch (error) {
                console.error(error);
                res.status(500).json({ message: "Internal server error" });
            }
        });
    }
}
_a = UserController;
UserController.getUserDetails = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Ensure req.user exists (middleware should have set this)
        if (!req.user || !req.user.id) {
            res.status(401).json({ message: "Unauthorized access!!" });
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
            res.status(404).json({ message: "User not found!" });
            return;
        }
        res.json({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role.name,
            createdAt: user.createdAt,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.default = UserController;
