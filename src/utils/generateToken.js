import { ApiError } from "./index.js";
import { User } from "../models/index.js";
const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);

    // generate access token
    const accessToken = user.generateAccessToken();

    // generate refresh token
    const refreshToken = user.generateRefreshToken();

    // update refresh token in database
    user.refreshToken = refreshToken;

    await user.save({ validateBeforeSave: false }); // allow to save without validation for password field

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Token generation failed");
  }
};
export { generateAccessAndRefreshToken };
