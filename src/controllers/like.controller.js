import mongoose from "mongoose"
import { Like } from "../models/like.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const userId = req.user?._id
    if (!userId) {
        throw new ApiError(400, "User is not authenticated")
    }

    if (!mongoose.isValidObjectId(userId)) {
        throw new ApiError(400, "User id is not valid")
    }

    if (!videoId) {
        throw new ApiError(400, "Video id is missing")
    }

    if (!mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "Video id is invalid")
    }

    const isVideoLiked = await Like.findOne({ video: videoId, likedBy: userId })

    if (isVideoLiked) {
        const deletedLike = await Like.findOneAndDelete({ video: videoId, likedBy: userId })
        if (!deletedLike) {
            throw new ApiError(400, "Unable to unlike the video")
        }
        return res
            .status(200)
            .json(new ApiResponse(200, {}, "Video unliked successfully "))
    } else {
        const newLike = await Like.create({ video: videoId, likedBy: userId })
        if (!newLike) {
            throw new ApiError(400, "Unable to like the video")
        }
        return res
            .status(200)
            .json(new ApiResponse(200, {}, "Video liked successfully "))
    }
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params
    const userId = req.user?._id
    if (!userId) {
        throw new ApiError(400, "User is not authenticated")
    }

    if (!mongoose.isValidObjectId(userId)) {
        throw new ApiError(400, "User id is not valid")
    }

    if (!commentId) {
        throw new ApiError(400, "Comment id is missing")
    }

    if (!mongoose.isValidObjectId(commentId)) {
        throw new ApiError(400, "comment id is invalid")
    }

    const isCommentLiked = await Like.findOne({ comment: commentId, likedBy: userId })

    if (isCommentLiked) {
        const deletedComment = await Like.findOneAndDelete({ comment: commentId, likedBy: userId })
        if (!deletedComment) {
            throw new ApiError(400, "Unable to unlike the comment")
        }
        return res
            .status(200)
            .json(new ApiResponse(200, {}, "Comment unliked successfully "))
    } else {
        const newLike = await Like.create({ comment: commentId, likedBy: userId })
        if (!newLike) {
            throw new ApiError(400, "Unable to like the comment")
        }
        return res
            .status(200)
            .json(new ApiResponse(200, {}, "Comment liked successfully "))
    }

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params
    const userId = req.user?._id
    if (!userId) {
        throw new ApiError(400, "User is not authenticated")
    }

    if (!mongoose.isValidObjectId(userId)) {
        throw new ApiError(400, "User id is not valid")
    }

    if (!tweetId) {
        throw new ApiError(400, "Tweet id is missing")
    }

    if (!mongoose.isValidObjectId(tweetId)) {
        throw new ApiError(400, "Tweet id is invalid")
    }

    const isTweetLiked = await Like.findOne({ tweet: tweetId, likedBy: userId })
    if (isTweetLiked) {
        const deletedTweet = await Like.findOneAndDelete({ tweet: tweetId, likedBy: userId })
        if (!deletedTweet) {
            throw new ApiError(400, "Unable to unlike the Tweet")
        }
        return res
            .status(200)
            .json(new ApiResponse(200, {}, "Tweet unliked successfully "))
    }
    else {
        const newLike = await Like.create({ tweet: tweetId, likedBy: userId })
        if (!newLike) {
            throw new ApiError(400, "Unable to like the Tweet")
        }
        return res
            .status(200)
            .json(new ApiResponse(200, {}, "Tweet liked successfully "))
    }

})

const getLikedVideos = asyncHandler(async (req, res) => {
    const userId = req.user?._id
    if(!userId){
        throw new ApiError(400,"user is not authenticated")
    }
    if(!mongoose.isValidObjectId(userId)){
        throw new ApiError(400,"User id is invalid")
    }

    const likedVideos = await Like.find({ likedBy: userId, video: { $exists: true, $ne: null } })
    .select("video")//$ne : checks field is not null 

    if(!likedVideos||likedVideos.length === 0){
        return res
        .status(200)
        .json(new ApiResponse(200,{},"No liked Videos Found"))
    }

    return res
    .status(200)
    .json(new ApiResponse(200,likedVideos,"Liked Videos Fetched successfully"))
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}