import { Router } from "express";
import {
    registerUser, loginUser, logoutUser, refereshAccessToken, updatePassword,
    getCurrentUser, updateAccountDetails, updateUserAvatar, updateUserCoverImage,
    getUserChannelProfile, getWatchHistory
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { jwtVerify } from "../middlewares/auth.middleware.js"

const router = Router()

router.route("/register").post(
    upload.fields([{
        name: "avatar",
        maxCount: 1
    },
    {
        name: "coverImage",
        maxCount: 1
    }]),
    registerUser);

router.route("/login").post(loginUser)

router.route("/logout").post(jwtVerify, logoutUser)

router.route("/refresh-token").post(refereshAccessToken)

router.route("/change-password").post(jwtVerify, updatePassword)

router.route("/current-user").get(jwtVerify, getCurrentUser)

router.route("/update-account").patch(jwtVerify, updateAccountDetails)

router.route("/update-avatar").patch(jwtVerify, upload.single("avatar"), updateUserAvatar)

router.route("/update-coverImage").patch(jwtVerify, upload.single("coverImage"), updateUserCoverImage) //check this

router.route("/c/:userName/channel-profile").get(jwtVerify, getUserChannelProfile) // also check this

router.route("/channel-watchHistory").get(jwtVerify, getWatchHistory)

export { router };                                  