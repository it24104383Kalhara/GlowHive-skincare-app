require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const connectDB = require('./config/db');

// Route imports
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const messageRoutes = require('./routes/messageRoutes');
const conversationRoutes = require('./routes/conversationRoutes');
const orderRoutes = require('./routes/orderRoutes');
const skinLogRoutes = require('./routes/skinLogRoutes');

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Request logger
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Global crash guards
process.on('unhandledRejection', (reason, promise) => {
  console.error('⚠️  Unhandled Rejection at:', promise, '\n  Reason:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('⚠️  Uncaught Exception:', err);
});
// Basic route for testing
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Glow Hive API' });
});

// Routes
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/skinlogs', skinLogRoutes);

// Make uploads folder static
const dirname = path.resolve();
app.use('/uploads', express.static(path.join(dirname, 'uploads')));

// Error handling middleware
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Server Error',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5000;

// Socket.io Setup
const server = http.createServer(app);
const io = socketIo(server, {
  cors: { origin: '*' },
});

io.on('connection', (socket) => {
  console.log('New client connected');
  socket.on('joinConversation', (conversationId) => {
    socket.join(`conv_${conversationId}`);
  });
  socket.on('sendMessage', (data) => {
    io.to(`conv_${data.conversationId}`).emit('newMessage', data);
  });
  socket.on('disconnect', () => console.log('Client disconnected'));
});

server.listen(PORT, '0.0.0.0', () => {
  const mode = process.env.NODE_ENV || 'development';
  console.log(`Server is running in ${mode} mode on port ${PORT} (with Socket.io)`);
});
