const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const { protect } = require('../middleware/authMiddleware');

// Mark conversation as read (existing)
router.post('/:conversationId/read', protect, async (req, res) => {
  const { conversationId } = req.params;
  
  if (!mongoose.Types.ObjectId.isValid(conversationId)) {
    return res.status(404).json({ message: 'Invalid Conversation ID' });
  }

  const userId = req.user._id;
  await Message.updateMany(
    { conversationId, read: false, senderId: { $ne: userId } },
    { read: true }
  );
  res.json({ message: 'Conversation marked as read' });
});

// Get unread count (existing)
router.get('/:conversationId/unread-count', protect, async (req, res) => {
  const { conversationId } = req.params;
  
  if (!mongoose.Types.ObjectId.isValid(conversationId)) {
    return res.json({ unreadCount: 0 });
  }

  const userId = req.user._id;
  const count = await Message.countDocuments({
    conversationId,
    read: false,
    senderId: { $ne: userId }
  });
  res.json({ unreadCount: count });
});

// ✅ NEW: DELETE conversation and all its messages
router.delete('/:conversationId', protect, async (req, res) => {
  const { conversationId } = req.params;
  
  if (!mongoose.Types.ObjectId.isValid(conversationId)) {
    return res.status(404).json({ message: 'Invalid Conversation ID' });
  }

  // Delete all messages in this conversation
  await Message.deleteMany({ conversationId });
  // Delete the conversation itself
  await Conversation.findByIdAndDelete(conversationId);
  
  res.json({ message: 'Conversation deleted successfully' });
});

module.exports = router;