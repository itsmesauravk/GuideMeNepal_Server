import CustomizeBooking from "../../../models/customizeBooking.model.js";
import Guide from "../../../models/guide.model.js";
import User from "../../../models/user.model.js";
import { ApiResponse } from "../../../utils/ApiResponse.js";
import { ApiError } from "../../../utils/ApiError.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { StatusCodes } from "http-status-codes";
import { Op } from "sequelize";



// this controller is for getting all bookings of a user or guide

const getBookings = asyncHandler(async(req,res) => {
    const role = req.query.role;
    const {bookingStatus, travelStatus} = req.query;
    const id = req.params.id;

    let bookings = [];
    let whereClause = {};

    if(!role || !id){
        throw new ApiError(StatusCodes.BAD_REQUEST, "Role and Id are required")
    }
    if(role !== "user" && role !== "guide"){
        throw new ApiError(StatusCodes.BAD_REQUEST, "Role must be either user or guide")
    }

   
    if(role === "user"){
        whereClause.userId = id;
    } else if(role === "guide"){
        whereClause.guideId = id;
    }

    // Add bookingStatus filter if provided
    if(bookingStatus){
        whereClause.bookingStatus = bookingStatus;
    }

    // Add travelStatus filter if provided
    if(travelStatus){
        whereClause.travelStatus = travelStatus;
    }

    // Execute query with filters
    if(role === "user"){
        bookings = await CustomizeBooking.findAll({
            where: whereClause, 
            include: [{
                model: Guide,
                attributes: ['id', 'slug', 'fullname', 'email', 'profilePhoto'] 
            }]
        });
    } else if(role === "guide"){
        bookings = await CustomizeBooking.findAll({
            where: whereClause, 
            include: [{
                model: User,
                attributes: ['id', 'slug', 'fullName', 'email', 'profilePicture'] 
            }]
        });
    }

    return res.status(StatusCodes.OK).json(
        new ApiResponse(StatusCodes.OK, "Bookings", bookings)
    );
});


// this controller is for getting only ongoing bookings of a user or guide
const getOngoingBookings = asyncHandler(async(req, res) => {
    const role = req.query.role;
    const id = req.params.id;
    
    let booking;
    let whereClause = {};
    
    if(!role || !id){
        throw new ApiError(StatusCodes.BAD_REQUEST, "Role and Id are required")
    }
    if(role !== "user" && role !== "guide"){
        throw new ApiError(StatusCodes.BAD_REQUEST, "Role must be either user or guide")
    }
        
    if(role === "user"){
        whereClause.userId = id;
    } else if(role === "guide"){
        whereClause.guideId = id;
    }
    
    // Update filter conditions
    whereClause.bookingStatus = "accepted";
    whereClause.travelStatus = {
        [Op.or]: ["not-started", "on-going"]
    };
    
    // Execute query with filters
    if(role === "user"){
        booking = await CustomizeBooking.findOne({
            where: whereClause,
            
            include: [{
                model: Guide,
                attributes: ['id', 'slug', 'fullname', 'email', 'profilePhoto']
            }]
        });
    } else if(role === "guide"){
        booking = await CustomizeBooking.findOne({
            where: whereClause,
            
            include: [{
                model: User,
                attributes: ['id', 'slug', 'fullName', 'email', 'profilePicture']
            }]
        });
    }
    
    return res.status(StatusCodes.OK).json(
        new ApiResponse(StatusCodes.OK, "Ongoing Booking", booking)
    );
});

export { getBookings, getOngoingBookings }