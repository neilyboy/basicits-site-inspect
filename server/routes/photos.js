const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');

const uploadsDir = path.join(__dirname, '..', 'uploads');
fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, `${uuidv4()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

// POST upload photos to a point
router.post('/points/:pointId/photos', upload.array('photos', 20), (req, res) => {
  try {
    const pointId = req.params.pointId;
    const point = db.prepare('SELECT * FROM inspection_points WHERE id = ?').get(pointId);
    if (!point) return res.status(404).json({ error: 'Point not found' });

    const photoType = req.body.photo_type || 'general';
    const notes = req.body.notes || null;

    const maxOrder = db.prepare('SELECT MAX(order_index) as max_order FROM photos WHERE point_id = ?').get(pointId);
    let orderIndex = (maxOrder?.max_order || 0) + 1;

    const photos = [];
    for (const file of req.files) {
      const id = uuidv4();
      db.prepare(`
        INSERT INTO photos (id, point_id, filename, photo_type, notes, order_index)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(id, pointId, file.filename, photoType, notes, orderIndex++);

      const photo = db.prepare('SELECT * FROM photos WHERE id = ?').get(id);
      photos.push(photo);
    }

    // Update site timestamp
    db.prepare("UPDATE sites SET updated_at = datetime('now') WHERE id = ?").run(point.site_id);

    res.status(201).json(photos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET photos for a point
router.get('/points/:pointId/photos', (req, res) => {
  try {
    const photos = db.prepare('SELECT * FROM photos WHERE point_id = ? ORDER BY order_index, created_at').all(req.params.pointId);
    res.json(photos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update photo metadata
router.put('/photos/:id', (req, res) => {
  try {
    const existing = db.prepare('SELECT * FROM photos WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Photo not found' });

    const { photo_type, notes, annotations, order_index } = req.body;
    db.prepare(`
      UPDATE photos SET
        photo_type = COALESCE(?, photo_type),
        notes = COALESCE(?, notes),
        annotations = COALESCE(?, annotations),
        order_index = COALESCE(?, order_index)
      WHERE id = ?
    `).run(photo_type, notes, annotations, order_index, req.params.id);

    const photo = db.prepare('SELECT * FROM photos WHERE id = ?').get(req.params.id);
    res.json(photo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST save annotated version of photo
router.post('/photos/:id/annotate', upload.single('annotated'), (req, res) => {
  try {
    const existing = db.prepare('SELECT * FROM photos WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Photo not found' });

    const annotations = req.body.annotations || null;
    const annotatedFilename = req.file ? req.file.filename : existing.filename;

    db.prepare(`
      UPDATE photos SET
        thumbnail = ?,
        annotations = ?
      WHERE id = ?
    `).run(annotatedFilename, annotations, req.params.id);

    const photo = db.prepare('SELECT * FROM photos WHERE id = ?').get(req.params.id);
    res.json(photo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE photo
router.delete('/photos/:id', (req, res) => {
  try {
    const existing = db.prepare('SELECT * FROM photos WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Photo not found' });

    // Delete file
    const filePath = path.join(uploadsDir, existing.filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    if (existing.thumbnail) {
      const thumbPath = path.join(uploadsDir, existing.thumbnail);
      if (fs.existsSync(thumbPath)) fs.unlinkSync(thumbPath);
    }

    db.prepare('DELETE FROM photos WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET full site report data
router.get('/report/:siteId', (req, res) => {
  try {
    const site = db.prepare('SELECT * FROM sites WHERE id = ?').get(req.params.siteId);
    if (!site) return res.status(404).json({ error: 'Site not found' });

    const points = db.prepare(`
      SELECT * FROM inspection_points WHERE site_id = ? ORDER BY category, order_index, created_at
    `).all(req.params.siteId);

    const pointsWithPhotos = points.map(point => {
      const photos = db.prepare('SELECT * FROM photos WHERE point_id = ? ORDER BY order_index, created_at').all(point.id);
      return { ...point, photos };
    });

    res.json({ site, points: pointsWithPhotos });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
