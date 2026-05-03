const express = require('express');
const router = express.Router();
const {
  getConversations,
  getOrCreateConversation,
  getMessages,
  sendMessage,
  updateMessage,   // ← add this
  deleteMessage,   // ← add this
} = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(protect);

router.route('/conversations')
  .get(getConversations)
  .post(getOrCreateConversation);

router.route('/:conversationId')
  .get(getMessages);

router.route('/')
  .post(sendMessage);

router.route('/:messageId')
  .put(updateMessage)
  .delete(deleteMessage);

module.exports = router;