import mongoose from "mongoose";
import { Like } from "../models/index.js";
import { ApiError, ApiResponse, asyncHandler } from "../utils/index.js";

//* helper function
const toggleLike = async (userId, targetId, targetType) => {
  // check for Like if already exists
  const exists = await Like.findOne({
    [targetType]: targetId,
    likedBy: userId,
  });

  // if exists then remove
  if (exists) {
    await Like.deleteOne({ _id: exists._id });
    return {
      message: `${targetType} Disliked Successfully`,
      action: "dislike",
    };
  }
  // else create like
  else {
    const createLike = await Like.create({
      [targetType]: targetId,
      likedBy: userId,
    });
    if (!createLike) {
      throw new ApiError(500, "Like document is not created.");
    }
    return { message: `${targetType} Liked Successfully`, action: "like" };
  }
};

//! toggle video like
const toggleVideoLike = asyncHandler(async (req, res) => {
  // incoming data
  const { videoId } = req.params;
  const userId = req.user._id;

  // validate object id
  if (videoId && !mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid object id");
  }

  // calling funtion
  const result = await toggleLike(userId, videoId, "video");

  // return response
  return res
    .status(200)
    .json(new ApiResponse(200, result, "toggle video like successfully"));
});

//! toggle comment like
const toggleCommentLike = asyncHandler(async (req, res) => {
  // incoming data
  const { commentId } = req.params;
  const userId = req.user._id;

  // validate object id
  if (commentId && !mongoose.Types.ObjectId.isValid(commentId)) {
    throw new ApiError(400, "Invalid object id");
  }

  // calling funtion
  const result = await toggleLike(userId, commentId, "comment");

  // return response
  return res
    .status(200)
    .json(new ApiResponse(200, result, "toggle comment like successfully"));
});

//! toggle tweet like
const toggleTweetLike = asyncHandler(async (req, res) => {
  // incoming data
  const { tweetId } = req.params;
  const userId = req.user._id;

  // validate object id
  if (tweetId && !mongoose.Types.ObjectId.isValid(tweetId)) {
    throw new ApiError(400, "Invalid object id");
  }

  // calling funtion
  const result = await toggleLike(userId, tweetId, "tweet");

  // return response
  return res
    .status(200)
    .json(new ApiResponse(200, result, "toggle tweet like successfully"));
});

const getLikedVideos = asyncHandler(async (req, res) => {
  //TODO: get all liked videos

  const result = await Like.find({
    likedBy: req.user._id,
    video: { $exists: true },
  })
    .populate("likedBy", "username")
    .populate("video", "title");

  return res
    .status(200)
    .json(new ApiResponse(200, result, "fetch liked videos"));
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
