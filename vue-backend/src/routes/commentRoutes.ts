import { Router } from "express";
import {
  getComments,
  getComment,
  createNewComment,
  updateExistingComment,
  removeComment,
} from "../controllers/commentController";

const router = Router();

// GET /api/comments - list comments with filters
router.get("/", getComments);

// GET /api/comments/:id - get single comment
router.get("/:id", getComment);

// POST /api/comments - create comment
router.post("/", createNewComment);

// PUT /api/comments/:id - update comment
router.put("/:id", updateExistingComment);

// DELETE /api/comments/:id - delete comment
router.delete("/:id", removeComment);

export default router;
