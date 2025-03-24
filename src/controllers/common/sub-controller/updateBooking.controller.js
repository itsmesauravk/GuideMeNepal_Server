
import CustomizeBooking from "../../../models/customizeBooking.model.js";
import Guide from "../../../models/guide.model.js";
import User from "../../../models/user.model.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { ApiResponse } from "../../../utils/ApiResponse.js";
import { ApiError } from "../../../utils/ApiError.js";
import { StatusCodes } from "http-status-codes";



//accept booking 
const acceptBooking = asyncHandler(async(req,res) =>{
    const user = req.user;
    const { bookingId } = req.body;
    const booking = await CustomizeBooking.findOne({where: {id: bookingId}})
    if(!booking){
        throw new ApiError(StatusCodes.NOT_FOUND, "Booking Not Found")
    }
    booking.status = "accepted";
    await booking.save();
    return res.status(StatusCodes.OK).json(
        new ApiResponse(StatusCodes.OK, "Booking Accepted", booking)
    )
})

//reject booking
const rejectBooking = asyncHandler(async(req,res) =>{
    const user = req.user;
    const { bookingId } = req.body;
    const booking = await CustomizeBooking.findOne({where: {id: bookingId}})
    if(!booking){
        throw new ApiError(StatusCodes.NOT_FOUND, "Booking Not Found")
    }
    booking.status = "rejected";
    await booking.save();
    return res.status(StatusCodes.OK).json(
        new ApiResponse(StatusCodes.OK, "Booking Rejected", booking)
    )
})

//cancel booking
const cancelBooking = asyncHandler(async(req,res) =>{
    const user = req.user;
    const { bookingId } = req.body;
    const booking = await CustomizeBooking.findOne({where: {id: bookingId}})
    if(!booking){
        throw new ApiError(StatusCodes.NOT_FOUND, "Booking Not Found")
    }
    booking.status = "cancelled";
    await booking.save();
    return res.status(StatusCodes.OK).json(
        new ApiResponse(StatusCodes.OK, "Booking Cancelled", booking)
    )
})

//start booking
const startBooking = asyncHandler(async(req,res) =>{
    const user = req.user;
    const { bookingId } = req.body;
    const booking = await CustomizeBooking.findOne({where: {id: bookingId}})
    if(!booking){
        throw new ApiError(StatusCodes.NOT_FOUND, "Booking Not Found")
    }
    booking.status = "started";
    await booking.save();
    return res.status(StatusCodes.OK).json(
        new ApiResponse(StatusCodes.OK, "Booking Started", booking)
    )
})

//end booking
const endBooking = asyncHandler(async(req,res) =>{
    const user = req.user;
    const { bookingId } = req.body;
    const booking = await CustomizeBooking.findOne({where: {id: bookingId}})
    if(!booking){
        throw new ApiError(StatusCodes.NOT_FOUND, "Booking Not Found")
    }
    booking.status = "ended";
    await booking.save();
    return res.status(StatusCodes.OK).json(
        new ApiResponse(StatusCodes.OK, "Booking Ended", booking)
    )
})



export { acceptBooking, rejectBooking, cancelBooking, startBooking, endBooking }