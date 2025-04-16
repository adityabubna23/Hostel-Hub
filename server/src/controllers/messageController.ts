import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Get Notices for a Specific Role
export const getNotices = async (req: Request, res: Response): Promise<void> => {
    try {
      let { role } = req.query; // Role passed as a query parameter
  
      if (!role) {
        res.status(400).json({ error: "Role is required to fetch notices." });
        return;
      }
      role = (role as string).toLowerCase();
      role = role.charAt(0).toUpperCase() + role.slice(1);
     
  
      // Fetch notices targeted to the specified role
      const notices = await prisma.notice.findMany({
        where: {
          targetRoles: {
            has: role as string, // Check if the role is in the targetRoles array
          },
        },
        orderBy: {
          createdAt: "desc", // Sort by most recent notices
        },
      });
  
      if (notices.length === 0) {
        res.status(200).json({ message: "At this time, no notices are available for your role.", notices: [] });
        return;
      }
  
      res.status(200).json(notices);
    } catch (error) {
      console.error("Error in getNotices:", error);
      res.status(500).json({ error: (error as Error).message });
    }
  };