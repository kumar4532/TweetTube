import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    // TODO: toggle subscription

    if (!channelId) {
        throw new ApiError(400, "Need channel id")
    }

    const subscriber = await User.findById(req.user?.id)
    const channel = await User.findById(channelId)

    if (!channel) {
        throw new ApiError(400, "Channel does not exist")
    }

    const alreadySubscribed = await Subscription.find({
        subscriber: subscriber._id,
        channel: channel._id
    })

    if (alreadySubscribed.length > 0) {
        await Subscription.deleteMany({ subscriber: subscriber._id, channel: channel._id});

        return res
        .status(200)
        .json(new ApiResponse(200, "Unsubscribed successfully"))
    }

    const subscribed = await Subscription.create({
        subscriber: subscriber._id,
        channel: channel._id
    })

    if (!subscribed) {
        throw new ApiError(400, "Couldn't subscribe")
    }

    await User.findByIdAndUpdate(
        req.user?._id,
        {
            $push: {
                subscribedTo: channel
            }
        }
    )

    await User.findByIdAndUpdate(
        channel,
        {
            $push: {
                subscriber: req.user._id
            }
        }
    )

    return res
    .status(200)
    .json(new ApiResponse(200, subscribed, "Subscribed successfully"))
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params

    if (!channelId) {
        throw new ApiError(400, "Channel id is needed")
    }

    const channel = await User.findById(channelId)

    const subscriberCount = await Subscription.aggregate([
        {
            $match: {
                channel: channel._id
            }
        }
    ])

    console.log(subscriberCount);

    if (!subscriberCount || subscriberCount.length === 0) {
        throw new ApiError(400, "Subscribers couldn't fetch or this channel doesn't have subscribers")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, subscriberCount, "Sub count fetched"))
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params

    if (!subscriberId) {
        throw new ApiError(400, "Sub id is needed")
    }

    const subscriber = await User.findById(subscriberId)

    const subscribedChannels = await Subscription.aggregate([
        {
            $match: {
                subscriber: subscriber._id
            }
        }
    ])

    console.log(subscribedChannels);

    if (!subscribedChannels) {
        throw new ApiError(400, "channels couldn't fetch")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, subscribedChannels, "Subed channels fetched"))
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}