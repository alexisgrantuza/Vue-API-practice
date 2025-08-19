import { PrismaClient, Prisma } from "@prisma/client";
import type {
  CreateCommentData,
  UpdateCommentData,
  CommentQuery,
} from "../types/user";

const prisma = new PrismaClient();

export const getAllComments = async (query: CommentQuery = {}) => {
  const { search, postId, userId, page, limit } = query;

  const where: Prisma.CommentWhereInput = {
    ...(postId !== undefined ? { postId } : {}),
    ...(userId !== undefined ? { userId } : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
            { body: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const take = typeof limit === "number" && limit > 0 ? limit : undefined;
  const currentPage = typeof page === "number" && page > 0 ? page : undefined;
  const skip = take && currentPage ? (currentPage - 1) * take : undefined;

  const comments = await prisma.comment.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take,
    skip,
  });

  return comments;
};

export const getCommentById = async (id: number) => {
  const comment = await prisma.comment.findUnique({ where: { id } });

  if (!comment) {
    throw new Error("Comment not found");
  }

  return comment;
};

export const createComment = async (data: CreateCommentData) => {
  const created = await prisma.comment.create({
    data: {
      postId: data.postId,
      name: data.name,
      email: data.email,
      body: data.body,
      userId: data.userId ?? null,
    },
  });

  return created;
};

export const updateComment = async (id: number, data: UpdateCommentData) => {
  const existing = await prisma.comment.findUnique({ where: { id } });
  if (!existing) {
    throw new Error("Comment not found");
  }

  const updated = await prisma.comment.update({
    where: { id },
    data: {
      postId: data.postId,
      name: data.name,
      email: data.email,
      body: data.body,
      userId: data.userId !== undefined ? data.userId : undefined,
    },
  });

  return updated;
};

export const deleteComment = async (id: number) => {
  const existing = await prisma.comment.findUnique({ where: { id } });
  if (!existing) {
    throw new Error("Comment not found");
  }

  await prisma.comment.delete({ where: { id } });
  return { message: "Comment deleted successfully" };
};
