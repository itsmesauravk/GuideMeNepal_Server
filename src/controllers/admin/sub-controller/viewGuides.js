
import { Op } from "sequelize";
import Guide from "../../../models/guide.model.js";
import { StatusCodes } from "http-status-codes";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { ApiResponse } from "../../../utils/ApiResponse.js";
import { ApiError } from "../../../utils/ApiError.js";


const getGuides = asyncHandler(async (req, res) => {
    const { 
        search, 
        page = 1, 
        limit = 10, 
        sortBy = "createdAt", 
        sortOrder = "DESC", 
        fields  // select fields
    } = req.query;

    // Validate page and limit
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    if (isNaN(pageNumber) || isNaN(limitNumber)) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid page or limit value");
    }

    // Base query options
    const queryOptions = {
        attributes: { exclude: ["password", "otp", "refreshToken"] },
        where: {
            verified: true, // Filter for verified guides only
        },
        order: [[sortBy, sortOrder]],
        offset: (pageNumber - 1) * limitNumber,
        limit: limitNumber,
    };

    // Apply search filter if provided
    if (search) {
        queryOptions.where = {
            ...queryOptions.where, // Retain the previous conditions
            [Op.or]: [
                { name: { [Op.like]: `%${search}%` } },
                { email: { [Op.like]: `%${search}%` } },
                // other fields to look at
            ],
        };
    }

    // Apply fields filter if provided
    if (fields) {
        const selectedFields = fields.split(",");
        queryOptions.attributes = selectedFields;
    }

    // Fetch guides
    const guides = await Guide.findAll(queryOptions);

    // Count total records (without offset and limit)
    const countOptions = { ...queryOptions };
    delete countOptions.offset;
    delete countOptions.limit;
    const count = await Guide.count(countOptions);

    if (!guides || guides.length === 0) {
        throw new ApiError(StatusCodes.NOT_FOUND, "No guides found");
    }

    // Return the response with pagination details
    return res.status(StatusCodes.OK).json(
        new ApiResponse(StatusCodes.OK, "Guides fetched successfully", {
            total: count,
            page: pageNumber,
            limit: limitNumber,
            totalPages: Math.ceil(count / limitNumber),
            guides,
        })
    );
});


export { getGuides };