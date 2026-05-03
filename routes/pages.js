const express = require('express');
const router = express.Router();
const db = require('../database/init');
const QRCode = require('qrcode');

// Home page - Creator
router.get('/', (req, res) => {
  res.render('index', { 
    error: null, 
    success: null 
  });
});

// Create page
router.post('/create', async (req, res) => {
  try {
    const { title, message, slug, music_url, theme } = req.body;
    
    // Validate
    if (!title || !message || !slug) {
      return res.render('index', { 
        error: 'All fields are required', 
        success: null 
      });
    }

    // Check slug availability
    const existing = db.prepare('SELECT id FROM pages WHERE slug = ?').get(slug);
    if (existing) {
      return res.render('index', { 
        error: 'This URL is already taken', 
        success: null 
      });
    }

    // Insert page
    const stmt = db.prepare(`
      INSERT INTO pages (title, message, slug, music_url, theme) 
      VALUES (?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(title, message, slug, music_url, theme || 'default');
    
    res.redirect(`/p/${slug}`);
  } catch (error) {
    res.render('index', { 
      error: 'Something went wrong', 
      success: null 
    });
  }
});

// View page
router.get('/p/:slug', (req, res) => {
  const page = db.prepare('SELECT * FROM pages WHERE slug = ?').get(req.params.slug);
  
  if (!page) {
    return res.status(404).render('404');
  }

  // Increment views
  db.prepare('UPDATE pages SET views = views + 1 WHERE id = ?').run(page.id);
  
  // Generate QR Code
  const pageUrl = `${req.protocol}://${req.get('host')}/p/${page.slug}`;
  
  QRCode.toDataURL(pageUrl, (err, qrCode) => {
    res.render('page', { 
      page, 
      qrCode: err ? null : qrCode,
      pageUrl 
    });
  });
});

module.exports = router;
