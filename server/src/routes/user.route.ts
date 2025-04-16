import express from "express";
import UserController from "../controllers/user.controller";
import { authenticateAdmin } from "../middlewares/auth.middleware";


const router = express.Router();


router.post("/create", authenticateAdmin, UserController.createUser);
router.get("/", authenticateAdmin, UserController.getAllUsers);
router.get("/:id", authenticateAdmin, UserController.getUserById);
router.put("/:id", authenticateAdmin, UserController.updateUser);
router.delete("/:id", authenticateAdmin, UserController.deleteUser);



export default router;
