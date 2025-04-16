import express from "express";
import {
  addFloor,
  addRoom,
  checkRoomAssigned,
  assignStudent,
  getFloors,
  createNotice,
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

export default router;
