import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { Video } from "../models/video.model.js"
import { User } from "../models/user.model.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(400, "Video doesn't exist")
    }

    const comments = await Comment.aggregate(
        [
            {
                $match: {
                    video: new mongoose.Types.ObjectId(video)
                }
            },
            {
                $skip:(page-1)*limit
            },
            {
                $limit:limit
            }
        ]
    )

    if (!comments.length === 0) {
        throw new ApiError(400, "Comments doesn't exist")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, comments, "Comments fetched successfully"))
})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const {videoId} = req.params

    if (!videoId) {
        throw new ApiError(400, "Video id is required")
    }

    const {content} = req.body

    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(400, "Video does not exist")
    }

    const comment = await Comment.create({
        content,
        video: video._id,
        owner: req.user?._id
    })

    return res
    .status(200)
    .json(new ApiResponse(200, comment, "Comment created successfully"))
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const {commentId} = req.params

    if (!commentId) {
        throw new ApiError(400, "Comment id is needed")
    }

    const {content} = req.body

    if (!content) {
        throw new ApiError(400, "Content feild is required")
    }

    const updatedComment = await Comment.findByIdAndUpdate(
        commentId,
        {
            $set: {
                content
            }
        },
        {new: true}
    )

    return res
    .status(200)
    .json(new ApiResponse(200, updatedComment, "Comment has been updated successfully"))
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const {commentId} = req.params

    if (!commentId) {
        throw new ApiError(400, "Comment id is needed")
    }

    const deletedComment = await Comment.findByIdAndDelete(
        commentId
    )

    return res
    .status(200)
    .json(new ApiResponse(200, "Comment has been deleted successfully"))
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
    deleteComment
}