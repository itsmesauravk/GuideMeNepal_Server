import express from 'express';
import { createMessage, getAllConversationUsers, getMessagesByConversation } from '../../controllers/message/index.js';
const messageRouter = express.Router();



//routes
messageRouter.post("/send-message", createMessage)
messageRouter.get("/get-conversations/:userId/:userType", getAllConversationUsers)
messageRouter.get("/get-messages/:conversationId/:userId/:userModel", getMessagesByConversation)


export { messageRouter };