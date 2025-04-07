import User from "../../../models/user.model.js";
import Guide from "../../../models/guide.model.js";
import { StatusCodes } from "http-status-codes";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { ApiResponse } from "../../../utils/ApiResponse.js";
import { ApiError } from "../../../utils/ApiError.js";
import { Op } from "sequelize";

const getAllUsers = asyncHandler(async (req, res) => {
    const { userId } = req.params; // Extract userId from request parameters

    // Fetch all users excluding the current user
    const users = await User.findAll({
        where: {
            id: {
                [Op.ne]: userId, // Exclude the current user
            },
        },
        attributes: ['id', 'slug','fullName', 'email', 'profilePicture'], // Specify the attributes to return
    });

    const guides = await Guide.findAll({
        where: {
            id: {
                [Op.ne]: userId, // Exclude the current user
            },
        },
        attributes: ['id','slug' ,'fullname', 'email', 'profilePhoto'], // Specify the attributes to return
    });

    if (!users || !guides) {
        throw new ApiError(StatusCodes.NOT_FOUND, "No users found");
    }

    // Combine users and guides into a single array
    const combinedUsers = users.map(user => ({
        id: user.id,
        name: user.fullName,
        email: user.email,
        profilePicture: user.profilePicture,
        slug: user.slug,
        type: 'user',
    })).concat(guides.map(guide => ({
        id: guide.id,
        name: guide.fullname,
        email: guide.email,
        profilePicture: guide.profilePhoto,
        slug: guide.slug,
        type: 'guide',
    })));

    res.status(StatusCodes.OK).json(new ApiResponse(StatusCodes.OK, "Users fetched successfully", combinedUsers));
}
);

export { getAllUsers };