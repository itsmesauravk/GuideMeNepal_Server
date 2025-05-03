import Guide from "../../../models/guide.model.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { ApiResponse } from "../../../utils/ApiResponse.js";
import { ApiError } from "../../../utils/ApiError.js";
import { StatusCodes } from "http-status-codes";
import { registrationSubmittedMail } from "../../../utils/MailSend.js";
import { uploadOnCloudinary } from "../../../utils/cloudinary.js";
import slug from "slug";

const registerGuide = asyncHandler(async (req, res) => {
    const { 
        fullName, 
        email, 
        contactNumber,
       languages,
        guideTypes,
        guidingAreas,
        aboutMe,
        experiences
    } = req.body;

    // console.log(req.body)

    if (!fullName || !email || !contactNumber) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "All required fields must be filled.");
    }

    // Extract uploaded files
    const liscensePhoto = req.files?.liscensePhoto ? req.files.liscensePhoto[0].path : null;
    const profilePhoto = req.files?.profilePhoto ? req.files.profilePhoto[0].path : null;
    const selfVideo = req.files?.selfVideo ? req.files.selfVideo[0].path : null;

    // Check if required files are uploaded
    if (!liscensePhoto) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "License photo is required.");
    }

    // Upload files to Cloudinary and store the response URLs
    let liscenseURL, profileURL, selfVideoURL;

    if (liscensePhoto) {
        const uploadResponse = await uploadOnCloudinary(liscensePhoto, "/guide-details/liscense");
        liscenseURL = uploadResponse?.secure_url || null;
    }
    if (profilePhoto) {
        const uploadResponse = await uploadOnCloudinary(profilePhoto, "/guide-details/profile");
        profileURL = uploadResponse?.secure_url || null;
    }
    if (selfVideo) {
        const uploadResponse = await uploadOnCloudinary(selfVideo, "/guide-details/videos");
        selfVideoURL = uploadResponse?.secure_url || null;
    }

    // Check if guide already exists
    const guideExists = await Guide.findOne({ where: { email } });
    if (guideExists) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Email already exists");
    }

    
    const slugName = slug(fullName, { lower: true });
    const guideSlug = `${slugName}-${Date.now()}`;
    

    // Create a new guide entry in the database
    const guide = await Guide.create({
        fullname:fullName,
        slug: guideSlug,
        email,
        contact:contactNumber,
        password: null,
        languageSpeak: JSON.parse(languages) || [],
        guideType:JSON.parse(guideTypes) || [],
        profilePhoto: profileURL,
        liscensePhoto: liscenseURL,
        selfVideo: selfVideoURL,
        guidingAreas: JSON.parse(guidingAreas) || [],
        aboutMe,
        experiences: JSON.parse(experiences) || [],
        verified: false,
        registrationStatus: "pending"
    });

    if (!guide) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Unable to submit the form");
    }

    // Send confirmation email
    await registrationSubmittedMail(guide.email, guide.fullname);

    return res.status(StatusCodes.CREATED).json(
        new ApiResponse(StatusCodes.CREATED, "Registration Request Submitted")
    );
});

export { registerGuide };
