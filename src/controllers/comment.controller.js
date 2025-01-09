import mongoose from "mongoose"
import { Comment } from "../models/comment.model.js"
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if (!videoId) {
        throw new ApiError(400, "Video id is required")
    }
    if (!mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "Video id is invalid")
    }
    const { page = 1, limit = 10 } = req.query

    if (page <= 0) {
        throw new ApiError(400, "Page must be greater than 0")
    }
    if (limit<=0) {
        throw new ApiError(400, "limit must be greater than 0")
    }

    const pageInt = parseInt(page, 10)
    const limitInt = parseInt(limit, 10)

    const skip = (pageInt - 1) * limitInt

    const allComments = await Comment.find({ videos: videoId })
        .skip(skip)
        .limit(limit)
        .sort({createdAt:-1})

    if (!allComments || allComments.length === 0) {
        throw new ApiError(404, "No comment found")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, allComments, "All comments fetched successfully"))
})

const addComment = asyncHandler(async (req, res) => {
    const { content } = req.body
    const { videoId } = req.params
    if (!content) {
        throw new ApiError(400, "Content is required")
    }
    if (!videoId) {
        throw new ApiError(400, "Video id is required")
    }
    if (!mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "Video id is invalid")
    }

    if (!req.user?._id) {
        throw new ApiError(400, "User is not authenticated")
    }

    const newComment = await Comment.create({
        content: content,
        videos: videoId,
        owner: req.user?._id
    })
    if (!newComment) {
        throw new ApiError("Unable to add comment")
    }

    return res
        .status(201)
        .json(new ApiResponse(201, newComment, "Comment added successfully"))
})

const updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params
    const { content } = req.body
    if (!commentId) {
        throw new ApiError(400, "Comment id is missing")
    }
    if (!mongoose.isValidObjectId(commentId)) {
        throw new ApiError(400, "Comment id is invalid")
    }
    if (!content) {
        throw new ApiError(400, "Content field cannot be empty")
    }
    const updatedComment = await Comment.findByIdAndUpdate(commentId, { content: content }, { new: true })
    if (!updatedComment) {
        throw new ApiError(404, "Comment not found")
    }
    return res
        .status(200)
        .json(new ApiResponse(200, updatedComment, "Comment updated successfully"))

})

const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params
    if (!commentId) {
        throw new ApiError(400, "Comment id is missing")
    }
    if (!mongoose.isValidObjectId(commentId)) {
        throw new ApiError(400, "Comment id is invalid")
    }
    const deletedComment = await Comment.findByIdAndDelete(commentId)
    if (!deletedComment) {
        throw new ApiError(404, "No comment found")
    }
    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Comment deleted successfully"))
})

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}