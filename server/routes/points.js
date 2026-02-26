const express = require('express');
const router = express.Router();
const db = require('../db');

// GET single point with photos
router.get('/:id', (req, res) => {
  try {
    const point = db.prepare('SELECT * FROM inspection_points WHERE id = ?').get(req.params.id);
    if (!point) return res.status(404).json({ error: 'Point not found' });

    const photos = db.prepare('SELECT * FROM photos WHERE point_id = ? ORDER BY order_index, created_at').all(req.params.id);
    res.json({ ...point, photos });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update point
router.put('/:id', (req, res) => {
  try {
    const existing = db.prepare('SELECT * FROM inspection_points WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Point not found' });

    const { category, subcategory, name, location_description, floor, notes, product_model, order_index, install_difficulty, idf_point_id, is_flagged, flag_notes, cable_type, cable_length } = req.body;

    db.prepare(`
      UPDATE inspection_points SET
        category = COALESCE(?, category),
        subcategory = COALESCE(?, subcategory),
        name = COALESCE(?, name),
        location_description = COALESCE(?, location_description),
        floor = COALESCE(?, floor),
        notes = COALESCE(?, notes),
        product_model = COALESCE(?, product_model),
        install_difficulty = ?,
        idf_point_id = ?,
        is_flagged = ?,
        flag_notes = ?,
        cable_type = ?,
        cable_length = ?,
        order_index = COALESCE(?, order_index),
        updated_at = datetime('now')
      WHERE id = ?
    `).run(category, subcategory, name, location_description, floor, notes, product_model, install_difficulty ?? null, idf_point_id ?? null, is_flagged ? 1 : 0, flag_notes ?? null, cable_type ?? null, cable_length ?? null, order_index, req.params.id);

    // Update site timestamp
    db.prepare("UPDATE sites SET updated_at = datetime('now') WHERE id = ?").run(existing.site_id);

    const point = db.prepare('SELECT * FROM inspection_points WHERE id = ?').get(req.params.id);
    const photos = db.prepare('SELECT * FROM photos WHERE point_id = ? ORDER BY order_index, created_at').all(req.params.id);
    res.json({ ...point, photos });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE point
router.delete('/:id', (req, res) => {
  try {
    const existing = db.prepare('SELECT * FROM inspection_points WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Point not found' });

    // Delete associated photo files
    const photos = db.prepare('SELECT * FROM photos WHERE point_id = ?').all(req.params.id);
    const path = require('path');
    const fs = require('fs');
    const uploadsDir = path.join(__dirname, '..', 'uploads');
    for (const photo of photos) {
      const filePath = path.join(uploadsDir, photo.filename);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      if (photo.thumbnail) {
        const thumbPath = path.join(uploadsDir, photo.thumbnail);
        if (fs.existsSync(thumbPath)) fs.unlinkSync(thumbPath);
      }
    }

    db.prepare('DELETE FROM inspection_points WHERE id = ?').run(req.params.id);
    db.prepare("UPDATE sites SET updated_at = datetime('now') WHERE id = ?").run(existing.site_id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
