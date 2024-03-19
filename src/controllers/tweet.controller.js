import mongoose from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet

    const {content} = req.body

    if (!content) {
        throw new ApiError(400, "Content is empty")
    }

    const tweet = await Tweet.create({
        content,
        owner:req.user?._id,
    });
    
    if (!tweet) {
        throw new ApiError(400, "Couldn't create tweet");
    }
    
    return res.status(200).json(new ApiResponse(200, tweet, "Tweet has been saved"))   
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const {userId} = req.params;

    if(!userId){
        throw new ApiError(400,"for user tweets id is required")
    }

   const user =  await User.findById(userId);

   if (!user) {
        throw new ApiError(400, "User not found")
   }

   const userTweets = await Tweet.aggregate(
    [
        {
            $match: {
                owner: user._id
            }
        },
        {
            $project: {
                content: 1
            }
        }
    ]
   )

   if(userTweets.length === 0){
    throw new ApiError(400,"Tweets does not exist for this user")
   }

   return res
   .status(200)
   .json(new ApiResponse(
        200,
        userTweets,
        "Tweet fetched successfully"
    ))
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const {tweetId} = req.params

    const {content} = req.body

    if (!tweetId || !content) {
        throw new ApiError(400, "Need id for update or the content is empty")
    }

    const tweet =  await Tweet.findById(tweetId);

    if(!tweet){
        throw new ApiError(400,"Tweet does not exist")
    }    

    const updatedTweet = await Tweet.findByIdAndUpdate(
        tweet._id,
        {
            $set: {
                content
            }
        },
        {new: true}
    )

    if (!updatedTweet) {
        throw new ApiError(400, "Could not update the tweet")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, updatedTweet, "Tweet updated successfully"))
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const {tweetId} = req.params

    if (!tweetId) {
        throw new ApiError(400, "Need id for update")
    }

    const tweet =  await Tweet.findById(tweetId);

    if(!tweet){
        throw new ApiError(400,"Tweet does not exist")
    }    

     await Tweet.findByIdAndDelete(
        tweet._id
    )

    return res
    .status(200)
    .json(new ApiResponse(200, "Tweet deleted successfully"))
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}