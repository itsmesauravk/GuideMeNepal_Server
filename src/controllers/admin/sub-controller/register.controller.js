import Admin from '../../../models/admin.model.js';
import { asyncHandler } from '../../../utils/asyncHandler.js';
import { ApiResponse } from '../../../utils/ApiResponse.js';
import { ApiError } from '../../../utils/ApiError.js';
import { StatusCodes } from 'http-status-codes';

const registerAdmin = asyncHandler(async (req, res, next) => {
    const { fullname, email, contact, password } = req.body;

    // Validate required fields
    if (!fullname || !email || !contact || !password) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'All fields are required');
    }

    // checking whether the email is already registered
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
        throw new ApiError(StatusCodes.CONFLICT, 'Email already registered');
    }

    // creating admin instance
    const admin = new Admin({
        fullname,
        email,
        contact,
        password,
    });

    // Save admin to the database
    await admin.save();

    if (!admin) {
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to create admin');
    }

    // Exclude sensitive fields in response
    const responseAdmin = {
        id: admin._id,
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
