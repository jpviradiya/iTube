import mongoose from "mongoose";
import { Comment } from "../models/index.js";
import { ApiError, ApiResponse, asyncHandler } from "../utils/index.js";

//! get video comments using pagination
const getVideoComments = asyncHandler(async (req, res) => {
  // getting required information
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  // validate video id
  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "invalid video id");
  }

  // coversion incoming data into int
  const itemsPerPage = parseInt(limit);
  const numOfPage = parseInt(page);
  const skip = (numOfPage - 1) * itemsPerPage;

  // fetching comments
  const comments = await Comment.find({ video: videoId })
    .skip(skip)
    .limit(itemsPerPage)
    .sort({ updatedAt: -1 })
    .populate("owner", "fullName username email"); // gives name of the owner
  if (!comments) {
    throw new ApiError(500, "no comments found");
  }

  // counting comments
  const commentCount = await Comment.countDocuments({ video: videoId });

  // return response
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        meta: {
          totalVideoComments: commentCount,
          page: numOfPage,
          limit: itemsPerPage,
        },
        comments,
      },
      "comment fetch successfully"
    )
  );
});

//! adding comment to video
const addComment = asyncHandler(async (req, res) => {
  // getting required details
  const { videoId } = req.params;
  const { content } = req.body;
  const ownerId = req.user._id;

  // validate video id
  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid VideoId");
  }

  // validate content
  if (!content) {
    throw new ApiError(400, "content of comment is not found");
  }

  // create comment object
  const comment = await Comment.create({
    content,
    video: videoId,
    owner: ownerId,
  });

  // check if comment document is not created
  if (!comment) {
    throw new ApiError(500, "error while creating comment document");
  }

  // return response
  return res
    .status(200)
    .json(new ApiResponse(200, comment, "comment added to video"));
});

//! updating comment to video
const updateComment = asyncHandler(async (req, res) => {
  // getting required parameters
  const { videoId, commentId } = req.params;
  const { content } = req.body;

  // validate video id and comment id
  if (
    !mongoose.Types.ObjectId.isValid(videoId) ||
    !mongoose.Types.ObjectId.isValid(commentId)
  ) {
    throw new ApiError(400, "Invalid video or comment IDs");
  }

  // validate content
  if (!content) {
    throw new ApiError(400, "content is require to update comment");
  }

  // fetch comment and varify user
  const comment = await Comment.findOneAndUpdate(
    { _id: commentId, owner: req.user._id }, // Query with conditions
    { content }, // Update
    { new: true } // Return the updated document
  );
  if (!comment) {
    throw new ApiError(500, "no comment found for given comment id");
  }

  // return response
  return res
    .status(200)
    .json(new ApiResponse(200, comment.content, "comment update successfully"));
});

//! deleting comment from video
const deleteComment = asyncHandler(async (req, res) => {
  // getting require details
  const { videoId, commentId } = req.params;

  // validate video id and comment id
  if (
    !mongoose.Types.ObjectId.isValid(videoId) ||
    !mongoose.Types.ObjectId.isValid(commentId)
  ) {
    throw new ApiError(400, "Invalid video or comment IDs");
  }

  // delete comment
  const comment = await Comment.findByIdAndDelete(commentId);

  // varify delete
  if (!comment) {
    throw new ApiError(500, "error while deleting comment");
  }

  // return response
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "comment delete successfully"));
});

export { getVideoComments, addComment, updateComment, deleteComment };
