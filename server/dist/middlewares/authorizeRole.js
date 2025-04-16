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
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizeRole = void 0;
const prismaClient_1 = require("../config/prismaClient");
const authorizeRole = (roles) => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id; // Extract user ID from request
        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        try {
            // Fetch user with role details
            const user = yield prismaClient_1.prisma.user.findUnique({
                where: { id: userId },
                include: { role: true },
            });
            if (!user || !roles.includes(user.role.name)) {
                res.status(403).json({ message: "Forbidden: Access denied" });
                return;
            }
            // Proceed to the next middleware
            next();
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ message: "Internal server error" });
        }
    });
};
exports.authorizeRole = authorizeRole;
