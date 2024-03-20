import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {Video} from "../models/video.model.js"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { Tweet } from "../models/tweet.model.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    //TODO: toggle like on video
    if (!videoId) {
        throw new ApiError(400, "Video id is needed")
    }

    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(400, "Video does not exist")
    }

    const alreadyLike = await Like.findOne({
        video: video._id,
        likedBy: req.user?._id
    }).select("-createdAt -updatedAt")

    if ( alreadyLike ) {
        await Like.findByIdAndDelete(alreadyLike._id)

        return res
        .status(200)
        .json(new ApiResponse(200, "User already liked video hence disliked the video"))
    }

    const likes = await Like.create({
        video: video._id,
        likedBy: req.user?._id
    })

    return res
    .status(200)
    .json(new ApiResponse(200, likes, "Video likes stored successfully"))
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment

    if (!commentId) {
        throw new ApiError(400, "Comment id is needed")
    }

    const comment = await Comment.findById(commentId)

    if (!comment) {
        throw new ApiError(400, "Comment does not exist")
    }

    const alreadyLike = await Like.findOne({
        comment: comment._id,
        likedBy: req.user?._id
    }).select("-createdAt -updatedAt")

    if ( alreadyLike ) {
        await Like.findByIdAndDelete(alreadyLike._id)

        return res
        .status(200)
        .json(new ApiResponse(200, "User already liked comment hence disliked the comment"))
    }

    const likes = await Like.create({
        comment: comment._id,
        likedBy: req.user?._id
    })

    return res
    .status(200)
    .json(new ApiResponse(200, likes, "Comment likes stored successfully"))
})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet

    if (!tweetId) {
        throw new ApiError(400, "Comment id is needed")
    }

    const tweet = await Tweet.findById(tweetId)

    if (!tweet) {
        throw new ApiError(400, "Comment does not exist")
    }

    const alreadyLike = await Like.findOne({
        tweet: tweet._id,
        likedBy: req.user?._id
    }).select("-createdAt -updatedAt")

    if ( alreadyLike ) {
        await Like.findByIdAndDelete(alreadyLike._id)

        return res
        .status(200)
        .json(new ApiResponse(200, "User already liked tweet hence disliked the tweet"))
    }

    const likes = await Like.create({
        tweet: tweet._id,
        likedBy: req.user?._id
    })

    return res
    .status(200)
    .json(new ApiResponse(200, likes, "Tweet likes stored successfully"))
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos

    const likedVideos = await Like.aggregate([
        {
            $match: {
                likedBy: new mongoose.Types.ObjectId(req.user?._id)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "likedVideo"
            }
        },
        {
            $unwind: "$likedVideo"
        },
        {
            $project: {
                likedVideo: 1
            }
        }
    ])

    return res
    .status(200)
    .json(new ApiResponse(200, likedVideos, "Liked videos fetched successfully"))
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}