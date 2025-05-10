import User from "../../../models/user.model.js";
import Guide from "../../../models/guide.model.js";
import CustomizeBooking from "../../../models/customizeBooking.model.js";

import { asyncHandler } from "../../../utils/asyncHandler.js";
import { ApiResponse } from "../../../utils/ApiResponse.js";
import { ApiError } from "../../../utils/ApiError.js";
import { StatusCodes } from "http-status-codes";

import { Op, fn, col, literal, where } from "sequelize";




const getDashboardData = asyncHandler(async (req, res) => {
    

    // Get the total number of users
    const totalUsers = await User.count();

    // Get the total number of guides
    const totalGuides = await Guide.count();

    // Get the total number of bookings
    const totalBookings = await CustomizeBooking.count({
        where:{
            travelStatus: 'completed',
        }
    });

    // Get the total revenue
    const totalRevenue = await CustomizeBooking.sum('estimatedPrice', {
        where: {
            travelStatus: 'completed',
        },
    });

    // get recent guides
    const recentGuides = await Guide.findAll({
        order: [['createdAt', 'DESC']],
        limit: 4,
        attributes: {
            exclude: ['password','liscensePhoto', 'selfVideo', 'securityMetadata', 'gallery', 'refreshToken', 'otp','securityMetadata' , 'phoneNumber', 'isVerified', 'isSuspended', 'isDeleted'],
        },
    });
;


    const responseData = {
        metrices:{
            totalUsers,
            totalGuides,
            totalBookings,
            totalEarnings: totalRevenue,  
        },
        recentGuidesRequest: recentGuides,
    }

    

    res.status(StatusCodes.OK).json(
        new ApiResponse(StatusCodes.OK,"Dashboard data fetched successfully", responseData)
    );
});




export { getDashboardData };