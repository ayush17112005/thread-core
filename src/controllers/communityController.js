import { createCommunityService } from "../services/communityService.js";

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

export { createCommunityController };
