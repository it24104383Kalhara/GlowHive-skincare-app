const asyncHandler = require('express-async-handler');
const SkinLog = require('../models/SkinLog');
const fs = require('fs');
const path = require('path');

// @desc    Create a new skin log entry
// @route   POST /api/skinlogs
// @access  Private
const createSkinLog = asyncHandler(async (req, res) => {
  const { date, hydration, acne, productsUsed, notes, imageUrl } = req.body;

  const skinLog = new SkinLog({
    user: req.user._id,
    date: date || Date.now(),
    hydration,
    acne,
    productsUsed: Array.isArray(productsUsed)
      ? productsUsed
      : productsUsed
        ? productsUsed.split(',').map(p => p.trim()).filter(Boolean)
        : [],
    notes: notes || '',
    imageUrl,
  });

  const createdLog = await skinLog.save();
  res.status(201).json(createdLog);
});

// @desc    Get all skin logs for the logged-in user
// @route   GET /api/skinlogs
// @access  Private
const getMySkinLogs = asyncHandler(async (req, res) => {
  const logs = await SkinLog.find({ user: req.user._id }).sort({ date: -1 });
  res.json(logs);
});

// @desc    Get a single skin log by ID
// @route   GET /api/skinlogs/:id
// @access  Private (owner only)
const getSkinLogById = asyncHandler(async (req, res) => {
  const log = await SkinLog.findById(req.params.id);

  if (!log) {
    res.status(404);
    throw new Error('Skin log entry not found');
  }

  // Ensure the log belongs to the logged-in user
  if (log.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to view this entry');
  }

  res.json(log);
});

// @desc    Update a skin log entry
// @route   PUT /api/skinlogs/:id
// @access  Private (owner only)
const updateSkinLog = asyncHandler(async (req, res) => {
  const log = await SkinLog.findById(req.params.id);

  if (!log) {
    res.status(404);
    throw new Error('Skin log entry not found');
  }

  // Ensure the log belongs to the logged-in user
  if (log.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to update this entry');
  }

  const { date, hydration, acne, productsUsed, notes, imageUrl } = req.body;

  // If a new image is uploaded, delete the old image file
  if (imageUrl && imageUrl !== log.imageUrl) {
    if (log.imageUrl && log.imageUrl.startsWith('/uploads/')) {
      const oldImagePath = path.join(__dirname, '../..', log.imageUrl);
      if (fs.existsSync(oldImagePath)) {
        try {
          fs.unlinkSync(oldImagePath);
        } catch (error) {
          console.error(`Failed to delete old skin log image: ${error.message}`);
        }
      }
    }
  }

  log.date = date || log.date;
  log.hydration = hydration || log.hydration;
  log.acne = acne || log.acne;
  log.productsUsed = productsUsed
    ? (Array.isArray(productsUsed)
        ? productsUsed
        : productsUsed.split(',').map(p => p.trim()).filter(Boolean))
    : log.productsUsed;
  log.notes = notes !== undefined ? notes : log.notes;
  log.imageUrl = imageUrl || log.imageUrl;

  const updatedLog = await log.save();
  res.json(updatedLog);
});

// @desc    Delete a skin log entry
// @route   DELETE /api/skinlogs/:id
// @access  Private (owner only)
const deleteSkinLog = asyncHandler(async (req, res) => {
  const log = await SkinLog.findById(req.params.id);

  if (!log) {
    res.status(404);
    throw new Error('Skin log entry not found');
  }

  // Ensure the log belongs to the logged-in user
  if (log.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to delete this entry');
  }

  // Delete the associated image file
  if (log.imageUrl && log.imageUrl.startsWith('/uploads/')) {
    const imagePath = path.join(__dirname, '../..', log.imageUrl);
    if (fs.existsSync(imagePath)) {
      try {
        fs.unlinkSync(imagePath);
      } catch (error) {
        console.error(`Failed to delete skin log image: ${error.message}`);
      }
    }
  }

  await log.deleteOne();
  res.json({ message: 'Skin log entry removed' });
});

module.exports = {
  createSkinLog,
  getMySkinLogs,
  getSkinLogById,
  updateSkinLog,
  deleteSkinLog,
};
