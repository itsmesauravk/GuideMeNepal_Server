import User from "../../../models/user.model.js";
import bcryptjs from "bcryptjs";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { ApiError } from "../../../utils/ApiError.js";
import { ApiResponse } from "../../../utils/ApiResponse.js";
import { StatusCodes } from "http-status-codes";
import Notification from "../../../models/notification.model.js";
import { getReceiverSocketId, io } from "../../../socket/socket.js";
import e from "cors";



const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

   
    
    if ( !email || !password ) {
        throw new ApiError(400, "All fields are required");
    }

    // validating whether the user already exists
    const existingUser = await User.findOne({ where: { email } });  // SQL Query : SELECT * FROM users WHERE email = email
    if (!existingUser) {
        throw new ApiError(409, "User not found");
    }
   

    if (existingUser.verified === false) {
        throw new ApiError(403, "User is not verified yet");
    }

    // validating password
    const verifyPassword = bcryptjs.compareSync(password, existingUser.password);

    if (!verifyPassword) {
        throw new ApiError(500, "Invalid Credentials");
    }

    const userToken = await existingUser.getAccessToken();

    

    //update last active
    existingUser.lastActiveAt = new Date()
    await existingUser.save()

    const userData = {
        id: existingUser.id,
        name: existingUser.fullName,
        email: existingUser.email,
        role: "user",
        image: existingUser.profilePicture,
        authMethod: existingUser.authMethod
    }
   

    res.cookie("userToken", userToken, {
        httpOnly: true,
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 1), // 1 day
    });

    //for notification
    const notification = await Notification.create({
        title: "Login Successfull",
        description: "You have successfully logged in to your account",
        notificationType: "auth",
        reciver: "user",
        userId: existingUser.id,   
    })

    //socket real time
    const reciverSocketId = getReceiverSocketId(existingUser.id)
    if(reciverSocketId){
        io.to(reciverSocketId).emit("newNotification", notification)
    }

    console.log(userData, "userData")


    res.status(StatusCodes.ACCEPTED).json(new ApiResponse(StatusCodes.ACCEPTED, "Login Successfull", {
       jwt:userToken,
       user:userData
    }));


    
});



  
  export {loginUser};
  