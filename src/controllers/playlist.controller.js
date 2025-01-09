import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Playlist } from "../models/playlist.model.js";

const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body;

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
    const { userId } = req.params
    if (!userId) {
        throw new ApiError(400, "userId is required")
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

    const playlist = await findByIdAndUpdate(playlistId, updatesForPlaylist, { new: true })

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