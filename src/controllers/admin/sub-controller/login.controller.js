import Admin from "../../../models/admin.model.js";

import { asyncHandler } from "../../../utils/asyncHandler.js";
import { ApiError } from "../../../utils/ApiError.js";
import { StatusCodes } from "http-status-codes";
import { ApiResponse } from "../../../utils/ApiResponse.js";


const generateAccessAndRefreshToken = async(admin) => {
    const accessToken = admin.getAccessToken();
    const refreshToken = admin.getRefreshToken();

    admin.refreshToken = refreshToken;
    await admin.save();

    return {accessToken, refreshToken};
}


const login = asyncHandler(async (req, res) => {
    const { email, password} = req.body;

    if(!email || !password){
        throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid Credentials");
    }

    const admin = await Admin.findOne({email});

    if(!admin){
        throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid Credentials");
    }

    const isMatch = await admin.matchPassword(password);

    if(!isMatch){
        //updating wrong password counter
        admin.wrongPassword();
        throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid Credentials");
    }

    //if suspended
    if(admin.securityMetadata.isSuspended){
        throw new ApiError(StatusCodes.UNAUTHORIZED, "Your account has been suspended. Please contact support.");
    }

    //generate token
    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(admin);

   

    res.cookie("accessToken", accessToken, {httpOnly: true, expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 1)}); //1 days
    res.cookie("refreshToken", refreshToken, {httpOnly: true, expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)}); //30 days


    res.status(StatusCodes.OK).json({
        success: true,
        message: "Login Successful",
        accessToken,
        refreshToken
    })

});





// logout
const logout = asyncHandler(async (req, res) => {

    const admin = req.user;

    admin.refreshToken = null;
    await admin.save();
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    res.status(StatusCodes.OK).json(new ApiResponse(StatusCodes.OK, "Logout Successful"));
});




export {login, logout};