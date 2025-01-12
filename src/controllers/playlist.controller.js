import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Playlist } from "../models/playlist.model.js";
import mongoose from "mongoose";

const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body
    console.log("Name:",name)
    console.log("description:",description)
    if (!name || !description) {
        throw new ApiError(400, "All fields are required")
    }
    const userId = req.user?._id;
    if (!userId) {
        throw new ApiError(400, "user is not auntheticated")
    }

    const newPlaylist = await Playlist.create({
        name: name,
        description: description,
        owner: userId
    })

    if (!newPlaylist) {
        throw new ApiError(400, "Unable to create the playlist")
    }


    return res
        .status(201)
        .json(new ApiResponse(201, newPlaylist, "New Playlist created"))

})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const userId = req.user?._id
    console.log(userId)
    if (!userId) {
        throw new ApiError(400, "user is not authenticated")
    }

    if (!mongoose.isValidObjectId(userId)) {
        throw new ApiError(400, "user id is incorrect")
    }

    const userPlaylist = await Playlist.find({ owner: userId })

    if (!userPlaylist || userPlaylist.length === 0) {
        throw new ApiError(400, "No playlist Found")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, userPlaylist, "User playlist fetched successfully"))
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params

    if (!playlistId) {
        throw new ApiError(400, "Playlist Id is required")
    }

    if (!mongoose.isValidObjectId(playlistId)) {
        throw new ApiError(400, "playlist id is incorrect")
    }

    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
        throw new ApiError(404, "No playlist found")
    }
    return res
        .status(200)
        .json(new ApiResponse(200, playlist, "Playlist fetched successfully"))

})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params
    if (!playlistId || !videoId) {
        throw new ApiError(400, "playlist and Video Id's are required")
    }

    if (!mongoose.isValidObjectId(playlistId) || !mongoose.isValidObjectId(playlistId)) {
        throw new ApiError(400, "either playlist id or user id is incorrect")
    }

    const playlist = await Playlist.findByIdAndUpdate(playlistId, { $push: { videos: videoId } }, { new: true });

    if (!playlist) {
        throw new ApiError(404, "No playlist found!")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, playlist, "Video added successfully"))

})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params
    if (!playlistId || !videoId) {
        throw new ApiError(400, "playlist and Video Id's are required")
    }

    if (!mongoose.isValidObjectId(playlistId) || !mongoose.isValidObjectId(playlistId)) {
        throw new ApiError(400, "either playlist id or user id is incorrect")
    }

    const playlist = await Playlist.findByIdAndUpdate(playlistId, { $pull: { videos: videoId } }, { new: true });

    if (!playlist) {
        throw new ApiError(404, "No playlist found!")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, playlist, "Video added successfully"))
})

const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    if (!playlistId) {
        throw new ApiError(400, "Playlist id is required")
    }

    if (!mongoose.isValidObjectId(playlistId)) {
        throw new ApiError(400, "playlist id is incorrect")
    }

    const playlist = await Playlist.findByIdAndDelete(playlistId);
    if (!playlist) {
        throw new ApiError(404, "No playlist found")
    }
    return res
        .status(200)
        .json(new ApiResponse(200, playlist, "Playlist deleted successfully"))
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    const { name, description } = req.body
    if (!playlistId) {
        throw new ApiError(400, "Playlist id is required")
    }

    if (!mongoose.isValidObjectId(playlistId)) {
        throw new ApiError(400, "playlist id is incorrect")
    }

    let updatesForPlaylist = {}
    if (name) {
        updatesForPlaylist.name = name;
    }
    if (description) {
        updatesForPlaylist.description = description;
    }
    if (!name && !description) {
        throw new ApiError(400, "At least one field should be updated")
    }

    const playlist = await Playlist.findByIdAndUpdate(playlistId, updatesForPlaylist, { new: true })

    if (!playlist) {
        throw new ApiError(404, "Playlist not found!")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, playlist, "Playlist updated successfully"))
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}