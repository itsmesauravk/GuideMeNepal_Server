
import CustomizeBooking from "../../../models/customizeBooking.model.js";
import Guide from "../../../models/guide.model.js";
import District from "../../../models/district.model.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { ApiResponse } from "../../../utils/ApiResponse.js";
import { ApiError } from "../../../utils/ApiError.js";
import { StatusCodes } from "http-status-codes";
import { Op } from "sequelize";
import { getReceiverSocketId, io } from "../../../socket/socket.js";
import Notification from "../../../models/notification.model.js";



const createCustomizeBooking = asyncHandler(async(req,res) =>{
    
        
        const { guideId, userId, contact ,destination, startingLocation, accommodation, numberOfAdults, numberOfChildren,  estimatedPrice, startDate, endDate, bookingMessage, bookingType } = req.body;
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
            contact,
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
            reviewstatus:false,
            platformLiability: true
        })

    

        //update the district booking count
        const district = await District.findOne({where: {
            slug: destination,
        }})
        if(district){
            district.bookings += 1;
            await district.save();
        }

         // 6 - create a notification for the user and guide
    const reciverSocketId = getReceiverSocketId(customizeBooking.guideId);
    const notification = await Notification.create({
        title: "Booking Request",
        description: `You have a new booking request for ${customizeBooking.destination}`,
        notificationType: "booking",
        reciver: "guide",
        userId: customizeBooking.userId,
        guideId: customizeBooking.guideId,
        bookingId: customizeBooking.id,
    });
    const totalUnread = await Notification.count({
        where: {
            guideId: customizeBooking.guideId,
            reciver: "guide",
            isRead: false,
        },
    });


    if (reciverSocketId) {
        io.to(reciverSocketId).emit("newNotification", notification);
        io.to(reciverSocketId).emit("notificationCount", totalUnread);
    }
    
        return res.status(StatusCodes.CREATED).json(
            new ApiResponse(StatusCodes.CREATED, "Customize Booking Created", customizeBooking)
        )
    
    }
)


const cancelCustomizeBookingUser = asyncHandler(async(req,res) =>{
    const { bookingId } = req.params;
    const {message} = req.body;

    const customizeBooking = await CustomizeBooking.findOne({where: {id: bookingId}})

    if(!customizeBooking){
        throw new ApiError(StatusCodes.NOT_FOUND, "Customize Booking Not Found")
    }

    if(message){
        customizeBooking.cancelMessage = message
    }else{
        customizeBooking.cancelMessage = "No message from user"
    }

    customizeBooking.bookingStatus = "cancelled"
    await customizeBooking.save()

     // 6 - create a notification for the user and guide
     const reciverSocketId = getReceiverSocketId(customizeBooking.guideId);
     const notification = await Notification.create({
         title: "Booking Request Cancelled",
         description: `Your booking request has been cancelled by ${customizeBooking.userId}`,
         notificationType: "booking",
         reciver: "guide",
         userId: customizeBooking.userId,
         guideId: customizeBooking.guideId,
         bookingId: customizeBooking.id,
     });
     const totalUnread = await Notification.count({
         where: {
             guideId: customizeBooking.guideId,
             reciver: "guide",
             isRead: false,
         },
     });
 
 
     if (reciverSocketId) {
         io.to(reciverSocketId).emit("newNotification", notification);
         io.to(reciverSocketId).emit("notificationCount", totalUnread);
     }
     

    

    return res.status(StatusCodes.OK).json(
        new ApiResponse(StatusCodes.OK, "Customize Booking Canceled", customizeBooking)
    )
})

const rejectCustomizeBookingGuide = asyncHandler(async(req,res) =>{
    const { bookingId } = req.params;
    const {message} = req.body;

    const customizeBooking = await CustomizeBooking.findOne({where: {id: bookingId}})

    if(!customizeBooking){
        throw new ApiError(StatusCodes.NOT_FOUND, "Customize Booking Not Found")
    }

    if(message){
        customizeBooking.cancelMessage = message
    }else{
        customizeBooking.cancelMessage = "No message from guide"
    }

    customizeBooking.bookingStatus = "rejected"
    await customizeBooking.save()

     // 6 - create a notification for the user and guide
     const reciverSocketId = getReceiverSocketId(customizeBooking.guideId);
     const notification = await Notification.create({
         title: "Booking Request Rejected",
         description: `Your booking request for ${customizeBooking.destination} has been rejected by Guide`,
         notificationType: "booking",
         reciver: "user",
         userId: customizeBooking.userId,
         guideId: customizeBooking.guideId,
         bookingId: customizeBooking.id,
     });
     const totalUnread = await Notification.count({
         where: {
             userId: customizeBooking.userId,
             reciver: "user",
             isRead: false,
         },
     });
 
 
     if (reciverSocketId) {
         io.to(reciverSocketId).emit("newNotification", notification);
         io.to(reciverSocketId).emit("notificationCount", totalUnread);
     }
     

    return res.status(StatusCodes.OK).json(
        new ApiResponse(StatusCodes.OK, "Customize Booking Rejected", customizeBooking)
    )
})


//accpet booking
const acceptCustomizeBookingGuide = asyncHandler(async(req, res) => {
    const { bookingId } = req.params;

    // 1 - check if the booking exists
    const customizeBooking = await CustomizeBooking.findOne({where: {id: bookingId}});
    if (!customizeBooking) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Customize Booking Not Found");
    }

    // 2 - check if the booking is already accepted or rejected
    if (customizeBooking.bookingStatus === "accepted") {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Booking is already accepted");
    }
    if (customizeBooking.bookingStatus === "rejected") {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Booking is already rejected");
    }
    if (customizeBooking.bookingStatus === "cancelled") {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Booking is already cancelled");
    }


    // 3 - update the booking status to accepted
    customizeBooking.bookingStatus = "accepted";
    await customizeBooking.save();

    // 4 - reject all other bookings request for the same guide with the cancellation message
    const { guideId } = customizeBooking;
    const otherBookings = await CustomizeBooking.findAll({
        where: {
            guideId: guideId,
            id: { [Op.ne]: bookingId }, // exclude the current booking
            bookingStatus: "pending"
        }
    });

    if (otherBookings.length > 0) {
        for (const booking of otherBookings) {
            booking.bookingStatus = "rejected";
            booking.cancelMessage = "Guide is no longer available for this period";
            await booking.save();
        }
    }

    // 5 - update the status of the guide to isAvailable - false
    const guide = await Guide.findOne({where: {id: guideId}});
    if (guide) {
        guide.availability = {
            ...guide.availability,
            isAvailable: false
        };
        await guide.save();
    }

    // 6 - create a notification for the user and guide
    const reciverSocketId = getReceiverSocketId(customizeBooking.userId);
    const notification = await Notification.create({
        title: "Booking Accepted",
        description: `Your booking request has been accepted by ${guide.fullname}`,
        notificationType: "booking",
        reciver: "user",
        userId: customizeBooking.userId,
        guideId: customizeBooking.guideId,
        bookingId: customizeBooking.id,
    });
    const totalUnread = await Notification.count({
        where: {
            userId: customizeBooking.userId,
            reciver: "user",
            isRead: false,
        },
    });


    if (reciverSocketId) {
        io.to(reciverSocketId).emit("newNotification", notification);
        io.to(reciverSocketId).emit("notificationCount", totalUnread);
    }

    // 7 - response with the booking details
    return res.status(StatusCodes.OK).json(
        new ApiResponse(StatusCodes.OK, " Booking Accepted", customizeBooking)
    );
});


export {createCustomizeBooking, cancelCustomizeBookingUser, rejectCustomizeBookingGuide, acceptCustomizeBookingGuide}
