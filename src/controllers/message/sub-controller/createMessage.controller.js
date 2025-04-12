import { Message } from '../../../models/message.model.js';
import { Conversation,Participant } from '../../../models/conversation.model.js';
import { Op } from 'sequelize';
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { ApiResponse } from "../../../utils/ApiResponse.js";
import { ApiError } from "../../../utils/ApiError.js";
import { StatusCodes } from "http-status-codes";
import { getReceiverSocketId, io } from '../../../socket/socket.js';


// Create a new message
const createMessage =asyncHandler( async (req, res) => {
 
    const { conversationId, senderId, senderModel, reciverId, reciverType ,content, contentType = 'text', metadata } = req.body;
 

    if(!conversationId ){
      // this means the user is creating a new conversation

      //creating new conversation
      const newConversation = await Conversation.create({
        isGroupChat: false,
        groupName: null
      });

      
      if (!newConversation) {
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Failed to create conversation");
      }

      //creating new participant for the sender and reciver
      const pUser = await Participant.create({
        conversationId: newConversation.id,
        participantId: senderId,
        participantModel: senderType
      });
      const pUser2 = await Participant.create({
        conversationId: newConversation.id,
        participantId: reciverId,
        participantModel: reciverType
      });

      if (!pUser || !pUser2) {
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Failed to create participant");
      }

   

      //creating new message
      const newMessage = await Message.create({
        conversationId: newConversation.id,
        senderId,
        senderModel: senderModel,
        content,
        contentType,
        metadata,
        isRead: false // Initially unread for other participants
      });

      // Update the last message in the conversation (if needed)
    await newConversation.update(
      { lastMessage: newMessage.content  },
      { where: { id: conversationId } }
    );

    

    // for realtime chat 
    const reciverSocketId = getReceiverSocketId(reciverId);
    if (reciverSocketId) {
      // Emit the new message to the receiver's socket
      io.to(reciverSocketId).emit("newMessage", newMessage);
      //for showing the conversation realtime
      io.to(reciverSocketId).emit("getConversation", newConversation);
    }

     
      // Return the created message
      return res.status(StatusCodes.CREATED).json(new ApiResponse(StatusCodes.CREATED, "Message Created", newMessage));

    }

    // Check if the conversation exists
    const conversation = await Conversation.findOne({
      where: {
        id: conversationId,
      },
    });

    if (!conversation) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Conversation not found");
    }

    // Create the message
    const newMessage = await Message.create({
      conversationId,
      senderId,
      senderModel,
      content,
      contentType,
      metadata,
      isRead: false 
    });

    if (!newMessage) {
      throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Failed to create message");
    }

    // Update the last message in the conversation (if needed)
    await Conversation.update(
      { lastMessage: newMessage.content },
      { where: { id: conversationId } }
    );


    //updated conversation
    const updatedConversation = await Conversation.findOne({
      where: {
        id: conversationId,
      },
    });

    let reciverUid;
    if(reciverId) {
      reciverUid = reciverId
    }else{
      // get the reciver id from the participant table
      const participant = await Participant.findOne({
        where: {
          conversationId, //4
          participantId: senderId, //5
          participantModel: senderModel, //Guide
        },
      });
      // participant = same user who is sending the message


      if (!participant) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Participant not found");
      }

      // participant Table Id 
      const pTableId = participant.id; // 3

      //finding the same conversationId what does not have the senderId and senderModel or pTableId
      const reciverParticipant = await Participant.findOne({
        where: {
          conversationId, //4
          id: {
            [Op.ne]: pTableId, //3
          },
        },
      });

      if (!reciverParticipant) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Participant not found");
      }
      reciverUid = reciverParticipant.participantId; //2
    }

    
    

    // for realtime chat 
    const reciverSocketId = getReceiverSocketId(reciverUid);
    if (reciverSocketId) {
      // Emit the new message to the receiver's socket
      io.to(reciverSocketId).emit("newMessage", newMessage);
      //for showing the conversation realtime
      io.to(reciverSocketId).emit("getConversation", updatedConversation);
    }

    



    // Return the created message
    return res.status(StatusCodes.CREATED).json(new ApiResponse(StatusCodes.CREATED, "Message Created", newMessage));


   
  
});



export {createMessage}