import { jwtVerify } from "../middlewares/auth.middleware.js";
import {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
} from "../controllers/comment.controller.js"
import { Router } from "express";

const router = Router();
router.use(jwtVerify)

router.route("/:videoId").get(getVideoComments).post(addComment);
router.route("/c/:commentId").delete(deleteComment).patch(updateComment);

export { router }