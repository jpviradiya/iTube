import { isValidObjectId } from "mongoose";
import { Subscription } from "../models/subscription.model.js";
import { ApiError, ApiResponse, asyncHandler } from "../utils/index.js";

//! toggle subscription for the user
const toggleSubscription = asyncHandler(async (req, res) => {
  // incoming channel id
  const { channelId } = req.params;

  // verify object id
  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "invalid channel id");
  }

  // find if channel is already subscribed or not
  const result = await Subscription.findOne({
    channel: channelId,
    subscriber: req.user._id,
  });

  // if sub then delete document
  if (result) {
    await Subscription.deleteOne(result._id);
    return res.status(200).json(
      new ApiResponse(200, {
        message: "unsubscribe to channel",
        action: "unsubscribe",
      })
    );
  }
  // else create document
  else {
    await Subscription.create({
      channel: channelId,
      subscriber: req.user._id,
    });
    return res.status(200).json(
      new ApiResponse(200, {
        message: "subscribe to channel",
        action: "subscribe",
      })
    );
  }
});

//! controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  // fetch subscriber for current user
  const subscribers = await Subscription.find({
    channel: req.user._id,
  })
    .populate("channel", "fullName")
    .populate("subscriber", "fullName");

  // if length is 0 then no record exists
  if (subscribers.length === 0) {
    throw new ApiError(500, "no subscriber found for this channel");
  }

  // count the subscriber
  const countSubscriber = await Subscription.countDocuments({
    channel: req.user._id,
  });

  // return response
  return res
    .status(200)
    .json(
      new ApiResponse(
        20,
        { countSubscriber, subscribers },
        "subscriber fetch succesfully"
      )
    );
});

//! controller to return channel list to which user has subscribed
const getUserSubscribedChannels = asyncHandler(async (req, res) => {

  // fetch channels for current user to whom he subscribe
  const channels = await Subscription.find({
    subscriber: req.user._id,
  })
    .populate("channel", "fullName")
    .populate("subscriber", "fullName");

    // if length is 0 then no record is found
  if (channels.length === 0) {
    throw new ApiError(500, "no channel found for this subscriber");
  }

  // count the no of channel to which user subscribe
  const countChannel = await Subscription.countDocuments({
    subscriber: req.user._id,
  });

  // return response
  return res
    .status(200)
    .json(
      new ApiResponse(
        20,
        { countChannel, channels },
        "channel fetch succesfully"
      )
    );
});

export {
  toggleSubscription,
  getUserChannelSubscribers,
  getUserSubscribedChannels,
};
