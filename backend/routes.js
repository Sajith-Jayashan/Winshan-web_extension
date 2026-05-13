const express = require('express');
const { nanoid } = require('nanoid');
const router = express.Router();

// In-memory store for now (Phase 2 we add a real database)
const store = {};

// Shorten a URL
router.post('/shorten', (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL is required' });

  const code = nanoid(6);          
  store[code] = url;

  res.json({ shortUrl: `http://localhost:3000/${code}`, code });
});

// Redirect to original URL
router.get('/:code', (req, res) => {
  const original = store[req.params.code];
  if (!original) return res.status(404).json({ error: 'URL not found' });
  res.redirect(original);
});

router.get('/history', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT code, original, clicks, created_at FROM urls ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

router.delete('/:code', async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM urls WHERE code = $1 RETURNING *',
      [req.params.code]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: 'URL not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;