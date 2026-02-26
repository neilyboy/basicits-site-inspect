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
// Verkada Product Catalog
// Each entry: { model, name, accessories: [{ id, name }] }
// ---------------------------------------------------------------------------
export const VERKADA_CATALOG = {
  // --- Cameras ---
  dome: [
    { model: 'CD52', name: 'CD52 — Indoor Dome (1080p)', accessories: [
      { id: 'surface_mount', name: 'Surface Mount Adapter' },
      { id: 'gang_box', name: 'Gang Box Mount Adapter' },
      { id: 'pendant_mount', name: 'Pendant Mount' },
    ]},
    { model: 'CD52-E', name: 'CD52-E — Outdoor Dome (1080p)', accessories: [
      { id: 'surface_mount', name: 'Surface Mount Adapter' },
      { id: 'pendant_mount', name: 'Pendant Mount' },
      { id: 'corner_mount', name: 'Corner Mount' },
    ]},
    { model: 'CD62', name: 'CD62 — Indoor Dome (4MP)', accessories: [
      { id: 'surface_mount', name: 'Surface Mount Adapter' },
      { id: 'gang_box', name: 'Gang Box Mount Adapter' },
      { id: 'pendant_mount', name: 'Pendant Mount' },
    ]},
    { model: 'CD62-E', name: 'CD62-E — Outdoor Dome (4MP)', accessories: [
      { id: 'surface_mount', name: 'Surface Mount Adapter' },
      { id: 'pendant_mount', name: 'Pendant Mount' },
      { id: 'corner_mount', name: 'Corner Mount' },
    ]},
    { model: 'CD72', name: 'CD72 — Indoor Dome (4K)', accessories: [
      { id: 'surface_mount', name: 'Surface Mount Adapter' },
      { id: 'gang_box', name: 'Gang Box Mount Adapter' },
      { id: 'pendant_mount', name: 'Pendant Mount' },
    ]},
    { model: 'CD72-E', name: 'CD72-E — Outdoor Dome (4K)', accessories: [
      { id: 'surface_mount', name: 'Surface Mount Adapter' },
      { id: 'pendant_mount', name: 'Pendant Mount' },
      { id: 'corner_mount', name: 'Corner Mount' },
    ]},
    { model: 'CD42', name: 'CD42 — Indoor Dome (1080p, Economy)', accessories: [
      { id: 'surface_mount', name: 'Surface Mount Adapter' },
      { id: 'gang_box', name: 'Gang Box Mount Adapter' },
    ]},
    { model: 'CD42-E', name: 'CD42-E — Outdoor Dome (1080p, Economy)', accessories: [
      { id: 'surface_mount', name: 'Surface Mount Adapter' },
      { id: 'corner_mount', name: 'Corner Mount' },
    ]},
  ],
  bullet: [
    { model: 'CB52-E', name: 'CB52-E — Outdoor Bullet (1080p)', accessories: [
      { id: 'junction_box', name: 'Junction Box' },
      { id: 'wall_mount', name: 'Wall Mount Bracket' },
      { id: 'pole_mount', name: 'Pole Mount Kit' },
    ]},
    { model: 'CB62-E', name: 'CB62-E — Outdoor Bullet (4MP)', accessories: [
      { id: 'junction_box', name: 'Junction Box' },
      { id: 'wall_mount', name: 'Wall Mount Bracket' },
      { id: 'pole_mount', name: 'Pole Mount Kit' },
    ]},
    { model: 'CB72-E', name: 'CB72-E — Outdoor Bullet (4K)', accessories: [
      { id: 'junction_box', name: 'Junction Box' },
      { id: 'wall_mount', name: 'Wall Mount Bracket' },
      { id: 'pole_mount', name: 'Pole Mount Kit' },
    ]},
    { model: 'CB42-E', name: 'CB42-E — Outdoor Bullet (1080p, Economy)', accessories: [
      { id: 'junction_box', name: 'Junction Box' },
      { id: 'wall_mount', name: 'Wall Mount Bracket' },
    ]},
  ],
  fisheye: [
    { model: 'CF81-E', name: 'CF81-E — Outdoor Fisheye 180° (4K)', accessories: [
      { id: 'junction_box', name: 'Junction Box' },
      { id: 'wall_mount', name: 'Wall Mount Bracket' },
    ]},
    { model: 'CF81', name: 'CF81 — Indoor Fisheye 360° (4K)', accessories: [
      { id: 'surface_mount', name: 'Surface Mount Adapter' },
      { id: 'pendant_mount', name: 'Pendant Mount' },
    ]},
  ],
  ptz: [
    { model: 'CP52-E', name: 'CP52-E — Outdoor PTZ (1080p, 32x zoom)', accessories: [
      { id: 'wall_mount', name: 'Wall Mount Bracket' },
      { id: 'pole_mount', name: 'Pole Mount Kit' },
      { id: 'pendant_mount', name: 'Pendant Mount' },
    ]},
    { model: 'CP62-E', name: 'CP62-E — Outdoor PTZ (4MP, 32x zoom)', accessories: [
      { id: 'wall_mount', name: 'Wall Mount Bracket' },
      { id: 'pole_mount', name: 'Pole Mount Kit' },
      { id: 'pendant_mount', name: 'Pendant Mount' },
    ]},
  ],
  mini: [
    { model: 'CM52', name: 'CM52 — Indoor Mini Dome (1080p)', accessories: [
      { id: 'surface_mount', name: 'Surface Mount Adapter' },
    ]},
    { model: 'CM42', name: 'CM42 — Indoor Mini (1080p, Economy)', accessories: [] },
  ],
  multisensor: [
    { model: 'CM81', name: 'CM81 — Indoor Multisensor (4x 4MP)', accessories: [
      { id: 'pendant_mount', name: 'Pendant Mount' },
      { id: 'surface_mount', name: 'Surface Mount Adapter' },
    ]},
    { model: 'CM81-E', name: 'CM81-E — Outdoor Multisensor (4x 4MP)', accessories: [
      { id: 'pendant_mount', name: 'Pendant Mount' },
      { id: 'wall_mount', name: 'Wall Mount Bracket' },
      { id: 'pole_mount', name: 'Pole Mount Kit' },
    ]},
  ],
  other_cam: [],

  // --- Access Control ---
  door_controller: [
    { model: 'AC41', name: 'AC41 — Door Controller (1-door)', accessories: [
      { id: 'power_supply', name: 'Power Supply (12V)' },
      { id: 'din_rail_kit', name: 'DIN Rail Mount Kit' },
      { id: 'surface_box', name: 'Surface Mount Box' },
    ]},
    { model: 'AC42', name: 'AC42 — Door Controller (2-door)', accessories: [
      { id: 'power_supply', name: 'Power Supply (12V)' },
      { id: 'din_rail_kit', name: 'DIN Rail Mount Kit' },
      { id: 'surface_box', name: 'Surface Mount Box' },
    ]},
  ],
  card_reader: [
    { model: 'BV41', name: 'BV41 — Card Reader (OSDP, Mullion)', accessories: [
      { id: 'single_gang', name: 'Single Gang Backplate' },
      { id: 'mullion_mount', name: 'Mullion Mount Plate' },
    ]},
    { model: 'BV41-HID', name: 'BV41-HID — Card Reader (HID iCLASS SE compatible)', accessories: [
      { id: 'single_gang', name: 'Single Gang Backplate' },
      { id: 'mullion_mount', name: 'Mullion Mount Plate' },
    ]},
    { model: 'BV42', name: 'BV42 — Card Reader with Keypad', accessories: [
      { id: 'single_gang', name: 'Single Gang Backplate' },
      { id: 'junction_box', name: 'Junction Box' },
    ]},
    { model: 'BX41', name: 'BX41 — Outdoor Card Reader (IP65)', accessories: [
      { id: 'single_gang', name: 'Single Gang Backplate' },
      { id: 'junction_box_outdoor', name: 'Outdoor Junction Box' },
    ]},
  ],
  lock: [
    { model: 'CL21', name: 'CL21 — Smart Lock (Mortise)', accessories: [] },
    { model: 'CL22', name: 'CL22 — Smart Lock (Cylindrical)', accessories: [] },
    { model: 'CL23', name: 'CL23 — Smart Lock (Exit Device/Panic Bar)', accessories: [] },
  ],
  rex: [
    { model: 'Generic PIR REX', name: 'Generic PIR Request to Exit', accessories: [] },
    { model: 'Generic Push Button REX', name: 'Push Button REX', accessories: [] },
  ],
  mag_lock: [
    { model: 'Mag Lock 600lb', name: 'Mag Lock — 600lb Single', accessories: [
      { id: 'armature_plate', name: 'Armature Plate' },
      { id: 'z_bracket', name: 'Z-Bracket Kit' },
      { id: 'lz_bracket', name: 'L-Z Bracket Kit' },
    ]},
    { model: 'Mag Lock 1200lb', name: 'Mag Lock — 1200lb Double', accessories: [
      { id: 'armature_plate', name: 'Armature Plate' },
      { id: 'z_bracket', name: 'Z-Bracket Kit' },
    ]},
  ],
  electric_strike: [
    { model: 'Electric Strike (Fail Secure)', name: 'Electric Strike — Fail Secure', accessories: [] },
    { model: 'Electric Strike (Fail Safe)', name: 'Electric Strike — Fail Safe', accessories: [] },
  ],
  other_ac: [],

  // --- Intercoms ---
  video_intercom: [
    { model: 'VI51', name: 'VI51 — Video Intercom Station', accessories: [
      { id: 'flush_mount', name: 'Flush Mount Kit' },
      { id: 'surface_mount', name: 'Surface Mount Box' },
      { id: 'rain_hood', name: 'Rain Hood' },
    ]},
    { model: 'VI51-CALL', name: 'VI51-CALL — Intercom Call Station (Indoor)', accessories: [
      { id: 'single_gang', name: 'Single Gang Backplate' },
    ]},
  ],
  audio_intercom: [
    { model: 'AI51', name: 'AI51 — Audio Intercom Station', accessories: [
      { id: 'surface_mount', name: 'Surface Mount Box' },
    ]},
  ],
  other_intercom: [],

  // --- Alarms ---
  alarm_panel: [
    { model: 'PA52', name: 'PA52 — Alarm Panel', accessories: [
      { id: 'surface_box', name: 'Surface Mount Box' },
    ]},
  ],
  door_sensor: [
    { model: 'DS61', name: 'DS61 — Door/Window Sensor', accessories: [] },
  ],
  motion_sensor: [
    { model: 'MS51', name: 'MS51 — Motion Sensor (PIR)', accessories: [
      { id: 'corner_mount', name: 'Corner Mount Adapter' },
    ]},
  ],
  glass_break: [
    { model: 'GB41', name: 'GB41 — Glass Break Sensor', accessories: [] },
  ],
  panic_button: [
    { model: 'PB41', name: 'PB41 — Panic Button', accessories: [
      { id: 'single_gang', name: 'Single Gang Backplate' },
    ]},
  ],
  water_sensor: [
    { model: 'WS41', name: 'WS41 — Water/Flood Sensor', accessories: [] },
  ],
  smoke_detector: [
    { model: 'SK41', name: 'SK41 — Smoke Sensor', accessories: [] },
  ],
  other_alarm: [],

  // --- Environmental Sensors ---
  air_quality: [
    { model: 'SV81', name: 'SV81 — Air Quality Sensor (CO2, VOC, PM2.5)', accessories: [
      { id: 'wall_plate', name: 'Wall Plate Mount' },
    ]},
  ],
  temp_humidity: [
    { model: 'SV21', name: 'SV21 — Temperature & Humidity Sensor', accessories: [
      { id: 'wall_plate', name: 'Wall Plate Mount' },
    ]},
  ],
  other_sensor: [],

  // --- Network / IDF / MDF ---
  idf: [],
  mdf: [],
  network_switch: [
    { model: 'Cisco Catalyst 1000', name: 'Cisco Catalyst 1000', accessories: [] },
    { model: 'Cisco Catalyst 2960', name: 'Cisco Catalyst 2960', accessories: [] },
    { model: 'Cisco Catalyst 9200', name: 'Cisco Catalyst 9200', accessories: [] },
    { model: 'Juniper EX2300', name: 'Juniper EX2300', accessories: [] },
    { model: 'Netgear PoE+', name: 'Netgear PoE+ Unmanaged', accessories: [] },
    { model: 'Ubiquiti USW-Pro', name: 'Ubiquiti UniFi USW-Pro', accessories: [] },
    { model: 'Other', name: 'Other / Customer Provided', accessories: [] },
  ],
  patch_panel: [
    { model: '24-Port Cat6', name: '24-Port Cat6 Patch Panel', accessories: [] },
    { model: '48-Port Cat6', name: '48-Port Cat6 Patch Panel', accessories: [] },
    { model: '24-Port Cat6A', name: '24-Port Cat6A Patch Panel', accessories: [] },
    { model: 'Other', name: 'Other', accessories: [] },
  ],
  rack: [],
  other_network: [],

  // --- Viewing Station ---
  viewing_station: [
    { model: 'VS52', name: 'VS52 — Viewing Station (All-in-One)', accessories: [
      { id: 'wall_mount_vesa', name: 'VESA Wall Mount' },
      { id: 'desk_stand', name: 'Desk Stand' },
    ]},
    { model: 'VS62', name: 'VS62 — Viewing Station (4K)', accessories: [
      { id: 'wall_mount_vesa', name: 'VESA Wall Mount' },
      { id: 'desk_stand', name: 'Desk Stand' },
    ]},
  ],

  // --- Guest Management ---
  visitor_kiosk: [
    { model: 'GX51', name: 'GX51 — Guest Entry Kiosk', accessories: [
      { id: 'floor_stand', name: 'Floor Stand' },
      { id: 'desk_stand', name: 'Desk Stand' },
      { id: 'wall_mount', name: 'Wall Mount' },
    ]},
  ],
  ipad_check_in: [
    { model: 'iPad (Customer Provided)', name: 'iPad (Customer Provided)', accessories: [
      { id: 'ipad_stand', name: 'iPad Kiosk Stand' },
      { id: 'ipad_enclosure', name: 'Secure Enclosure' },
    ]},
  ],
  other_guest: [],

  // --- Other ---
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
