import { Router } from "express";
import { verifyJWT } from "./../middlewares/index.js";
import {
  createTweet,
  deleteTweet,
  getUserTweets,
  updateTweet,
} from "../controllers/index.js";

const tweetRouter = Router();

tweetRouter.use(verifyJWT); //securing all routes
tweetRouter.route("/user/:userId").get(getUserTweets).post(createTweet);
tweetRouter.route("/:tweetId").patch(updateTweet).delete(deleteTweet);

export { tweetRouter };
