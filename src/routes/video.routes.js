import { Router } from "express";
import { upload, verifyJWT } from "../middlewares/index.js";
import { publishVideo } from "../controllers/index.js";

// creating video route
const videoRoute = Router();

//! make all routes secure 
videoRoute.use(verifyJWT);
videoRoute.route("/publish-video").post(
  // call middleware to upload file on local
  upload.fields([
    { name: "videoFile", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  publishVideo
);

export { videoRoute };
