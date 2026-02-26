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
// Verkada Product Catalog — sourced from verkada.com product pages
// model = SKU family (storage variants / -HW suffix omitted)
// Accessories = real Verkada ACC-MNT-* SKUs from product pages
// ---------------------------------------------------------------------------

// ── Shared indoor dome accessory sets ──────────────────────────────────────
// Source: CD63 product page (representative of all indoor dome/mini models)
const INDOOR_DOME_ACC = [
  { id: 'ACC-MNT-CJBOX-1', name: 'ACC-MNT-CJBOX-1 — Circle Junction Box Mount' },
  { id: 'ACC-MNT-LBRAC-1', name: 'ACC-MNT-LBRAC-1 — L-Bracket Mount' },
  { id: 'ACC-MNT-ARM-1',   name: 'ACC-MNT-ARM-1 — Arm Mount' },
  { id: 'ACC-MNT-PEND-1',  name: 'ACC-MNT-PEND-1 — Pendant Cap Mount' },
  { id: 'ACC-MNT-REC-2',   name: 'ACC-MNT-REC-2 — Recessed Ceiling Mount' },
  { id: 'ACC-MNT-CLIP-1',  name: 'ACC-MNT-CLIP-1 — Tile Clip Mount (no-drill ceiling tile)' },
  { id: 'ACC-MNT-POLE-1',  name: 'ACC-MNT-POLE-1 — Pole Mount (2"–6" dia.)' },
  { id: 'ACC-MNT-CORNER-1',name: 'ACC-MNT-CORNER-1 — Corner Mount' },
];

// Source: CD63-E product page (representative of all outdoor dome models)
const OUTDOOR_DOME_ACC = [
  { id: 'ACC-CAM-SHIELD-1', name: 'ACC-CAM-SHIELD-1 — Camera Weather Shield' },
  { id: 'ACC-MNT-LBRAC-1',  name: 'ACC-MNT-LBRAC-1 — L-Bracket Mount' },
  { id: 'ACC-MNT-CJBOX-1',  name: 'ACC-MNT-CJBOX-1 — Circle Junction Box Mount' },
  { id: 'ACC-MNT-ARM-1',    name: 'ACC-MNT-ARM-1 — Arm Mount' },
  { id: 'ACC-MNT-UPEND-1',  name: 'ACC-MNT-UPEND-1 — Umbrella Pendant Cap (weatherproof)' },
  { id: 'ACC-MNT-POLE-1',   name: 'ACC-MNT-POLE-1 — Pole Mount (2"–6" dia.)' },
  { id: 'ACC-MNT-CORNER-1', name: 'ACC-MNT-CORNER-1 — Corner Mount' },
];

// Source: CB52-E product page
const BULLET_ACC = [
  { id: 'ACC-MNT-SJBOX-1', name: 'ACC-MNT-SJBOX-1 — Square Junction Box Mount' },
  { id: 'ACC-MNT-POLE-1',  name: 'ACC-MNT-POLE-1 — Pole Mount (2"–6" dia.)' },
  { id: 'ACC-MNT-CORNER-1',name: 'ACC-MNT-CORNER-1 — Corner Mount' },
];

// Source: CF83-E product page
const FISHEYE_ACC = [
  { id: 'ACC-MNT-ANGLE-1',  name: 'ACC-MNT-ANGLE-1 — Angle Mount (30° tilt for wall FOV)' },
  { id: 'ACC-CAM-SHIELD-1', name: 'ACC-CAM-SHIELD-1 — Camera Weather Shield' },
  { id: 'ACC-MNT-ARM-1',    name: 'ACC-MNT-ARM-1 — Arm Mount' },
  { id: 'ACC-MNT-PEND-1',   name: 'ACC-MNT-PEND-1 — Pendant Cap Mount' },
  { id: 'ACC-MNT-UPEND-1',  name: 'ACC-MNT-UPEND-1 — Umbrella Pendant Cap (weatherproof)' },
  { id: 'ACC-MNT-CJBOX-1',  name: 'ACC-MNT-CJBOX-1 — Circle Junction Box Mount' },
  { id: 'ACC-MNT-CLIP-1',   name: 'ACC-MNT-CLIP-1 — Tile Clip Mount (no-drill ceiling tile)' },
  { id: 'ACC-MNT-POLE-1',   name: 'ACC-MNT-POLE-1 — Pole Mount (2"–6" dia.)' },
  { id: 'ACC-MNT-CORNER-1', name: 'ACC-MNT-CORNER-1 — Corner Mount' },
];

// Source: CM42 product page (mini dome)
const MINI_DOME_ACC = [
  { id: 'ACC-MNT-SJBOX-1', name: 'ACC-MNT-SJBOX-1 — Square Junction Box Mount' },
  { id: 'ACC-MNT-MJBOX-1', name: 'ACC-MNT-MJBOX-1 — Mini Junction Box Mount' },
  { id: 'ACC-MNT-ARM-1',   name: 'ACC-MNT-ARM-1 — Arm Mount' },
  { id: 'ACC-MNT-MPEND-1', name: 'ACC-MNT-MPEND-1 — Mini Pendant Cap Mount' },
  { id: 'ACC-MNT-CLIP-1',  name: 'ACC-MNT-CLIP-1 — Tile Clip Mount (no-drill ceiling tile)' },
  { id: 'ACC-MNT-POLE-1',  name: 'ACC-MNT-POLE-1 — Pole Mount (2"–6" dia.)' },
  { id: 'ACC-MNT-CORNER-1',name: 'ACC-MNT-CORNER-1 — Corner Mount' },
];

// Source: CH52-E product page (multisensor / PTZ — large arm)
const MULTISENSOR_ACC = [
  { id: 'ACC-MNT-XLARM-1', name: 'ACC-MNT-XLARM-1 — Large Arm Mount' },
  { id: 'ACC-MNT-ARM-1',   name: 'ACC-MNT-ARM-1 — Arm Mount' },
  { id: 'ACC-MNT-PEND-1',  name: 'ACC-MNT-PEND-1 — Pendant Cap Mount' },
  { id: 'ACC-MNT-POLE-1',  name: 'ACC-MNT-POLE-1 — Pole Mount (2"–6" dia.)' },
  { id: 'ACC-MNT-CORNER-1',name: 'ACC-MNT-CORNER-1 — Corner Mount' },
];

// Source: CP52-E product page
const PTZ_ACC = [
  { id: 'ACC-MNT-XLARM-1', name: 'ACC-MNT-XLARM-1 — Large Arm Mount' },
  { id: 'ACC-MNT-POLE-1',  name: 'ACC-MNT-POLE-1 — Pole Mount (2"–6" dia.)' },
  { id: 'ACC-MNT-CORNER-1',name: 'ACC-MNT-CORNER-1 — Corner Mount' },
];

// Source: TD53 product page
const INTERCOM_ACC = [
  { id: 'TD-ANGLE-MNT',    name: 'Angle Mount (25° — reversible)' },
  { id: 'TD-CONDUIT-MNT',  name: 'Conduit Mount Box (gooseneck / conduit installs)' },
  { id: 'TD-TRIM-PLATE',   name: 'Trim Plate (flush install cosmetic cover)' },
  { id: 'TD-RAIN-HOOD',    name: 'Rain Hood (wall-mount weather protection)' },
  { id: 'TD-2WIRE-POE',    name: 'PoE over 2-Wire Converter' },
  { id: 'TD-BLUEPOINT-MNT',name: 'Blue Light Phone Retrofit Mount' },
  { id: 'TD-DOOR-UNLOCK',  name: 'Door Power / Unlock Peripheral' },
];

export const VERKADA_CATALOG = {

  // ── CAMERAS ─────────────────────────────────────────────────────────────

  dome: [
    { model: 'CD22',   name: 'CD22 — Indoor Dome (3MP)',                  accessories: [...INDOOR_DOME_ACC] },
    { model: 'CD22-E', name: 'CD22-E — Outdoor Dome (3MP)',               accessories: [...OUTDOOR_DOME_ACC] },
    { model: 'CD32',   name: 'CD32 — Indoor Dome (3MP, 10-yr)',           accessories: [...INDOOR_DOME_ACC] },
    { model: 'CD32-E', name: 'CD32-E — Outdoor Dome (3MP, 10-yr)',        accessories: [...OUTDOOR_DOME_ACC] },
    { model: 'CD43',   name: 'CD43 — Indoor Dome (5MP)',                  accessories: [...INDOOR_DOME_ACC] },
    { model: 'CD43-E', name: 'CD43-E — Outdoor Dome (5MP)',               accessories: [...OUTDOOR_DOME_ACC] },
    { model: 'CD53',   name: 'CD53 — Indoor Dome (5MP, zoom lens)',       accessories: [...INDOOR_DOME_ACC] },
    { model: 'CD53-E', name: 'CD53-E — Outdoor Dome (5MP, zoom lens)',    accessories: [...OUTDOOR_DOME_ACC] },
    { model: 'CD63',   name: 'CD63 — Indoor Dome (4K, zoom lens)',        accessories: [...INDOOR_DOME_ACC] },
    { model: 'CD63-E', name: 'CD63-E — Outdoor Dome (4K, zoom lens)',     accessories: [...OUTDOOR_DOME_ACC] },
  ],

  bullet: [
    { model: 'CB52-E',  name: 'CB52-E — Outdoor Bullet (5MP, 3× zoom)',   accessories: [...BULLET_ACC] },
    { model: 'CB52-TE', name: 'CB52-TE — Outdoor Bullet Turret (5MP, telephoto)', accessories: [...BULLET_ACC] },
    { model: 'CB62-E',  name: 'CB62-E — Outdoor Bullet (4K, zoom)',       accessories: [...BULLET_ACC] },
    { model: 'CB62-TE', name: 'CB62-TE — Outdoor Bullet Turret (4K, telephoto)', accessories: [...BULLET_ACC] },
  ],

  fisheye: [
    { model: 'CF83-E', name: 'CF83-E — Outdoor Fisheye 180° (12.5MP)',   accessories: [...FISHEYE_ACC] },
  ],

  ptz: [
    { model: 'CP52-E', name: 'CP52-E — Outdoor PTZ (5MP, 28× optical)',  accessories: [...PTZ_ACC] },
    { model: 'CP63-E', name: 'CP63-E — Outdoor PTZ (4K, 32× optical)',   accessories: [...PTZ_ACC] },
  ],

  mini: [
    { model: 'CM22',    name: 'CM22 — Indoor Mini Dome (3MP)',            accessories: [...MINI_DOME_ACC] },
    { model: 'CM41-E',  name: 'CM41-E — Outdoor Mini Dome (5MP)',         accessories: [...OUTDOOR_DOME_ACC] },
    { model: 'CM42',    name: 'CM42 — Indoor Mini Dome (5MP)',            accessories: [...MINI_DOME_ACC] },
    { model: 'CM42-S',  name: 'CM42-S — Mini Split Camera (5MP)',         accessories: [...MINI_DOME_ACC] },
  ],

  multisensor: [
    { model: 'CH52-E',  name: 'CH52-E — Outdoor 4-Sensor Multisensor (5MP/sensor)', accessories: [...MULTISENSOR_ACC] },
    { model: 'CH53-E',  name: 'CH53-E — Outdoor 4-Sensor Multisensor (5MP/sensor, zoom)', accessories: [...MULTISENSOR_ACC] },
    { model: 'CH63-E',  name: 'CH63-E — Outdoor 4-Sensor Multisensor (4K/sensor)', accessories: [...MULTISENSOR_ACC] },
    { model: 'CY53-E',  name: 'CY53-E — Outdoor 2-Sensor Multisensor (5MP/sensor)', accessories: [...MULTISENSOR_ACC] },
    { model: 'CY63-E',  name: 'CY63-E — Outdoor 2-Sensor Multisensor (4K/sensor)', accessories: [...MULTISENSOR_ACC] },
  ],

  other_cam: [
    { model: 'CR63-E',  name: 'CR63-E — Remote Camera (4K, LTE + battery, solar/hardwired)', accessories: [
      { id: 'ACC-BAT-430WH-E-1', name: 'ACC-BAT-430WH-E-1 — Solar Battery Pack' },
    ]},
    { model: 'CC300',   name: 'CC300 — Cloud Connect 300 (NVR Bridge)',   accessories: [] },
    { model: 'CC500',   name: 'CC500 — Cloud Connect 500 (NVR Bridge)',   accessories: [] },
    { model: 'CC700',   name: 'CC700 — Cloud Connect 700 (NVR Bridge)',   accessories: [] },
  ],

  // ── ACCESS CONTROL ───────────────────────────────────────────────────────

  door_controller: [
    { model: 'AC12', name: 'AC12 — Access Controller (1 door, PoE-powered)', accessories: [] },
    { model: 'AC42', name: 'AC42 — Access Controller (4 doors)',             accessories: [] },
    { model: 'AC62', name: 'AC62 — Access Controller (16 doors)',            accessories: [] },
    { model: 'AX11', name: 'AX11 — IO & Elevator Controller (16 in/out, 2 readers)', accessories: [] },
  ],

  card_reader: [
    { model: 'AD34', name: 'AD34 — Door Reader (OSDP v2, BLE Intent Unlock)', accessories: [
      { id: 'single_gang', name: 'Single-Gang Backplate' },
    ]},
    { model: 'AD64', name: 'AD64 — Door Reader + Keypad (OSDP v2, PIN + BLE)', accessories: [
      { id: 'single_gang', name: 'Single-Gang Backplate' },
    ]},
    { model: 'AF64', name: 'AF64 — Access Station Pro (Face Unlock + camera + controller)', accessories: [
      { id: 'single_gang', name: 'Single-Gang Backplate' },
    ]},
  ],

  lock: [
    { model: 'AL54-CY', name: 'AL54-CY — Wireless Cylindrical Lock (3 function variants)', accessories: [] },
    { model: 'AL54-MS', name: 'AL54-MS — Wireless Mortise Lock (coming soon)',              accessories: [] },
  ],

  rex: [
    { model: 'Generic PIR REX',         name: 'Generic PIR Request-to-Exit',   accessories: [] },
    { model: 'Generic Push Button REX', name: 'Generic Push-Button REX',        accessories: [] },
  ],

  mag_lock: [
    { model: 'Mag Lock 600lb',  name: 'Mag Lock — 600 lb Single',  accessories: [
      { id: 'armature_plate', name: 'Armature Plate' },
      { id: 'z_bracket',      name: 'Z-Bracket Kit' },
      { id: 'lz_bracket',     name: 'L-Z Bracket Kit' },
    ]},
    { model: 'Mag Lock 1200lb', name: 'Mag Lock — 1200 lb Double', accessories: [
      { id: 'armature_plate', name: 'Armature Plate' },
      { id: 'z_bracket',      name: 'Z-Bracket Kit' },
    ]},
  ],

  electric_strike: [
    { model: 'Electric Strike (Fail Secure)', name: 'Electric Strike — Fail Secure', accessories: [] },
    { model: 'Electric Strike (Fail Safe)',   name: 'Electric Strike — Fail Safe',   accessories: [] },
  ],

  other_ac: [
    { model: 'ACC-CEL-LTE-2', name: 'ACC-CEL-LTE-2 — LTE Cellular Backup (for BP52 panel)', accessories: [] },
    { model: 'ACC-VBX-200WH', name: 'ACC-VBX-200WH — LiFePO4 Backup Battery',               accessories: [] },
    { model: 'ACC-VBX-ENC',   name: 'ACC-VBX-ENC — Dual Battery Expansion Enclosure',        accessories: [] },
  ],

  // ── INTERCOMS ────────────────────────────────────────────────────────────

  video_intercom: [
    { model: 'TD33', name: 'TD33 — Video Intercom (slim, mullion mount, keycard/BLE/NFC/QR)', accessories: [...INTERCOM_ACC] },
    { model: 'TD53', name: 'TD53 — Video Intercom (full-size, 5MP, keycard/BLE/NFC/QR)',      accessories: [...INTERCOM_ACC] },
    { model: 'TD63', name: 'TD63 — Video Intercom (full-size + keypad PIN, keycard/BLE)',     accessories: [...INTERCOM_ACC] },
  ],

  audio_intercom: [
    { model: 'TS12', name: 'TS12 — Audio Intercom (audio-only, high-noise environments)',    accessories: [
      { id: 'TS12-RETROFIT-BB',  name: 'Retrofit Backbox' },
      { id: 'TS12-DEEP-BB',      name: 'Deep Retrofit Backbox' },
    ]},
  ],

  other_intercom: [],

  // ── ALARMS ───────────────────────────────────────────────────────────────

  alarm_panel: [
    { model: 'BP52', name: 'BP52 — Wired Alarm Panel (32-zone, cloud-managed)', accessories: [
      { id: 'ACC-CEL-LTE-2', name: 'ACC-CEL-LTE-2 — LTE Cellular Backup' },
      { id: 'ACC-VBX-200WH', name: 'ACC-VBX-200WH — LiFePO4 Backup Battery' },
      { id: 'ACC-VBX-ENC',   name: 'ACC-VBX-ENC — Dual Battery Expansion Enclosure' },
    ]},
    { model: 'BP32', name: 'BP32 — Wireless Alarm Panel (PoE, built-in LTE + battery)', accessories: [] },
    { model: 'BK22', name: 'BK22 — Alarm Keypad (touchscreen, arm/disarm)',             accessories: [] },
  ],

  door_sensor: [
    { model: 'BR Series (wired)',    name: 'BR Series — Wired Door/Window Sensors',    accessories: [] },
    { model: 'BR Series (wireless)', name: 'BR Series — Wireless Door/Window Sensors', accessories: [] },
    { model: 'Q Series',             name: 'Q Series — Next-Gen Wireless Sensors (dual-tech, longer range)', accessories: [] },
  ],

  motion_sensor: [
    { model: 'BR Series PIR (wired)',    name: 'BR Series — Wired PIR Motion Sensor',    accessories: [] },
    { model: 'BR Series PIR (wireless)', name: 'BR Series — Wireless PIR Motion Sensor', accessories: [] },
    { model: 'Q Series PIR',             name: 'Q Series — Wireless PIR Motion Sensor (dual-tech)', accessories: [] },
  ],

  glass_break: [
    { model: 'BR Series Glass Break', name: 'BR Series — Glass Break Sensor', accessories: [] },
    { model: 'Q Series Glass Break',  name: 'Q Series — Glass Break Sensor',  accessories: [] },
  ],

  panic_button: [
    { model: 'BR Series Panic (wired)',    name: 'BR Series — Wired Panic Button',    accessories: [] },
    { model: 'BR Series Panic (wireless)', name: 'BR Series — Wireless Panic Button', accessories: [] },
  ],

  water_sensor: [
    { model: 'BR Series Water', name: 'BR Series — Water Leak Sensor', accessories: [] },
    { model: 'Q Series Water',  name: 'Q Series — Water Leak Sensor',  accessories: [] },
  ],

  smoke_detector: [
    { model: 'BR Series Smoke/CO', name: 'BR Series — Smoke / CO Sensor', accessories: [] },
    { model: 'Q Series Smoke/CO',  name: 'Q Series — Smoke / CO Sensor',  accessories: [] },
  ],

  other_alarm: [
    { model: 'BZ11', name: 'BZ11 — Talk-Down Horn Speaker (cloud-managed deterrence)',        accessories: [] },
    { model: 'BZ32', name: 'BZ32 — Siren Strobe (wired or wireless, indoor/outdoor)',         accessories: [] },
  ],

  // ── ENVIRONMENTAL SENSORS ───────────────────────────────────────────────
  // Source: verkada.com/air-quality/sensors/ — SV21 / SV23 / SV25

  air_quality: [
    { model: 'SV21', name: 'SV21 — Temp, Humidity, CO₂ Sensor',                           accessories: [] },
    { model: 'SV23', name: 'SV23 — Air Quality Sensor (CO₂, Vape, PM, TVOC, noise, motion)', accessories: [] },
    { model: 'SV25', name: 'SV25 — Advanced Air Quality (CO₂, Vape, PM, CO, formaldehyde, audio, barometric)', accessories: [] },
  ],

  temp_humidity: [
    { model: 'SV21', name: 'SV21 — Temp & Humidity Sensor (+ CO₂)', accessories: [] },
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
    { model: '24-Port Cat6',  name: '24-Port Cat6 Patch Panel',  accessories: [] },
    { model: '48-Port Cat6',  name: '48-Port Cat6 Patch Panel',  accessories: [] },
    { model: '24-Port Cat6A', name: '24-Port Cat6A Patch Panel', accessories: [] },
    { model: 'Other',         name: 'Other',                      accessories: [] },
  ],
  rack: [],
  other_network: [],

  // ── VIEWING STATION ─────────────────────────────────────────────────────

  viewing_station: [
    { model: 'VS52', name: 'VS52 — Viewing Station (All-in-One Display)', accessories: [
      { id: 'wall_mount_vesa', name: 'VESA Wall Mount' },
      { id: 'desk_stand',      name: 'Desk Stand' },
    ]},
  ],

  // ── GUEST MANAGEMENT / WORKPLACE ─────────────────────────────────────────

  visitor_kiosk: [
    { model: 'Verkada Guest (iPad)', name: 'Verkada Guest — iPad Kiosk (visitor management)', accessories: [
      { id: 'ipad_floor_stand', name: 'iPad Floor Stand' },
      { id: 'ipad_desk_stand',  name: 'iPad Desk Stand' },
      { id: 'ipad_wall_mount',  name: 'iPad Wall Mount' },
    ]},
    { model: 'Verkada Mailroom', name: 'Verkada Mailroom — Package Delivery Management', accessories: [] },
  ],
  ipad_check_in: [
    { model: 'iPad (Customer Provided)', name: 'iPad (Customer Provided)', accessories: [
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
