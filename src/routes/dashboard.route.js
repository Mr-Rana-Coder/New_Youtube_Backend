import { jwtVerify } from "../middlewares/auth.middleware.js";
import { Router } from "express";
import { getChannelStats, getChannelVideos } from "../controllers/dashboard.controller.js";

const router = Router();
router.use(jwtVerify)

router.route("/stats").get(getChannelStats)
router.route("/videos").get(getChannelVideos)

export {
    router
}