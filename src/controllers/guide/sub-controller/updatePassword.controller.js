import Guide from "../../../models/guide.model.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { ApiResponse } from "../../../utils/ApiResponse.js";
import { ApiError } from "../../../utils/ApiError.js";
import { StatusCodes } from "http-status-codes";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

const firstTimeLoginPasswordChange = asyncHandler(async (req, res) => {
    const { password, token } = req.body;

    if (!password) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "All fields are required");
    }

    if (!token) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Auth token is required");
    }

    const decodedData = await jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const guide = await Guide.findOne({ where: { id:decodedData.id } }); // Query: SELECT * FROM Guide WHERE id = decodedData.id
    if (!guide) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Invalid Request");
    }

    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    guide.password = hashedPassword;
    guide.firstTimeLogin = false;

    await guide.save();

    const guideToken = await guide.getAccessToken();

    res.cookie("guideToken", guideToken, {
        httpOnly: true,
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 1), // 1 day
    });

    return res.status(StatusCodes.OK).json(
        new ApiResponse(StatusCodes.OK, "Password Updated Successfully", guideToken )
    );
});




export { firstTimeLoginPasswordChange };