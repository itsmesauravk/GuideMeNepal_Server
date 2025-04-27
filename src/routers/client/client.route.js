import express from 'express';
import { registerUser, loginUser, verifyEmail, passwordReset, passwordChange,} from '../../controllers/client/index.controller.js';


const router = express.Router();


router.post('/register', registerUser);
router.patch('/verify-email/:token', verifyEmail); 
router.post('/login', loginUser);
router.post("/forgot-password", passwordReset)
router.patch("/password-reset/:token", passwordChange)   


export default router;