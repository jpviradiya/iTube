import { Router } from "express";
import { verifyJWT } from "../middlewares/index.js";
import {
  getUserSubscribedChannels,
  getUserChannelSubscribers,
  toggleSubscription,
} from "../controllers/index.js";

const subscriptionRouter = Router();

//! securing all routes
subscriptionRouter.use(verifyJWT);

subscriptionRouter.route("/channel/:channelId").post(toggleSubscription);
subscriptionRouter.route("/channel").get(getUserSubscribedChannels);
subscriptionRouter.route("/user").get(getUserChannelSubscribers);

export { subscriptionRouter };
