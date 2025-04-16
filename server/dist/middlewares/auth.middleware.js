"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateAdmin = exports.authenticateUser = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const authenticateAdmin = (req, res, next) => {
    var _a;
    const token = (_a = req.header("Authorization")) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
    if (!token) {
        res.status(401).json({ message: "Access Denied. No token provided." });
        return; // ✅ Ensures function exits after response
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        if (decoded.role !== "Admin") {
            res.status(403).json({ message: "Access forbidden. Admins only." });
            return; // ✅ Ensures function exits after response
        }
        next(); // ✅ Pass control to the next middleware
    }
    catch (error) {
        res.status(400).json({ message: "Invalid token." });
        return; // ✅ Ensures function exits after response
    }
};
exports.authenticateAdmin = authenticateAdmin;
const authenticateUser = (allowedRoles) => {
    return (req, res, next) => {
        var _a;
        const token = (_a = req.header("Authorization")) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
        if (!token) {
            res.status(401).json({ message: "Access Denied. No token provided." });
            return;
        }
        try {
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            if (!allowedRoles.includes(decoded.role)) {
                res.status(403).json({ message: "Access forbidden." });
                return;
            }
            req.user = { id: decoded.userId, role: decoded.role }; // ✅ Attach user details to req.user
            next();
        }
        catch (error) {
            res.status(400).json({ message: "Invalid token." });
        }
    };
};
exports.authenticateUser = authenticateUser;
