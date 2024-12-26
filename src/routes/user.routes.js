import { Router } from "express";
import { registerUser } from "../controllers/index.js";
import { upload } from "../middlewares/index.js";

const userRouter = Router();
// userRouter.route("/register").post(middleware, controller);
userRouter.route("/register").post(
  // call middleware function to upload file on local
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImg", maxCount: 1 },
  ]),
  // call controller function to register user
  registerUser
);

export { userRouter };
