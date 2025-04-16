"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_controller_1 = __importDefault(require("../controllers/auth.controller"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
const user_controller_1 = __importDefault(require("../controllers/user.controller"));
const router = express_1.default.Router();
// Admin login route
router.post("/admin/login", auth_controller_1.default.loginAdmin);
router.post("/login", auth_controller_1.default.login);
router.get("/details", (0, auth_middleware_1.authenticateUser)(["Admin", "Warden", "Student", "Accountant"]), user_controller_1.default.getUserDetails);
router.get("/me", (0, auth_middleware_1.authenticateUser)(["Admin", "Warden", "Student", "Accountant", "Staff"]), auth_controller_1.default.getCurrentUser);
exports.default = router;
