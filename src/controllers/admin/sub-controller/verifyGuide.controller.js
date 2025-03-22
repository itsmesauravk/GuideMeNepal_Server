
import Guide from "../../../models/guide.model.js";

import { StatusCodes } from "http-status-codes";

import { asyncHandler } from "../../../utils/asyncHandler.js";
import { ApiResponse } from "../../../utils/ApiResponse.js";
import { ApiError } from "../../../utils/ApiError.js";
import { requestRejectionMail, requestVerificationMail } from "../../../utils/MailSend.js";
import bcryptjs from "bcryptjs";


//generate random password
const generatePassword = () => {
  const length = 6;
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  
  return password;
};

// get registration request
const getRegistrationRequest = asyncHandler(async (req, res) => {
  const guides = await Guide.findAll({
    where: {
      "registrationStatus": ["pending","viewed"],
    },
    attributes: ["id", "fullname", "email", "contact","verified", "guidingAreas","languageSpeak","registrationStatus", "profilePhoto", "createdAt"],
    order: [["createdAt", "DESC"]],
  });  // Query: SELECT * FROM Guide WHERE registrationStatus = "pending" ORDER BY createdAt DESC

  if(!guides || guides.length === 0){
    throw new ApiError(StatusCodes.NOT_FOUND, "No registration requests found");
  }

  return res.status(StatusCodes.OK).json(
    new ApiResponse(StatusCodes.OK, "Registration Requests", guides)
  );
});




// verify requests (action: accept or reject)
const verifyRequest = asyncHandler(async (req, res) => {
    const { action } = req.body;
    const { id } = req.params;
  
    // Validate action
    if (!action) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Action is required");
    }

    if(!id){
      throw new ApiError(StatusCodes.BAD_REQUEST, "Guide ID is required");
    }
  
    // Find the guide by ID
    const guide = await Guide.findByPk(id); // Query: SELECT * FROM Guide WHERE id = id
    if (!guide) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Guide not found");
    }
  
    // Check if the guide's registration status is already verified
    if (guide.registrationStatus == "registered"  ) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Guide is already verified");
    }

  
   
    if (action === "accept") {
      guide.registrationStatus = "registered"; 
      guide.verified = true;
    //generate random password
        const tempPass = generatePassword();

        const salt = bcryptjs.genSaltSync(10);
        const hashedPassword = bcryptjs.hashSync(tempPass, salt);

       
        if(!tempPass || !hashedPassword){
          throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Password generation failed");
        }
        guide.password = hashedPassword;
        
      await requestVerificationMail(guide.email,guide.fullname,tempPass);

    } else if (action === "reject") {
      guide.registrationStatus = "rejected";
      await requestRejectionMail(guide.email, guide.fullname);
    } else {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid action. Use 'accept' or 'reject'");
    }

    await guide.save();  // Query: UPDATE Guide SET profile = guide.profile WHERE id = id
  
    
  
    // Return success response
    return res
      .status(StatusCodes.OK)
      .json(new ApiResponse(StatusCodes.OK, "Request verified successfully"));
  });



//exports
export {getRegistrationRequest, verifyRequest};