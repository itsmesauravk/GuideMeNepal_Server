import Admin from "../models/admin.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshToken = async(admin) => {
    const newAccessToken = admin.getAccessToken();
    
    return {newAccessToken};
}

const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
       
        const accessToken = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
       

        if (!accessToken) {
            const refreshToken = req.cookies?.refreshToken;
            
            if (!refreshToken) {
                throw new ApiError(401, "Unauthorized request");
            }

            // Verify refresh token and get admin
            const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
            const admin = await Admin.findById(decoded?.id).select("-password -refreshToken -securityMetadata");

            if (!admin) {
                throw new ApiError(401, "Invalid Request");
            }

            // Generate new access token and refresh token
            const {newAccessToken} = await generateAccessAndRefreshToken(admin);
            
           res.cookie("accessToken", newAccessToken, {httpOnly: true, expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 1)}); //1 days

            req.user = admin;
            return next();
        }

        // Verify access token
        const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
        
        // Get admin without sensitive fields
        const admin = await Admin.findById(decoded?.id)
            .select("-password -refreshToken -securityMetadata");

        if (!admin) {
            throw new ApiError(401, "Invalid access token");
        }

        req.user = admin;
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