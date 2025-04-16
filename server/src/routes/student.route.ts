import express from "express";
import multer from "multer";
import { uploadDocuments } from "../controllers/student.controller";

const router = express.Router();
const upload = multer(); // Configure multer for file uploads

// Allow multiple documents to be uploaded
router.post("/upload-documents", upload.array("documents", 10), uploadDocuments); // Allow up to 10 files

export default router;