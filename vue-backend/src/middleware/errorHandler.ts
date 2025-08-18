import { Request, Response, NextFunction } from "express";
import { CustomError } from "../types";

export const errorHandler = (
  error: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error("Error:", error);

  // Prisma errors
  if (error.name === "PrismaClientKnownRequestError") {
    const prismaError = error as any;

    if (prismaError.code === "P2002") {
      return res.status(400).json({
        success: false,
        message: "A record with this data already exists",
        error: "Duplicate entry",
      });
    }

    if (prismaError.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "Record not found",
        error: "Not found",
      });
    }
  }

  // Custom application errors
  if (error.message === "User not found") {
    return res.status(404).json({
      success: false,
      message: "User not found",
      error: "Not found",
    });
  }

  // Validation errors
  if (error.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      error: error.message,
    });
  }

  // Default error
  const statusCode = error.statusCode || 500;
  const message = error.message || "Internal Server Error";

  res.status(statusCode).json({
    success: false,
    message,
    error:
      process.env.NODE_ENV === "development"
        ? error.stack
        : "Internal Server Error",
  });
};
