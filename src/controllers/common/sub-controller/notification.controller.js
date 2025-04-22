import Notification from "../../../models/notification.model.js";

import { asyncHandler } from "../../../utils/asyncHandler.js";
import { ApiError } from "../../../utils/ApiError.js";
import { ApiResponse } from "../../../utils/ApiResponse.js";
import { StatusCodes } from "http-status-codes";



//get all notification
const getAllNotification = asyncHandler(async (req, res) => {
    const {userId, reciver} = req.params;
    
    if (!userId) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "User ID is required");
    }
    if (!reciver) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Reciver is required");
    }

    let notification

    if(reciver === "user"){
     notification = await Notification.findAll({
        where: {
            userId: userId,
            reciver: reciver,
        },
        order: [["createdAt", "DESC"]],    
    });
    }else if(reciver === "guide"){
        notification = await Notification.findAll({
            where: {
                guideId: userId,
                reciver: reciver,
            },
            order: [["createdAt", "DESC"]],    
        });
    }
    

    if (!notification) {
        throw new ApiError(StatusCodes.NOT_FOUND, "No notification found");
    }
    //count the number of unread notification
    let unreadCount = 0;
    if(reciver === "user"){
        unreadCount = await Notification.count({
            where: {
                userId: userId,
                reciver: reciver,
                isRead: false,
            },
        });
    }else if(reciver === "guide"){
        unreadCount = await Notification.count({
            where: {
                guideId: userId,
                reciver: reciver,
                isRead: false,
            },
        });
    }
    

    //response 
    const response = {
        notification: notification,
        unreadCount: unreadCount,
    };
    return res.status(StatusCodes.OK).json(new ApiResponse(StatusCodes.OK, "Notifications fetched successfully", response));

});


//mark notification as read
const markNotificationAsRead = asyncHandler(async (req, res) => {
    const { notificationId } = req.params;

    if (!notificationId) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Notification ID is required");
    }

    const notification = await Notification.findByPk(notificationId);

    if (!notification) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Notification not found");
    }

    notification.isRead = true;
    await notification.save();

    return res.status(StatusCodes.OK).json(new ApiResponse(StatusCodes.OK, "Notification marked as read", notification));
});

// mark all notification as read
const markAllNotificationAsRead = asyncHandler(async (req, res) => {
    const { userId, reciver } = req.params;

    if (!userId) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "User ID is required");
    }
    if (!reciver) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Reciver is required");
    }

    let notification

    if(reciver === "user"){
     notification = await Notification.update(
        { isRead: true },
        {
            where: {
                userId: userId,
                reciver: reciver,
            },
        }
    );
    }else if(reciver === "guide"){
        notification = await Notification.update(
            { isRead: true },
            {
                where: {
                    guideId: userId,
                    reciver: reciver,
                },
            }
        );
    }
    

    if (!notification) {
        throw new ApiError(StatusCodes.NOT_FOUND, "No notification found");
    }

    return res.status(StatusCodes.OK).json(new ApiResponse(StatusCodes.OK, "All notifications marked as read", notification));
});





export { getAllNotification, markNotificationAsRead, markAllNotificationAsRead };