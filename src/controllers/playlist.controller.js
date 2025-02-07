import { isValidObjectId } from "mongoose";
import { Playlist } from "../models/index.js";
import { ApiError, ApiResponse, asyncHandler } from "../utils/index.js";

//! creating playlist
const createPlaylist = asyncHandler(async (req, res) => {
  // incoming details
  const { name, description } = req.body;

  // verify details
  if (!name && !description) {
    throw new ApiError(
      400,
      "both name and description is require to create playlist"
    );
  }

  // create playlist
  const create = await Playlist.create({
    name,
    description,
    owner: req.user._id,
  });

  // check for document creation
  if (!create) {
    throw new ApiError(500, "error while creating playlist");
  }

  // return response
  return res
    .status(200)
    .json(new ApiResponse(200, create, "playlist created successfully"));
});

//! get user playlist based on user id
const getUserPlaylists = asyncHandler(async (req, res) => {
  // incoming details
  const { userId } = req.params;

  // verify user id
  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "invalid user id");
  }

  // fetching playlist based on user id
  const result = await Playlist.find({ owner: userId }).populate(
    "owner",
    "username"
  );

  // check response is valid or not
  if (!result) {
    throw new ApiError(500, "no playlist found");
  }

  // return response
  return res
    .status(200)
    .json(new ApiResponse(200, result, "playlist fetch successfully"));
});

//! get playlist based on id
const getPlaylistById = asyncHandler(async (req, res) => {
  // incoming data
  const { playlistId } = req.params;

  // validate object id
  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "invalid playlist object id");
  }

  // fetch playlist based on id
  const result = await Playlist.findById(playlistId).populate(
    "owner",
    "username"
  );

  // verify result
  if (!result) {
    throw new ApiError(500, "no playlist found");
  }

  // return response
  return res
    .status(200)
    .json(new ApiResponse(200, result, "playlist fetch succesfully"));
});

//! update playlist detail
const updatePlaylist = asyncHandler(async (req, res) => {
  // incoming data
  const { playlistId } = req.params;
  const { name, description } = req.body;

  // validate incoming data
  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "invalid playlist object id");
  }
  if (!name && !description) {
    throw new ApiError(400, "at least one is require to update details");
  }

  // update details
  const updatedPlaylist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $set: {
        ...(name && { name }),
        ...(description && { description }),
      },
    },
    { new: true }
  );

  // verify result
  if (!updatedPlaylist) {
    throw new ApiError(500, "error while updating playlist details");
  }

  // return response
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedPlaylist,
        "playlist details updated successfully"
      )
    );
});

//! delete playlist based on id
const deletePlaylist = asyncHandler(async (req, res) => {
  // incoming data
  const { playlistId } = req.params;

  // validate object id
  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "invalid object id");
  }

  // delete playlist based on id
  const result = await Playlist.findByIdAndDelete(playlistId);

  // check for deletion
  if (!result) {
    throw new ApiError(500, "error while deletion of playlist");
  }

  // return response
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "playlist delete siccessfully"));
});

//! adding video to playlist
const addVideoToPlaylist = asyncHandler(async (req, res) => {
  // incoming data
  const { playlistId, videoId } = req.params;

  // verify object ids
  if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
    throw new ApiError(400, "invalid playlist or video object id");
  }

  // adding video to the existing playlist
  const addedvideo = await Playlist.updateOne(
    { _id: playlistId },
    { $addToSet: { videos: videoId } }
  );

  // check for insertion
  if (!addedvideo) {
    throw new ApiError(500, "error while adding video to playlist");
  }

  // return response
  return res
    .status(200)
    .json(
      new ApiResponse(200, addedvideo, "video added to playlist successfully")
    );
});

//! delete video from playlist
const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  // incoming data
  const { playlistId, videoId } = req.params;

  // verify object ids
  if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
    throw new ApiError(400, "invalid playlist or video object id");
  }

  // deleting video to the existing playlist
  const deletedvideo = await Playlist.updateOne(
    { _id: playlistId },
    { $pull: { videos: videoId } }
  );

  // check for insertion
  if (!deletedvideo) {
    throw new ApiError(500, "error while deleting video from playlist");
  }

  // return response
  return res
    .status(200)
    .json(
      new ApiResponse(200, deletedvideo, "video deleted from playlist successfully")
    );
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
