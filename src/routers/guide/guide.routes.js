import { 
    registerGuide, loginGuide, firstTimeLoginPasswordChange, 
     getSingleGuideDetails, getGuides, getGuideAvailability, 
    updateGuideAvailability, createGuideAvailability, 
    getPopularAndNewGuides,
    deleteGuideAvailaibility,
    getGuideProfileFullDetails,
    updateGuideProfile,
    getDashboardData
} from "../../controllers/guide/index.controller.js";

import { Router } from "express";
import { upload } from "../../middlewares/multer.middleware.js";
import { getSingleRequest } from "../../controllers/admin/index.controller.js";

const router = Router();


const fileUpload = upload.fields([
    { name: "liscensePhoto", maxCount: 1 },
    { name: "profilePhoto", maxCount: 1 },
    { name: "certificationPhoto", maxCount: 1 },
    { name: "selfVideo", maxCount: 1 }
]);

// Routes
router.post("/register", fileUpload, registerGuide);
router.post("/login", loginGuide);
router.post("/first-time-login-password-change", firstTimeLoginPasswordChange);
router.get("/get-single-request/:id", getSingleRequest);


// client side routes
router.get("/get-popular-new-guides", getPopularAndNewGuides)
router.get("/single-guide-details/:slug", getSingleGuideDetails)
router.get("/get-guides", getGuides)

// Availability routes
router.get("/availability/:guideId", getGuideAvailability);
router.post("/create-availability/:guideId", createGuideAvailability);
router.put("/update-availability/:guideId/:availabilityId", updateGuideAvailability);
router.delete("/delete-availability/:availabilityId", deleteGuideAvailaibility);


//profile update
router.get("/get/:guideId", getGuideProfileFullDetails)
router.put("/update/:guideId", fileUpload, updateGuideProfile);

//dashboard
router.get("/dashboard/:guideId", getDashboardData);


// Export the router

export default router;
