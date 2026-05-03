const path = require('path');
const express = require('express');
const multer = require('multer');
const router = express.Router();

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename(req, file, cb) {
    // Generate a unique name: timestamp-random-originalName
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

function checkFileType(file, cb) {
  console.log(`[UPLOAD] Checking file: ${file.originalname} (${file.mimetype})`);
  const filetypes = /jpg|jpeg|png/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    console.log('[UPLOAD] File type valid');
    return cb(null, true);
  } else {
    console.log(`[UPLOAD] Invalid file type: ext=${extname}, mime=${mimetype}`);
    cb(new Error('Images only! (jpg, jpeg, png)'));
  }
}

const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    console.log('[UPLOAD] Multer filter starting');
    checkFileType(file, cb);
  },
});

router.post('/', upload.single('image'), (req, res) => {
  console.log('[UPLOAD] Route handler reached');
  if (req.file) {
    // Ensure we return a forward-slash path for the URL
    const formattedPath = `/${req.file.path.replace(/\\/g, '/')}`;
    console.log(`[UPLOAD] Success: ${formattedPath}`);
    res.send(formattedPath);
  } else {
    console.log('[UPLOAD] No file in request');
    res.status(400).send('No file uploaded');
  }
});

module.exports = router;
