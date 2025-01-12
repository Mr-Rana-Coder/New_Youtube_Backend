import { Router } from "express";
import {jwtVerify} from "../middlewares/auth.middleware.js"
import {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
} from "../controllers/subscription.controller.js"

const router = Router();

router.use(jwtVerify)

router
    .route("/c/:channelId")
    .post(toggleSubscription)
    .get(getUserChannelSubscribers);

router.route("/c/:subscriberId").get(getSubscribedChannels);

export { router };