import express from "express";
import {
  addFloor,
  addRoom,
  checkRoomAssigned,
  assignStudent,
  getFloors,
  createNotice,
  getStudentDocuments,
  verifyDocument,
  getAllComplaints,
  updateRoomChangeRequestStatus,
  getAllRoomChangeRequests,
} from "../controllers/adminController";
import multer from "multer";

const router = express.Router();

// Floor Routes
router.post("/floor", addFloor);

// Room Routes
router.post("/room", addRoom);
router.get("/room/assigned/:roomId", checkRoomAssigned);

// Assign Student to Room
router.post("/room/assign", assignStudent);

// Get All Floors
router.get("/floors", getFloors);

// Configure multer to parse multiple file uploads (no local storage)
const upload = multer(); // Files are stored in memory

// Route to send notices with multiple files
router.post("/notices", upload.array("documents", 10), createNotice); // Allow up to 10 files

router.get("/student-documents", getStudentDocuments);

// Route to verify a document
router.post("/verify-document", verifyDocument);

router.get("/complaints", getAllComplaints);

router.put("/room-change-request/status", updateRoomChangeRequestStatus);

// Admin: Get All Room Change Requests
router.get("/room-change-requests", getAllRoomChangeRequests);

export default router;
