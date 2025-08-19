import { Request, Response, NextFunction } from "express";
import {
  getAllComments,
  getCommentById,
  createComment,
  updateComment,
  deleteComment,
} from "../services/commentService";
import type { CommentQuery } from "../types/user";

export const getComments = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const query: CommentQuery = {
      search: req.query.search as string,
      postId: req.query.postId
        ? parseInt(req.query.postId as string)
        : undefined,
      userId: req.query.userId
        ? parseInt(req.query.userId as string)
        : undefined,
      page: req.query.page ? parseInt(req.query.page as string) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
    };

    const comments = await getAllComments(query);

    res.json({
      success: true,
      data: comments,
      message: "Comments fetched successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const getComment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid comment ID" });
    }

    const comment = await getCommentById(id);
    res.json({
      success: true,
      data: comment,
      message: "Comment fetched successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const createNewComment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const created = await createComment(req.body);
    res
      .status(201)
      .json({
        success: true,
        data: created,
        message: "Comment created successfully",
      });
  } catch (error) {
    next(error);
  }
};

export const updateExistingComment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid comment ID" });
    }

    const updated = await updateComment(id, req.body);
    res.json({
      success: true,
      data: updated,
      message: "Comment updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const removeComment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid comment ID" });
    }

    const result = await deleteComment(id);
    res.json({
      success: true,
      data: result,
      message: "Comment deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
