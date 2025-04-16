import express from "express";
import { getNotices } from "../controllers/messageController";

const router = express.Router();

// Route to get notices for a specific role
router.get("/notices", getNotices);

export default router;