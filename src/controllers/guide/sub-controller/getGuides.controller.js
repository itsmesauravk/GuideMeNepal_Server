

import Guide from "../../../models/guide.model.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { ApiResponse } from "../../../utils/ApiResponse.js";
import { ApiError } from "../../../utils/ApiError.js";
import { StatusCodes } from "http-status-codes";
import GuideReview from "../../../models/guideReview.model.js";

import { Op } from "sequelize";

import { sequelize } from "../../../db/ConnectDB.js";



const getPopularAndNewGuides = asyncHandler(async (req, res) => {
    
    const guides = await Guide.findAll({
        where: { verified: true , "availability.isActivate":true, "securityMetadata.isSuspended":false },
        limit: 4,
        order: [["createdAt", "DESC"]], 
        attributes: ["id", "fullname", "slug", "languageSpeak", "guidingAreas", "profilePhoto", "verified", "aboutMe"],
      });
      
      // Create an array to store guides with their review stats
      const newGuides = await Promise.all(guides.map(async (guide) => {
        const guideReviews = await GuideReview.findAll({
          where: { guideId: guide.id },
        });
        
        let totalReviews = guideReviews.length;
        let averageRating = totalReviews > 0 
          ? guideReviews.reduce((acc, review) => acc + review.rating, 0) / totalReviews 
          : 0;
        
        // Return guide object with added review stats
        return {
          ...guide.get({ plain: true }),
          totalReviews,
          averageRating
        };
      }));

   


  
    /* 
    For popular guides 
    1. get the profile views count from Guide table
    2. get the booking count from the CustomizeBooking table
    3. get the review count from the GuideReview table
    4. get the average rating from the GuideReview table

    approach:
    1. first get all the uinque guide ids from the CustomizeBooking table and GuideReview table
    2. then get the guide ids from the Guide table and join them with the CustomizeBooking and GuideReview table
    3. then get the average rating and booking count and review count from the CustomizeBooking and GuideReview table
    4. then get the profile views count from the Guide table
    5. then order the guides by the profile views count and booking count and review count and average rating
    6. then limit the result to 4 guides
    7. then return the result
    */

     // For popular guides - we need to aggregate data from multiple sources
    // This requires a more complex query with subqueries for proper counting

    // Use a raw query to properly calculate all metrics
   

    const popularGuidesQuery = `
    SELECT 
        g.id, 
        g.fullname, 
        g.slug, 
        g."languageSpeak", 
        g."guidingAreas", 
        g."profilePhoto", 
        g.verified, 
        g."aboutMe",
        g.profileviews,
        g.availability,
        g."securityMetadata",
        COUNT(DISTINCT b.id) AS bookingcount,
        COUNT(DISTINCT r.id) AS "totalReviews",
        COALESCE(AVG(r.rating), 0) AS "averageRating",
        (COALESCE(AVG(r.rating), 0) * 3) + 
        (COUNT(DISTINCT b.id) * 2.5) + 
        (COUNT(DISTINCT r.id) * 1.5) + 
        (g.profileviews * 0.5) AS popularityscore
    FROM 
        guides g
    LEFT JOIN 
        "CustomizeBookings" b ON g.id = b.guide
    LEFT JOIN 
        guide_reviews r ON g.id = r."guideId"
    WHERE 
        g.verified = true
        AND (g.availability->>'isActivate')::boolean = true
        AND (g."securityMetadata"->>'isSuspended')::boolean = false
       
    GROUP BY 
        g.id
    ORDER BY 
        popularityscore DESC
    LIMIT 4
`;


    const [popularGuides] = await sequelize.query(popularGuidesQuery);

    return res.status(StatusCodes.OK).json(
      new ApiResponse(StatusCodes.OK, "Guides Found", {
        newGuides,
        popularGuides
      })
    );
  });



const getGuides = asyncHandler(async (req, res) => {
    const { guidingArea } = req.query; 

    const whereCondition = { verified: true , "availability.isActivate":true, "securityMetadata.isSuspended":false  };

    // Apply filtering if guidingArea is provided
    if (guidingArea) {
        whereCondition.guidingAreas = { [Op.contains]: [guidingArea] }; 
    }

    const guides = await Guide.findAll({
        where: whereCondition,
        attributes: ["id", "fullname", "slug", "languageSpeak", "guidingAreas", "profilePhoto", "verified", "aboutMe"],
    });

    if (!guides || guides.length === 0) {
        throw new ApiError(StatusCodes.NOT_FOUND, "No Guides Found");
    }

    return res.status(StatusCodes.OK).json(
        new ApiResponse(StatusCodes.OK, "Guides Found", guides)
    );
});



export {getPopularAndNewGuides, getGuides}