import { uploadToCloudinaryService } from "../services/uploadService.js";
import { createPostService, votePostService } from "../services/postService.js";

const createPostController = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const communityId = req.params.communityId;
    if (!communityId) {
      return res.status(400).json({ message: "Community ID is required" });
    }

    const { title, content } = req.body;
    if (!title || !content) {
      return res.status(400).json({
        message: "Title and content are required",
      });
    }

    let imageUrl = null;

    // If image exists → upload to cloudinary
    if (req.file) {
      try {
        const result = await uploadToCloudinaryService(req.file.buffer);
        imageUrl = result.secure_url;
      } catch (error) {
        return res.status(500).json({
          message: "Error uploading image",
          error: error.message,
        });
      }
    }

    // Create post
    const post = await createPostService(
      userId,
      communityId,
      title,
      content,
      imageUrl,
    );

    return res.status(201).json({
      message: "Post created successfully",
      post,
    });
  } catch (error) {
    if (
      error.message === "You must be a member of the community to create a post"
    ) {
      return res.status(403).json({ message: error.message });
    }
    return res.status(500).json({ message: "Unexpected error occurred" });
  }
};

const votePostController = async (req, res) => {
  try {
    const userId = req.user.id;
    const postId = req.params.postId;
    const voteType = req.body.voteType; // "upvote" or "downvote"

    //but this check doesn't have any meaning as from the frontend there are two arrows only:)
    //but we will not trust the frontend and will do the check here as well
    if (!["upvote", "downvote"].includes(voteType)) {
      return res.status(400).json({ message: "Invalid vote type" });
    }
    const updatePost = await votePostService(postId, userId, voteType);
    return res
      .status(200)
      .json({ message: "Vote recorded successfully", post: updatePost });
  } catch (e) {
    if (e.message === "Post does not exist") {
      return res.status(404).json({ message: e.message });
    }
    return res.status(500).json({ message: "Unexpected error occurred" });
  }
};
export { createPostController, votePostController };
