import { createCustomizeBooking, cancelCustomizeBookingUser, rejectCustomizeBookingGuide, acceptCustomizeBookingGuide } from "./sub-controller/booking.controller.js";
import { getBookings, getOngoingBookings } from "./sub-controller/getBookings.controller.js";
import { getAllUsers } from "./sub-controller/getAllUsers.controller.js";

//districts
import { addSingleDistrict, addBulkDistrict, getAllDistricts, getSingleDistrict, getPopularDistricts } from "./sub-controller/district.controller.js";

//booking complete 
import { completeBookingGuide } from "./sub-controller/completeBooking.controller.js";

//reviews
import { createGuideReview,getGuideReviews, getLatestGuideReviews } from "./sub-controller/guideReviews.controller.js";


//notification
import { getAllNotification, markNotificationAsRead, markAllNotificationAsRead } from "./sub-controller/notification.controller.js";

//report
import { createGuideReport, getAllGuidesReports, getGuideReports } from "./sub-controller/reportGuide.controller.js";

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
    getSingleDistrict,

    // users
    getAllUsers,

    // booking complete
    completeBookingGuide,

    //reviews
    createGuideReview,
    getLatestGuideReviews,

    //notification
    getAllNotification,
    markNotificationAsRead,
    markAllNotificationAsRead,

    //report
    createGuideReport,
    getAllGuidesReports,
    getGuideReports,
}