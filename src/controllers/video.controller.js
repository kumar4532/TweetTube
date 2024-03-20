import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body
    // TODO: get video, upload to cloudinary, create video

    if (!title && !description) {
        throw new ApiError(400, "Title and description is needed")
    }

    const videoLocalPath = req.files?.videoFile[0]?.path;
    const thumbnailLocalPath = req.files?.thumbnail[0]?.path;

    if (!videoLocalPath && !thumbnailLocalPath) {
        throw new ApiError(400, "Video and thumbnail is required")
    }

    const upVideo = await uploadOnCloudinary(videoLocalPath)
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)

    const duration = await upVideo.duration;

    const video = await Video.create({
        title,
        description,
        videoFile: upVideo.url,
        thumbnail: thumbnail.url,
        duration
    })

    if (!video) {
        throw new ApiError(400, "Video upload problem")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, video, "Video published successfully"))
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id

    if (!videoId) {
        throw new ApiError(400, "Video id is needed")
    }

    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(400, "Cannot find the video")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, video, "Video fetched successfully"))
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

    if (!videoId) {
        throw new ApiError(400, "Video id is needed")
    }

    const {title, description} = req.body

    const thumbnailLocalPath = await req.file?.path
    
    if (!thumbnailLocalPath) {
        throw new ApiError(400, "Cannot find the local path")
    }

    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)

    if (!title && !description && !thumbnail) {
        throw new ApiError(400, "All fields are required")
    }

    const video = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                title,
                description,
                thumbnail: thumbnail.url
            }
        },
        {new: true}
    )

    if (!video) {
        throw new ApiError(400, "Cannot find the video")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, video, "Video updated successfully"))

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video

    if (!videoId) {
        throw new ApiError(400, "Video id is needed")
    }

    const video = await Video.findByIdAndDelete(videoId)

    if (!video) {
        throw new ApiError(400, "Cannot find the video")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, "Video deleted successfully"))
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}