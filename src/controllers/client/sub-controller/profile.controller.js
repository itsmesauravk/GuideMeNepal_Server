import User from "../../../models/user.model.js";
import bcryptjs from "bcryptjs";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { ApiError } from "../../../utils/ApiError.js";
import { ApiResponse } from "../../../utils/ApiResponse.js";
import { StatusCodes } from "http-status-codes";
import Notification from "../../../models/notification.model.js";
import { getReceiverSocketId, io } from "../../../socket/socket.js";
import jwt from "jsonwebtoken";
import { uploadOnCloudinary } from "../../../utils/cloudinary.js";


const getProfile = asyncHandler(async (req, res) => {
    const userId = req.params.id;

    const user = await User.findOne({
        where: { id: userId },
        attributes: {
            exclude: ["password", "createdAt", "updatedAt"],
        },
    });

    if (!user) {
        throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
    }

    return res.status(StatusCodes.OK).json(
        new ApiResponse(StatusCodes.OK, "User profile fetched successfully", user)
    );

});

const updateProfile = asyncHandler(async (req, res) => {
    
        const userId = req.params.id;
        const { fullName, contact, dob, country, gender } = req.body;
        const profileImage = req.file?.path || null;

        if (!fullName) {
            throw new ApiError(StatusCodes.BAD_REQUEST, "Full Name is required");
        }

        const user = await User.findOne({ where: { id: userId } });
        if (!user) {
            throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
        }

        let uploadImage = null;

  

        if(profileImage) {
        uploadImage = await uploadOnCloudinary(profileImage, "user-profile");
        }

        user.fullName = fullName;
        user.contact = contact || user.contact;
        user.dob = dob || user.dob;
        user.country = country || user.country;
        user.gender = gender || user.gender;
        user.profilePicture = uploadImage ? uploadImage.secure_url : user.profilePicture;

        await user.save();

        return res.status(StatusCodes.OK).json(
                
                new ApiResponse(StatusCodes.OK, "Profile updated successfully", user)
            );       

}) ;


const passwordUpdate = asyncHandler(async (req, res) => {
    console.log(req.body)
    const { oldPassword, newPassword } = req.body;
    const userId = req.params.id;

    if (!oldPassword || !newPassword) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Old and new passwords are required");
    }

    const user = await User.findOne({ where: { id: userId } });
    if (!user) {
        throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
    }

    console.log("user", user);

    const isMatch = await bcryptjs.compare(oldPassword, user.password);
    if (!isMatch) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, "Old password is incorrect");
    }

    user.password = await bcryptjs.hash(newPassword, 10);
    await user.save();

    return res.status(StatusCodes.OK).json(
        new ApiResponse(StatusCodes.OK, "Password changed successfully")
    );
});



    



//export
export { getProfile, updateProfile, passwordUpdate };
