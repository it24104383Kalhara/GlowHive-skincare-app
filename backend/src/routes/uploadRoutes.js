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

// ✅ Accept all file types (images + documents)
const fileFilter = (req, file, cb) => {
  cb(null, true); // Allow everything (you can add restrictions later if needed)
};

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit
  fileFilter,
});

// ✅ Upload endpoint – field name = "file"
router.post('/', (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      console.error('Upload error:', err.message);
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ error: `Multer error: ${err.message}` });
      }
      return res.status(400).json({ error: err.message });
    }
    if (!req.file) {
      console.error('No file received. Body keys:', Object.keys(req.body));
      return res.status(400).json({ error: 'No file uploaded' });
    }
    console.log('File uploaded successfully:', req.file.filename);
    const url = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    res.json({ url });
  });
});

module.exports = router;