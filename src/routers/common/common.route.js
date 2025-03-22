import express from "express";

const router = express.Router();

import { createCustomizeBooking, getBookings } from "../../controllers/common/index.js";


//secure routes
router.post("/create-customize-booking", createCustomizeBooking);
router.get("/get-bookings/:id", getBookings);



export { router as commonRouter };
