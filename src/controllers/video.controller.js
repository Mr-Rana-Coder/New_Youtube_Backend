import { uploadOnCloudinary, destroyFromCloudinary } from "../utils/cloudinary.js";
import { Video } from "../models/video.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import mongoose, {isValidObjectId} from "mongoose"

const getAllVideos = asyncHandler(async (req, res) => {

    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query

    if (!sortBy || !sortType || !userId) {
        throw new ApiError(400, "sortBy, sortType, and userId are Required")
    }

    const pageInt = parseInt(page, 10);
    const limitInt = parseInt(limit, 10);
    const sortDirection = sortType.toLowerCase() === "asc" ? 1 : -1;

    const videos = await Video.aggregate([
        {
            $match: {
                isPublished: true,
                ...(userId ? { owner: new mongoose.Types.ObjectId(userId) } : {})
            }
        },
        {
            $sort: {
                [sortBy]: sortDirection,
            }
        },
        {
            $skip: (pageInt - 1) * limitInt,
        },
        {
            $limit: {
                limitInt
            }
        },
        {
            $project: {
                videoPublicId: 0,
                thumbnailPublicId: 0
            }
        }
    ])

    if (!videos) {
        throw new ApiError(400, "Error while fetching the videos from the Model")
    }

    const totalVideos = await Video.countDocuments({
        ...(userId && { owner: new mongoose.Types.ObjectId(userId) }),
        isPublished: true,
    });

    if (totalVideos === 0) {
        throw new ApiError(400, "No videos Found ")
    }

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            { videos, totalVideos },
            "ALl Videos Fetched Successfully"
        ))
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body
    if (!title || !description) {
        throw new ApiError(400, "Title and Description are required")
    }

    const videoFilePath = req.files?.videoFile[0].path;
    const videoThumbnailPath = req.files?.videoThumbnail[0].path;

    if (!videoFilePath) {
        throw new ApiError(400, "Unable to get Video File")
    }
    if (!videoThumbnailPath) {
        throw new ApiError(400, "Unable to get video Thumbnail")
    }

    const video = await uploadOnCloudinary(videoFilePath)
    const videoThumbnail = await uploadOnCloudinary(videoThumbnailPath)

    if (!video || !videoThumbnail) {
        throw new ApiError(400, "unable to upload file on cloudinary")
    }

    const uploadedVideo = await Video.create({
        title: title,
        description: description,
        videoFile: video.url,
        thumbnail: videoThumbnail.url,
        duration: video.duration,
        videoPublicId: video.public_id,
        thumbnailPublicId: videoThumbnail.public_id
    })

    if (!uploadedVideo) {
        throw new ApiError(400, "Something went wrong while uploading the video")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, uploadedVideo, "Video Uploaded Succesfully"))
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if (!videoId) {
        throw new ApiError(400, "Video Id is required")
    }

    if(!mongoose.isValidObjectId(videoId)){
        throw new ApiError(400,"Video id is invalid")
    }

    const video = await Video.findById(videoId).select("-videoPublicId -thumbnailPublicId");

    if (!video) {
        throw new ApiError(404, "Video Not Found")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, video, "Video Fetched successfullly"))
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const { title, description } = req.body

    
    if(!mongoose.isValidObjectId(videoId)){
        throw new ApiError(400,"Video id is invalid")
    }

    let updateData = {};

    if (title) {
        updateData.title = title;
    }

    if (description) {
        updateData.description = description;
    }

    const videoThumbnail = req.file?.path;
    if (videoThumbnail) {
        updateData.thumbnail = videoThumbnail;
    }

    if (Object.keys(updateData).length === 0) {
        throw new ApiError(400, "At least one field (title, description, or thumbnail) is required to update");
    }

    const video = await Video.findByIdAndUpdate(videoId, updateData, { new: true }).select("-videoPublicId -thumbnailPublicId")

    if (!video) {
        throw new ApiError(400, "Error while updating the details")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, video, "Details updated successfully"))
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if (!videoId) {
        throw new ApiError(400, "videoID is Requried")
    }

    if(!mongoose.isValidObjectId(videoId)){
        throw new ApiError(400,"Video id is invalid")
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(400, "Unable to find the video");
    }

    const videoFileDeletion = await destroyFromCloudinary(video.videoPublicId)
    const videoThumbnailDeletion = await destroyFromCloudinary(video.thumbnailPublicId)

    if (!videoFileDeletion || !videoThumbnailDeletion) {
        throw new ApiError(400, "Unable to delete files from cloundinary")
    }

    const deletedVideo = await Video.findByIdAndDelete(videoId);

    if (!deletedVideo) {
        throw new ApiError(400, "Unable to delete the video")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, deletedVideo, "Video deleted successfully"))
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if (!videoId) {
        throw new ApiError(400, "Video Id is required")
    }

    if(!mongoose.isValidObjectId(videoId)){
        throw new ApiError(400,"Video id is invalid")
    }

    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(404, "Video doesn't exist")
    }

    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        { isPublished: !video.isPublished },  // Toggle the boolean value
        { new: true }
    );

    if (!updatedVideo) {
        throw new ApiError(400, "Unable to update the video status");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, updatedVideo, "Video Publish Status change successfull"))
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}
