// ithis is for viewing guide details for client side

import Guide from "../../../models/guide.model.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { ApiResponse } from "../../../utils/ApiResponse.js";
import { ApiError } from "../../../utils/ApiError.js";
import { StatusCodes } from "http-status-codes";
import GuideReview from "../../../models/guideReview.model.js";
import User from "../../../models/user.model.js";



const getSingleGuideDetails = asyncHandler(async (req, res) => {
    const slug = req.params.slug;

    if (!slug) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Slug is required");
    }

    // Get selected fields from query params (comma-separated)
    const selectFields = req.query.select ? req.query.select.split(",") : null;
    const excludeFields = req.query.exclude ? req.query.exclude.split(",") : [];

    // Default fields to exclude
    const defaultExclude = ["password", "refreshToken", "registrationStatus", "firstTimeLogin", "securityMetadata", "otp"];

    const guide = await Guide.findOne({
        where: { slug },
        attributes: selectFields ? selectFields : { exclude: [...defaultExclude, ...excludeFields] }
    });

    const guideReviews = await GuideReview.findAll({
        where: { guideId: guide.id },
    });

    const totalReviews = guideReviews.length;
    const averageRating = guideReviews.reduce((acc, review) => acc + review.rating, 0) / totalReviews || 0;

    if (!guide) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Unable to find the guide");
    }

    const resposeData = {
        ...guide.toJSON(),
        totalReviews,
        averageRating,
    }

    return res.status(StatusCodes.OK).json(
        new ApiResponse(StatusCodes.OK, "Guide Found", resposeData )
    );
});


export {getSingleGuideDetails}