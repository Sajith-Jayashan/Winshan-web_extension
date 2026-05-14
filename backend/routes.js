const express = require('express');
const { nanoid } = require('nanoid');
const pool = require('./db'); // <-- 1. Import your database connection
const router = express.Router();

// Shorten a URL
router.post('/shorten', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL is required' });

  const code = nanoid(6);
  // 2. Fix the localhost issue using the environment variable
  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';

  try {
    // 3. Save the new URL directly into the database
    await pool.query(
      'INSERT INTO urls (code, original) VALUES ($1, $2)',
      [code, url]
    );
    res.json({ shortUrl: `${baseUrl}/${code}`, code });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error while saving URL' });
  }
});

// Redirect to original URL
router.get('/:code', async (req, res) => {
  try {
    // 4. Look up the URL from the database instead of the 'store' object
    const result = await pool.query(
      'SELECT original FROM urls WHERE code = $1',
      [req.params.code]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'URL not found' });
    }

    // Optional bonus: You are tracking clicks, so increment the click counter here!
    await pool.query(
      'UPDATE urls SET clicks = clicks + 1 WHERE code = $1', 
      [req.params.code]
    );

    res.redirect(result.rows[0].original);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error during redirect' });
  }
});

// Fetch History
router.get('/history', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT code, original, clicks, created_at FROM urls ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error fetching history' });
  }
});

// Delete a URL
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
    console.error(err);
    res.status(500).json({ error: 'Database error during deletion' });
  }
});

module.exports = router;
