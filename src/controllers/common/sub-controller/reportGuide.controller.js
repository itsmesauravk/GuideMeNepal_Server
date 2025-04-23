
import CustomizeBooking from "../../../models/customizeBooking.model.js";
import User from "../../../models/user.model.js";
import Guide from "../../../models/guide.model.js";

import { ApiError } from "../../../utils/ApiError.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { ApiResponse } from "../../../utils/ApiResponse.js";
import { StatusCodes } from "http-status-codes";
import { Op } from "sequelize";
import Notification from "../../../models/notification.model.js";
import { getReceiverSocketId, io } from "../../../socket/socket.js";
import ReportGuide from "../../../models/reportGuide.model.js";


//create a report
const createGuideReport = asyncHandler(async (req, res) => {
  const {bookingId, userId, guideId, reason, description,metadata} = req.body;


  // Check if the guide exists
  const guide = await Guide.findByPk(guideId);
  if (!guide) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Guide not found");
  }


  // Create the report
  const newReport = await ReportGuide.create({
    guideId,
    userId,
    reason,
    description,
    metadata
  });

  if (!newReport) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Failed to report guide");
  }

  if(bookingId){

    //update the booking reportstatus to true
    await CustomizeBooking.update(
      { reportstatus: true },  
      { where: { id: bookingId } } 
    );
  }



        // 6 - create a notification for the user and guide
        const reciverSocketIdGuide = getReceiverSocketId(newReport.guideId);
        const notificationGuide = await Notification.create({
            title: "Report from User",
            description: `You have received a new report from the user`,
            notificationType: "report",
            reciver: "guide",
            userId: newReport.userId,
            guideId: newReport.guideId,
            
        });
        const totalUnreadGuide = await Notification.count({
            where: {
                guideId: newReport.guideId,
                reciver: "guide",
                isRead: false,
            },
        });
        const reciverSocketIdUser = getReceiverSocketId(newReport.guideId);
        const notificationUser = await Notification.create({
            title: "Report For Guide",
            description: `Your report has been submitted successfully`,
            notificationType: "report",
            reciver: "user",
            userId: newReport.userId,
            guideId: newReport.guideId,
            
        });
        const totalUnreadUser = await Notification.count({
            where: {
                userId: newReport.userId,
                reciver: "user",
                isRead: false,
            },
        });
    
    
        if (reciverSocketIdUser || reciverSocketIdGuide) {
            io.to(reciverSocketIdGuide).emit("newNotification", notificationGuide);
            io.to(reciverSocketIdGuide).emit("notificationCount", totalUnreadGuide);

            io.to(reciverSocketIdUser).emit("newNotification", notificationUser);
            io.to(reciverSocketIdUser).emit("notificationCount", totalUnreadUser);
        }

  return res.status(StatusCodes.CREATED).json(
    new ApiResponse(StatusCodes.CREATED, "Feedback submitted successfully", newReport)
  );
});

//get review for a guide 
const getGuideReports = asyncHandler(async (req, res) => {
  const { guideId } = req.params;

  const guideReport = await ReportGuide.findAll({
    where: { guideId: guideId },
    order: [['createdAt', 'DESC']],
    include: [
        {
            model: User,
            as: "user",
            attributes: ["fullName", "profilePicture"],
        },
    ],
});

const totalReports = guideReport.length;
const averageRating = guideReport.reduce((acc, review) => acc + review.rating, 0) / totalReports || 0;

return res.status(StatusCodes.OK).json(
    new ApiResponse(StatusCodes.OK, "Guide reviews fetched successfully", { reviews:guideReport, total:totalReviews, average:averageRating })
);

})

const getAllGuidesReports = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  const guideReports = await ReportGuide.findAndCountAll({
    order: [['createdAt', 'DESC']],
    include: [
        {
            model: User,
            as: "user",
            attributes: ["fullName", "profilePicture"],
        },
    ],
    limit: parseInt(limit),
    offset: parseInt(offset),
});
  const totalReports = guideReports.count;
  const totalPages = Math.ceil(totalReports / limit);

  return res.status(StatusCodes.OK).json(
    new ApiResponse(StatusCodes.OK, "Guide reports fetched successfully", {
      reports: guideReports.rows,
      totalReports,
      totalPages,
      currentPage: page,
    })
  );
})



export {createGuideReport, getGuideReports, getAllGuidesReports}