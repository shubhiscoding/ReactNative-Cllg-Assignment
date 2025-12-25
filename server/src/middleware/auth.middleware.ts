import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AuthenticatedRequest } from "../types";
import prisma from "../config/database";

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ success: false, error: "No token provided" });
      return;
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key"
    ) as { id: string; email: string; schoolId: string };

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user) {
      res.status(401).json({ success: false, error: "User not found" });
      return;
    }

    req.user = {
      id: decoded.id,
      email: decoded.email,
      schoolId: decoded.schoolId,
    };

    next();
  } catch (error) {
    res.status(401).json({ success: false, error: "Invalid token" });
  }
};
