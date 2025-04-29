import { registerGuide } from "./sub-controller/register.controller.js";
import { loginGuide } from "./sub-controller/login.controller.js";
import { firstTimeLoginPasswordChange } from "./sub-controller/updatePassword.controller.js";


//client side guide controller
import {  getPopularAndNewGuides,getGuides } from "./sub-controller/getGuides.controller.js";
import { getSingleGuideDetails } from "./sub-controller/getSingleGuide.controller.js";

//availability controller
import { getGuideAvailability, createGuideAvailability, updateGuideAvailability, deleteGuideAvailaibility } from "./sub-controller/availability.controller.js";



export { registerGuide, loginGuide, firstTimeLoginPasswordChange ,

    //
    getPopularAndNewGuides,
    getSingleGuideDetails,
    getGuides,

    //availability controller
    getGuideAvailability,
    createGuideAvailability,
    updateGuideAvailability,
    deleteGuideAvailaibility
};