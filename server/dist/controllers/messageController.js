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
exports.getNotices = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// Get Notices for a Specific Role
const getNotices = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { role } = req.query; // Role passed as a query parameter
        if (!role) {
            res.status(400).json({ error: "Role is required to fetch notices." });
            return;
        }
        role = role.toLowerCase();
        role = role.charAt(0).toUpperCase() + role.slice(1);
        // Fetch notices targeted to the specified role
        const notices = yield prisma.notice.findMany({
            where: {
                targetRoles: {
                    has: role, // Check if the role is in the targetRoles array
                },
            },
            orderBy: {
                createdAt: "desc", // Sort by most recent notices
            },
        });
        if (notices.length === 0) {
            res.status(200).json({ message: "At this time, no notices are available for your role.", notices: [] });
            return;
        }
        res.status(200).json(notices);
    }
    catch (error) {
        console.error("Error in getNotices:", error);
        res.status(500).json({ error: error.message });
    }
});
exports.getNotices = getNotices;
