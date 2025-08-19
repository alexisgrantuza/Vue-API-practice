import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import userRoutes from "./routes/userRoutes";
import commentRoutes from "./routes/commentRoutes";
import { errorHandler } from "./middleware/errorHandler";

// Load environment variables
dotenv.config({ quiet: true });

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// API routes
app.use("/api/users", userRoutes);
app.use("/api/comments", commentRoutes);

// 404 handler - Fixed for Express 5.x
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Error handling middleware
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`📊 API endpoints:`);
  console.log(`   • http://localhost:${PORT}/api/users`);
  console.log(`   • http://localhost:${PORT}/api/comments`);
});

export default app;
