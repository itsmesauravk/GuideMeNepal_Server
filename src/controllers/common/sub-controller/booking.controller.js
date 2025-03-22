
import CustomizeBooking from "../../../models/customizeBooking.model.js";
import Guide from "../../../models/guide.model.js";
import User from "../../../models/user.model.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { ApiResponse } from "../../../utils/ApiResponse.js";
import { ApiError } from "../../../utils/ApiError.js";
import { StatusCodes } from "http-status-codes";



const createCustomizeBooking = asyncHandler(async(req,res) =>{
    
        const user = req.user;
        const { guideId, userId ,destination, startingLocation, accommodation, numberOfAdults, numberOfChildren,  estimatedPrice, startDate, endDate, bookingMessage, bookingType } = req.body;
        // console.log(req.body)
        const estimatedDays = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24));

        // if(!guideId || !destination || !startingLocation || !accommodation || !numberOfAdults || !numberOfChildren || !estimatedPrice || !startDate || !endDate || !bookingMessage || !bookingType){
        //     throw new ApiError(StatusCodes.BAD_REQUEST, "All fields are required")
        // }
        const bookingDate = new Date();

        if(!guideId){
            throw new ApiError(StatusCodes.BAD_REQUEST, "Guide Id is required")
        }
    
        const guide = await Guide.findOne({where: {id: guideId}})


        
        if(!guide){
            throw new ApiError(StatusCodes.NOT_FOUND, "Guide Not Found")
        }
    
        const customizeBooking = await CustomizeBooking.create({
            userId: userId,
            guideId: guideId,
            destination,
            startingLocation,
            accommodation,
            numberOfAdults,
            numberOfChildren,
            estimatedDays,
            estimatedPrice,
            startDate,
            endDate,
            bookingDate,
            bookingMessage,
            bookingType,
            platformLiability: true
        })
    
        return res.status(StatusCodes.CREATED).json(
            new ApiResponse(StatusCodes.CREATED, "Customize Booking Created", customizeBooking)
        )
    
    }
)


export {createCustomizeBooking}
