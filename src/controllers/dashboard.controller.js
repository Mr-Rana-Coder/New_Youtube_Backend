import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Video } from "../models/video.model.js";
import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import { Like } from "../models/like.model.js";

const getChannelStats = asyncHandler(async (req, res) => {
    const userId = req.user?._id
    if (!userId) {
        throw new ApiError(400, "User is not authenticated")
    }
    if (!mongoose.isValidObjectId(userId)) {
        throw new ApiError(400, "User id is invalid")
    }
    const videoViewsResult = await Video.aggregate([
        { $match: { owner: new mongoose.Types.ObjectId(userId) } },
        { $group: { _id: null, totalViews: { $sum: "$views" } } }
    ]);

    const totalVideoViews = videoViewsResult.length > 0 ? videoViewsResult[0].totalViews : 0;

    const subscribersResult = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(userId)
            }
        }, {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        }, {
            $project: {
                subscribersCount: { $size: "$subscribers" }
            }
        }
    ])
    const totalSubscribers = subscribersResult.length > 0 ? subscribersResult[0].subscribersCount : 0;

    const totalVideos = await Video.countDocuments({ owner: userId })
    const totalLikes = await Like.countDocuments({ likedBy: userId })

    return res
        .status(200)
        .json(new ApiResponse(200, {
            totalVideoViews: totalVideoViews,
            totalSubscribers: totalSubscribers,
            totalVideos: totalVideos,
            totalLikes: totalLikes
        }, "All channel stats fetched successfully"))
})

const getChannelVideos = asyncHandler(async (req, res) => {
    const userId = req.user?._id
    if (!userId) {
        throw new ApiError(400, "User is not authenticated")
    }
    if (!mongoose.isValidObjectId(userId)) {
        throw new ApiError(400, "User id is invalid")
    }
    const channelVideos = await Video.find({ owner: userId }).sort({ createdAt: -1 }).select("-videoPublicId -thumbnailPublicId")
    if (!channelVideos || channelVideos.length === 0) {
        return res
            .status(200)
            .json(new ApiResponse(200, [], "Zero videos"))
    }
    return res
        .status(200)
        .json(new ApiResponse(200, channelVideos, "Videos fetched successfully"))
})

export {
    getChannelStats,
    getChannelVideos
}