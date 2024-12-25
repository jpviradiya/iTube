import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";
import { upload } from "./../middlewares/multer.middleware.js";
const userRouter = Router();

// userRouter.route("/register").post(middleware, controller);
userRouter.route("/register").post(
  // call middleware function to upload file on local
  upload.fields([
    {
      name: "avatar", // name of the field in form
      maxCount: 1,
    },
    {
      name: "coverImg", // name of the field in form
      maxCount: 1,
    },
  ]),
  // call controller function to register user
  registerUser
); 

export default userRouter;