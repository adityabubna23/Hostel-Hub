import express from "express";
import multer from "multer";
import { getUploadedDocuments, submitComplaint, submitRoomChangeRequest, uploadDocuments } from "../controllers/student.controller";

const router = express.Router();
const upload = multer(); // Configure multer for file uploads

// Allow multiple documents to be uploaded
router.post("/upload-documents", upload.array("documents", 10), uploadDocuments); // Allow up to 10 files

router.get("/:studentId/documents", getUploadedDocuments);

router.post("/complaints", submitComplaint);

router.post("/room-change-request", submitRoomChangeRequest);

export default router;