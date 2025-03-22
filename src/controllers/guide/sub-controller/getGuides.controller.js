// i am making this temproraly for showing the guides in the client side ( i will updat this later)

import Guide from "../../../models/guide.model.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { ApiResponse } from "../../../utils/ApiResponse.js";
import { ApiError } from "../../../utils/ApiError.js";
import { StatusCodes } from "http-status-codes";
import bcryptjs from "bcryptjs";



const getPopularGuides = asyncHandler(async(req,res) =>{

    const popularGuides = await Guide.findAll({
        where: { verified: true },
        limit: 10,
        attributes: ["id", "fullname", "slug", "languageSpeak", "guidingAreas", "profilePhoto", "verified", "aboutMe"],
      });
      

    if(popularGuides.length === 0 || !popularGuides){
        throw new ApiError(StatusCodes.NOT_FOUND, "No Guides Found")
    }

    return res.status(StatusCodes.OK).json(
        new ApiResponse(StatusCodes.OK, "Guides Found", popularGuides)
    )

})

export {getPopularGuides}