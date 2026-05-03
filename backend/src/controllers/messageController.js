const asyncHandler = require('express-async-handler');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const ADMIN_ID = '000000000000000000000000';

// Get all conversations for current user (customer or seller)
const getConversations = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  console.log('User ID:', userId);
  const isAdmin = req.user.isAdmin || (userId === ADMIN_ID);
  console.log('Is admin?', isAdmin);
  
  let query;
  if (isAdmin) {
    query = { sellerId: ADMIN_ID };
  } else {
    query = { customerId: userId };
  }
  console.log('Query:', query);
  
  const conversations = await Conversation.find(query)
    .populate('customerId', 'name email')
    .populate('sellerId', 'name email');
  console.log('Found conversations:', conversations.length);
  
  res.json(conversations);
});

// Get or create a conversation between customer and seller for a product
const getOrCreateConversation = asyncHandler(async (req, res) => {
  const { productId, productTitle } = req.body;
  const customerId = req.user._id;
  const ADMIN_ID = '000000000000000000000000';

  let conversation = await Conversation.findOne({
    customerId,
    sellerId: ADMIN_ID,
    productId,
  });

  if (!conversation) {
    conversation = await Conversation.create({
      customerId,
      sellerId: ADMIN_ID,
      productId,
      productTitle,
      lastMessage: '',
    });
  }

  await conversation.populate('customerId', 'name email');
  await conversation.populate('sellerId', 'name email');

  res.json(conversation);
});

// Get all messages for a conversation
const getMessages = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;
  const userId = req.user._id;
  console.log('--- getMessages called ---');
  console.log('Conversation ID:', conversationId);
  console.log('User ID:', userId.toString());

  const conversation = await Conversation.findById(conversationId);
  if (!conversation) {
    console.log('Conversation NOT found');
    res.status(404);
    throw new Error('Conversation not found');
  }
  console.log('Conversation found:', conversation._id);
  console.log('Customer ID:', conversation.customerId.toString());
  console.log('Seller ID:', conversation.sellerId.toString());

  const isParticipant = conversation.customerId.toString() === userId.toString() ||
                        conversation.sellerId.toString() === userId.toString();
  console.log('Is participant?', isParticipant);
  if (!isParticipant) {
    res.status(403);
    throw new Error('Not authorized');
  }

  const messages = await Message.find({ conversationId }).sort({ createdAt: 1 });
  console.log('Messages count:', messages.length);
  if (messages.length > 0) {
    console.log('First message:', messages[0].text);
  }
  res.json(messages);
});

// Send a new message
const sendMessage = asyncHandler(async (req, res) => {
  const { conversationId, text, attachments } = req.body;   // ← added attachments
  const senderId = req.user._id;
  console.log('=== sendMessage called ===');
  console.log('  conversationId:', conversationId);
  console.log('  text:', text);
  console.log('  attachments:', attachments);
  console.log('  senderId:', senderId);

  if (!conversationId || !text) {
    console.error('Missing conversationId or text');
    res.status(400);
    throw new Error('conversationId and text are required');
  }

  const conversation = await Conversation.findById(conversationId);
  if (!conversation) {
    console.error('Conversation not found for ID:', conversationId);
    res.status(404);
    throw new Error('Conversation not found');
  }

  // Update lastMessage
  conversation.lastMessage = text;
  conversation.updatedAt = Date.now();
  conversation.lastMessageSenderId = senderId;
  await conversation.save();
  console.log('Conversation lastMessage updated');

  // Create the message with attachments
  try {
    const message = await Message.create({
      conversationId,
      senderId,
      text,
      attachments: attachments || [],   // ✅ THIS IS WHAT YOU NEED
    });
    console.log('✅ Message saved with ID:', message._id);
    const populatedMessage = await Message.findById(message._id).populate('senderId', 'name email');
    res.status(201).json(populatedMessage);
  } catch (err) {
    console.error('❌ Failed to save message:', err);
    res.status(500);
    throw new Error('Could not save message: ' + err.message);
  }
});

// Update a message (only by sender, no time restriction)
const updateMessage = asyncHandler(async (req, res) => {
  const { text } = req.body;
  const message = await Message.findById(req.params.messageId);

  if (!message) {
    res.status(404);
    throw new Error('Message not found');
  }

  // Check if user is the sender
  if (message.senderId.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to edit this message');
  }

  // Update message text
  message.text = text;
  message.edited = true; // Ensure Message schema has `edited` field (default false)
  await message.save();

  res.json(message);
});

// Delete a message (only by sender)
const deleteMessage = asyncHandler(async (req, res) => {
  const message = await Message.findById(req.params.messageId);

  if (!message) {
    res.status(404);
    throw new Error('Message not found');
  }

  if (message.senderId.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to delete this message');
  }

  await message.deleteOne();
  res.json({ message: 'Message deleted' });
});



module.exports = {
  getConversations,
  getOrCreateConversation,
  getMessages,
  sendMessage,
  updateMessage,
  deleteMessage,
};