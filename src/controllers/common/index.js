import { createCustomizeBooking, cancelCustomizeBookingUser, rejectCustomizeBookingGuide, acceptCustomizeBookingGuide } from "./sub-controller/booking.controller.js";
import { getBookings, getOngoingBookings } from "./sub-controller/getBookings.controller.js";

//districts
import { addSingleDistrict, addBulkDistrict, getAllDistricts, getSingleDistrict, getPopularDistricts } from "./sub-controller/district.controller.js";


export {
    createCustomizeBooking,
    getBookings,
    cancelCustomizeBookingUser,
    rejectCustomizeBookingGuide,
    acceptCustomizeBookingGuide,
    getOngoingBookings,

    //districts
    addSingleDistrict,
    addBulkDistrict,
    getAllDistricts,
    getPopularDistricts,
    getSingleDistrict
}