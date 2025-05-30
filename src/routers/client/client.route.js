import express from 'express';
import { registerUser, loginUser, verifyEmail, passwordReset, passwordChange, getProfile, updateProfile, passwordUpdate, createHelpAndSupport, getAllHelpAndSupportRequests, updateHelpAndSupportRequest,} from '../../controllers/client/index.controller.js';

import { upload } from '../../middlewares/multer.middleware.js';

const router = express.Router();



router.post('/register', registerUser);
router.patch('/verify-email/:token', verifyEmail); 
router.post('/login', loginUser);
router.post("/forgot-password", passwordReset)
router.patch("/password-reset/:token", passwordChange)   


//update profile
router.get('/my-profile/:id', getProfile); //get profile
router.patch('/update-profile/:id', upload.single('image'), updateProfile); //update profile
router.patch('/update-password/:id', passwordUpdate); //update password



//help and support
router.post('/contact', createHelpAndSupport);
router.get('/contact', getAllHelpAndSupportRequests);
router.patch('/contact/:id', updateHelpAndSupportRequest); //update help and support request


export default router;