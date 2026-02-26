const express = require('express');
const router = express.Router();
const db = require('../db');
const { v4: uuidv4 } = require('uuid');

// GET all sites
router.get('/', (req, res) => {
  try {
    const { status, search } = req.query;
    let query = `
      SELECT s.*,
        (SELECT COUNT(*) FROM inspection_points WHERE site_id = s.id) as point_count,
        (SELECT COUNT(*) FROM photos p JOIN inspection_points ip ON p.point_id = ip.id WHERE ip.site_id = s.id) as photo_count
      FROM sites s
      WHERE 1=1
    `;
    const params = [];

    if (status && status !== 'all') {
      query += ' AND s.status = ?';
      params.push(status);
    }
    if (search) {
      query += ' AND (s.name LIKE ? OR s.address LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY s.updated_at DESC';
    const sites = db.prepare(query).all(...params);
    res.json(sites);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single site
router.get('/:id', (req, res) => {
  try {
    const site = db.prepare('SELECT * FROM sites WHERE id = ?').get(req.params.id);
    if (!site) return res.status(404).json({ error: 'Site not found' });
    res.json(site);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create site
router.post('/', (req, res) => {
  try {
    const id = uuidv4();
    const { name, address, latitude, longitude, contact_name, contact_phone, contact_ext, contact_email, notes, job_flags } = req.body;
    db.prepare(`
      INSERT INTO sites (id, name, address, latitude, longitude, contact_name, contact_phone, contact_ext, contact_email, notes, job_flags)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, name, address || null, latitude || null, longitude || null, contact_name || null, contact_phone || null, contact_ext || null, contact_email || null, notes || null, job_flags || null);

    const site = db.prepare('SELECT * FROM sites WHERE id = ?').get(id);
    res.status(201).json(site);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update site
router.put('/:id', (req, res) => {
  try {
    const { name, address, latitude, longitude, contact_name, contact_phone, contact_ext, contact_email, notes, job_flags, status } = req.body;
    const existing = db.prepare('SELECT * FROM sites WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Site not found' });

    db.prepare(`
      UPDATE sites SET
        name = COALESCE(?, name),
        address = COALESCE(?, address),
        latitude = COALESCE(?, latitude),
        longitude = COALESCE(?, longitude),
        contact_name = COALESCE(?, contact_name),
        contact_phone = COALESCE(?, contact_phone),
        contact_ext = ?,
        contact_email = COALESCE(?, contact_email),
        notes = COALESCE(?, notes),
        job_flags = ?,
        status = COALESCE(?, status),
        updated_at = datetime('now')
      WHERE id = ?
    `).run(name, address, latitude, longitude, contact_name, contact_phone, contact_ext || null, contact_email, notes, job_flags ?? null, status, req.params.id);

    const site = db.prepare('SELECT * FROM sites WHERE id = ?').get(req.params.id);
    res.json(site);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE site
router.delete('/:id', (req, res) => {
  try {
    const existing = db.prepare('SELECT * FROM sites WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Site not found' });
    db.prepare('DELETE FROM sites WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET points for a site
router.get('/:id/points', (req, res) => {
  try {
    const points = db.prepare(`
      SELECT ip.*,
        (SELECT COUNT(*) FROM photos WHERE point_id = ip.id) as photo_count
      FROM inspection_points ip
      WHERE ip.site_id = ?
      ORDER BY ip.category, ip.order_index, ip.created_at
    `).all(req.params.id);
    res.json(points);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create point for a site
router.post('/:id/points', (req, res) => {
  try {
    const id = uuidv4();
    const siteId = req.params.id;
    const { category, subcategory, name, location_description, floor, notes, product_model, install_difficulty, idf_point_id, is_flagged, flag_notes, cable_type, cable_length } = req.body;

    const maxOrder = db.prepare('SELECT MAX(order_index) as max_order FROM inspection_points WHERE site_id = ?').get(siteId);
    const orderIndex = (maxOrder?.max_order || 0) + 1;

    db.prepare(`
      INSERT INTO inspection_points (id, site_id, category, subcategory, name, location_description, floor, notes, product_model, install_difficulty, idf_point_id, is_flagged, flag_notes, cable_type, cable_length, order_index)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, siteId, category, subcategory || null, name || null, location_description || null, floor || null, notes || null, product_model || null, install_difficulty || null, idf_point_id || null, is_flagged ? 1 : 0, flag_notes || null, cable_type || null, cable_length ?? null, orderIndex);

    // Update site timestamp
    db.prepare("UPDATE sites SET updated_at = datetime('now') WHERE id = ?").run(siteId);

    const point = db.prepare('SELECT * FROM inspection_points WHERE id = ?').get(id);
    res.status(201).json(point);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
