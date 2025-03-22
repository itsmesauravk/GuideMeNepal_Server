import User from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshToken = async(user) => {
    const newAccessToken = user.getAccessToken();
    
    return {newAccessToken};
}

const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
       
        const accessToken = req.cookies?.userToken || req.headers?.authorization?.split(" ")[1]
       

        if (!accessToken) {
            const refreshToken = req.cookies?.refreshToken;
            
            if (!refreshToken) {
                throw new ApiError(401, "Unauthorized request");
            }

            // Verify refresh token and get user
            const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
            const user = await User.findById(decoded?.id).select("-password -refreshToken -securityMetadata");

            if (!user) {
                throw new ApiError(401, "Invalid Request");
            }

            // Generate new access token and refresh token
            const {newAccessToken} = await generateAccessAndRefreshToken(user);
            
           res.cookie("accessToken", newAccessToken, {httpOnly: true, expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 1)}); //1 days

            req.user = user;
            return next();
        }

        // Verify access token
        const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
        
        // Get user without sensitive fields
        const user = await Admin.findById(decoded?.id)
            .select("-password -refreshToken -securityMetadata");

        if (!user) {
            throw new ApiError(401, "Invalid access token");
        }

        req.user = user;
        next();
        
    } catch (error) {
        throw new ApiError(401, 
            error instanceof jwt.TokenExpiredError ? "Token has expired" :
            error instanceof jwt.JsonWebTokenError ? "Invalid token" :
            "Authentication failed"
        );
    }
});

export { verifyJWT };