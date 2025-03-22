
import Guide from "../../../models/guide.model.js";

import { StatusCodes } from "http-status-codes";

import { asyncHandler } from "../../../utils/asyncHandler.js";
import { ApiResponse } from "../../../utils/ApiResponse.js";
import { ApiError } from "../../../utils/ApiError.js";
import { requestViewedMail } from "../../../utils/MailSend.js";
import bcryptjs from "bcryptjs";



const getSingleRequest = asyncHandler(async (req, res) => {
    const { id } = req.params;
    
     //get all except password
    const guide = await Guide.findByPk(id, {
        attributes: { exclude: ["password","otp","refreshToken"] },
    }); // Query: SELECT * FROM Guide WHERE id = id
    
    if (!guide) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Guide not found");
    }
    //update the status
    if(guide.registrationStatus === "pending"){
        await guide.update({
            registrationStatus: "viewed",
        });
        await requestViewedMail(guide.email, guide.fullname);
    }

    
    return res.status(StatusCodes.OK).json(
        new ApiResponse(StatusCodes.OK, "Guide", guide)
    );
    });

    export { getSingleRequest };