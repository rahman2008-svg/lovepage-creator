const express = require('express');
const router = express.Router();
const db = require('../database/init');
const QRCode = require('qrcode');

// Home page
router.get('/', (req, res) => {
  res.render('index', {
    error: null,
    success: null
  });
});

// Create page
router.post('/create', (req, res) => {
  const { title, message, slug, music_url, theme } = req.body;

  if (!title || !message || !slug) {
    return res.render('index', {
      error: 'All fields are required',
      success: null
    });
  }

  // Check slug
  db.get('SELECT id FROM pages WHERE slug = ?', [slug], (err, row) => {
    if (err) {
      return res.render('index', {
        error: 'Database error',
        success: null
      });
    }

    if (row) {
      return res.render('index', {
        error: 'This URL is already taken',
        success: null
      });
    }

    // Insert
    db.run(
      `INSERT INTO pages (title, message, slug, music_url, theme)
       VALUES (?, ?, ?, ?, ?)`,
      [title, message, slug, music_url, theme || 'default'],
      function (err) {
        if (err) {
          return res.render('index', {
            error: 'Something went wrong',
            success: null
          });
        }

        res.redirect(`/p/${slug}`);
      }
    );
  });
});

// View page
router.get('/p/:slug', (req, res) => {
  db.get(
    'SELECT * FROM pages WHERE slug = ?',
    [req.params.slug],
    (err, page) => {
      if (err || !page) {
        return res.status(404).render('404');
      }

      // views update
      db.run(
        'UPDATE pages SET views = views + 1 WHERE id = ?',
        [page.id]
      );

      const pageUrl = `${req.protocol}://${req.get('host')}/p/${page.slug}`;

      QRCode.toDataURL(pageUrl, (err, qrCode) => {
        res.render('page', {
          page,
          qrCode: err ? null : qrCode,
          pageUrl
        });
      });
    }
  );
});

module.exports = router;
