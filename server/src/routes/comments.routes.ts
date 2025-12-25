import { Router, Response } from "express";
import prisma from "../config/database";
import { authenticate } from "../middleware/auth.middleware";
import { AuthenticatedRequest } from "../types";

const router = Router();

// Get comments for a post
router.get("/:postId/comments", authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { postId } = req.params;

    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
      res.status(404).json({ success: false, error: "Post not found" });
      return;
    }

    const comments = await prisma.comment.findMany({
      where: { postId },
      include: {
        user: {
          select: { id: true, displayName: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const formattedComments = comments.map((comment) => ({
      id: comment.id,
      postId: comment.postId,
      userId: comment.userId,
      content: comment.content,
      isAnonymous: comment.isAnonymous,
      author: comment.isAnonymous
        ? null
        : { displayName: comment.user?.displayName || "Unknown" },
      createdAt: comment.createdAt,
    }));

    res.status(200).json({
      success: true,
      data: formattedComments,
    });
  } catch (error: any) {
    console.error("Get comments error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create comment
router.post("/:postId/comments", authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { postId } = req.params;
    const { content, isAnonymous = false } = req.body;
    const userId = req.user!.id;

    if (!content || content.trim().length === 0) {
      res.status(400).json({ success: false, error: "Content is required" });
      return;
    }

    if (content.length > 280) {
      res.status(400).json({ success: false, error: "Comment too long (max 280 chars)" });
      return;
    }

    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
      res.status(404).json({ success: false, error: "Post not found" });
      return;
    }

    const comment = await prisma.comment.create({
      data: {
        postId,
        userId,
        content: content.trim(),
        isAnonymous,
      },
      include: {
        user: {
          select: { displayName: true },
        },
      },
    });

    res.status(201).json({
      success: true,
      data: {
        id: comment.id,
        postId: comment.postId,
        userId: comment.userId,
        content: comment.content,
        isAnonymous: comment.isAnonymous,
        author: isAnonymous ? null : { displayName: comment.user?.displayName || "Unknown" },
        createdAt: comment.createdAt,
      },
    });
  } catch (error: any) {
    console.error("Create comment error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
