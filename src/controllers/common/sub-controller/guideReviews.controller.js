import GuideReview from "../../../models/guideReview.model.js";
import User from "../../../models/user.model.js";
import Guide from "../../../models/guide.model.js";

import { ApiError } from "../../../utils/ApiError.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { ApiResponse } from "../../../utils/ApiResponse.js";
import { StatusCodes } from "http-status-codes";


//create a review 
const createGuideReview = asyncHandler(async (req, res) => {
  const {userId, guideId, rating, destination, comments } = req.body;


  // Check if the guide exists
  const guide = await Guide.findByPk(guideId);
  if (!guide) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Guide not found");
  }

  // Create the review
  const review = await GuideReview.create({
    guideId,
    userId,
    rating,
    destination,
    comments,
  });

  if (!review) {
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Failed to create review");
  }

  return res.status(StatusCodes.CREATED).json(
    new ApiResponse(StatusCodes.CREATED, "Review created successfully", review)
  );
});



export {createGuideReview}