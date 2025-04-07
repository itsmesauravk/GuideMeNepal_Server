import { Message } from '../../../models/message.model.js';
import { Conversation,Participant } from '../../../models/conversation.model.js';

// Delete a message (soft delete or mark as deleted)
const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;
    const userModel = req.user.role === 'guide' ? 'Guide' : 'User';

    // Find the message
    const message = await Message.findByPk(messageId);
    
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Check if user is the sender of the message
    if (message.senderId !== userId || message.senderModel !== userModel) {
      return res.status(403).json({ message: 'You can only delete your own messages' });
    }

    // Option 1: Hard delete
    await message.destroy();
    
    // Option 2: Soft delete (alternatively, add an 'isDeleted' field to your model)
    /*
    await Message.update(
      { isDeleted: true },
      { where: { id: messageId } }
    );
    */

    res.status(200).json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ message: 'Failed to delete message', error: error.message });
  }
};