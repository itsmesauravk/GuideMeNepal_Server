


import { Op } from "sequelize";
import Guide from "../../../models/guide.model.js";
import { StatusCodes } from "http-status-codes";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { ApiResponse } from "../../../utils/ApiResponse.js";
import { ApiError } from "../../../utils/ApiError.js";

const guideSuspension = asyncHandler(async (req, res) => {
    const { guideId, action } = req.body;

    if (!guideId || !action) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Guide ID and action are required.");
    }

    // Validate the action value
    if (action !== "suspended" && action !== "active") {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid action value. Use 'suspended' or 'active'.");
    }

    // Find the guide by ID
    const guide = await Guide.findByPk(guideId);
    if (!guide) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Guide not found.");
    }

    //cannot perform suspension if the guide is booked
    const isBooked = !guide.availability.isAvailable 

    if (isBooked) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Cannot suspend the guide for now, as they have bookings.");
    }

    // Determine the suspension status based on action
    const isSuspended = action === "suspended";
    

    
    // Get the current securityMetadata or initialize if it doesn't exist
    const securityMetadata = {
        ...(guide.securityMetadata || {}),
        isSuspended: isSuspended
    };
    
    // Use direct update to ensure it's properly saved to the database
    await Guide.update(
        { securityMetadata: securityMetadata },
        { where: { id: guideId } }
    );

    return res.status(StatusCodes.OK).json(
        new ApiResponse(
            StatusCodes.OK, 
            `Guide ${isSuspended ? 'suspended' : 'activated'} successfully.`, 
            guide
        )
    );
});

export { guideSuspension };