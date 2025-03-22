import Admin from '../../../models/admin.model.js';
import { asyncHandler } from '../../../utils/asyncHandler.js';
import { ApiResponse } from '../../../utils/ApiResponse.js';
import { ApiError } from '../../../utils/ApiError.js';
import { StatusCodes } from 'http-status-codes';

const registerAdmin = asyncHandler(async (req, res) => {
    const { fullname, email, contact, password } = req.body;

    // Validate required fields
    if (!fullname || !email || !contact || !password) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'All fields are required');
    }

    // Check if the email is already registered
    const existingAdmin = await Admin.findOne({ where: { email } });
    if (existingAdmin) {
        throw new ApiError(StatusCodes.CONFLICT, 'Email already registered');
    }

    // Create admin instance and save to the database
    const admin = await Admin.create({
        fullname,
        email,
        contact,
        password,
        securityMetadata: {
            wrongPasswordCounter: 0,
            isSuspended: false,
        },
        otp: {
            code: null,
            expiresAt: null,
        },
        refreshToken: null,
    });

    if (!admin) {
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to create admin');
    }

    // for response of created admin
    const responseAdmin = {
        id: admin.id,
        fullname: admin.fullname,
        email: admin.email,
        contact: admin.contact,
        createdAt: admin.createdAt,
    };

    return res
        .status(StatusCodes.CREATED)
        .json(new ApiResponse(StatusCodes.CREATED, 'Admin created successfully', responseAdmin));
});

export { registerAdmin };