const path = require('path');
const express = require('express');
const multer = require('multer');
const router = express.Router();

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename(req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB limit
  fileFilter: (req, file, cb) => {
    cb(null, true); // Allow all file types (images, docs, etc.)
  },
});

// ✅ COMPATIBILITY LAYER: Support both "image" and "file" field names
router.post('/', (req, res) => {
  console.log('[UPLOAD] Request received');
  
  // Try 'image' first, then 'file'
  upload.fields([{ name: 'image', maxCount: 1 }, { name: 'file', maxCount: 1 }])(req, res, (err) => {
    if (err) {
      console.error('[UPLOAD] Multer error:', err.message);
      return res.status(400).json({ error: err.message });
    }

    const uploadedFile = (req.files['image'] && req.files['image'][0]) || (req.files['file'] && req.files['file'][0]);

    if (!uploadedFile) {
      console.error('[UPLOAD] No file found in request');
      return res.status(400).json({ error: 'No file uploaded. Use field "image" or "file".' });
    }

    const formattedPath = `/${uploadedFile.path.replace(/\\/g, '/')}`;
    const fullUrl = `${req.protocol}://${req.get('host')}${formattedPath}`;
    
    console.log(`[UPLOAD] Success: ${formattedPath}`);

    // Return everything to satisfy all frontend services (Review, Chat, Products)
    // - Review/Product wants a string (legacy) or filePath
    // - Chat wants .url
    res.json({
      success: true,
      filePath: formattedPath, // Used by productService
      url: fullUrl,           // Used by ChatScreen
      name: uploadedFile.filename,
      originalName: uploadedFile.originalname
    });
  });
});

module.exports = router;