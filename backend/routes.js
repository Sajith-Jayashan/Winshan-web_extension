const express = require('express');
const { nanoid } = require('nanoid');
const router = express.Router();

// In-memory store for now (Phase 2 we add a real database)
const store = {};

// Shorten a URL
router.post('/shorten', (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL is required' });

  const code = nanoid(6);          // e.g. "aB3xYz"
  store[code] = url;

  res.json({ shortUrl: `http://localhost:3000/${code}`, code });
});

// Redirect to original URL
router.get('/:code', (req, res) => {
  const original = store[req.params.code];
  if (!original) return res.status(404).json({ error: 'URL not found' });
  res.redirect(original);
});

module.exports = router;