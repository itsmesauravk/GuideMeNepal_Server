import express from 'express';
import { registerAdmin } from '../../controllers/admin/index.controller.js';

const router = express.Router();





//routes 
router.post("/register", registerAdmin);


export default router;