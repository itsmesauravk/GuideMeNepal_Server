import express from "express";

const router = express.Router();

import { acceptCustomizeBookingGuide,
    addBulkDistrict, addSingleDistrict,
    cancelCustomizeBookingUser, completeBookingGuide,
    completeBookingUser,
    createCustomizeBooking, createGuideReview, getAllDistricts, getAllNotification, getAllUsers,
    getBookings, getOngoingBookings, getPopularDistricts,
        getSingleDistrict, rejectCustomizeBookingGuide 
    } from "../../controllers/common/index.js";
import { getGuideReviews, getLatestGuideReviews } from "../../controllers/common/sub-controller/guideReviews.controller.js";


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

//booking complete
router.patch("/complete-booking-guide/:bookingId", completeBookingGuide);
router.patch("/complete-booking-user/:bookingId", completeBookingUser);

//reviews
router.post("/create-guide-review", createGuideReview);
router.get("/get-guide-reviews/:guideId", getGuideReviews);
router.get("/latest-guide-reviews", getLatestGuideReviews)

//notification
router.get("/all-notifications/:userId/:reciver", getAllNotification);


export { router as commonRouter };
