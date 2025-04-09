import { Message } from '../../../models/message.model.js';
import { Conversation, Participant } from '../../../models/conversation.model.js';
import User from '../../../models/user.model.js';
import Guide from '../../../models/guide.model.js';
import { DataTypes, Op } from 'sequelize';
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { ApiResponse } from "../../../utils/ApiResponse.js";
import { ApiError } from "../../../utils/ApiError.js";
import { StatusCodes } from "http-status-codes";
import { response } from 'express';

// Get all users that the current user is in conversation with
const getAllConversationUsers = asyncHandler(async (req, res) => {
    const { userId, userType } = req.params; 

    const participantId = parseInt(userId);
    const participantModel = userType; // 'User' or 'Guide'

    console.log("participantId", participantId)
    console.log("participantModel", participantModel)
    
    // Find all conversations where the user is a participant
    const conversations = await Conversation.findAll({
        include: [
            {
                model: Participant,
                as: 'participants',
                where: {
                    participantId: participantId,
                    participantModel: participantModel
                },
                required: true
            }
        ]
    });
    
    if (!conversations || conversations.length === 0) {
        return ApiResponse.success(res, StatusCodes.OK, "No conversations found", []);
    }
    
    const conversationIds = conversations.map(conv => conv.id);

    
    
    // Get all participants from these conversations (excluding the current user)
    const allParticipants = await Participant.findAll({
        where: {
            conversationId: { [Op.in]: conversationIds },
            [Op.or]: [
                { participantId: { [Op.ne]: userId } },
                { participantModel: { [Op.ne]: userType } }
            ]
        }
    });

   
    
    if (!allParticipants || allParticipants.length === 0) {
        return new ApiResponse.success(res, StatusCodes.OK, "No participants found", []);
    }
    
    // Prepare to fetch user/guide details
    const userIds = [];
    const guideIds = [];
    
    allParticipants.forEach(participant => {
        if (participant.participantModel === 'User') {
            userIds.push(participant.participantId);
        } else if (participant.participantModel === 'Guide') {
            guideIds.push(participant.participantId);
        }
    });
    
    // Fetch user details
    const users = userIds.length > 0 ? await User.findAll({
        attributes: ['id', 'fullName', 'profilePicture'], // Adjust fields as per your User model
        where: { id: { [Op.in]: userIds } }
    }) : [];
    
    // Fetch guide details
    const guides = guideIds.length > 0 ? await Guide.findAll({
        attributes: ['id', 'fullname', 'profilePhoto'], // Adjust fields as per your Guide model
        where: { id: { [Op.in]: guideIds } }
    }) : [];
    
    // Create maps for quick lookup
    const userMap = {};
    users.forEach(user => {
        userMap[`User-${user.id}`] = {
            id: user.id,
            name: user.fullName,
            profilePicture: user.profilePicture,
            type: 'User'
        };
    });
    
    const guideMap = {};
    guides.forEach(guide => {
        guideMap[`Guide-${guide.id}`] = {
            id: guide.id,
            name: guide.fullname,
            profilePicture: guide.profilePhoto,
            type: 'Guide'
        };
    });
    
    // Map conversations to include participants
    const formattedConversations = conversations.map(conversation => {
        // Get other participants (not the current user)
        const otherParticipants = allParticipants
            .filter(p => p.conversationId === conversation.id)
            .map(p => {
                const key = `${p.participantModel}-${p.participantId}`;
                return p.participantModel === 'User' ? userMap[key] : guideMap[key];
            })
            .filter(Boolean); // Filter out any undefined values
        
        // Group chat additional data
        const groupData = conversation.isGroupChat ? {
            groupName: conversation.groupName,
            groupImage: conversation.groupImage
        } : {};
        
        return {
            conversationId: conversation.id,
            isGroupChat: conversation.isGroupChat,
            lastMessage: conversation.lastMessage,
            createdAt: conversation.createdAt,
            updatedAt: conversation.updatedAt,
            ...groupData,
            participants: otherParticipants
        };
    });
    
    return res.status(StatusCodes.OK).json(new ApiResponse(StatusCodes.OK, "Conversations fetched successfully", formattedConversations));
});

export { getAllConversationUsers };