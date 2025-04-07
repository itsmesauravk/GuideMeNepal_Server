import { Message } from '../../../models/message.model.js';
import { Conversation,Participant } from '../../../models/conversation.model.js';
import { Op } from 'sequelize';

// Mark messages as read
const markMessagesAsRead = async (req, res) => {
    try {
      const { conversationId } = req.params;
      const userId = req.user.id;
      const userModel = req.user.role === 'guide' ? 'Guide' : 'User';
  
      // Verify user is a participant in the conversation
      const isParticipant = await Participant.findOne({
        where: {
          conversationId,
          participantId: userId,
          participantModel: userModel
        }
      });
  
      if (!isParticipant) {
        return res.status(403).json({ message: 'You are not a participant in this conversation' });
      }
  
      // Mark all messages in the conversation as read (except user's own messages)
      const result = await Message.update(
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
  
      res.status(200).json({ 
        message: 'Messages marked as read',
        updatedCount: result[0]
      });
    } catch (error) {
      console.error('Error marking messages as read:', error);
      res.status(500).json({ message: 'Failed to mark messages as read', error: error.message });
    }
  };