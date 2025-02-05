import { Router } from "express";
import { upload, verifyJWT } from "../middlewares/index.js";
import {
  getAllVideos,
  publishVideo,
  getVideoById,
  deleteVideo,
  updateVideoDetails,
  updateVideoThumbnail,
  togglePublishStatus,
} from "../controllers/index.js";

// creating video route
const videoRouter = Router();

//! make all routes secure
videoRouter.use(verifyJWT);

videoRouter.route("/").get(getAllVideos);
videoRouter.route("/publish-video").post(
  // call middleware to upload file on local
  upload.fields([
    { name: "videoFile", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  publishVideo
);
videoRouter
  .route("/:videoId")
  .get(getVideoById)
  .delete(deleteVideo)
  .patch(updateVideoDetails);
videoRouter
  .route("/update-thumbnail/:videoId")
  .patch(upload.single("thumbnail"), updateVideoThumbnail);
videoRouter.route("/toggle/publish/:videoId").patch(togglePublishStatus);
export { videoRouter };
