import mongoose, { isValidObjectId } from "mongoose";
import { Tweet, User } from "../models/index.js";
import { ApiError, ApiResponse, asyncHandler } from "../utils/index.js";

const createTweet = asyncHandler(async (req, res) => {
  //TODO: create tweet
});

const getUserTweets = asyncHandler(async (req, res) => {
  // TODO: get user tweets
});

const updateTweet = asyncHandler(async (req, res) => {
  //TODO: update tweet
});

const deleteTweet = asyncHandler(async (req, res) => {
  //TODO: delete tweet
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
