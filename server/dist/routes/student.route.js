"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const student_controller_1 = require("../controllers/student.controller");
const router = express_1.default.Router();
const upload = (0, multer_1.default)(); // Configure multer for file uploads
// Allow multiple documents to be uploaded
router.post("/upload-documents", upload.array("documents", 10), student_controller_1.uploadDocuments); // Allow up to 10 files
router.get("/:studentId/documents", student_controller_1.getUploadedDocuments);
router.post("/complaints", student_controller_1.submitComplaint);
router.post("/room-change-request", student_controller_1.submitRoomChangeRequest);
exports.default = router;
