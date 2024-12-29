import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
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

export { userRouter };
