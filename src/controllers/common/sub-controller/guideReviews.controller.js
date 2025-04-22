import GuideReview from "../../../models/guideReview.model.js";
import CustomizeBooking from "../../../models/customizeBooking.model.js";
import User from "../../../models/user.model.js";
import Guide from "../../../models/guide.model.js";

import { ApiError } from "../../../utils/ApiError.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { ApiResponse } from "../../../utils/ApiResponse.js";
import { StatusCodes } from "http-status-codes";
import { Op, where } from "sequelize";
import Notification from "../../../models/notification.model.js";
import { getReceiverSocketId, io } from "../../../socket/socket.js";


//create a review 
const createGuideReview = asyncHandler(async (req, res) => {
  const {bookingId, userId, guideId, rating, destination, comments } = req.body;


  // Check if the guide exists
  const guide = await Guide.findByPk(guideId);
  if (!guide) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Guide not found");
  }

  // Create the review
  const review = await GuideReview.create({
    guideId,
    userId,
    rating,
    destination,
    comments,
  });

  if (!review) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Failed to create review");
  }

  if(bookingId){

    //update the booking reviewstatus to true
    await CustomizeBooking.update(
      { reviewstatus: true },  
      { where: { id: bookingId } } 
    );
  }



        // 6 - create a notification for the user and guide
        const reciverSocketId = getReceiverSocketId(review.guideId);
        const notification = await Notification.create({
            title: "Review from User",
            description: `You have received a new review from the user`,
            notificationType: "review",
            reciver: "guide",
            userId: review.userId,
            guideId: review.guideId,
            
        });
        const totalUnread = await Notification.count({
            where: {
                guideId: review.guideId,
                reciver: "guide",
                isRead: false,
            },
        });
    
    
        if (reciverSocketId) {
            io.to(reciverSocketId).emit("newNotification", notification);
            io.to(reciverSocketId).emit("notificationCount", totalUnread);
        }

  return res.status(StatusCodes.CREATED).json(
    new ApiResponse(StatusCodes.CREATED, "Feedback submitted successfully", review)
  );
});

//get review for a guide 
const getGuideReviews = asyncHandler(async (req, res) => {
  const { guideId } = req.params;

  const guideReviews = await GuideReview.findAll({
    where: { guideId: guideId },
    order: [['createdAt', 'DESC']],
    attributes: ["id", "comments", "rating","destination" ,"createdAt"],
    include: [
        {
            model: User,
            as: "user",
            attributes: ["fullName", "profilePicture"],
        },
    ],
});

const totalReviews = guideReviews.length;
const averageRating = guideReviews.reduce((acc, review) => acc + review.rating, 0) / totalReviews || 0;

return res.status(StatusCodes.OK).json(
    new ApiResponse(StatusCodes.OK, "Guide reviews fetched successfully", { reviews:guideReviews, total:totalReviews, average:averageRating })
);

})

//get latest review for homepage (max 4 reviews)
const getLatestGuideReviews = asyncHandler(async (req, res) => {
  const guideReviews = await GuideReview.findAll({
    where: {
      rating: {
        [Op.gte]: 3, // Only ratings >= 3
      },
    },
    order: [["createdAt", "DESC"]],
    limit: 4,
    attributes: ["id", "comments", "rating","destination" ,"createdAt"],
    include: [
        {
            model: User,
            as: "user",
            attributes: ["fullName", "profilePicture", "country"],
        },
    ],
});
if (!guideReviews) {
  throw new ApiError(StatusCodes.NOT_FOUND, "No reviews found");
}
return res.status(StatusCodes.OK).json(
    new ApiResponse(StatusCodes.OK, "Latest reviews fetched successfully", guideReviews)
);
})



export {createGuideReview, getGuideReviews, getLatestGuideReviews}