const express = require('express');
const router = express.Router();
const archiver = require('archiver');
const path = require('path');
const fs = require('fs');
const db = require('../db');

const uploadsDir = path.join(__dirname, '..', 'uploads');

// GET /api/archive/:siteId  — download full site archive as .zip
router.get('/:siteId', (req, res) => {
  try {
    const site = db.prepare('SELECT * FROM sites WHERE id = ?').get(req.params.siteId);
    if (!site) return res.status(404).json({ error: 'Site not found' });

    const points = db.prepare(
      'SELECT * FROM inspection_points WHERE site_id = ? ORDER BY category, created_at'
    ).all(site.id);

    const pointsWithPhotos = points.map((p) => {
      const photos = db.prepare(
        'SELECT * FROM photos WHERE point_id = ? ORDER BY order_index, created_at'
      ).all(p.id);
      return { ...p, photos };
    });

    const safeName = site.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const filename = `site-inspect_${safeName}_${new Date().toISOString().slice(0, 10)}.zip`;

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    const archive = archiver('zip', { zlib: { level: 6 } });
    archive.on('error', (err) => {
      console.error('Archive error:', err);
      if (!res.headersSent) res.status(500).json({ error: err.message });
    });

    archive.pipe(res);

    // Write manifest JSON
    const manifest = {
      version: 1,
      exportedAt: new Date().toISOString(),
      site,
      points: pointsWithPhotos,
    };
    archive.append(JSON.stringify(manifest, null, 2), { name: 'manifest.json' });

    // Add all photo files
    for (const point of pointsWithPhotos) {
      for (const photo of point.photos) {
        const filePath = path.join(uploadsDir, photo.filename);
        if (fs.existsSync(filePath)) {
          archive.file(filePath, { name: `photos/${photo.filename}` });
        }
        if (photo.thumbnail && photo.thumbnail !== photo.filename) {
          const thumbPath = path.join(uploadsDir, photo.thumbnail);
          if (fs.existsSync(thumbPath)) {
            archive.file(thumbPath, { name: `photos/${photo.thumbnail}` });
          }
        }
      }
    }

    archive.finalize();
  } catch (err) {
    if (!res.headersSent) res.status(500).json({ error: err.message });
  }
});

// POST /api/archive/import  — restore a site from an uploaded manifest.json (JSON body)
router.post('/import', express.json({ limit: '10mb' }), (req, res) => {
  try {
    const { site, points } = req.body;
    if (!site || !points) return res.status(400).json({ error: 'Invalid archive manifest' });

    const { v4: uuidv4 } = require('uuid');

    // Create new site with fresh ID
    const newSiteId = uuidv4();
    db.prepare(`
      INSERT INTO sites (id, name, address, contact_name, contact_phone, contact_ext, contact_email,
        notes, job_flags, status, latitude, longitude, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `).run(
      newSiteId, site.name + ' (Restored)', site.address, site.contact_name,
      site.contact_phone, site.contact_ext, site.contact_email,
      site.notes, site.job_flags, site.status || 'active',
      site.latitude, site.longitude
    );

    const pointIdMap = {};

    // First pass: create all points
    for (const point of points) {
      const newPointId = uuidv4();
      pointIdMap[point.id] = newPointId;
      db.prepare(`
        INSERT INTO inspection_points (
          id, site_id, category, subcategory, name, location_description, floor,
          notes, product_model, install_difficulty, idf_point_id,
          is_flagged, flag_notes, cable_type, cable_length, order_index, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
      `).run(
        newPointId, newSiteId, point.category, point.subcategory, point.name,
        point.location_description, point.floor, point.notes, point.product_model,
        point.install_difficulty, null, // idf_point_id resolved in second pass
        point.is_flagged, point.flag_notes, point.cable_type, point.cable_length,
        point.order_index || 0
      );
    }

    // Second pass: fix idf_point_id references
    for (const point of points) {
      if (point.idf_point_id && pointIdMap[point.idf_point_id]) {
        db.prepare('UPDATE inspection_points SET idf_point_id = ? WHERE id = ?')
          .run(pointIdMap[point.idf_point_id], pointIdMap[point.id]);
      }
    }

    // Third pass: restore photo metadata (files must be re-uploaded separately)
    for (const point of points) {
      for (const photo of point.photos || []) {
        const newPhotoId = uuidv4();
        // Only insert if the file actually exists in uploads
        const filePath = path.join(uploadsDir, photo.filename);
        if (fs.existsSync(filePath)) {
          db.prepare(`
            INSERT INTO photos (id, point_id, filename, thumbnail, photo_type, notes, annotations, order_index, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).run(
            newPhotoId, pointIdMap[point.id], photo.filename, photo.thumbnail,
            photo.photo_type, photo.notes, photo.annotations, photo.order_index, photo.created_at
          );
        }
      }
    }

    res.json({ success: true, siteId: newSiteId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
