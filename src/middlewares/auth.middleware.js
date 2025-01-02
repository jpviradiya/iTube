import { asyncHandler, ApiError } from "../utils/index.js";
import jwt from "jsonwebtoken";
import { User } from "../models/index.js";

export const verifyJWT = asyncHandler(async (req, _, next) => {
  try {
    // get cookie detail
    const token = req.cookies?.accessToken;

    // check if token is present
    if (!token) {
      throw new ApiError(401, "Unauthorized access while logout");
    }

    // verify token
    // decoded object has info of _id, usename, email, fullName
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // check for user exists
    const user = await User.findById(decoded?._id).select(
      "-password -refreshToken"
    );
    if (!user) {
      throw new ApiError(401, "invalid user access token");
    }

    // adding user object to request
    req.user = user;

    // calling nect function
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid user access");
  }
});
