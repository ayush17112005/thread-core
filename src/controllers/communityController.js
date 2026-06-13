import {
  createCommunityService,
  joinCommunityService,
  getCommunityFeedService,
  leaveCommunityService,
} from "../services/communityService.js";
import {
  ValidationError,
  NotFoundError,
  UnauthorizedError,
} from "../utils/errors/customErrors.js";
import { catchAsync } from "../utils/catchAsync.js";
const createCommunityController = catchAsync(async (req, res, next) => {
  const name = req.body.name;
  const adminId = req.user.id;
  const description = req.body.description;
  if (!name) {
    throw new ValidationError("Please provide a name for the community");
  }
  if (!adminId) {
    throw new UnauthorizedError("Unauthorized user!!");
  }
  const community = await createCommunityService(name, adminId, description);
  await community.populate("admin", "username");
  res
    .status(201)
    .json({ success: true, message: "Community Created", community });
});

const joinCommunityController = catchAsync(async (req, res, next) => {
  const communityId = req.params.communityId;
  const userId = req.user.id; //we are getting this from auth middleware
  if (!communityId) {
    throw new NotFoundError("Community does not exist");
  }
  await joinCommunityService(communityId, userId);
  return res.status(200).json({ success: true, message: "Joined Community" });
});

const leaveCommunityController = catchAsync(async (req, res, next) => {
  const communityId = req.params.communityId;
  const userId = req.user.id;
  if (!userId) {
    throw new UnauthorizedError("Unauthorized user!!");
  }
  await leaveCommunityService(communityId, userId);
  return res.status(200).json({ success: true, message: "Left Community" });
});

const getCommunityFeedController = catchAsync(async (req, res, next) => {
  const communityId = req.params.communityId;
  if (!communityId) {
    throw new NotFoundError("Community does not exist");
  }
  const cursor = req.query.cursor || null;
  const limit = parseInt(req.query.limit) || 10;
  const { posts, newCursor, hasMore } = await getCommunityFeedService(
    communityId,
    cursor,
    limit,
  );
  return res.status(200).json({ posts, cursor: newCursor, hasMore });
});

export {
  createCommunityController,
  joinCommunityController,
  getCommunityFeedController,
  leaveCommunityController,
};
