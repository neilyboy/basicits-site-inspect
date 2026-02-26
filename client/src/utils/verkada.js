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
