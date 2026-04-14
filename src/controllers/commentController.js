import { createCommentService } from "../services/commentService.js";
const createCommentController = async (req, res) => {
  try {
    const userId = req.user.id;
    const content = req.body.content;
    const postId = req.params.postId;
    const communityId = req.params.communityId;
    const parentCommentId = req.body.parentCommentId; // This is optional for top-level comments
    if (!content) {
      return res.status(400).json({ error: "Content is required" });
    }
    const newComment = await createCommentService(
      content,
      userId,
      postId,
      communityId,
      parentCommentId,
    );
    res.status(201).json({
      message: "Comment Created Successfully",
      comment: await newComment.populate("userId", "username"),
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

export { createCommentController };
