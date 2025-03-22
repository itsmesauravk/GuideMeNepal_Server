import Admin from "../../../models/admin.model.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { ApiError } from "../../../utils/ApiError.js";
import { StatusCodes } from "http-status-codes";
import { ApiResponse } from "../../../utils/ApiResponse.js";

// Helper function to generate access and refresh tokens
const generateAccessAndRefreshToken = async (admin) => {
    const accessToken = admin.getAccessToken();
    const refreshToken = admin.getRefreshToken();

    // Update the refresh token in the database
    await admin.update({ refreshToken });

    return { accessToken, refreshToken };
};

// Login controller
const login = asyncHandler(async (req, res) => {
    
    const { email, password } = req.body;

   

    // Validate input
    if (!email || !password) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Email and password are required");
    }

    // Find admin by email
    const admin = await Admin.findOne({ where: { email } });
    if (!admin) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid credentials");
    }

    // Check if the password matches
    const isMatch = await admin.matchPassword(password);
    if (!isMatch) {
        // Increment wrong password counter
        await admin.wrongPassword();
        throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid credentials");
    }

    // Check if the account is suspended
    if (admin.securityMetadata.isSuspended) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, "Your account has been suspended. Please contact support.");
    }

    // Generate tokens
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(admin);

   
    res.cookie("accessToken", accessToken, {
        httpOnly: true,
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 1), // 1 day
    });
   

   
    res.status(StatusCodes.OK).json(
        new ApiResponse(StatusCodes.OK, "Login successful", {
            accessToken,
           
        })
    );
});

// Logout controller
const logout = asyncHandler(async (req, res) => {
    const admin = req.user;

   
    await admin.update({ refreshToken: null });

    // Clear cookies
    res.clearCookie("accessToken");
    // res.clearCookie("refreshToken");

   
    res.status(StatusCodes.OK).json(new ApiResponse(StatusCodes.OK, "Logout successful"));
});

export { login, logout };