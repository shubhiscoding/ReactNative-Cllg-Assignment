import { Router, Response } from "express";
import prisma from "../config/database";
import { authenticate } from "../middleware/auth.middleware";
import { AuthenticatedRequest } from "../types";

const router = Router();

// Get posts (feed)
router.get("/", authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { type = "normal", page = "1", limit = "10" } = req.query;
    const schoolId = req.user!.schoolId;
    const userId = req.user!.id;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const [posts, count] = await Promise.all([
      prisma.post.findMany({
        where: {
          schoolId,
          isHotTake: type === "hottake",
        },
        include: {
          user: {
            select: { id: true, displayName: true },
          },
          _count: {
            select: { comments: true },
          },
        },
        orderBy: { createdAt: "desc" },
        take: limitNum,
        skip,
      }),
      prisma.post.count({
        where: {
          schoolId,
          isHotTake: type === "hottake",
        },
      }),
    ]);

    // Get user votes for these posts
    const postIds = posts.map((p) => p.id);
    const userVotes = await prisma.vote.findMany({
      where: {
        userId,
        postId: { in: postIds },
      },
    });

    const votesMap = new Map(userVotes.map((v) => [v.postId, v.value]));

    // Format posts
    const formattedPosts = posts.map((post) => ({
      id: post.id,
      userId: post.userId,
      schoolId: post.schoolId,
      content: post.content,
      imageUrl: post.imageUrl,
      isAnonymous: post.isAnonymous,
      isHotTake: post.isHotTake,
      upvotes: post.upvotes,
      downvotes: post.downvotes,
      commentCount: post._count.comments,
      userVote: votesMap.get(post.id) || null,
      author: post.isAnonymous
        ? null
        : { displayName: post.user?.displayName || "Unknown" },
      createdAt: post.createdAt,
    }));

    const totalPages = Math.ceil(count / limitNum);

    res.status(200).json({
      success: true,
      data: formattedPosts,
      page: pageNum,
      totalPages,
      hasMore: pageNum < totalPages,
    });
  } catch (error: any) {
    console.error("Get posts error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get user's posts
router.get("/me", authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;

    const posts = await prisma.post.findMany({
      where: { userId },
      include: {
        user: {
          select: { id: true, displayName: true },
        },
        _count: {
          select: { comments: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const formattedPosts = posts.map((post) => ({
      id: post.id,
      userId: post.userId,
      schoolId: post.schoolId,
      content: post.content,
      imageUrl: post.imageUrl,
      isAnonymous: post.isAnonymous,
      isHotTake: post.isHotTake,
      upvotes: post.upvotes,
      downvotes: post.downvotes,
      commentCount: post._count.comments,
      userVote: null,
      author: { displayName: post.user?.displayName || "Unknown" },
      createdAt: post.createdAt,
    }));

    res.status(200).json({
      success: true,
      data: formattedPosts,
    });
  } catch (error: any) {
    console.error("Get user posts error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create post
router.post("/", authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { content, isAnonymous = false, isHotTake = false, imageUrl } = req.body;
    const userId = req.user!.id;
    const schoolId = req.user!.schoolId;

    if (!content || content.trim().length === 0) {
      res.status(400).json({ success: false, error: "Content is required" });
      return;
    }

    if (content.length > 500) {
      res.status(400).json({ success: false, error: "Content too long (max 500 chars)" });
      return;
    }

    const post = await prisma.post.create({
      data: {
        userId,
        schoolId,
        content: content.trim(),
        imageUrl,
        isAnonymous,
        isHotTake,
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
        id: post.id,
        userId: post.userId,
        schoolId: post.schoolId,
        content: post.content,
        imageUrl: post.imageUrl,
        isAnonymous: post.isAnonymous,
        isHotTake: post.isHotTake,
        upvotes: post.upvotes,
        downvotes: post.downvotes,
        commentCount: 0,
        userVote: null,
        author: isAnonymous ? null : { displayName: post.user?.displayName || "Unknown" },
        createdAt: post.createdAt,
      },
    });
  } catch (error: any) {
    console.error("Create post error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Vote on post
router.post("/:id/vote", authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { value } = req.body;
    const userId = req.user!.id;

    if (value !== 1 && value !== -1) {
      res.status(400).json({ success: false, error: "Invalid vote value" });
      return;
    }

    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) {
      res.status(404).json({ success: false, error: "Post not found" });
      return;
    }

    // Check if user has already voted
    const existingVote = await prisma.vote.findUnique({
      where: {
        userId_postId: { userId, postId: id },
      },
    });

    let newUserVote: number | null = value;
    let upvotes = post.upvotes;
    let downvotes = post.downvotes;

    if (existingVote) {
      if (existingVote.value === value) {
        // Remove vote (toggle off)
        await prisma.vote.delete({
          where: { id: existingVote.id },
        });
        if (value === 1) {
          upvotes = Math.max(0, upvotes - 1);
        } else {
          downvotes = Math.max(0, downvotes - 1);
        }
        newUserVote = null;
      } else {
        // Change vote
        await prisma.vote.update({
          where: { id: existingVote.id },
          data: { value },
        });

        if (existingVote.value === 1) {
          upvotes = Math.max(0, upvotes - 1);
          downvotes += 1;
        } else {
          downvotes = Math.max(0, downvotes - 1);
          upvotes += 1;
        }
      }
    } else {
      // Create new vote
      await prisma.vote.create({
        data: { userId, postId: id, value },
      });
      if (value === 1) {
        upvotes += 1;
      } else {
        downvotes += 1;
      }
    }

    // Update post vote counts
    await prisma.post.update({
      where: { id },
      data: { upvotes, downvotes },
    });

    res.status(200).json({
      success: true,
      data: {
        upvotes,
        downvotes,
        userVote: newUserVote,
      },
    });
  } catch (error: any) {
    console.error("Vote error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
