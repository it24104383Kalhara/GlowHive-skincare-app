const express = require('express');
const router = express.Router();
const {
  createSkinLog,
  getMySkinLogs,
  getSkinLogById,
  updateSkinLog,
  deleteSkinLog,
} = require('../controllers/skinLogController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getMySkinLogs)
  .post(protect, createSkinLog);

router.route('/:id')
  .get(protect, getSkinLogById)
  .put(protect, updateSkinLog)
  .delete(protect, deleteSkinLog);

module.exports = router;
