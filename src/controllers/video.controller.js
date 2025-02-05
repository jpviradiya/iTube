// TODO: for update don't call database operation twice
import mongoose from "mongoose";
import { Video } from "../models/index.js";
import {
  ApiError,
  ApiResponse,
  asyncHandler,
  deleteFileFromCloudinary,
  uploadFileOnCloudinary,
} from "../utils/index.js";

//! get all video based on criteria
const getAllVideos = asyncHandler(async (req, res) => {
  const {
    page = 1, // page number
    limit = 3, // limit for single page
    query, // filter or keyword to search
    sortBy, // sort by given field
    sortType, // asc or desc
    userId = req.user._id, // user id
  } = req.query;

  // validate userID
  if (userId && !mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(400, "Invalid UserID");
  }

  // setup skip variable for skip number of pages
  const itemsPerPage = parseInt(limit);
  const numOfPage = parseInt(page);
  const skip = (numOfPage - 1) * itemsPerPage;

  // setup order of the videos
  const sortField = sortBy || "createdAt"; // default createdAt
  const sortOrder = sortType === "desc" ? -1 : 1; // default ascending
  const sort = {
    [sortField]: sortOrder,
  };

  // setup query for search based on value
  const filter = {
    owner: userId,
    ...(query && {
      $or: [
        { title: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
      ],
    }),
  };

  // fetch videos based on given criteria
  const videos = await Video.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(itemsPerPage);

  // count total videos
  const totalVideos = await Video.countDocuments(filter);

  // return result
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        meta: {
          total: totalVideos,
          page: numOfPage,
          limit: itemsPerPage,
          totalPages: Math.ceil(totalVideos / itemsPerPage),
        },
        videos,
      },
      "video fetch successfully!!"
    )
  );
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
  if (videoId && !mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid Video ID");
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
  if (videoId && !mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid Video ID");
  }
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
    .json(new ApiResponse(200, result, "video update successfully"));
});

//! update video details by its id
const updateVideoThumbnail = asyncHandler(async (req, res) => {
  // getting video detail
  const { videoId } = req.params;
  const thumbnailLocalPath = req.file?.path;

  // validate incoming details
  if (videoId && !mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid Video ID");
  }
  if (!thumbnailLocalPath) {
    throw new ApiError(400, "thumbnail local path not found");
  }

  // upload new thumbnail on cloudinary
  const thumbnail = await uploadFileOnCloudinary(thumbnailLocalPath, "image");
  if (!thumbnail?.url) {
    throw new ApiError("error while uploading thumbnail");
  }

  // old video thumbnail
  const oldVideo = await Video.findById(videoId);
  if (!oldVideo) {
    throw new ApiError(500, "error while getting video");
  }

  // update thumbnail
  const video = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        thumbnail: thumbnail.url,
      },
    },
    {
      new: true,
    }
  );
  if (!video) {
    throw new ApiError(500, "error while uploading thumbnail");
  }

  // deleting old image
  if (oldVideo.thumbnail !== video.thumbnail) {
    const deleteThumbnail = await deleteFileFromCloudinary(
      oldVideo.thumbnail,
      "image"
    );
    if (deleteThumbnail.result !== "ok") {
      throw new ApiError(500, "error while deleting file from cloudinary");
    }
  }

  // returning response
  return res
    .status(200)
    .json(
      new ApiResponse(200, video.thumbnail, "thumbnail updated successfully")
    );
});

//! delete video by its id
const deleteVideo = asyncHandler(async (req, res) => {
  // get video id
  const { videoId } = req.params;

  // validate video id
  if (videoId && !mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid Video ID");
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
  if (videoId && !mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid Video ID");
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
