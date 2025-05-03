// ithis is for viewing guide details for client side

import Guide from "../../../models/guide.model.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { ApiResponse } from "../../../utils/ApiResponse.js";
import { ApiError } from "../../../utils/ApiError.js";
import { StatusCodes } from "http-status-codes";
import { uploadOnCloudinary } from "../../../utils/cloudinary.js";
import slug from "slug";
import bcrypt from "bcryptjs";




const getGuideProfileFullDetails = asyncHandler(async (req, res) => {
    const guideId = req.params.guideId;

    if (!guideId) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Guide Id is required");
    }



    // Default fields to exclude
    const defaultExclude = ["password", "refreshToken", "registrationStatus", "firstTimeLogin", "securityMetadata", "otp"];

    const guide = await Guide.findOne({
        where: { id: guideId },
        attributes: { exclude: [...defaultExclude] }
    })

   
    if (guide.length === 0) {
        return res.status(StatusCodes.OK).json(
            new ApiResponse(StatusCodes.OK, "Guide Not Found", guide )
        );
    }



    return res.status(StatusCodes.OK).json(
        new ApiResponse(StatusCodes.OK, "Guide Found", guide )
    );
});


const updateGuideProfile = asyncHandler(async (req, res) => {
    const guideId = req.params.guideId;

   

    if (!guideId) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Guide Id is required");
    }

    const profilePhoto = req.files?.profilePhoto ? req.files.profilePhoto[0].path : null;
    const selfVideo = req.files?.selfVideo ? req.files.selfVideo[0].path : null;


    // Check if required files are uploaded
    let profileURL, selfVideoURL;
    if (profilePhoto) {
        const uploadResponse = await uploadOnCloudinary(profilePhoto, "/guide-details/profile");
        profileURL = uploadResponse?.secure_url || null;
    }

    if (selfVideo) {
        const uploadResponse = await uploadOnCloudinary(selfVideo, "/guide-details/videos");
        selfVideoURL = uploadResponse?.secure_url || null;
    }
   


    const guide = await Guide.findOne({
        where: { id: guideId },
       
    });

    if (!guide) {
        return res.status(StatusCodes.NOT_FOUND).json(
            new ApiResponse(StatusCodes.NOT_FOUND, "Guide Not Found")
        );
    }

    //create new slug for the guide
    let newSlug;
    if(req.body.fullname){
        if(guide.fullname !== req.body.fullname){
            const slugName = slug(fullname, { lower: true });
            newSlug = `${slugName}-${Date.now()}`;
        }
    }

    //hash password if provided
    let passwordHash = null;
    if(req.body.password && req.body.newPassword) {
        const isPasswordMatch = await bcrypt.compare(req.body.password, guide.password);
        if (!isPasswordMatch) {
            return res.status(StatusCodes.BAD_REQUEST).json(
                new ApiResponse(StatusCodes.BAD_REQUEST, "Current password is incorrect")
            );
        }
        passwordHash = await bcrypt.hash(req.body.newPassword, 10);
    }

    
    

    // Update the guide's profile
    const updateProfile = await guide.update({
        fullname: req.body.fullname || guide.fullname,
        slug: newSlug || guide.slug,
        email: req.body.email || guide.email,
        contact: req.body.contact || guide.contact,
        password: passwordHash || guide.password,
        languageSpeak: req.body.languageSpeak ? JSON.parse(req.body.languageSpeak) : guide.languageSpeak,
        guideType: req.body.guideType ? JSON.parse(req.body.guideType) : guide.guideType,
        profilePhoto: profileURL || guide.profilePhoto,
        liscensePhoto: guide.liscensePhoto,
        selfVideo: selfVideoURL || guide.selfVideo,
        guidingAreas: req.body.guidingAreas ? JSON.parse(req.body.guidingAreas) : guide.guidingAreas,
        aboutMe: req.body.aboutMe || guide.aboutMe,
        experiences: req.body.experiences ? JSON.parse(req.body.experiences) : guide.experiences,
        availability: {
            ...guide.availability,
            isActivate: req.body.isActivate !== undefined ? req.body.isActivate : guide.availability.isActivate
        }
    });

    if (!updateProfile) {
        return res.status(StatusCodes.BAD_REQUEST).json(
            new ApiResponse(StatusCodes.BAD_REQUEST, "Unable to update the profile")
        );
    }
    

    return res.status(StatusCodes.OK).json(
        new ApiResponse(StatusCodes.OK, "Guide Profile Updated Successfully", updateProfile )
    );
}
);


export {getGuideProfileFullDetails, updateGuideProfile}