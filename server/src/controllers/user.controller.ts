import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import sendEmail from "../utils/emailService";
import { AuthRequest } from "../types/auth.type";


const prisma = new PrismaClient();

class UserController {
  static async createUser(req: Request, res: Response): Promise<void> {
    const { name, email, password, role } = req.body;

    try {
      const validRoles = ["Warden", "Student", "Accountant"];
      if (!validRoles.includes(role)) {
        res.status(400).json({ message: "Invalid role specified!" });
        return;
      }

      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        res.status(400).json({ message: "Email already in use!" });
        return;
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: {
            connect: { name: role },
          },
        },
      });

      const emailSubject = "Your Hostel Management System Account";
      const emailBody = `
        Hello ${name},<br><br>
        Your account has been created with the following details:<br>
        <b>Email:</b> ${email}<br>
        <b>Password:</b> ${password}<br>
        <b>Role:</b> ${role}<br><br>
        Please login and change your password immediately.<br><br>
        Regards,<br>
        Admin Team
      `;

      await sendEmail(email, emailSubject, emailBody);

      res.status(201).json({
        message: `User created successfully as ${role}!`,
        userId: newUser.id,
      });

      return; // ✅ Explicitly return void
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error", error });
      return; // ✅ Explicitly return void in catch block
    }
  }

  static async getAllUsers(req: Request, res: Response) {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
      });
      res.status(200).json(users);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  static async getUserById(req: Request, res: Response): Promise<void>{
    const {id} = req.params;
    try {
      const user = await prisma.user.findUnique({ where: { id } });
      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }
      res.status(200).json(user);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  static async updateUser(req: Request, res: Response):Promise<void> {
    const { id } = req.params;
    const { name, email, role } = req.body;

    try {
      // Validate role
      const validRoles = ["Warden", "Student", "Accountant"];
      if (role && !validRoles.includes(role)) {
        res.status(400).json({ message: "Invalid role specified!" });
        return ;
      }

      // Update user
      const updatedUser = await prisma.user.update({
        where: { id },
        data: { name, email, role },
      });

      res.status(200).json({
        message: "User updated successfully",
        user: updatedUser,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  static async deleteUser(req: Request, res: Response) {
    const { id } = req.params;
    try {
      await prisma.user.delete({ where: { id } });
      res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  static getUserDetails = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Ensure req.user exists (middleware should have set this)
      if (!req.user || !req.user.id) {
        res.status(401).json({ message: "Unauthorized access!!" });
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
       res.status(404).json({ message: "User not found!" });
        return;
      }

      res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role.name,
        createdAt: user.createdAt,
      });
    } catch (error) {
      next(error);
    }
  };
}


  


export default UserController;
