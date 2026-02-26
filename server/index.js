const express = require('express');
const cors = require('cors');
const compression = require('compression');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Ensure directories exist
const uploadsDir = path.join(__dirname, 'uploads');
fs.mkdirSync(uploadsDir, { recursive: true });

app.use(cors());
app.use(compression());
app.use(express.json({ limit: '50mb' }));

// API routes
app.use('/api/sites', require('./routes/sites'));
app.use('/api/points', require('./routes/points'));
app.use('/api/photos', require('./routes/photos'));
app.use('/api/archive', require('./routes/archive'));

// Serve uploaded files
app.use('/uploads', express.static(uploadsDir));

// Serve frontend in production
const clientDist = path.join(__dirname, '../client/dist');
if (fs.existsSync(clientDist)) {
  // sw.js must never be cached — browser needs to detect updates
  app.get('/sw.js', (req, res) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.sendFile(path.join(clientDist, 'sw.js'));
  });

  app.use(express.static(clientDist, { maxAge: '1y', immutable: true }));
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api') && !req.path.startsWith('/uploads')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      res.sendFile(path.join(clientDist, 'index.html'));
    }
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Site Inspect server running on http://0.0.0.0:${PORT}`);
});
