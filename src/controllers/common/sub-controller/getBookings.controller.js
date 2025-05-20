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
        [Op.or]: ["not-started", "on-going", "guide-completed"]
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

    if(!booking){
        throw new ApiError(StatusCodes.NOT_FOUND, "No ongoing booking found")
    }

    //for automatically updating the travel status of the booking
    const bookingStartDate = booking?.startDate;
    const todaysDate = new Date();
    const dateDiff = bookingStartDate - todaysDate;
    const diffDays = Math.ceil(dateDiff / (1000 * 3600 * 24)); // Difference in days
    if(booking.travelStatus === "not-started"){
        if(diffDays < 0){
            booking.travelStatus = "on-going";
            await booking.save();
        }

    }
    
    return res.status(StatusCodes.OK).json(
        new ApiResponse(StatusCodes.OK, "Ongoing Booking", booking)
    );
});


// this is for admin purpose
const getAllBookings = asyncHandler(async(req,res) => {
    const bookings = await CustomizeBooking.findAll({
        include: [{
            model: User,
            attributes: ['id', 'slug', 'fullName', 'email', 'profilePicture'] 
        },{
            model: Guide,
            attributes: ['id', 'slug', 'fullname', 'email', 'profilePhoto'] 
        }]
    });

    return res.status(StatusCodes.OK).json(
        new ApiResponse(StatusCodes.OK, "Bookings", bookings)
    );
});

export { getBookings, getOngoingBookings, getAllBookings }