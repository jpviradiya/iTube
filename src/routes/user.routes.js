import { Router } from "express";
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
} from "../controllers/index.js";
import { upload, verifyJWT } from "../middlewares/index.js";

const userRouter = Router();
// userRouter.route("/route").post(middleware, controller);

//! public routes
userRouter.route("/register").post(
  // call middleware to upload file on local
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImg", maxCount: 1 },
  ]),
  // call controller function to register user
  registerUser
);
userRouter.route("/login").post(loginUser);

//! secured routes
userRouter.route("/logout").post(verifyJWT, logoutUser);
userRouter.route("/refresh-token").post(refreshAccessToken);
userRouter.route("/change-password").post(verifyJWT, changeCurrentPassword);
userRouter.route("/current-user").get(verifyJWT, getCurrentUser);
userRouter.route("/update-account").patch(verifyJWT, updateAccountDetails);
userRouter
  .route("/update-avatar")
  .patch(verifyJWT, upload.single("avatar"), updateUserAvatar);
userRouter
  .route("/update-cover-image")
  .patch(verifyJWT, upload.single("coverImg"), updateUserCoverImg);
userRouter.route("/channel/:username").get(verifyJWT, getUserChanneProfile);
userRouter.route("/history").get(verifyJWT, getWatchHistroy);

export { userRouter };
