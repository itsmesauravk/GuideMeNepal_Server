import Guide from "../../../models/guide.model.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { ApiResponse } from "../../../utils/ApiResponse.js";
import { ApiError } from "../../../utils/ApiError.js";
import { StatusCodes } from "http-status-codes";
import bcryptjs from "bcryptjs";

const loginGuide = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "All fields are required");
    }

    const guide = await Guide.findOne({ where: { email } }); // Query: SELECT * FROM Guide WHERE email = email
    if (!guide) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Guide not found");
    }

    if (guide.registrationStatus !== "registered") {
        throw new ApiError(StatusCodes.FORBIDDEN, "Account is not registered yet");
    }

    if (guide.verified === false) {
        throw new ApiError(StatusCodes.FORBIDDEN, "Guide is not verified yet");
    }

    if (guide.securityMetadata.isSuspended === true) {
        throw new ApiError(StatusCodes.FORBIDDEN, "Guide account is suspended");
    }

    // if (guide.securityMetadata.wrongPasswordCounter >= 5) {
    //     throw new ApiError(StatusCodes.FORBIDDEN, "Guide account is suspended due to multiple wrong password attempts");
    // }

    const verifyPassword = bcryptjs.compareSync(password, guide.password);

    if (!verifyPassword) {
        // guide.securityMetadata.wrongPasswordCounter += 1;
        // await guide.save();
        throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid Credentials");
    }

    // guide.securityMetadata.wrongPasswordCounter = 0;
    guide.lastActiveAt = new Date();
    await guide.save();

    
    const guideToken = await guide.getAccessToken();
    //response guide data
    const guideData = {
        id: guide.id,
        fullname: guide.fullname,
        email: guide.email,
        profilePhoto: guide.profilePhoto,
        verified: guide.verified,
        registrationStatus: guide.registrationStatus,
        firstTimeLogin: guide.firstTimeLogin,
        guideToken
    };

    if(!guideData.firstTimeLogin){
        res.cookie("guideToken", guideToken, {
            httpOnly: true,
            expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 1), // 1 day
        });
    }

   

    return res.status(StatusCodes.OK).json(
        new ApiResponse(StatusCodes.OK, "Guide logged in successfully",guideData
        )
    );
});




export { loginGuide };