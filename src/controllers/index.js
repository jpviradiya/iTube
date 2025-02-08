import {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImg,
  getUserChanneProfile,
  getWatchHistroy,
} from "./user.controller.js";

import {
  getAllVideos,
  publishVideo,
  getVideoById,
  updateVideoDetails,
  updateVideoThumbnail,
  deleteVideo,
  togglePublishStatus,
} from "./video.controller.js";

import {
  getVideoComments,
  addComment,
  updateComment,
  deleteComment,
} from "./comment.controller.js";

import {
  toggleCommentLike,
  toggleTweetLike,
  toggleVideoLike,
  getLikedVideos,
} from "./like.controller.js";

import {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
} from "./playlist.controller.js";

import {
  toggleSubscription,
  getUserChannelSubscribers,
  getUserSubscribedChannels,
} from "./subscription.controller.js";

import {
  createTweet,
  getUserTweets,
  updateTweet,
  deleteTweet,
} from "./tweet.controller.js";

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImg,
  getUserChanneProfile,
  getWatchHistroy,
  getAllVideos,
  publishVideo,
  getVideoById,
  updateVideoDetails,
  updateVideoThumbnail,
  deleteVideo,
  togglePublishStatus,
  getVideoComments,
  addComment,
  updateComment,
  deleteComment,
  toggleCommentLike,
  toggleTweetLike,
  toggleVideoLike,
  getLikedVideos,
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
  toggleSubscription,
  getUserChannelSubscribers,
  getUserSubscribedChannels,
  createTweet,
  getUserTweets,
  updateTweet,
  deleteTweet,
};
