
import { Message } from '../../../models/message.model.js';
import { Conversation,Participant } from '../../../models/conversation.model.js';
import { Op } from 'sequelize';

// Get unread message counts
export const getUnreadMessageCount = async (req, res) => {
    try {
      const userId = req.user.id;
      const userModel = req.user.role === 'guide' ? 'Guide' : 'User';
      
      // Find all conversations where the user is a participant
      const userConversations = await Participant.findAll({
        where: {
          participantId: userId,
          participantModel: userModel
        },
        attributes: ['conversationId']
      });
      
      const conversationIds = userConversations.map(p => p.conversationId);
      
      // Count unread messages in each conversation
      const unreadCounts = await Message.findAll({
        attributes: [
          'conversationId',
          [sequelize.fn('COUNT', sequelize.col('id')), 'unreadCount']
        ],
        where: {
          conversationId: conversationIds,
          senderId: { [Op.ne]: userId },
          senderModel: { [Op.ne]: userModel },
          isRead: false
        },
        group: ['conversationId']
      });
  
      res.status(200).json({ unreadCounts });
    } catch (error) {
      console.error('Error getting unread message counts:', error);
      res.status(500).json({ message: 'Failed to get unread message counts', error: error.message });
    }
  };