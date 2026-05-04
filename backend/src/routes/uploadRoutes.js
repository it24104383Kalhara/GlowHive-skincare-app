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

// Accept all file types (images + documents) for chat support
const fileFilter = (req, file, cb) => {
  cb(null, true);
};

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit
  fileFilter,
});

// Upload endpoint – handles either "file" or "image" field
router.post('/', (req, res, next) => {
  const uploadHandler = upload.fields([{ name: 'file', maxCount: 1 }, { name: 'image', maxCount: 1 }]);
  
  uploadHandler(req, res, (err) => {
    if (err) {
      console.error('Upload error:', err.message);
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ error: `Multer error: ${err.message}` });
      }
      return res.status(400).json({ error: err.message });
    }
    
    const file = req.files && (req.files.file ? req.files.file[0] : req.files.image ? req.files.image[0] : null);
    
    if (!file) {
      console.error('No file received.');
      return res.status(400).json({ error: 'No file uploaded. Expected field "file" or "image".' });
    }

    console.log('File uploaded successfully:', file.filename);
    const filePath = `/uploads/${file.filename}`;
    const url = `${req.protocol}://${req.get('host')}${filePath}`;
    
    // Return relative path and full URL
    res.json({ url, filePath });
  });
});

module.exports = router;
