import express from 'express';
import { registerUser, loginUser, verifyEmail,} from '../../controllers/client/index.controller.js';


const router = express.Router();


router.post('/register', registerUser);
router.patch('/verify-email/:token', verifyEmail); 
router.post('/login', loginUser);


export default router;