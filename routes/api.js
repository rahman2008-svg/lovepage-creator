const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { nanoid } = require('nanoid');
const db = require('../database/init');

// Image upload config
const storage = multer.diskStorage({
  destination: 'public/uploads/',
  filename: (req, file, cb) => {
    cb(null, nanoid() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only images are allowed'));
  }
});

// Upload image
router.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  res.json({
    success: true,
    imageUrl: `/uploads/${req.file.filename}`
  });
});

// Get page data
router.get('/page/:slug', (req, res) => {
  db.get(
    'SELECT * FROM pages WHERE slug = ?',
    [req.params.slug],
    (err, page) => {
      if (err || !page) {
        return res.status(404).json({ error: 'Page not found' });
      }

      res.json(page);
    }
  );
});

// List recent pages
router.get('/recent', (req, res) => {
  db.all(
    'SELECT * FROM pages ORDER BY created_at DESC LIMIT 20',
    [],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      res.json(rows);
    }
  );
});

module.exports = router;
