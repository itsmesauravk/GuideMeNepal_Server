import User from "../../../models/user.model.js";
import bcryptjs from "bcryptjs";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { ApiError } from "../../../utils/ApiError.js";
import { ApiResponse } from "../../../utils/ApiResponse.js";
import slug from "slug";
import jwt from "jsonwebtoken";
import { verifyEmailMail } from "../../../utils/MailSend.js";


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
        verified: false,
    });


    if (!newUser) {
        throw new ApiError(500, "User registration failed");
    }

    const verifyToken = await jwt.sign(
        { id: newUser.id, email: newUser.email },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "1d" }
    );
//for sending verification email
    verifyEmailMail(
        newUser.email,
        verifyToken
    );

    res.status(201).json(new ApiResponse(201, "Check your email to verify", {
        id: newUser.id,
        fullName: newUser.fullName,
        email: newUser.email,
        authMethod: newUser.authMethod,
    }));
});


const verifyEmail = asyncHandler(async (req, res) => {
    const { token } = req.params;
 
    if (!token) {
        throw new ApiError(400, "Token is required");
        
    }

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    if (!decoded) {
        throw new ApiError(400, "Invalid token");
    }

    

    const user = await User.findByPk(decoded.id);
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    user.verified = true;
    await user.save();

    res.status(200).json(new ApiResponse(200, "Email verified successfully", {}));


}
);





  
  export {registerUser, verifyEmail};
  