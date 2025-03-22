import { registerAdmin } from "./sub-controller/register.controller.js";
import { getRegistrationRequest, verifyRequest } from "./sub-controller/verifyGuide.controller.js";
import { getSingleRequest } from "./sub-controller/viewSingleRequest.controller.js";
import { getGuides } from "./sub-controller/viewGuides.js";
import { getUsers } from "./sub-controller/viewUsers.controller.js";

import { login, logout } from "./sub-controller/login.controller.js";

export {
    registerAdmin,
    getRegistrationRequest,
    verifyRequest,
    getSingleRequest,
    getGuides,
    login,
    logout,
    getUsers,
 
}