// ithis is for viewing guide details for client side

import Guide from "../../../models/guide.model.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { ApiResponse } from "../../../utils/ApiResponse.js";
import { ApiError } from "../../../utils/ApiError.js";
import { StatusCodes } from "http-status-codes";
import GuideReview from "../../../models/guideReview.model.js";
import Availability from "../../../models/availibility.model.js";
import { or } from "sequelize";




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
        where: {slug:slug,verified: true , "availability.isActivate":true, "securityMetadata.isSuspended":false },
        attributes: selectFields ? selectFields : { exclude: [...defaultExclude, ...excludeFields] }
    })

    if (!guide) {
        return res.status(StatusCodes.OK).json(
            new ApiResponse(StatusCodes.OK, "Guide Not Found", guide )
        );
    }


    let  guideReviews;

    if (guide) {
        guideReviews = await GuideReview.findAll({
            where: { guideId: guide.id },
        });

    }

    let totalReviews = 0;
    let averageRating = 0;
    if (guideReviews && guideReviews.length > 0) {
        totalReviews = guideReviews.length;
        averageRating = guideReviews.reduce((acc, review) => acc + review.rating, 0) / totalReviews || 0;
    }

   
    if(guide.profileviews){

        guide.profileviews += 1; // Increment profile views by 1
        await guide.save(); 
    }


      // Fetch availability for the specified guide
        const availability_date = await Availability.findAll({
            where: { guideId: guide.id },
            order: [["startDate", "ASC"]],
            attributes: ["id", "startDate", "endDate", "reason"],
        });
    
        

    const resposeData = {
        ...guide.toJSON(),
        totalReviews,
        averageRating,
        availability_date,
    }

    return res.status(StatusCodes.OK).json(
        new ApiResponse(StatusCodes.OK, "Guide Found", resposeData )
    );
});


export {getSingleGuideDetails}