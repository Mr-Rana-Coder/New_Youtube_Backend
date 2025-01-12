import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Tweet } from "../models/tweet.model.js";
import mongoose, { isValidObjectId } from "mongoose";

const createTweet = asyncHandler(async (req, res) => {
    const { content } = req.body

    if (!content) {
        throw new ApiError(400, "Content is required")
    }

    const userId = req.user?._id

    if (!userId) {
        throw new ApiError(400, "User is not authenticated")
    }

    const tweet = await Tweet.create({
        content: content,
        owner: userId
    })

    if (!tweet) {
        throw new ApiError(400, "Unable to create a tweet")
    }

    return res
        .status(201)
        .json(new ApiResponse(201, tweet, "Tweet created successfully"))
})

const getUserTweets = asyncHandler(async (req, res) => {
    const userId = req.user?._id

    if (!userId) {
        throw new ApiError(400, "User is not autheticated")
    }

    const userTweets = await Tweet.find({ owner: userId })
    if (userTweets.length === 0) {
        return res
            .status(200)
            .json(new ApiResponse(200, [], "No tweets exsist for this user"))
    }

    return res
        .status(200)
        .json(new ApiResponse(200, userTweets, "Tweets fetched successfully"))
})

const updateTweet = asyncHandler(async (req, res) => {
    const { content } = req.body
    if (!content || content.trim() === "") {
        throw new ApiError(400, "Content is required for updation")
    }
    const { tweetId } = req.params
    if (!tweetId) {
        throw new ApiError(400, "Tweet id is required")
    }

    if (!mongoose.isValidObjectId(tweetId)) {
        throw new ApiError(400, "Tweet id is invalid")
    }

    const updatedTweet = await Tweet.findByIdAndUpdate(tweetId, { content: content }, { new: true })

    if (!updatedTweet) {
        throw new ApiError(404, "Tweet not found")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, updatedTweet, "Tweet updated successfully"))
})

const deleteTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params
    if (!tweetId) {
        throw new ApiError(400, "Tweet id is required")
    }

    if (!mongoose.isValidObjectId(tweetId)) {
        throw new ApiError(400, "Tweet id is invalid")
    }

    const deletedTweet = await Tweet.findByIdAndDelete(tweetId)
    if (!deletedTweet) {
        throw new ApiError(404, "Tweet not found")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Tweet deleted successfully"))
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}