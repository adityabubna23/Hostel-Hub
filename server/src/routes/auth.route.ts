import express from "express";
import AuthController from "../controllers/auth.controller";
import { authenticateUser } from "../middlewares/auth.middleware";
import UserController from "../controllers/user.controller";

const router = express.Router();

// Admin login route
router.post("/admin/login", AuthController.loginAdmin);
router.post("/login", AuthController.login);
router.post("/signup", AuthController.signup);
router.get("/details", authenticateUser(["Admin", "Warden", "Student", "Accountant"]), UserController.getUserDetails);
router.get("/me", authenticateUser(["Admin", "Warden", "Student", "Accountant", "Staff"]), AuthController.getCurrentUser);
export default router;
