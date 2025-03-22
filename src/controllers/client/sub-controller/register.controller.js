import User from "../../../models/user.model.js";
import bcryptjs from "bcryptjs";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { ApiError } from "../../../utils/ApiError.js";
import { ApiResponse } from "../../../utils/ApiResponse.js";
import slug from "slug";


const registerUser = asyncHandler(async (req, res) => {
    const {fullName,  email, password } = req.body;
    
    if (!fullName || !email || !password ) {
        throw new ApiError(400, "All fields are required");
    }

    // validating whether the user already exists
    const existingUser = await User.findOne({ where: { email } });  // SQL Query : SELECT * FROM users WHERE email = email
    if (existingUser) {
        throw new ApiError(409, "User with this email already exists");
    }

    // hashing the password
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    const nameSlug = slug(fullName, { lower: true });
    const mainSlug = nameSlug + Math.floor(Math.random() * 1000);

    // registring new user
    const newUser = await User.create({
        fullName,
        slug:mainSlug,
        email,
        password: hashedPassword,
       
        authMethod: "email",
    });

    if (!newUser) {
        throw new ApiError(500, "User registration failed");
    }

    res.status(201).json(new ApiResponse(201, "User registered successfully", {
        id: newUser.id,
        fullName: newUser.fullName,
        email: newUser.email,
      
        authMethod: newUser.authMethod,
    }));
});



  
  export {registerUser};
  