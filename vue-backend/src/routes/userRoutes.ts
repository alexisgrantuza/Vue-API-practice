import { Router } from "express";
import {
  getUsers,
  getUser,
  createNewUser,
  updateExistingUser,
  removeUser,
} from "../controllers/userController";

const router = Router();

// GET /api/users - Get all users (with search and pagination)
router.get("/", getUsers);

// GET /api/users/:id - Get single user
router.get("/:id", getUser);

// POST /api/users - Create new user
router.post("/", createNewUser);

// PUT /api/users/:id - Update user
router.put("/:id", updateExistingUser);

// DELETE /api/users/:id - Delete user
router.delete("/:id", removeUser);

export default router;
