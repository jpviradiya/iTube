import mongoose from "mongoose";
import { Tweet } from "../models/index.js";
import { ApiError, ApiResponse, asyncHandler } from "../utils/index.js";

//! get user tweets
const getUserTweets = asyncHandler(async (req, res) => {
  // get data
  const userId = req.user._id;
  const { page = 1, limit = 5 } = req.query;

  // coversion incoming data into int
  const itemsPerPage = parseInt(limit);
  const numOfPage = parseInt(page);
  const skip = (numOfPage - 1) * itemsPerPage;

  // fetch tweets
  const tweets = await Tweet.find({ owner: userId })
    .skip(skip)
    .limit(itemsPerPage)
    .sort({ updatedAt: -1 })
    .populate("owner", "fullName username email");

  // check for data
  if (!tweets) {
    throw new ApiError(500, "error while fetching tweets");
  }

  // count tweets
  const tweetCount = await Tweet.countDocuments({ owner: userId });

  // return response
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        meta: {
          totalTweetsCount: tweetCount,
          page: numOfPage,
          limit: itemsPerPage,
        },
        tweets,
      },
      "tweets fetch successfully"
    )
  );
});

//! creating tweet
const createTweet = asyncHandler(async (req, res) => {
  // incoming data
  const { content } = req.body;
  const userId = req.user._id;

  // validate content
  if (!content) {
    throw new ApiError(400, "content is required");
  }

  // creating document
  const tweet = await Tweet.create({
    content,
    owner: userId,
  });

  // varify creation
  if (!tweet) {
    throw new ApiError(500, "error while creating tweet");
  }

  // return response
  return res
    .status(200)
    .json(new ApiResponse(200, tweet, "tweet created successfully"));
});

//! updating tweet
const updateTweet = asyncHandler(async (req, res) => {
  // incoming data
  const { tweetId } = req.params;
  const { content } = req.body;
  const userId = req.user._id;

  // validate information
  if (!mongoose.Types.ObjectId.isValid(tweetId)) {
    throw new ApiError(400, "Invalid TweetId");
  }
  if (!content) {
    throw new ApiError(400, "content is required to update tweet");
  }

  // updating document
  const tweet = await Tweet.findByIdAndUpdate(
    {
      _id: tweetId,
      owner: userId,
    },
    {
      content,
    },
    {
      new: true,
    }
  );

  // check for document
  if (!tweet) {
    throw new ApiError(500, "error while updating tweet");
  }

  // return response
  return res
    .status(200)
    .json(new ApiResponse(200, tweet, "tweet updating succesfully"));
});

//! deleting tweet
const deleteTweet = asyncHandler(async (req, res) => {
  // incoming data
  const { tweetId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(tweetId)) {
    throw new ApiError(400, "invalid tweetid");
  }

  const tweet = await Tweet.findByIdAndDelete(tweetId);
  if (!tweet) {
    throw new ApiError(500, "error while deleting tweet");
  }

  // return response
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "tweet delete successfully"));
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
