import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { User } from "../models/user.model.js"



const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body
    //TODO: create playlist

    if (!name && !description) {
        throw new ApiError(400, "Name and description is required")
    }

    const playlist = await Playlist.create({
        name,
        description,
        owner: req.user?._id
    })

    if (!playlist) {
        throw new ApiError(400, "Couldn't create playlist")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist created successfully"))
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    //TODO: get user playlists

    if (!userId) {
        throw new ApiError(400, "user id is required")
    }

    const user = await User.findById(userId)

    if (!user) {
        throw new ApiError(400, "User does not exist")
    }

    const playlists = await Playlist.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(req.user?._id)
            }
        }
    ])

    console.log("Playlist is", playlists);

    return res
    .status(200)
    .json(new ApiResponse(200, playlists, "Playlists fetched successfully"))
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id

    if (!playlistId) {
        throw new ApiError(400, "Playlist id is needed")
    }

    const playlist = await Playlist.findById(playlistId)

    if (!playlist) {
        throw new ApiError(400, "Playlist does not exist")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist fetched successfully"))
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params

    if (!playlistId && !videoId) {
        throw new ApiError(400, "Both id's are required")
    }

    const playlist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $set: {
                videos: new mongoose.Types.ObjectId(videoId)
            }
        }
    )

    if (!playlist) {
        throw new ApiError(400, "Couldn't add video to playlist")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Video added to playlist"))
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist

    if (!playlistId && !videoId) {
        throw new ApiError(400, "Both id's are required")
    }

    const playlist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $unset: {
                videos: videoId
            }
        }
    )

    if (!playlist) {
        throw new ApiError(400, "Couldn't remove video from playlist")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Video removed from playlist"))
})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist

    if (!playlistId) {
        throw new ApiError(400, "Need id")
    }

    const playlist = await Playlist.findByIdAndDelete(playlistId)

    if (!playlist) {
        throw new ApiError(400, "Couldn't delete playlist")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, "Playlist has been deleted"))
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist

    if (!playlistId) {
        throw new ApiError(400, "Need id")
    }

    if (!name && !description) {
        throw new ApiError(400, "All fields are required")
    }

    const playlist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $set: {
                name,
                description
            }
        },
        {new: true}
    )

    if (!playlist) {
        throw new ApiError(400, "Couldn't update playlist")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist has been updated"))
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