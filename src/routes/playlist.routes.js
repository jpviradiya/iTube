import { Router } from "express";
import { verifyJWT } from "../middlewares/index.js";
import {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
} from "../controllers/index.js";

const playlistRouter = Router();

//! securing all routes
playlistRouter.use(verifyJWT);

playlistRouter.route("/create").post(createPlaylist);
playlistRouter.route("/user/:userId").get(getUserPlaylists);
playlistRouter
  .route("/:playlistId")
  .get(getPlaylistById)
  .patch(updatePlaylist)
  .delete(deletePlaylist);
playlistRouter.route("/add/:playlistId/:videoId").patch(addVideoToPlaylist);
playlistRouter
  .route("/remove/:playlistId/:videoId")
  .patch(removeVideoFromPlaylist);

export { playlistRouter };
