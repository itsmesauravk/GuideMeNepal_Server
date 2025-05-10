// {
//   "metrics": {
//     "totalRequests": 124,
//     "tripsCompleted": 87,
//     "averageTripCost": "$195",
//     "totalEarnings": "$16,965",
//     "profileViews": 1430
//   },
//   "reviewSummary": {
//     "totalReviews": 120,
//     "averageRating": 4.8,
//     "recentReviews": [
//       {
//         "id": "rev-123",
//         "travelerName": "Mike Thompson",
//         "rating": 5,
//         "comment": "Amazing tour experience!",
//         "date": "2025-05-08T10:30:00Z"
//       },
//       {
//         "id": "rev-122",
//         "travelerName": "Sarah Chen",
//         "rating": 5,
//         "comment": "Very knowledgeable guide",
//         "date": "2025-05-05T14:20:00Z"
//       }
//     ]
//   },
//   "ongoingTrip": {
//     "isActive": true,
//     "tripId": "trip-123456",
//     "travelerName": "Emma & David Wilson",
//     "destination": "Golden Gate Park Tour",
//     "startDate": "2025-05-10",
//     "endDate": "2025-05-10",
//     "formattedDates": "May 10, 2025",
//     "groupSize": 2,
//     "status": "In progress",
//     "dayNumber": 1,
//     "totalDays": 1,
//     "contactInfo": {
//       "email": "emma.wilson@example.com",
//       "phone": "+1-555-123-4567"
//     }
//   },
//   "notifications": {
//     "items": [
//       {
//         "id": 1,
//         "type": "booking",
//         "message": "New booking request from Sarah Johnson",
//         "time": "10 min ago",
//         "createdAt": "2025-05-10T12:45:00Z",
//         "isRead": false
//       },
//       {
//         "id": 2,
//         "type": "review",
//         "message": "You received a 5-star review from Mike Thompson",
//         "time": "2 hours ago",
//         "createdAt": "2025-05-10T10:30:00Z",
//         "isRead": true
//       },
//       {
//         "id": 3,
//         "type": "message",
//         "message": "Alex has a question about the upcoming trip",
//         "time": "1 day ago",
//         "createdAt": "2025-05-09T14:20:00Z",
//         "isRead": false
//       }
//     ],
//     "unreadCount": 2,
//     "totalCount": 18
//   },
//   "bookingRequests": {
//     "items": [
//       {
//         "id": "req-1",
//         "travelerName": "James Brown",
//         "travelerProfileId": "user-456",
//         "destination": "City Highlights Tour",
//         "dates": {
//           "start": "2025-05-15",
//           "end": "2025-05-16"
//         },
//         "formattedDates": "May 15-16, 2025",
//         "groupSize": 3,
//         "requestedAt": "2025-05-09T18:30:00Z",
//         "specialRequests": "Would like to focus on architecture",
//         "estimatedPrice": "$285"
//       },
//       {
//         "id": "req-2",
//         "travelerName": "Lisa Chen",
//         "travelerProfileId": "user-789",
//         "destination": "Wine Country Day Trip",
//         "dates": {
//           "start": "2025-05-22",
//           "end": "2025-05-22"
//         },
//         "formattedDates": "May 22, 2025",
//         "groupSize": 2,
//         "requestedAt": "2025-05-08T09:15:00Z",
//         "specialRequests": null,
//         "estimatedPrice": "$350"
//       }
//     ],
//     "totalPending": 2
//   },
//     "upcomingTrips": [
//       {
//         "tripId": "trip-234567",
//         "travelerName": "James Brown",
//         "dates": {
//           "start": "2025-05-15",
//           "end": "2025-05-16"
//         }
//       }
//     ]
//   }
// }


import Guide from "../../../models/guide.model.js";
import CustomizeBooking from "../../../models/customizeBooking.model.js";
import GuideReview from "../../../models/guideReview.model.js";
import Notification from "../../../models/notification.model.js";

import { asyncHandler } from "../../../utils/asyncHandler.js";
import { ApiResponse } from "../../../utils/ApiResponse.js";
import { ApiError } from "../../../utils/ApiError.js";
import { StatusCodes } from "http-status-codes";

import { Op } from "sequelize";

import { sequelize } from "../../../db/ConnectDB.js";



//support functions
const getNotifications = async (guideId) => {
  // Fetch notifications from the database
  const notifications = await Notification.findAll({
    where: { guideId: guideId, reciver: "guide" },
    order: [["createdAt", "DESC"]],
    limit: 3,
  });


  return notifications;
};

//get pending booking requests
const getBookingRequests = async (guideId) => {
  // Fetch booking requests from the database
  const bookingRequests = await CustomizeBooking.findAll({
    where: { guideId: guideId, bookingStatus: "pending" },
    order: [["createdAt", "DESC"]],
    limit: 2,
  });

  return bookingRequests;
};




// Main function to get dashboard data
const getDashboardData = asyncHandler(async (req, res) => {
  const guideId = req.params.guideId;
  if (!guideId) {
    return ApiResponse.error(res, StatusCodes.BAD_REQUEST, "Guide ID is required");
  }

  // Get the guide's profile views count
  const profileViews = await Guide.findOne({
    where: { id: guideId },
    attributes: ["profileviews"],
  });
  const profileViewsCount = profileViews ? profileViews.profileviews : 0;

  //total requests count 
    const totalRequests = await CustomizeBooking.count({
        where: {
        guideId: guideId,
        },
    });

  // Get the completed booking count from the CustomizeBooking table
  const bookingCount = await CustomizeBooking.count({
    where: {
      guideId: guideId,
      travelStatus: "completed",
    },
  });

  // total estimated earnings
  const totalEarnings = await CustomizeBooking.sum("estimatedPrice", {
    where: {
      guideId: guideId,
      travelStatus: "completed",
    },
  });


  // Get the review statistics
const guideReviews = await GuideReview.findAll({
      where: { guideId: guideId },
      order: [['createdAt', 'DESC']],
      attributes: ["id", "comments", "rating","destination" ,"createdAt"],
      
  });
  
  const totalReviews = guideReviews.length;
  const averageRating = guideReviews.reduce((acc, review) => acc + review.rating, 0) / totalReviews || 0;

  // Get ongoing trip details
  const ongoingTrip = await CustomizeBooking.findOne({
    where: {
      guideId: guideId,
      bookingStatus: "accepted",
      travelStatus: {
        [Op.or]: [
          { [Op.eq]: "on-going" },
          { [Op.eq]: "not-started" },
        ],
      },
      
    },
  });

  //for unread count
  const unreadCount = await Notification.count({
    where: { guideId: guideId,
        reciver: "guide",
         isRead: false },
  });


  // Get notifications and booking requests
  const notifications = await getNotifications(guideId);
  const bookingRequests = await getBookingRequests(guideId);

  // Prepare the response data
  const dashboardData = {
    metrics: {
      profileViews: profileViewsCount || 0,
      bookingCompletedCount: bookingCount || 0, //completed trips
      totalReviews: totalReviews || 0,
      averageRating: averageRating || 0,
      totalEarnings: totalEarnings || 0,
      totalRequests: totalRequests || 0,
      unreadNotifications: unreadCount || 0,
    },
    ongoingTrip,
    notifications,
    bookingRequests,
  };

  return res.status(StatusCodes.OK).json(new ApiResponse(StatusCodes.OK, "Dashboard data retrieved successfully", dashboardData));
}
);



export { getDashboardData };