import Guide from "../../../models/guide.model.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { ApiResponse } from "../../../utils/ApiResponse.js";
import { ApiError } from "../../../utils/ApiError.js";
import { StatusCodes } from "http-status-codes";
import { Op } from "sequelize";
import Availability from "../../../models/availibility.model.js";


const getGuideAvailability = asyncHandler(async (req, res) => {
    const { guideId } = req.params; 

    // Check if the guide exists
    const guide = await Guide.findOne({ where: { id: guideId } });
    if (!guide) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Guide not found");
    }

    // Fetch availability for the specified guide
    const availability = await Availability.findAll({
        where: { guideId },
        attributes: ["id", "startDate", "endDate", "reason"],
    });

    if ( availability.length === 0) {
        return res.status(StatusCodes.OK).json(
            new ApiResponse(StatusCodes.OK, "Guide availability not set", availability)
        );
    }

    

    return res.status(StatusCodes.OK).json(
        new ApiResponse(StatusCodes.OK, "Guide availability found", availability)
    );
}
);


const createGuideAvailability = asyncHandler(async (req, res) => {
    const { guideId } = req.params; 
    const { startDate, endDate, reason } = req.body;

    
    
    // Validate dates
    const parsedStartDate = new Date(startDate);
    const parsedEndDate = new Date(endDate);

    // Check if the guide exists
    const guide = await Guide.findOne({ where: { id: guideId } });
    if (!guide) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Guide not found");
    }

    // Create availability for the specified guide
    const availability = await Availability.create({
        guideId,
        startDate: parsedStartDate,
        endDate: parsedEndDate,
        reason,
    });

    if (!availability) {    
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Failed to create availability");
    }

    return res.status(StatusCodes.CREATED).json(
        new ApiResponse(StatusCodes.CREATED, "Guide availability created", availability)
    );
}
);


const updateGuideAvailability = asyncHandler(async (req, res) => {
    const { guideId, availabilityId } = req.params; 
    const { startDate, endDate, reason } = req.body; 

    // Check if the guide exists
    const guide = await Guide.findOne({ where: { id: guideId } });
    if (!guide) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Guide not found");
    }

    // Check if the availability entry exists
    const availability = await Availability.findOne({ where: { id: availabilityId, guideId } });
    if (!availability) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Availability not found");
    }

    // Update availability for the specified guide
    availability.startDate = startDate || availability.startDate;
    availability.endDate = endDate || availability.endDate;
    availability.reason = reason || availability.reason;

    await availability.save();

    return res.status(StatusCodes.OK).json(
        new ApiResponse(StatusCodes.OK, "Guide availability updated", availability)
    );
}
);

const deleteGuideAvailaibility = asyncHandler(async (req, res) => {
    const {  availabilityId } = req.params; 

  
    // Check if the availability entry exists
    const availability = await Availability.findOne({ where: { id: availabilityId } });
    if (!availability) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Availability not found");
    }

    // Delete availability for the specified guide
    await availability.destroy();

    return res.status(StatusCodes.OK).json(
        new ApiResponse(StatusCodes.OK, "Guide availability deleted")
    );
}
);


export { getGuideAvailability, createGuideAvailability, updateGuideAvailability, deleteGuideAvailaibility };