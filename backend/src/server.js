require('dotenv').config();

// ─── Global crash guards ───────────────────────────────────────────────────
// Prevents the server from going down on unhandled promise rejections
// (e.g. Mongoose CastError not caught by a controller)
process.on('unhandledRejection', (reason, promise) => {
  console.error('⚠️  Unhandled Rejection at:', promise, '\n  Reason:', reason);
  // Log but do NOT exit — keep the server alive
});

process.on('uncaughtException', (err) => {
  console.error('⚠️  Uncaught Exception:', err);
  // Log but do NOT exit — keep the server alive
});
// ──────────────────────────────────────────────────────────────────────────

const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const messageRoutes = require('./routes/messageRoutes');
const conversationRoutes = require('./routes/conversationRoutes');

const path = require('path');

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

// Basic route for testing
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Glow Hive API' });
});

// Routes
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/messages', messageRoutes);        // ✅ ADD THIS
app.use('/api/conversations', conversationRoutes);

// Make uploads folder static so images are publicly accessible
const dirname = path.resolve();
app.use('/uploads', express.static(path.join(dirname, 'uploads')));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('API Error:', err);
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Server Error',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5000;

// ✅ REPLACE `app.listen` with `server.listen` (Socket.io needs HTTP server)
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
  console.log(`Server is running in ${process.env.NODE_ENV} mode on port ${PORT} (with Socket.io, bound to 0.0.0.0)`);
});