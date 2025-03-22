import User from "../../../models/user.model.js";
import bcryptjs from "bcryptjs";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { ApiError } from "../../../utils/ApiError.js";
import { ApiResponse } from "../../../utils/ApiResponse.js";
import { StatusCodes } from "http-status-codes";



const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    
    if ( !email || !password ) {
        throw new ApiError(400, "All fields are required");
    }

    // validating whether the user already exists
    const existingUser = await User.findOne({ where: { email } });  // SQL Query : SELECT * FROM users WHERE email = email
    if (!existingUser) {
        throw new ApiError(409, "User not found");
    }

    // validating password
    const verifyPassword = bcryptjs.compareSync(password, existingUser.password);

    if (!verifyPassword) {
        throw new ApiError(500, "Invalid Credentials");
    }

    const userToken = await existingUser.getAccessToken();

    

    //update last active
    existingUser.lastActiveAt = new Date()
    await existingUser.save()
   

    res.cookie("userToken", userToken, {
        httpOnly: true,
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 1), // 1 day
    });

    res.status(StatusCodes.ACCEPTED).json(new ApiResponse(StatusCodes.ACCEPTED, "Login Successfull", {
        id: existingUser.id,
        fullName: existingUser.fullName,
        email: existingUser.email,
        authMethod: existingUser.authMethod,
        userToken
    }));


    
});



  
  export {loginUser};
  