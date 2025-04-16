import { Request, Response, NextFunction, RequestHandler } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { AuthRequest } from "../types/auth.type";

const prisma = new PrismaClient();

class AuthController {
  static loginAdmin: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ message: "Email and password are required." });
      return; // Explicitly return void
    }

    try {
      // Find admin user
      const admin = await prisma.user.findUnique({
        where: { email },
        include: { role: true },
      });

      if (!admin || admin.role.name !== "Admin") {
        res.status(401).json({ message: "Unauthorized access!" });
        return; // Explicitly return void
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, admin.password);
      if (!isPasswordValid) {
        res.status(401).json({ message: "Invalid credentials!" });
        return;
      }

      // Generate JWT Token
      const token = jwt.sign(
        { userId: admin.id, role: admin.role.name },
        process.env.JWT_SECRET!,
        { expiresIn: "1d" }
      );

      res.json({ message: "Login successful", token });
      return; // Explicit return to match Promise<void>
    } catch (error) {
      next(error); // Properly forward the error
    }
  };

  static login: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const { email, password } = req.body;

    try {
      // Find the user
      const user = await prisma.user.findUnique({
        where: { email },
        include: { role: true },
      });

      if (!user) {
        res.status(401).json({ message: "Invalid credentials!" });
        return;
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        res.status(401).json({ message: "Invalid credentials!" });
        return;
      }

      // Generate JWT Token
      const token = jwt.sign(
        { userId: user.id, role: user.role.name },
        process.env.JWT_SECRET!,
        { expiresIn: "1d" }
      );

      res.json({
        message: "Login successful",
        token,
        role: user.role.name, // Return role so frontend can display correct sections
      });
    } catch (error) {
      next(error);
    }
  };

  static getCurrentUser: RequestHandler = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // Ensure `req.user` exists (set by middleware)
      if (!req.user || !req.user.id) {
        res.status(401).json({ message: "Invalid or missing token. Please log in again." });
        return;
      }
  
      // Fetch user details
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: {
          id: true,
          name: true,
          email: true,
          role: {
            select: { name: true },
          },
          createdAt: true,
        },
      });
  
      if (!user) {
        res.status(404).json({ message: "User not found. Please check your account." });
        return;
      }
  
      // Respond with user details
      res.status(200).json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role.name,
        createdAt: user.createdAt,
      });
    } catch (error) {
      console.error("Error in getCurrentUser:", error);
      res.status(500).json({ message: "An error occurred while fetching user details." });
    }
  };

}

export default AuthController;
