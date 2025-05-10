import HelpAndSupport from "../../../models/help.model.js";


import { asyncHandler } from "../../../utils/asyncHandler.js";
import { ApiResponse } from "../../../utils/ApiResponse.js";
import { ApiError } from "../../../utils/ApiError.js";
import { StatusCodes } from "http-status-codes";



//create help and support
const createHelpAndSupport = asyncHandler(async (req, res) => {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
        throw new ApiError(
            StatusCodes.BAD_REQUEST,
            "Please provide all required fields"
        );
    }

    // Check if the user already exists
    const existingUser = await HelpAndSupport.findOne({
        where: {
            email: email,
            status: "pending",
        },
    });

    if (existingUser) {
        throw new ApiError(
            StatusCodes.BAD_REQUEST,
            "You have already submitted a request. Please wait for a response."
        );
    }

    // Create a new help and support request
    const newRequest = await HelpAndSupport.create({
        fullname:name,
        email,
        message,
    });

    return res.status(StatusCodes.CREATED).json(
        new ApiResponse(
            StatusCodes.CREATED,
            "Help and support request created successfully",
            newRequest
        )
    );
});


// Get all help and support requests
const getAllHelpAndSupportRequests = asyncHandler(async (req, res) => {
    const requests = await HelpAndSupport.findAll({
        order: [["createdAt", "DESC"]],
    });

    return res.status(StatusCodes.OK).json(
        new ApiResponse(
            StatusCodes.OK,
            "Help and support requests fetched successfully",
            requests
        )
    );
});


//update help and support request
const updateHelpAndSupportRequest = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    // Check if the request exists
    const request = await HelpAndSupport.findByPk(id);
    if (!request) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Request not found");
    }

    // Update the request status
    request.status = status;
    await request.save();

    return res.status(StatusCodes.OK).json(
        new ApiResponse(
            StatusCodes.OK,
            "Help and support request updated successfully",
            request
        )
    );
});




//export 
export  {
    createHelpAndSupport,
    getAllHelpAndSupportRequests,
    updateHelpAndSupportRequest,
};