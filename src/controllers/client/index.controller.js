import { registerUser, verifyEmail } from "./sub-controller/register.controller.js";
import { loginUser, passwordReset, passwordChange } from "./sub-controller/login.controller.js";
import { getProfile, updateProfile, passwordUpdate } from "./sub-controller/profile.controller.js";

import { createHelpAndSupport,getAllHelpAndSupportRequests,updateHelpAndSupportRequest } from "./sub-controller/helpandsupport.controller.js";


export { registerUser, loginUser,verifyEmail, passwordReset, passwordChange, getProfile, updateProfile, passwordUpdate,
    createHelpAndSupport,getAllHelpAndSupportRequests,updateHelpAndSupportRequest
 };