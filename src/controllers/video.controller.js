import mongoose, { isValidObjectId } from "mongoose";
import { User, Video } from "../models/index.js";
import {
  ApiError,
  ApiResponse,
  asyncHandler,
  uploadFileOnCloudinary,
} from "../utils/index.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
  //TODO: get all videos based on query, sort, pagination
});

//! upload and publish video 
const publishVideo = asyncHandler(async (req, res) => {
  /*
  1. get video details
  2. validate video detail
  3. check for the video file
  4. upload on cloudinary
  5. create video document(duration)
  6. return response
  */

  // 1. get video details
  const { title, description } = req.body;

  // 2. validate video details
  if ([title, description].some((field) => !field || field.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  // 3. check for files & 4. upload files on cloudinary

  // for thumbnail
  const thumbnailLocalPath = req.files?.thumbnail[0]?.path;

  if (!thumbnailLocalPath) {
    throw new ApiError(400, "thumbnail is required");
  }
  const thumbnail = await uploadFileOnCloudinary(thumbnailLocalPath);
  if (!thumbnail) {
    throw new ApiError(
      400,
      "thumbnail is require while uploading on cloudinary"
    );
  }

  // for videoFile
  const videoFileLocalPath = req.files?.videoFile[0]?.path;
  if (!videoFileLocalPath) {
    throw new ApiError(400, "video file is required");
  }
  const videoFile = await uploadFileOnCloudinary(videoFileLocalPath);
  if (!videoFile) {
    throw new ApiError(
      400,
      "video file is require while uploadinf on cloudinary"
    );
  }

  // 5. create video document
  const video = await Video.create({
    title,
    description,
    videoFile: videoFile.url,
    thumbnail: thumbnail.url,
    duration: videoFile.duration,
    owner: req.user._id,
  });
  if (!video) {
    throw new ApiError(400, "error while creating video document");
  }

  // 6. return response
  return res.status(200).json(new ApiResponse(200, video, "video uploaded"));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: get video by id
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: update video details like title, description, thumbnail
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: delete video
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
});

export {
  getAllVideos,
  publishVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
