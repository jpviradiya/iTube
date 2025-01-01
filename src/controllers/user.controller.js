import mongoose from "mongoose";
import { COOKIE_OPTION } from "../constants.js";
import { User } from "../models/index.js";
import {
  asyncHandler,
  ApiResponse,
  ApiError,
  uploadFileOnCloudinary,
  deleteFileFromCloudinary,
  generateAccessAndRefreshToken,
} from "../utils/index.js";
import jwt from "jsonwebtoken";

//! user register function
const registerUser = asyncHandler(async (req, res) => {
  //! steps to register user
  /*
  1. get user detail from frontend
  2. validate user detail
  3. check for user already exists (email, username)
  4. check for files(avatar require)
  5. upload files on cloudinary (avatar require)
  6. create user object
  7. check for user creation
  8. remove password and refreshToken from response
  9. return response
  */

  // req.body gives the data while making the request to the server (POST, PUT, PATCH, DELETE)
  // req.files gives the files using multer on request to server(POST, PUT, PATCH, DELETE)

  // 1. getting user details
  const { fullName, email, password, username } = req.body;

  // 2. validating user details
  if (
    [fullName, email, password, username].some(
      (field) => !field || field.trim() === ""
    ) // if any field is empty or undefined, return true
  ) {
    throw new ApiError(400, "All fields are required");
  }

  // 3. check for user already exists or not
  const userExsistance = await User.findOne({
    $or: [{ email }, { username }],
  });
  if (userExsistance) {
    throw new ApiError(409, "User already exists");
  }

  // 4. check for files & 5. upload files on cloudinary

  // for avatar
  const avatarLPath = req.files?.avatar[0]?.path; // if there is files -> if there is avatar -> if there is path = then give path
  if (!avatarLPath) {
    throw new ApiError(400, "Avatar is required");
  }
  const avatar = await uploadFileOnCloudinary(avatarLPath);
  if (!avatar) {
    throw new ApiError(400, "Avatar is Required while uploading on cloudinary");
  }

  // for coverImg
  let coverImgLPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImg) &&
    req.files.coverImg.length > 0
  ) {
    coverImgLPath = req.files.coverImg[0].path;
  }
  const coverImg = await uploadFileOnCloudinary(coverImgLPath);

  // 6. create user object
  const user = await User.create({
    username: username.toLowerCase(),
    email,
    password,
    fullName,
    avatar: avatar.url,
    coverImg: coverImg?.url || "", // if converImg is there then select url else ""
  });

  // 7. check for user creation
  const createdUser = await User.findOne(user._id).select(
    // 8. remove password and refreshToken from response
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "User not created");
  }

  // 9. return response
  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User created"));
});

//! user login function
const loginUser = asyncHandler(async (req, res) => {
  //! steps to login user
  /*
  1. get user details
  2. username or email is required
  3. check for user exists
  4. check for password is correct
  5. generate token
  6. return response in cookies
  */

  //  1. get user details
  const { email, password } = req.body;

  // 2. username or email is required
  if (!email) {
    throw new ApiError(400, "Email is required");
  }

  // 3. check for user exists
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // 4. check for password is correct
  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid password");
  }

  // 5. generate token
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  // Remove sensitive fields before sending response
  const { password: _, refreshToken: __, ...userDetails } = user.toObject();
  // convert into object and remove password and refreshToken
  // with diffrent variable name _ and __

  // 6. return response in cookies
  return res
    .status(200)
    .cookie("accessToken", accessToken, COOKIE_OPTION)
    .cookie("refreshToken", refreshToken, COOKIE_OPTION)
    .json(
      new ApiResponse(
        200,
        {
          user: userDetails,
          accessToken,
          refreshToken,
        },
        "User logged in successfully"
      )
    );
});

//! user logout function
const logoutUser = asyncHandler(async (req, res) => {
  //! steps to logout user
  /*
  1. get user details from req
  2. clear refreshToken from database
  3. return response with clear cookie
  */

  //* at this point we don't have any thing to fetch details of user
  //* so we use middleware to add user object with req object

  // 1. get user details from req
  const { _id } = req.user;

  // 2. clear refreshToken from database
  await User.findByIdAndUpdate(
    _id,
    {
      // clear the refreshToken  field from document
      $unset: {
        refreshToken: 1, // unset refreshToken with flag
      },
    },
    {
      new: true,
    }
  );

  // 3.. return response with clear cookie
  return res
    .status(200)
    .clearCookie("accessToken", COOKIE_OPTION)
    .clearCookie("refreshToken", COOKIE_OPTION)
    .json(new ApiResponse(200, {}, "User Loggedout Successfully!!"));
});

//! refresh Access token
const refreshAccessToken = asyncHandler(async (req, res) => {
  // fetch refresh token from user
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;
  if (!incomingRefreshToken) {
    throw new ApiError(401, "unauthorized request");
  }

  try {
    // decoded token has _id which is define at the time of creation of token
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken._id);
    if (!user) {
      throw new ApiError(401, "invalid refresh token");
    }

    // match both refresh token
    if (incomingRefreshToken !== user.refreshToken) {
      throw new ApiError(401, "refresh token is expired or userd");
    }

    // generate new access and refresh tokens
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
      user._id
    );

    // sending response
    return res
      .status(200)
      .cookie("accessToken", accessToken, COOKIE_OPTION)
      .cookie("refreshToken", refreshToken, COOKIE_OPTION)
      .json(
        new ApiResponse(
          200,
          {
            accessToken,
            refreshToken,
          },
          "token refresh successfully!!"
        )
      );
  } catch (error) {
    throw new ApiError(
      401,
      error?.message || "error while refreshing new access token"
    );
  }
});

//! change current password
const changeCurrentPassword = asyncHandler(async (req, res) => {
  // getting user details
  const { currentPassword, newPassword } = req.body;

  // check for user
  const user = await User.findById(req.user._id); // auth middleware is use to set user object in request

  // check for password validation
  const isPasswordValid = await user.isPasswordCorrect(currentPassword);
  if (!isPasswordValid) {
    throw new ApiError(
      400,
      "invalid current password while updating new password"
    );
  }

  // setting new password
  user.password = newPassword;

  // save new password by middleware hook pre
  await user.save({ validateBeforeSave: false });

  // return response
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "password update successfully!!"));
});

//! get current user
const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(
      new ApiResponse(200, req.user, "current user data fetched successfully!!")
    );
});

//! update account details
const updateAccountDetails = asyncHandler(async (req, res) => {
  // Define allowed fields for update
  const allowedFields = ["fullName", "username"];

  // Filter the incoming fields to only include allowed fields
  const updates = Object.keys(req.body).reduce((filtered, key) => {
    if (allowedFields.includes(key)) {
      filtered[key] = req.body[key];
    }
    return filtered;
  }, {});

  // Ensure at least one valid field is provided
  if (Object.keys(updates).length === 0) {
    throw new ApiError(400, "No valid fields provided for update");
  }

  // fetch and update user from its id
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: updates,
    },
    {
      new: true,
    }
  ).select("-password");

  // return response
  return res
    .status(200)
    .json(new ApiResponse(200, updates, "All fields are updated successfully"));
});

//! update user avatar
const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLPath = req.file?.path;
  if (!avatarLPath) {
    throw new ApiError(400, "Avatar file is missing");
  }

  // deleting file from cloudinary
  const deleteAvatar = await deleteFileFromCloudinary(req.user.avatar);
  if (deleteAvatar.result !== "ok") {
    throw new ApiError(400, "error while deleting from cloudinary");
  }

  // upload new avatar
  const avatar = await uploadFileOnCloudinary(avatarLPath);
  if (!avatar.url) {
    throw new ApiError(400, "error while uploading avatar on cloudinary");
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    {
      new: true,
    }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user.avatar, "Avatar updated successfully!!"));
});

//! update user cover image
const updateUserCoverImg = asyncHandler(async (req, res) => {
  const coverImgLPath = req.file?.path;
  if (!coverImgLPath) {
    throw new ApiError(400, "cover file is missing");
  }

  // deleting file from cloudinary
  const deleteCoverImg = await deleteFileFromCloudinary(req.user.coverImg);
  if (deleteCoverImg.result !== "ok") {
    throw new ApiError(400, "error while deleting from cloudinary");
  }

  const coverImg = await uploadFileOnCloudinary(coverImgLPath);
  if (!coverImg.url) {
    throw new ApiError(400, "error while uploading avatar on cloudinary");
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        coverImg: coverImg.url,
      },
    },
    {
      new: true,
    }
  ).select("-password");

  return res
    .status(200)
    .json(
      new ApiResponse(200, user.coverImg, "Cover Image updated successfully!!")
    );
});

//! get user's channel profile
const getUserChanneProfile = asyncHandler(async (req, res) => {
  // get username from url
  const { username } = req.params;

  // check for username
  if (!username?.trim()) {
    throw new ApiError(400, "username is missing");
  }

  // aggregation pipeline query(result will return in array data structure)(0th ele of array is ans)
  const channelProfile = await User.aggregate([
    //? pipeline 1 (filter based on username)
    {
      // $match filters the document based on username
      $match: {
        username: username?.toLowerCase(),
      },
    },
    //? pipeline 2 (subscribers for that user)
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    //? pipeline 3 (channel to whom user subscribed)
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo",
      },
    },
    //? pipeline 4 (adding field to response)
    {
      $addFields: {
        subscriberCount: {
          $size: "$subscribers", // $size count num of record
        },
        subscribedToCount: {
          $size: "$subscribedTo",
        },
        isSubscribed: {
          $cond: {
            // if user entry is there in subscribe field then will return true
            // ex. i sub my channel then list of my sub has also name of my
            // ex. i sub to my friend A then subscriber of A has name of mine so if i visit his channel then show true
            if: { $in: [req.user?._id, "$subscribers.subscribe"] }, // search userid in $subscriber(object)
            then: true,
            else: false,
          },
        },
      },
    },
    //? pipeline 5 (projection the document)
    {
      $project: {
        fullName: 1,
        username: 1,
        email: 1,
        subscriberCount: 1,
        subscribedToCount: 1,
        isSubscribed: 1,
        avatar: 1,
        coverImg: 1,
      },
    },
  ]);

  // check for channel profile length
  if (!channelProfile?.length) {
    throw new ApiError(404, "Channel does not exists");
  }

  // return response
  return res.status(200).json(
    new ApiResponse(
      200,
      channelProfile[0], // return the first obj of the response
      "user channel fetched successfully"
    )
  );
});

//!  get watch history (toughest)
const getWatchHistroy = asyncHandler(async (req, res) => {
  // aggregation query to fetch user history
  const userHistory = await User.aggregate([
    //? pipeline 1 (match _id)
    {
      $match: {
        //_id is not direcly work in aggeration (coversion is needed)
        _id: new mongoose.Types.ObjectId(req.user._id),
      },
    },
    //? pipeline 2 (lookup for watchHistory(users) in (videos) )
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
        // fetch onwer data
        pipeline: [
          //?? pipeline 2.1 (lookup for owner(videos) in (users))
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              // project owner data
              pipeline: [
                //??? pipeline 2.1.1 (project the value)
                {
                  $project: {
                    _id: 1,
                    fullName: 1,
                    username: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          //?? pipeline 2.2 (override the owner field and provide first array element which reduce extra loop)
          {
            $addFields: {
              owner: {
                $first: "$owner",
                //$arrayElemAt: ["$owner", 0], (alternate ways)
              },
            },
          },
        ],
      },
    },
  ]);

  // fetch only watch history data from the first object of the answer value
  const userWatchHistroyData = userHistory[0].watchHistory;

  // return response
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        userWatchHistroyData,
        "user watch history fetched successfully!!"
      )
    );
});

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
};
