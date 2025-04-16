import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/prismaClient";

// Extend Request type to include user
interface AuthenticatedRequest extends Request {
  user?: { id: string }; // Ensure `req.user` has an `id`
}

export const authorizeRole = (roles: string[]) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.user?.id; // Extract user ID from request

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    try {
      // Fetch user with role details
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { role: true },
      });

      if (!user || !roles.includes(user.role.name)) {
        res.status(403).json({ message: "Forbidden: Access denied" });
        return;
      }

      // Proceed to the next middleware
      next();
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  };
};
