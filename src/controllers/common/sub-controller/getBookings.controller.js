import CustomizeBooking from "../../../models/customizeBooking.model.js";
import Guide from "../../../models/guide.model.js";
import User from "../../../models/user.model.js";
import { ApiResponse } from "../../../utils/ApiResponse.js";
import { ApiError } from "../../../utils/ApiError.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { StatusCodes } from "http-status-codes";



// this controller is for getting all bookings of a user or guide

const getBookings = asyncHandler(async(req,res) =>{
    const role  = req.query.role;
    const id = req.params.id;
    let bookings = [];
    if(!role || !id){
        throw new ApiError(StatusCodes.BAD_REQUEST, "Role and Id are required")
    }
    if(role !== "user" && role !== "guide"){
        throw new ApiError(StatusCodes.BAD_REQUEST, "Role must be either user or guide")
    }

    if(role === "user"){
        bookings = await CustomizeBooking.findAll({where: {userId: id}, include: [{
            model: Guide,
            attributes: ['id', 'slug', 'fullname', 'email', 'profilePhoto'] 
          }]})
        //query : SELECT * FROM customize_bookings WHERE userId = id JOIN guides ON customize_bookings.guideId = guides.id JOIN users ON customize_bookings.userId = users.id
    }else if(role === "guide"){
        bookings = await CustomizeBooking.findAll({where: {guideId: id}, include: [{
            model: User,
            attributes: ['id', 'slug', 'fullName', 'email', 'profilePicture'] 
          }]
        })
        //query : SELECT * FROM customize_bookings WHERE guideId = id JOIN guides ON customize_bookings.guideId = guides.id JOIN users ON customize_bookings.userId = users.id
       
    }

    return res.status(StatusCodes.OK).json(
        new ApiResponse(StatusCodes.OK, "Bookings", bookings)
    )
    

})

export { getBookings }