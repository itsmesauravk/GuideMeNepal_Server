import User from "../../../models/user.model.js";
import Guide from "../../../models/guide.model.js";
import bcryptjs from "bcryptjs";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { ApiError } from "../../../utils/ApiError.js";
import { ApiResponse } from "../../../utils/ApiResponse.js";
import { StatusCodes } from "http-status-codes";
import Notification from "../../../models/notification.model.js";
import { getReceiverSocketId, io } from "../../../socket/socket.js";
import jwt from "jsonwebtoken";
import { passwordResetMail } from "../../../utils/MailSend.js";





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

    


    res.status(StatusCodes.ACCEPTED).json(new ApiResponse(StatusCodes.ACCEPTED, "Login Successfull", {
       jwt:userToken,
       user:userData
    }));


    
});



//for both user and guide
const passwordReset = asyncHandler(async (req, res) => {    
    const { email } = req.body;
    const {user} = req.query;

    if (!user) {
        throw new ApiError(401, "User is required");
    }

    if (!email) {
        throw new ApiError(400, "Email is required");
    }

    let existingUser = null;
    let token = null;

    if(user==="client"){
        // validating whether the user already exists
        existingUser = await User.findOne({ where: { email } });  // SQL Query : SELECT * FROM users WHERE email = email
        
        
    }else if(user==="guide"){
        existingUser = await Guide.findOne({ where: { email } });  // SQL Query : SELECT * FROM guides WHERE email = email

    }else{
        throw new ApiError(400, "Invalid user type");
    }

    if (!existingUser) {
        throw new ApiError(409, "User not found");
    }

    if(!existingUser.verified){
        throw new ApiError(403, "User is not verified yet");
    }

    //send reset password link to email
   
    // generating token 
    token = jwt.sign({ id: existingUser.id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "5m" });


    //sending email
    passwordResetMail(existingUser.email, token, user);


    res.status(StatusCodes.ACCEPTED).json(new ApiResponse(StatusCodes.ACCEPTED, "Reset password link sent to your email", {
       token: token,
    }));


});


const passwordChange = asyncHandler(async(req, res) => {
    const { password } = req.body;
    const { token } = req.params;
    const {user} = req.query;
    if (!user) {
        throw new ApiError(401, "User is required");
    }
    if (!password) {
        throw new ApiError(400, "Password is required");
    }
    if (!token) {
        throw new ApiError(400, "Token is required");
    }

    // verifying token
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    if (!decoded) {
        throw new ApiError(400, "Invalid token");
    }
    const userId = decoded.id;
    let existingUser = null;
    //finding user
    if(user==="client"){
        // validating whether the user already exists
    existingUser = await User.findOne({ where: { id: userId } });  // SQL Query : SELECT * FROM users WHERE email = email
    }else if(user==="guide"){
        existingUser = await Guide.findOne({ where: { id: userId } });  // SQL Query : SELECT * FROM guides WHERE email = email
    }
    else{
        throw new ApiError(400, "Invalid user type");
    }

    if (!existingUser) {
        throw new ApiError(409, "User not found");
    }
    // hashing password
    const hashedPassword = bcryptjs.hashSync(password, 10);
    //updating password
    existingUser.password = hashedPassword;
    await existingUser.save();

    //expiring token


    res.status(StatusCodes.ACCEPTED).json(new ApiResponse(StatusCodes.ACCEPTED, "Password changed successfully", {}))

    })



  
  export {loginUser, passwordReset, passwordChange};
  