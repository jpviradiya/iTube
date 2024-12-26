import { User } from "../models/index.js";
import {
  asyncHandler,
  ApiResponse,
  ApiError,
  uploadFileOnCloudinary,
} from "../utils/index.js";
// user register function
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
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
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

export { registerUser };
