import { Router } from "express";
import { jwtVerify } from "../middlewares/auth.middleware.js";
import {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
} from "../controllers/playlist.controller.js";

const router = Router();
router.use(jwtVerify)

router.route("/create-playlist").post(createPlaylist)
router.route("/user-playlist").get(getUserPlaylists)
router
    .route("/c/:playlistId")
    .get(getPlaylistById)
    .patch(updatePlaylist)
    .delete(deletePlaylist)
router.route("/c/add/:videoId/:playlistId").patch(addVideoToPlaylist)
router.route("/c/remove/:videoId/:playlistId").patch(removeVideoFromPlaylist)

export {router}