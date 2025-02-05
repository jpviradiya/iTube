import { Router } from "express";
import { verifyJWT } from "../middlewares/index.js";
import {
  getLikedVideos,
  toggleVideoLike,
  toggleCommentLike,
  toggleTweetLike,
} from "../controllers/index.js";
const likeRouter = Router();

//! securing all routes
likeRouter.use(verifyJWT);

likeRouter.route("/video").get(getLikedVideos);
likeRouter.route("/toggle/video/:videoId").post(toggleVideoLike);
likeRouter.route("/toggle/comment/:commentId").post(toggleCommentLike);
likeRouter.route("/toggle/tweet/:tweetId").post(toggleTweetLike);

export { likeRouter };
