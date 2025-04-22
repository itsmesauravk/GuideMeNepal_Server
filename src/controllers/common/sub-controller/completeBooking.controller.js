import CustomizeBooking from "../../../models/customizeBooking.model.js";
import Guide from "../../../models/guide.model.js";
import District from "../../../models/district.model.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { ApiResponse } from "../../../utils/ApiResponse.js";
import { ApiError } from "../../../utils/ApiError.js";
import { StatusCodes } from "http-status-codes";
import { Op } from "sequelize";
import { getReceiverSocketId } from "../../../socket/socket.js";
import Notification from "../../../models/notification.model.js";



// this is for completing form guide side 

const completeBookingGuide = asyncHandler(async (req, res) => {
    const { bookingId } = req.params;
    
    if (!bookingId) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Booking Id is required")
    }

    const booking = await CustomizeBooking.findOne({ where: { id: bookingId } });

    if (!booking) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Booking not found")
    }

    if (booking.travelStatus === "completed") {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Booking already completed")
    }

          booking.travelStatus = "completed";
          await booking.save();
      
          //update the guide profile availability to true
          
           const guide = await Guide.findOne({where: {id: booking.guideId}});
           if (guide) {
               guide.availability = {
                   ...guide.availability,
                   isAvailable: true
               };
               await guide.save();
           }
      
         

          // 6 - create a notification for the user and guide
          const reciverSocketId = getReceiverSocketId(booking.guideId);
          const notification = await Notification.create({
              title: "Trip Completed",
              description: `Your trip has been completed. Now you can rate the guide`,
              notificationType: "booking",
              reciver: "user",
              userId: booking.userId,
              guideId: booking.guideId,
              bookingId: booking.id,
          });
          const totalUnread = await Notification.count({
              where: {
                  userId: booking.userId,
                  reciver: "user",
                  isRead: false,
              },
          });
      
      
          if (reciverSocketId) {
              io.to(reciverSocketId).emit("newNotification", notification);
              io.to(reciverSocketId).emit("notificationCount", totalUnread);
          }


    return res.status(StatusCodes.OK).json(new ApiResponse(StatusCodes.OK, "Booking completed successfully", booking));
})






export { completeBookingGuide };