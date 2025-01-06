import express from 'express';
import { login, registerAdmin, logout } from '../../controllers/admin/index.controller.js';

const router = express.Router();

//middleware
import {verifyJWT} from "../../middlewares/authAdmin.middleware.js";





//routes 
router.post("/register", registerAdmin);
router.post("/login", login);

//secure routes
router.post("/logout", verifyJWT ,logout)



export default router;