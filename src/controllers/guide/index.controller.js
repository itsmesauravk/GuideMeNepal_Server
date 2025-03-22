import { registerGuide } from "./sub-controller/register.controller.js";
import { loginGuide } from "./sub-controller/login.controller.js";
import { firstTimeLoginPasswordChange } from "./sub-controller/updatePassword.controller.js";

//client side guide controller
import { getPopularGuides } from "./sub-controller/getGuides.controller.js";
import { getSingleGuideDetails } from "./sub-controller/getSingleGuide.controller.js";



export { registerGuide, loginGuide, firstTimeLoginPasswordChange 
    //
    ,getPopularGuides,
    getSingleGuideDetails,
};