import {
  createCommunityService,
  joinCommunityService,
  getCommunityFeedService,
} from "../services/communityService.js";

const createCommunityController = async (req, res) => {
  try {
    const name = req.body.name;
    const adminId = req.user.id;
    const description = req.body.description;
    if (!name) {
      return res
        .status(400)
        .json({ success: false, message: "Name of the community is required" });
    }
    if (!adminId) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized user!!" });
    }
    const community = await createCommunityService(name, adminId, description);
    await community.populate("admin", "username");
    res
      .status(201)
      .json({ success: true, message: "Community Created", community });
  } catch (e) {
    if (e.message === "Community name already taken") {
      return res.status(409).json({ message: e.message });
    }
    return res.status(500).json({ message: "Server Error", error: e.message });
  }
};

const joinCommunityController = async (req, res) => {
  try {
    const communityId = req.params.communityId;
    const userId = req.user.id; //we are getting this from auth middleware
    if (!communityId) {
      return res
        .status(400)
        .json({ success: false, message: "Community ID is required" });
    }
    await joinCommunityService(communityId, userId);
    return res.status(200).json({ success: true, message: "Joined Community" });
  } catch (e) {
    if (e.message === "Community does not exist") {
      return res.status(404).json({ success: false, message: e.message });
    }
    if (e.message === "User already a member of this community") {
      return res.status(409).json({ success: false, message: e.message });
    }
    return res.status(500).json({ message: "Server Error", error: e.message });
  }
};

const getCommunityFeedController = async (req, res) => {
  try {
    const communityId = req.params.communityId;
    const cursor = req.query.cursor || null;
    const limit = parseInt(req.query.limit) || 10;
    const { posts, newCursor, hasMore } = await getCommunityFeedService(
      communityId,
      cursor,
      limit,
    );
    return res.status(200).json({ posts, cursor: newCursor, hasMore });
  } catch (e) {
    if (e.message === "Community does not exist") {
      return res.status(404).json({ success: false, message: e.message });
    }
    return res.status(500).json({ message: "Server Error", error: e.message });
  }
};

export {
  createCommunityController,
  joinCommunityController,
  getCommunityFeedController,
};
