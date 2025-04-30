// import { Message } from '../../../models/message.model.js';
// import { Conversation,Participant } from '../../../models/conversation.model.js';
// import { Op } from 'sequelize';
// import { asyncHandler } from "../../../utils/asyncHandler.js";
// import { ApiResponse } from "../../../utils/ApiResponse.js";
// import { ApiError } from "../../../utils/ApiError.js";
// import { StatusCodes } from "http-status-codes";



// // Get all messages for a conversation
// const getMessagesByConversation =asyncHandler( async (req, res) => {

//       const { conversationId,userId, userModel } = req.params;
//       const { page = 1, limit = 50 } = req.query;
//       const offset = (page - 1) * limit;
      
      
    
  
//       // Verify user is a participant in the conversation
//       const isParticipant = await Participant.findOne({
//         where: {
//           conversationId,
//           participantId: userId,
//           participantModel: userModel
//         }
//       });
  
//       if (!isParticipant) {
//         throw new ApiError(StatusCodes.FORBIDDEN, "You are not a participant in this conversation."); 
//       }
  
//       // Get messages with pagination
//       const messages = await Message.findAndCountAll({
//         where: { conversationId },
//         order: [['createdAt', 'ASC']], // Newest messages first
//         limit: parseInt(limit),
//         offset: parseInt(offset)
//       });

  
//       // Mark messages as read (excluding user's own messages)
//       await Message.update(
//         { isRead: true },
//         { 
//           where: { 
//             conversationId,
//             senderId: { [Op.ne]: userId }, // Not equal to current user
//             senderModel: { [Op.ne]: userModel },
//             isRead: false
//           } 
//         }
//       );
  
//       return res.status(StatusCodes.OK).json(new ApiResponse(StatusCodes.OK, "Messages retrieved successfully", {
//         messages: messages.rows,
//         totalMessages: messages.count,
//         totalPages: Math.ceil(messages.count / limit),
//         currentPage: parseInt(page),
//         hasNextPage: offset + limit < messages.count,
//         hasPreviousPage: offset > 0
//       }));

//     } )
  

//   export { getMessagesByConversation };


import { Message } from '../../../models/message.model.js';
import { Conversation, Participant } from '../../../models/conversation.model.js';
import { Op } from 'sequelize';
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { ApiResponse } from "../../../utils/ApiResponse.js";
import { ApiError } from "../../../utils/ApiError.js";
import { StatusCodes } from "http-status-codes";

// Get all messages for a conversation
const getMessagesByConversation = asyncHandler(async (req, res) => {
  const { conversationId, userId, userModel } = req.params;
  const { page = 1, limit = 50 } = req.query;
  const offset = (page - 1) * limit;
  
  // Convert page and limit to integers
  const pageInt = parseInt(page);
  const limitInt = parseInt(limit);
  
  // Verify user is a participant in the conversation
  const isParticipant = await Participant.findOne({
    where: {
      conversationId,
      participantId: userId,
      participantModel: userModel
    }
  });

  if (!isParticipant) {
    throw new ApiError(StatusCodes.FORBIDDEN, "You are not a participant in this conversation."); 
  }

  // Get total message count for pagination calculation
  const totalCount = await Message.count({
    where: { conversationId }
  });

  // Get messages with pagination
  // For page 1: Get the most recent messages first, but then reverse them for display
  // For other pages: Keep the ASC order for consistent pagination
  const sortOrder = pageInt === 1 ? 'DESC' : 'ASC';
  
  const messagesQuery = await Message.findAndCountAll({
    where: { conversationId },
    order: [['createdAt', sortOrder]],
    limit: limitInt,
    offset: offset
  });
  
  // If it's page 1, reverse the messages to show oldest first (chronological order)
  const messages = {
    count: messagesQuery.count,
    rows: pageInt === 1 ? messagesQuery.rows.reverse() : messagesQuery.rows
  };

  // Mark messages as read (excluding user's own messages)
  await Message.update(
    { isRead: true },
    { 
      where: { 
        conversationId,
        senderId: { [Op.ne]: userId }, // Not equal to current user
        senderModel: { [Op.ne]: userModel },
        isRead: false
      } 
    }
  );

  return res.status(StatusCodes.OK).json(new ApiResponse(StatusCodes.OK, "Messages retrieved successfully", {
    messages: messages.rows,
    totalMessages: messages.count,
    totalPages: Math.ceil(totalCount / limitInt),
    currentPage: pageInt,
    hasNextPage: offset + limitInt < totalCount,
    hasPreviousPage: offset > 0
  }));
});

export { getMessagesByConversation };