"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_controller_1 = __importDefault(require("../controllers/user.controller"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = express_1.default.Router();
router.post("/create", auth_middleware_1.authenticateAdmin, user_controller_1.default.createUser);
router.get("/", auth_middleware_1.authenticateAdmin, user_controller_1.default.getAllUsers);
router.get("/:id", auth_middleware_1.authenticateAdmin, user_controller_1.default.getUserById);
router.put("/:id", auth_middleware_1.authenticateAdmin, user_controller_1.default.updateUser);
router.delete("/:id", auth_middleware_1.authenticateAdmin, user_controller_1.default.deleteUser);
exports.default = router;
