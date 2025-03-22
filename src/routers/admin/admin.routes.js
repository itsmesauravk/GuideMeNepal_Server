import express from 'express';
import { login, registerAdmin, getRegistrationRequest,verifyRequest, logout, getGuides, getUsers } from '../../controllers/admin/index.controller.js';

import { upload } from '../../middlewares/multer.middleware.js';



const router = express.Router();

const uploadFiles = [
    {name:"liscensePhoto",maxCount:1},
    {name:"idPhoto", maxCount:1},
    {name:"certificationPhoto", maxCount:1}
]
//middleware
import {verifyJWT} from "../../middlewares/authAdmin.middleware.js";





//routes 
router.post("/register", registerAdmin);
router.post("/login", login);


//secure routes
router.post("/logout", verifyJWT ,logout)
router.get("/registration-request",upload.fields(uploadFiles) ,getRegistrationRequest);
router.patch("/verify-request/:id", verifyRequest);
router.get("/view-guides",getGuides);
router.get("/view-users",getUsers)



export default router;