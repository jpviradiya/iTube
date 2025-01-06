import { Router } from "express";
import { verifyJWT } from "../middlewares/index.js";
import {
  getVideoComments,
  addComment,
  updateComment,
  deleteComment,
} from "../controllers/index.js";

// creating comment route
const commentRouter = Router();

//! securing all routes
commentRouter.use(verifyJWT);

commentRouter.route("/:videoId").get(getVideoComments).post(addComment);
commentRouter
  .route("/:videoId/:commentId")
  .delete(deleteComment)
  .patch(updateComment);

export { commentRouter };
