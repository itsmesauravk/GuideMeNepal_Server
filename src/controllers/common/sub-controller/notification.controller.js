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
    const notification = await Notification.findAll({
        where: {
            userId: userId,
            reciver: reciver,
        },
        order: [["createdAt", "DESC"]],
        
    });
    if (!notification) {
        throw new ApiError(StatusCodes.NOT_FOUND, "No notification found");
    }
    //count the number of unread notification
    const unreadCount = await Notification.count({
        where: {
            userId: userId,
            reciver: reciver,
            isRead: false,
        },
    });

    //response 
    const response = {
        notification: notification,
        unreadCount: unreadCount,
    };
    return res.status(StatusCodes.OK).json(new ApiResponse(StatusCodes.OK, "Notifications fetched successfully", response));

});





export { getAllNotification };