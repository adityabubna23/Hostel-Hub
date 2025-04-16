"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const adminController_1 = require("../controllers/adminController");
const multer_1 = __importDefault(require("multer"));
const router = express_1.default.Router();
// Floor Routes
router.post("/floor", adminController_1.addFloor);
// Room Routes
router.post("/room", adminController_1.addRoom);
router.get("/room/assigned/:roomId", adminController_1.checkRoomAssigned);
// Assign Student to Room
router.post("/room/assign", adminController_1.assignStudent);
// Get All Floors
router.get("/floors", adminController_1.getFloors);
// Configure multer to parse multiple file uploads (no local storage)
const upload = (0, multer_1.default)(); // Files are stored in memory
// Route to send notices with multiple files
router.post("/notices", upload.array("documents", 10), adminController_1.createNotice); // Allow up to 10 files
exports.default = router;
