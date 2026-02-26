const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
fs.mkdirSync(DATA_DIR, { recursive: true });

const DB_PATH = path.join(DATA_DIR, 'siteinspect.db');
const db = new Database(DB_PATH);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS sites (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    address TEXT,
    latitude REAL,
    longitude REAL,
    contact_name TEXT,
    contact_phone TEXT,
    contact_ext TEXT,
    contact_email TEXT,
    notes TEXT,
    job_flags TEXT DEFAULT NULL,
    status TEXT DEFAULT 'active',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS inspection_points (
    id TEXT PRIMARY KEY,
    site_id TEXT NOT NULL,
    category TEXT NOT NULL,
    subcategory TEXT,
    name TEXT,
    location_description TEXT,
    floor TEXT,
    notes TEXT,
    product_model TEXT,
    install_difficulty INTEGER DEFAULT NULL,
    idf_point_id TEXT DEFAULT NULL,
    is_flagged INTEGER DEFAULT 0,
    flag_notes TEXT DEFAULT NULL,
    cable_type TEXT DEFAULT NULL,
    cable_length REAL DEFAULT NULL,
    order_index INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (site_id) REFERENCES sites(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS photos (
    id TEXT PRIMARY KEY,
    point_id TEXT NOT NULL,
    filename TEXT NOT NULL,
    thumbnail TEXT,
    photo_type TEXT DEFAULT 'general',
    notes TEXT,
    annotations TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (point_id) REFERENCES inspection_points(id) ON DELETE CASCADE
  );
`);

// Migration: add contact_ext if it doesn't exist yet
try {
  db.exec(`ALTER TABLE sites ADD COLUMN contact_ext TEXT`);
} catch (_) { /* column already exists */ }

// Migration: add install_difficulty
try {
  db.exec(`ALTER TABLE inspection_points ADD COLUMN install_difficulty INTEGER DEFAULT NULL`);
} catch (_) { /* column already exists */ }

// Migration: add idf_point_id
try {
  db.exec(`ALTER TABLE inspection_points ADD COLUMN idf_point_id TEXT DEFAULT NULL`);
} catch (_) { /* column already exists */ }

// Migration: add is_flagged
try {
  db.exec(`ALTER TABLE inspection_points ADD COLUMN is_flagged INTEGER DEFAULT 0`);
} catch (_) { /* column already exists */ }

// Migration: add flag_notes
try {
  db.exec(`ALTER TABLE inspection_points ADD COLUMN flag_notes TEXT DEFAULT NULL`);
} catch (_) { /* column already exists */ }

// Migration: add cable_type
try {
  db.exec(`ALTER TABLE inspection_points ADD COLUMN cable_type TEXT DEFAULT NULL`);
} catch (_) { /* column already exists */ }

// Migration: add cable_length
try {
  db.exec(`ALTER TABLE inspection_points ADD COLUMN cable_length REAL DEFAULT NULL`);
} catch (_) { /* column already exists */ }

// Migration: add job_flags to sites
try {
  db.exec(`ALTER TABLE sites ADD COLUMN job_flags TEXT DEFAULT NULL`);
} catch (_) { /* column already exists */ }

module.exports = db;
