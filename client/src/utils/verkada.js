export const CATEGORIES = [
  {
    id: 'camera',
    name: 'Cameras',
    icon: 'Camera',
    color: '#3b82f6',
    bgColor: '#eff6ff',
    subcategories: [
      { id: 'dome', name: 'Dome Camera' },
      { id: 'bullet', name: 'Bullet Camera' },
      { id: 'fisheye', name: 'Fisheye Camera' },
      { id: 'ptz', name: 'PTZ Camera' },
      { id: 'mini', name: 'Mini Camera' },
      { id: 'multisensor', name: 'Multisensor Camera' },
      { id: 'other_cam', name: 'Other Camera' },
    ],
  },
  {
    id: 'access_control',
    name: 'Access Control',
    icon: 'DoorOpen',
    color: '#10b981',
    bgColor: '#ecfdf5',
    subcategories: [
      { id: 'door_controller', name: 'Door Controller' },
      { id: 'card_reader', name: 'Card Reader' },
      { id: 'lock', name: 'Smart Lock' },
      { id: 'rex', name: 'Request to Exit (REX)' },
      { id: 'mag_lock', name: 'Mag Lock' },
      { id: 'electric_strike', name: 'Electric Strike' },
      { id: 'other_ac', name: 'Other Access Control' },
    ],
  },
  {
    id: 'intercom',
    name: 'Intercoms',
    icon: 'Radio',
    color: '#8b5cf6',
    bgColor: '#f5f3ff',
    subcategories: [
      { id: 'video_intercom', name: 'Video Intercom' },
      { id: 'audio_intercom', name: 'Audio Intercom' },
      { id: 'other_intercom', name: 'Other Intercom' },
    ],
  },
  {
    id: 'alarm',
    name: 'Alarms',
    icon: 'ShieldAlert',
    color: '#ef4444',
    bgColor: '#fef2f2',
    subcategories: [
      { id: 'alarm_panel', name: 'Alarm Panel' },
      { id: 'door_sensor', name: 'Door/Window Sensor' },
      { id: 'motion_sensor', name: 'Motion Sensor' },
      { id: 'glass_break', name: 'Glass Break Sensor' },
      { id: 'panic_button', name: 'Panic Button' },
      { id: 'water_sensor', name: 'Water Sensor' },
      { id: 'smoke_detector', name: 'Smoke Detector' },
      { id: 'other_alarm', name: 'Other Alarm' },
    ],
  },
  {
    id: 'sensor',
    name: 'Environmental Sensors',
    icon: 'Thermometer',
    color: '#f59e0b',
    bgColor: '#fffbeb',
    subcategories: [
      { id: 'air_quality', name: 'Air Quality Sensor' },
      { id: 'temp_humidity', name: 'Temperature & Humidity' },
      { id: 'other_sensor', name: 'Other Sensor' },
    ],
  },
  {
    id: 'network',
    name: 'IDF / MDF / Network',
    icon: 'Server',
    color: '#6366f1',
    bgColor: '#eef2ff',
    subcategories: [
      { id: 'idf', name: 'IDF Closet' },
      { id: 'mdf', name: 'MDF Closet' },
      { id: 'network_switch', name: 'Network Switch' },
      { id: 'patch_panel', name: 'Patch Panel' },
      { id: 'rack', name: 'Network Rack' },
      { id: 'other_network', name: 'Other Network' },
    ],
  },
  {
    id: 'viewing_station',
    name: 'Viewing Station',
    icon: 'Monitor',
    color: '#0ea5e9',
    bgColor: '#f0f9ff',
    subcategories: [
      { id: 'viewing_station', name: 'Viewing Station' },
    ],
  },
  {
    id: 'guest',
    name: 'Guest Management',
    icon: 'Users',
    color: '#ec4899',
    bgColor: '#fdf2f8',
    subcategories: [
      { id: 'visitor_kiosk', name: 'Visitor Kiosk' },
      { id: 'ipad_check_in', name: 'iPad Check-in' },
      { id: 'other_guest', name: 'Other Guest Mgmt' },
    ],
  },
  {
    id: 'other',
    name: 'Other / Misc',
    icon: 'Package',
    color: '#64748b',
    bgColor: '#f8fafc',
    subcategories: [
      { id: 'other', name: 'Other' },
    ],
  },
];

export function getCategoryById(id) {
  return CATEGORIES.find((c) => c.id === id);
}

export function getSubcategoryName(categoryId, subcategoryId) {
  const cat = getCategoryById(categoryId);
  if (!cat) return subcategoryId;
  const sub = cat.subcategories.find((s) => s.id === subcategoryId);
  return sub ? sub.name : subcategoryId;
}

export const PHOTO_TYPES = [
  { id: 'general',       name: 'General' },
  { id: 'overview',      name: 'Overview / Wide Shot' },
  { id: 'closeup',       name: 'Close-up' },
  { id: 'camera_fov',    name: 'Camera Field of View' },
  { id: 'camera_view',   name: 'Camera Angle / Aim' },
  { id: 'placement',     name: 'Camera Placement' },
  { id: 'mounting',      name: 'Mounting Location' },
  { id: 'existing',      name: 'Existing Hardware' },
  { id: 'wiring',        name: 'Wiring / Cabling' },
  { id: 'door',          name: 'Door / Entry Point' },
  { id: 'rack',          name: 'Network Rack / IDF' },
  { id: 'panel',         name: 'Panel / Control Box' },
  { id: 'ceiling',       name: 'Ceiling View' },
  { id: 'exterior',      name: 'Exterior / Outside' },
  { id: 'floor_plan',    name: 'Floor Plan / Layout' },
  { id: 'label',         name: 'Label / Asset Tag' },
  { id: 'damage',        name: 'Damage / Issue' },
  { id: 'reference',     name: 'Reference / Note' },
];

export function getPhotoTypeName(typeId) {
  const pt = PHOTO_TYPES.find((t) => t.id === typeId);
  return pt ? pt.name : typeId;
}

// ---------------------------------------------------------------------------
// Verkada Product Catalog — US Commercial SKUs (Feb 2026 Inventory)
// model = SKU family (without storage suffix / -HW)
// name  = human readable description
// Each entry: { model, name, accessories: [{ id, name }] }
// ---------------------------------------------------------------------------

const CAM_DOME_ACC = [
  { id: 'ACC-MNT-PEND-1',  name: 'ACC-MNT-PEND-1 — Pendant Mount' },
  { id: 'ACC-MNT-HPEND-1', name: 'ACC-MNT-HPEND-1 — Hard-Ceiling Pendant Mount' },
  { id: 'ACC-MNT-YPEND-1', name: 'ACC-MNT-YPEND-1 — Y-Pendant Mount' },
  { id: 'ACC-MNT-YJBOX-1', name: 'ACC-MNT-YJBOX-1 — Y-Junction Box Mount' },
];

const CAM_BULLET_ACC = [
  { id: 'ACC-MNT-YJBOX-1', name: 'ACC-MNT-YJBOX-1 — Y-Junction Box Mount' },
  { id: 'ACC-POLE-1',       name: 'ACC-POLE-1 — Pole Mount Adapter' },
];

const CAM_PTZ_ACC = [
  { id: 'ACC-MNT-PEND-1',  name: 'ACC-MNT-PEND-1 — Pendant Mount' },
  { id: 'ACC-MNT-HPEND-1', name: 'ACC-MNT-HPEND-1 — Hard-Ceiling Pendant Mount' },
  { id: 'ACC-POLE-1',       name: 'ACC-POLE-1 — Pole Mount Adapter' },
];

const CAM_FISH_ACC = [
  { id: 'ACC-MNT-PEND-1',  name: 'ACC-MNT-PEND-1 — Pendant Mount' },
  { id: 'ACC-MNT-YJBOX-1', name: 'ACC-MNT-YJBOX-1 — Y-Junction Box Mount' },
];

export const VERKADA_CATALOG = {

  // ── CAMERAS ─────────────────────────────────────────────────────────────

  // Indoor / Outdoor Mini Dome (CD22 series – entry level)
  dome: [
    { model: 'CD22',  name: 'CD22 — Indoor Mini Dome (1080p)',            accessories: [...CAM_DOME_ACC] },
    { model: 'CD22-E',name: 'CD22-E — Outdoor Mini Dome (1080p)',         accessories: [...CAM_DOME_ACC] },
    { model: 'CD32',  name: 'CD32 — Indoor Mini Dome (4MP)',              accessories: [...CAM_DOME_ACC] },
    { model: 'CD32-E',name: 'CD32-E — Outdoor Mini Dome (4MP)',           accessories: [...CAM_DOME_ACC] },
    { model: 'CD43',  name: 'CD43 — Indoor Dome (4MP)',                   accessories: [...CAM_DOME_ACC] },
    { model: 'CD43-E',name: 'CD43-E — Outdoor Dome (4MP)',                accessories: [...CAM_DOME_ACC] },
    { model: 'CD53',  name: 'CD53 — Indoor Dome (4K)',                    accessories: [...CAM_DOME_ACC] },
    { model: 'CD53-E',name: 'CD53-E — Outdoor Dome (4K)',                 accessories: [...CAM_DOME_ACC] },
    { model: 'CD63',  name: 'CD63 — Indoor Dome (4K Long-Range)',         accessories: [...CAM_DOME_ACC] },
    { model: 'CD63-E',name: 'CD63-E — Outdoor Dome (4K Long-Range)',      accessories: [...CAM_DOME_ACC] },
  ],

  bullet: [
    { model: 'CB52-E',   name: 'CB52-E — Outdoor Bullet (1080p)',         accessories: [...CAM_BULLET_ACC] },
    { model: 'CB52-TE',  name: 'CB52-TE — Outdoor Bullet Turret (1080p)', accessories: [...CAM_BULLET_ACC] },
    { model: 'CB62-E',   name: 'CB62-E — Outdoor Bullet (4MP)',           accessories: [...CAM_BULLET_ACC] },
    { model: 'CB62-TE',  name: 'CB62-TE — Outdoor Bullet Turret (4MP)',   accessories: [...CAM_BULLET_ACC] },
  ],

  fisheye: [
    { model: 'CF81-E',   name: 'CF81-E — Outdoor Fisheye 180° (4K)',      accessories: [...CAM_FISH_ACC] },
    { model: 'CF83-E',   name: 'CF83-E — Outdoor Fisheye 360° (4K)',      accessories: [...CAM_FISH_ACC] },
    { model: 'CF83',     name: 'CF83 — Indoor Fisheye 360° (4K)',         accessories: [...CAM_FISH_ACC] },
  ],

  ptz: [
    { model: 'CP52-E',   name: 'CP52-E — Outdoor PTZ (1080p, 32× optical)', accessories: [...CAM_PTZ_ACC] },
    { model: 'CP63-E',   name: 'CP63-E — Outdoor PTZ (4K, 36× optical)',    accessories: [...CAM_PTZ_ACC] },
  ],

  mini: [
    { model: 'CM22',     name: 'CM22 — Indoor Hidden Mini (1080p)',        accessories: [] },
    { model: 'CM41',     name: 'CM41 — Indoor Discreet Mini (wide FOV)',   accessories: [] },
    { model: 'CM42',     name: 'CM42 — Indoor Mini Dome (1080p)',          accessories: [
      { id: 'CM42-256S', name: 'CM42 Standard Lens' },
    ]},
  ],

  multisensor: [
    { model: 'CH53-E',   name: 'CH53-E — Outdoor Multisensor 4-head (4K)', accessories: [
      { id: 'ACC-MNT-PEND-1',  name: 'ACC-MNT-PEND-1 — Pendant Mount' },
      { id: 'ACC-POLE-1',       name: 'ACC-POLE-1 — Pole Mount Adapter' },
    ]},
    { model: 'CH63-E',   name: 'CH63-E — Outdoor Multisensor 4-head (4K LR)', accessories: [
      { id: 'ACC-MNT-PEND-1',  name: 'ACC-MNT-PEND-1 — Pendant Mount' },
      { id: 'ACC-POLE-1',       name: 'ACC-POLE-1 — Pole Mount Adapter' },
    ]},
    { model: 'CY53',     name: 'CY53 — Indoor 180° Panoramic (4K)',        accessories: [...CAM_DOME_ACC] },
    { model: 'CY63',     name: 'CY63 — Indoor 180° Panoramic (4K LR)',     accessories: [...CAM_DOME_ACC] },
    { model: 'CR63-E',   name: 'CR63-E — Outdoor 360° Panoramic (4K)',     accessories: [
      { id: 'ACC-POLE-1', name: 'ACC-POLE-1 — Pole Mount Adapter' },
    ]},
  ],

  // Cloud Connect / Recording Appliance
  other_cam: [
    { model: 'CC300',    name: 'CC300 — Cloud Connect 300 (NVR Bridge)',   accessories: [] },
    { model: 'CC500',    name: 'CC500 — Cloud Connect 500 (NVR Bridge)',   accessories: [] },
    { model: 'CC700',    name: 'CC700 — Cloud Connect 700 (NVR Bridge)',   accessories: [] },
    { model: 'VX52',     name: 'VX52 — Vehicle Tracking Camera',           accessories: [] },
    { model: 'ACC-POLE-1', name: 'ACC-POLE-1 — Pole Mount Kit (accessory only)', accessories: [] },
    { model: 'ACC-BAT-430WH-E-1', name: 'ACC-BAT-430WH-E-1 — Solar Battery Pack', accessories: [] },
  ],

  // ── ACCESS CONTROL ───────────────────────────────────────────────────────

  door_controller: [
    { model: 'AC12',     name: 'AC12 — Door Controller (1-door, PoE)',     accessories: [
      { id: 'ACCX-HUB-PIM',  name: 'ACCX-HUB-PIM — Power & IO Module' },
      { id: 'ACCX-HUB-AH30', name: 'ACCX-HUB-AH30 — Access Hub (30A PSU)' },
      { id: 'ACCX-HUB-GWE',  name: 'ACCX-HUB-GWE — Gateway Expander' },
    ]},
    { model: 'AC42',     name: 'AC42 — Door Controller (2-door)',          accessories: [
      { id: 'ACCX-HUB-PIM',  name: 'ACCX-HUB-PIM — Power & IO Module' },
      { id: 'ACCX-HUB-AH30', name: 'ACCX-HUB-AH30 — Access Hub (30A PSU)' },
      { id: 'ACCX-HUB-GWE',  name: 'ACCX-HUB-GWE — Gateway Expander' },
    ]},
    { model: 'AC62',     name: 'AC62 — Door Controller (4-door)',          accessories: [
      { id: 'ACCX-HUB-PIM',  name: 'ACCX-HUB-PIM — Power & IO Module' },
      { id: 'ACCX-HUB-AH30', name: 'ACCX-HUB-AH30 — Access Hub (30A PSU)' },
      { id: 'ACCX-HUB-GWE',  name: 'ACCX-HUB-GWE — Gateway Expander' },
    ]},
  ],

  card_reader: [
    { model: 'AD34',     name: 'AD34 — Card Reader (OSDP, Mullion)',       accessories: [
      { id: 'single_gang', name: 'Single-Gang Backplate' },
    ]},
    { model: 'AD64',     name: 'AD64 — Card Reader + Keypad (OSDP)',       accessories: [
      { id: 'single_gang', name: 'Single-Gang Backplate' },
    ]},
    { model: 'AF64',     name: 'AF64 — Facial Auth Reader',                accessories: [
      { id: 'single_gang', name: 'Single-Gang Backplate' },
    ]},
    { model: 'AX11',     name: 'AX11 — Elevator/Auxiliary Controller',     accessories: [] },
    { model: 'DK22',     name: 'DK22 — Desk Reader / Check-in Kiosk',      accessories: [] },
  ],

  lock: [
    { model: 'AL54-CY-CC', name: 'AL54-CY-CC — Cylindrical Lock (Core, Classroom)', accessories: [] },
    { model: 'AL54-CY-FC', name: 'AL54-CY-FC — Cylindrical Lock (Core, Function)',  accessories: [] },
    { model: 'AL54-CY-SC', name: 'AL54-CY-SC — Cylindrical Lock (Core, Storeroom)', accessories: [] },
    { model: 'AL54-MS-CC', name: 'AL54-MS-CC — Mortise Lock (Classroom)',            accessories: [] },
    { model: 'AL54-MS-FC', name: 'AL54-MS-FC — Mortise Lock (Function)',             accessories: [] },
    { model: 'AL54-MS-SC', name: 'AL54-MS-SC — Mortise Lock (Storeroom)',            accessories: [] },
  ],

  rex: [
    { model: 'ACC-DR-MS-1', name: 'ACC-DR-MS-1 — Motion Sensor REX (Verkada)',  accessories: [] },
    { model: 'Generic PIR REX',         name: 'Generic PIR REX',                accessories: [] },
    { model: 'Generic Push Button REX', name: 'Generic Push Button REX',         accessories: [] },
  ],

  mag_lock: [
    { model: 'Mag Lock 600lb',  name: 'Mag Lock — 600 lb Single',          accessories: [
      { id: 'armature_plate', name: 'Armature Plate' },
      { id: 'z_bracket',      name: 'Z-Bracket Kit' },
      { id: 'lz_bracket',     name: 'L-Z Bracket Kit' },
    ]},
    { model: 'Mag Lock 1200lb', name: 'Mag Lock — 1200 lb Double',         accessories: [
      { id: 'armature_plate', name: 'Armature Plate' },
      { id: 'z_bracket',      name: 'Z-Bracket Kit' },
    ]},
  ],

  electric_strike: [
    { model: 'Electric Strike (Fail Secure)', name: 'Electric Strike — Fail Secure', accessories: [] },
    { model: 'Electric Strike (Fail Safe)',   name: 'Electric Strike — Fail Safe',   accessories: [] },
  ],

  other_ac: [
    { model: 'ACCX-HUB-AH30', name: 'ACCX-HUB-AH30 — Access Hub (30A PSU)',     accessories: [] },
    { model: 'ACCX-HUB-GWE',  name: 'ACCX-HUB-GWE — Gateway Expander',          accessories: [] },
    { model: 'ACCX-HUB-PIM',  name: 'ACCX-HUB-PIM — Power & IO Module',         accessories: [] },
    { model: 'ACC-CEL-LTE-2', name: 'ACC-CEL-LTE-2 — LTE Cellular Backup',      accessories: [] },
    { model: 'ACC-VBX-200WH', name: 'ACC-VBX-200WH — Backup Battery (200Wh)',   accessories: [] },
    { model: 'ACC-VBX-ENC',   name: 'ACC-VBX-ENC — Battery Enclosure',          accessories: [] },
  ],

  // ── INTERCOMS ────────────────────────────────────────────────────────────

  video_intercom: [
    { model: 'TD33',     name: 'TD33 — Video Intercom (Compact)',          accessories: [
      { id: 'ACC-INT-TS-COND',  name: 'ACC-INT-TS-COND — Conduit Box' },
      { id: 'ACC-INT-PLATE-1',  name: 'ACC-INT-PLATE-1 — Trim Plate' },
    ]},
    { model: 'TD53',     name: 'TD53 — Video Intercom (Standard)',         accessories: [
      { id: 'ACC-INT-TS-COND',  name: 'ACC-INT-TS-COND — Conduit Box' },
      { id: 'ACC-INT-PLATE-1',  name: 'ACC-INT-PLATE-1 — Trim Plate' },
      { id: 'ACC-INT-SMB-4',    name: 'ACC-INT-SMB-4 — Surface Mount Box' },
    ]},
    { model: 'TD63',     name: 'TD63 — Video Intercom (4K)',               accessories: [
      { id: 'ACC-INT-TS-COND',  name: 'ACC-INT-TS-COND — Conduit Box' },
      { id: 'ACC-INT-PLATE-1',  name: 'ACC-INT-PLATE-1 — Trim Plate' },
      { id: 'ACC-INT-SMB-4',    name: 'ACC-INT-SMB-4 — Surface Mount Box' },
    ]},
  ],

  audio_intercom: [
    { model: 'TS12-N',    name: 'TS12-N — Indoor Call Station',            accessories: [
      { id: 'TS12-N-RB',  name: 'TS12-N-RB — Retrofit Backbox' },
      { id: 'TS12-N-R2B', name: 'TS12-N-R2B — Deep Retrofit Backbox' },
    ]},
  ],

  other_intercom: [
    { model: 'ACC-INT-SMB-4',  name: 'ACC-INT-SMB-4 — Intercom Surface Mount Box', accessories: [] },
    { model: 'ACC-INT-TS-COND',name: 'ACC-INT-TS-COND — Intercom Conduit Box',     accessories: [] },
    { model: 'ACC-INT-PLATE-1',name: 'ACC-INT-PLATE-1 — Intercom Trim Plate',      accessories: [] },
  ],

  // ── ALARMS ───────────────────────────────────────────────────────────────

  alarm_panel: [
    { model: 'BE32',     name: 'BE32 — Alarm Panel (Base Hub)',            accessories: [
      { id: 'ACC-CEL-LTE-2', name: 'ACC-CEL-LTE-2 — LTE Cellular Backup' },
      { id: 'ACC-VBX-200WH', name: 'ACC-VBX-200WH — Backup Battery' },
    ]},
  ],

  door_sensor: [
    { model: 'BR31',     name: 'BR31 — Door/Window Sensor (Mini)',         accessories: [] },
    { model: 'BR32',     name: 'BR32 — Door/Window Sensor (Standard)',     accessories: [] },
    { model: 'BR33',     name: 'BR33 — Door/Window Sensor (Wide Gap)',     accessories: [] },
    { model: 'BR35',     name: 'BR35 — Door/Window Sensor (Recessed)',     accessories: [] },
  ],

  motion_sensor: [
    { model: 'BK22',     name: 'BK22 — Motion Sensor (PIR)',              accessories: [] },
  ],

  glass_break: [
    { model: 'BZ11',     name: 'BZ11 — Glass Break Sensor (Acoustic)',    accessories: [] },
    { model: 'BZ32',     name: 'BZ32 — Glass Break Sensor + PIR Combo',   accessories: [] },
  ],

  panic_button: [
    { model: 'BP32',     name: 'BP32 — Panic Button (Wired)',              accessories: [] },
    { model: 'BP52',     name: 'BP52 — Panic Button (Wireless)',           accessories: [] },
  ],

  water_sensor: [
    { model: 'WH32',     name: 'WH32 — Water / Flood Sensor',             accessories: [] },
    { model: 'WH52',     name: 'WH52 — Water Sensor (Rope)',               accessories: [] },
  ],

  smoke_detector: [
    { model: 'QC11-W',   name: 'QC11-W — CO Detector (Wireless)',         accessories: [] },
    { model: 'QT11-W',   name: 'QT11-W — Smoke + CO Detector (Wireless)', accessories: [] },
  ],

  other_alarm: [
    { model: 'BK22',     name: 'BK22 — Motion Sensor (PIR)',              accessories: [] },
    { model: 'DK22',     name: 'DK22 — Desk / Touchscreen Reader',        accessories: [] },
    { model: 'GC31',     name: 'GC31 — Gateway (Cellular)',               accessories: [] },
    { model: 'GW31-E',   name: 'GW31-E — Gateway (Wi-Fi/Cellular)',       accessories: [] },
  ],

  // ── ENVIRONMENTAL SENSORS ───────────────────────────────────────────────

  air_quality: [
    { model: 'SV25',     name: 'SV25 — Air Quality Sensor (CO2, VOC, PM2.5, Temp, Humidity)', accessories: [
      { id: 'wall_plate', name: 'Wall Plate Mount' },
    ]},
    { model: 'SV25-128', name: 'SV25-128 — Air Quality Sensor (+ 128GB local storage)',       accessories: [
      { id: 'wall_plate', name: 'Wall Plate Mount' },
    ]},
  ],

  temp_humidity: [
    { model: 'SV21',     name: 'SV21 — Temperature & Humidity Sensor',    accessories: [
      { id: 'wall_plate', name: 'Wall Plate Mount' },
    ]},
    { model: 'SV23',     name: 'SV23 — Temperature & Humidity + Motion Sensor', accessories: [
      { id: 'wall_plate', name: 'Wall Plate Mount' },
    ]},
  ],

  other_sensor: [],

  // ── NETWORK / IDF / MDF ─────────────────────────────────────────────────

  idf: [],
  mdf: [],
  network_switch: [
    { model: 'Cisco Catalyst 1000',  name: 'Cisco Catalyst 1000',        accessories: [] },
    { model: 'Cisco Catalyst 9200',  name: 'Cisco Catalyst 9200',        accessories: [] },
    { model: 'Cisco Meraki MS120',   name: 'Cisco Meraki MS120',         accessories: [] },
    { model: 'Juniper EX2300',       name: 'Juniper EX2300',             accessories: [] },
    { model: 'Netgear PoE+',         name: 'Netgear PoE+ Unmanaged',     accessories: [] },
    { model: 'Ubiquiti USW-Pro',     name: 'Ubiquiti UniFi USW-Pro',     accessories: [] },
    { model: 'Other',                name: 'Other / Customer Provided',  accessories: [] },
  ],
  patch_panel: [
    { model: '24-Port Cat6',  name: '24-Port Cat6 Patch Panel',          accessories: [] },
    { model: '48-Port Cat6',  name: '48-Port Cat6 Patch Panel',          accessories: [] },
    { model: '24-Port Cat6A', name: '24-Port Cat6A Patch Panel',         accessories: [] },
    { model: 'Other',         name: 'Other',                              accessories: [] },
  ],
  rack: [],
  other_network: [],

  // ── VIEWING STATION ─────────────────────────────────────────────────────

  viewing_station: [
    { model: 'VX52',     name: 'VX52 — Viewing Station (1080p All-in-One)',   accessories: [
      { id: 'wall_mount_vesa', name: 'VESA Wall Mount' },
      { id: 'desk_stand',      name: 'Desk Stand' },
    ]},
  ],

  // ── GUEST MANAGEMENT ────────────────────────────────────────────────────

  visitor_kiosk: [
    { model: 'GC31',     name: 'GC31 — Guest / Lobby Kiosk (Cellular GW)', accessories: [
      { id: 'floor_stand', name: 'Floor Stand' },
      { id: 'desk_stand',  name: 'Desk Stand' },
      { id: 'wall_mount',  name: 'Wall Mount' },
    ]},
    { model: 'GW31-E',   name: 'GW31-E — Gateway + Guest Wi-Fi',            accessories: [] },
  ],
  ipad_check_in: [
    { model: 'iPad (Customer Provided)', name: 'iPad (Customer Provided)',   accessories: [
      { id: 'ipad_stand',     name: 'iPad Kiosk Stand' },
      { id: 'ipad_enclosure', name: 'Secure Enclosure' },
    ]},
  ],
  other_guest: [],

  // ── OTHER ────────────────────────────────────────────────────────────────

  other: [],
};

export function getModelsForSubcategory(subcategoryId) {
  return VERKADA_CATALOG[subcategoryId] || [];
}

export function getAccessoriesForModel(subcategoryId, modelId) {
  const models = getModelsForSubcategory(subcategoryId);
  const found = models.find((m) => m.model === modelId);
  return found ? found.accessories : [];
}
