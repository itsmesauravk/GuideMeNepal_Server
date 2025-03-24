import { createCustomizeBooking } from "./sub-controller/booking.controller.js";
import { getBookings } from "./sub-controller/getBookings.controller.js";

//districts
import { addSingleDistrict, addBulkDistrict, getAllDistricts } from "./sub-controller/district.controller.js";


export {
    createCustomizeBooking,
    getBookings,

    //districts
    addSingleDistrict,
    addBulkDistrict,
    getAllDistricts
}