import { Video } from "../models/index.js";
import {
  ApiError,
  ApiResponse,
  asyncHandler,
  deleteFileFromCloudinary,
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
  5. create video document
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
  const thumbnail = await uploadFileOnCloudinary(thumbnailLocalPath, "image");
  if (!thumbnail) {
    throw new ApiError(
      500,
      "thumbnail is require while uploading on cloudinary"
    );
  }

  // for videoFile
  const videoFileLocalPath = req.files?.videoFile[0]?.path;
  if (!videoFileLocalPath) {
    throw new ApiError(400, "video file is required");
  }
  const videoFile = await uploadFileOnCloudinary(videoFileLocalPath, "video");
  if (!videoFile) {
    throw new ApiError(
      500,
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
    throw new ApiError(500, "error while creating video document");
  }

  // 6. return response
  return res.status(200).json(new ApiResponse(200, video, "video uploaded"));
});

//! get video details by its id
const getVideoById = asyncHandler(async (req, res) => {
  // getting video id from url
  const { videoId } = req.params;
  if (!videoId) {
    throw new ApiError(400, "video id is not found from url");
  }

  // fetch video detail from db
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(500, "video not found");
  }

  // return response
  return res
    .status(200)
    .json(new ApiResponse(200, video, "video found successfully!!"));
  //TODO: get video by id
});

//! update video details by its id
const updateVideoDetails = asyncHandler(async (req, res) => {
  // getting necessary details
  const { videoId } = req.params;
  const { title, description } = req.body;
  
  // validate incoming parameter
  if (!title && !description) {
    throw new ApiError(400, "At least one of title or description is required");
  }

  // update video details
  const result = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        ...(title && { title }),
        ...(description && { description }),
      },
    },
    {
      new: true,
    }
  );
  if (!result) {
    throw new ApiError(
      500,
      "updating operation fail while updating video details in db"
    );
  }


  // returning response
  return res
    .status(200)
    .json(
      new ApiResponse(200, result, "video update successfully")
    );
});

//! update video details by its id
const updateVideoThumbnail = asyncHandler(async (req, res) => {
  // TODO:
});

//! delete video by its id
const deleteVideo = asyncHandler(async (req, res) => {
  // get video id
  const { videoId } = req.params;

  // validate video id
  if (!videoId) {
    throw new ApiError(400, "video is requied for delete a video");
  }

  // fetch and delete video
  const video = await Video.findByIdAndDelete(videoId);
  if (!video) {
    throw new ApiError(500, "error while deleting video from db");
  }

  // delete old thumbnail from cloudinary
  if (typeof video.thumbnail === typeof "string") {
    const deleteThumbnail = await deleteFileFromCloudinary(
      video.thumbnail,
      "image"
    );
    if (deleteThumbnail.result !== "ok") {
      throw new ApiError(500, "error while deleting thumbnail from cloudinary");
    }
  }

  // delete old video file from cloudinary
  if (typeof video.videoFile === typeof "string") {
    const deleteVideoFile = await deleteFileFromCloudinary(
      video.videoFile,
      "video"
    );
    if (deleteVideoFile.result !== "ok") {
      throw new ApiError(500, "error while deleting video from cloudinary");
    }
  }

  // returning response
  return res
    .status(200)
    .json(new ApiResponse(200, video, "video deleted successfully"));
});

//! toggle publish status
const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId) {
    throw new ApiError(400, "video id not found to toggle status");
  }

  // fetch and update video for toggle publish status
  const video = await Video.findByIdAndUpdate(
    videoId,
    // aggeration pipeline for update
    [
      {
        $set: {
          isPublished: {
            $not: "$isPublished",
          },
        },
      },
    ],
    {
      new: true,
    }
  );
  if (!video) {
    throw new ApiError(500, "error while toggling status");
  }

  // returning response
  return res
    .status(200)
    .json(new ApiResponse(200, video.isPublished, "change status of video"));
});

export {
  getAllVideos,
  publishVideo,
  getVideoById,
  updateVideoDetails,
  updateVideoThumbnail,
  deleteVideo,
  togglePublishStatus,
};
