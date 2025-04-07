import express from "express";

const router = express.Router();

import { acceptCustomizeBookingGuide, addBulkDistrict, addSingleDistrict, cancelCustomizeBookingUser, createCustomizeBooking, getAllDistricts, getAllUsers, getBookings, getOngoingBookings, getPopularDistricts, getSingleDistrict, rejectCustomizeBookingGuide } from "../../controllers/common/index.js";


//secure routes
router.post("/create-customize-booking", createCustomizeBooking);
router.get("/get-bookings/:id", getBookings);
router.patch("/cancel-customize-booking-user/:bookingId", cancelCustomizeBookingUser);
router.patch("/reject-customize-booking-guide/:bookingId", rejectCustomizeBookingGuide);
router.patch("/accept-customize-booking-guide/:bookingId", acceptCustomizeBookingGuide);
router.get("/get-ongoing-booking/:id", getOngoingBookings);

//district

router.post("/add-single-district", addSingleDistrict);
router.post("/add-bulk-district", addBulkDistrict);
router.get("/get-all-districts", getAllDistricts);
router.get("/get-single-district/:slug", getSingleDistrict);
router.get("/get-popular-districts", getPopularDistricts);


//users
router.get("/get-all-users/:userId", getAllUsers);


export { router as commonRouter };
