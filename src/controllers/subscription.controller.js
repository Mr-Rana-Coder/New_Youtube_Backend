import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Subscription } from "../models/subscription.model.js";
import { User } from "../models/user.model.js"

const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params
    const subscriberId = req.user?._id

    const channel = await User.findById(channelId);
    if (!channel) {
        throw new ApiError(404, "Channel Not found")
    }

    const existingSubscription = await Subscription.findOne({
        subscriber: subscriberId,
        channel: channelId
    })

    if (existingSubscription) {
        await Subscription.findByIdAndDelete(existingSubscription._id);
        return res
            .status(200)
            .json(new ApiResponse(200, { isSubscribed: false }, "Unsubscribed Successfully "))
    } else {
        const newSubscription = await Subscription.create({
            subscriber: subscriberId,
            channel: channelId
        })
        return res
            .status(201)
            .json(new ApiResponse(201), { isSubscribed: true, subscriberId: newSubscription._id }, "Channel Subscribed succefully")
    }
})

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params
    if (!channelId) {
        throw new ApiError(400, "Channel id is required")
    }

    const channelSubscriber = await User.aggregate([
        {
        $match: {
            _id: new mongoose.Types.ObjectId(channelId)
        }
    },{
        $lookup: {
            from: "subscriptions",
            localField: "_id",
            foreignField: "channel",
            as: "subscribers"
        }
    },{
        $project: {
            subscribersCount: { $size: "$subscribers" }
        }
    }
    ])

    if (!channelSubscriber.length) {
        throw new ApiError(404, "Channel Doesn't have any subscriber")
    }
    return res
        .status(200)
        .json(
            new ApiResponse(200, {
                channelId,
                subscribersCount: channelSubscriber[0].subscribersCount
            }, "Channel subscriber fetched successfully")
        )
})

const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
    if (!subscriberId) {
        throw new ApiError(400, "Channel id is required")
    }

    const subscriberData = await User.aggregate([
        {
        $match: {
            _id: new mongoose.Types.ObjectId(subscriberId)
        }
    },{
        $lookup: {
            from: "subscriptions",
            localField: "_id",
            foreignField: "subscriber",
            as: "subscribedTo"
        }
    },{
        $project: {
            channelsSubscribedToCount: { $size: "$subscribedTo" }
        }
    }
    ])

    if (!subscriberData.length) {
        throw new ApiError(404, "Subscriber does not exist or has no subscriptions")
    }
    return res
        .status(200)
        .json(
            new ApiResponse(200, {
                subscriberId,
                channelsSubscribedToCount: subscribedData[0].channelsSubscribedToCount
            }, "Subscribed Channel fetched successfully")
        )
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
};