import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, Plus, Edit, FileText, MapPin, Phone, Mail, User,
  Camera, DoorOpen, Radio, ShieldAlert, Thermometer, Server,
  Monitor, Users, Package, ChevronRight, Image, Link2, Map, Archive, Loader2
} from 'lucide-react';
import { api } from '../utils/api';
import { CATEGORIES, getCategoryById, getSubcategoryName } from '../utils/verkada';
import { format } from 'date-fns';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const DIFFICULTY_COLORS = ['', 'bg-green-500', 'bg-lime-500', 'bg-yellow-500', 'bg-orange-500', 'bg-red-500'];

const ICON_MAP = {
  Camera, DoorOpen, Radio, ShieldAlert, Thermometer, Server, Monitor, Users, Package,
};

export default function SiteDetail() {
  const { siteId } = useParams();
  const navigate = useNavigate();
  const [site, setSite] = useState(null);
  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [archiving, setArchiving] = useState(false);
  const [photoFilter, setPhotoFilter] = useState(false);
  const [tileLayer, setTileLayer] = useState('street');
  const tileLayerRef = useRef(null);

  const TILE_LAYERS = {
    street: {
      label: 'Street',
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    },
    satellite: {
      label: 'Satellite',
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: '© Esri, Maxar, Earthstar Geographics',
      maxZoom: 19,
    },
    topo: {
      label: 'Topo',
      url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
      attribution: '© OpenTopoMap contributors',
      maxZoom: 17,
    },
  };

  async function handleArchive() {
    setArchiving(true);
    try {
      const res = await fetch(`/api/archive/${siteId}`);
      if (!res.ok) throw new Error('Archive failed');
      const blob = await res.blob();
      const disposition = res.headers.get('Content-Disposition') || '';
      const nameMatch = disposition.match(/filename="([^"]+)"/);
      const filename = nameMatch ? nameMatch[1] : `site-archive-${siteId}.zip`;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Archive download failed: ' + err.message);
    } finally {
      setArchiving(false);
    }
  }
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    loadData();
  }, [siteId]);

  useEffect(() => {
    if (!site || !mapRef.current) return;
    const pointsWithGPS = points.filter(p => p.latitude && p.longitude);
    if (!pointsWithGPS.length && !(site.latitude && site.longitude)) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });

    const allCoords = [
      ...(site.latitude && site.longitude ? [[site.latitude, site.longitude]] : []),
      ...pointsWithGPS.map(p => [p.latitude, p.longitude]),
    ];
    const centerLat = allCoords.reduce((s, c) => s + c[0], 0) / allCoords.length;
    const centerLng = allCoords.reduce((s, c) => s + c[1], 0) / allCoords.length;

    const map = L.map(mapRef.current, { zoomControl: true }).setView([centerLat, centerLng], 16);
    mapInstanceRef.current = map;

    const initialLayer = TILE_LAYERS['street'];
    tileLayerRef.current = L.tileLayer(initialLayer.url, {
      attribution: initialLayer.attribution,
      maxZoom: initialLayer.maxZoom,
    }).addTo(map);

    if (site.latitude && site.longitude) {
      L.marker([site.latitude, site.longitude])
        .addTo(map)
        .bindPopup(`<b>${site.name}</b><br>Site Location`);
    }

    pointsWithGPS.forEach(p => {
      const cat = getCategoryById(p.category);
      const label = p.name || getSubcategoryName(p.category, p.subcategory) || 'Device';
      const icon = L.divIcon({
        className: '',
        html: `<div style="background:${cat?.color || '#64748b'};color:#fff;padding:3px 7px;border-radius:99px;font-size:11px;font-weight:700;white-space:nowrap;box-shadow:0 2px 6px rgba(0,0,0,0.3)">${label}</div>`,
        iconAnchor: [0, 0],
      });
      L.marker([p.latitude, p.longitude], { icon })
        .addTo(map)
        .bindPopup(`<b>${label}</b><br>${cat?.name || ''}${p.floor ? ` \u00b7 Floor ${p.floor}` : ''}`);
    });

    if (allCoords.length > 1) {
      map.fitBounds(allCoords, { padding: [30, 30] });
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        tileLayerRef.current = null;
      }
    };
  }, [site, points]);

  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;
    const cfg = TILE_LAYERS[tileLayer];
    mapInstanceRef.current.removeLayer(tileLayerRef.current);
    tileLayerRef.current = L.tileLayer(cfg.url, {
      attribution: cfg.attribution,
      maxZoom: cfg.maxZoom,
    }).addTo(mapInstanceRef.current);
    tileLayerRef.current.bringToBack();
  }, [tileLayer]);

  async function loadData() {
    try {
      const [siteData, pointsData] = await Promise.all([
        api.getSite(siteId),
        api.getPoints(siteId),
      ]);
      setSite(siteData);
      setPoints(pointsData);
    } catch (err) {
      console.error('Failed to load site:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!site) {
    return (
      <div className="page-container flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-gray-500">Site not found</p>
        <Link to="/" className="btn-primary">Go Home</Link>
      </div>
    );
  }

  // Group points by category
  const grouped = {};
  for (const cat of CATEGORIES) {
    const catPoints = points.filter((p) => p.category === cat.id);
    if (catPoints.length > 0) {
      grouped[cat.id] = catPoints;
    }
  }

  const totalPhotos = points.reduce((sum, p) => sum + (p.photo_count || 0), 0);

  return (
    <div className="page-container">
      {/* Header */}
      <div className="header">
        <button onClick={() => navigate('/')} className="p-1">
          <ArrowLeft size={22} />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-bold truncate">{site.name}</h1>
        </div>
        <button onClick={handleArchive} disabled={archiving} className="p-1 text-gray-400" title="Download archive">
          {archiving ? <Loader2 size={20} className="animate-spin" /> : <Archive size={20} />}
        </button>
        <Link to={`/sites/${siteId}/edit`} className="p-1">
          <Edit size={20} />
        </Link>
        <Link to={`/sites/${siteId}/report`} className="p-1">
          <FileText size={20} />
        </Link>
      </div>

      {/* Site Info Card */}
      <div className="mx-4 mt-4 card p-4">
        <div className="flex items-center justify-between mb-2">
          <span
            className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
              site.status === 'completed'
                ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400'
                : 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400'
            }`}
          >
            {site.status}
          </span>
          <span className="text-xs text-gray-400">
            {format(new Date(site.created_at + 'Z'), 'MMM d, yyyy')}
          </span>
        </div>

        {site.address && (
          <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-2 mb-1">
            <MapPin size={14} className="text-gray-400 shrink-0" />
            {site.address}
          </p>
        )}
        {site.contact_name && (
          <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-2 mb-1">
            <User size={14} className="text-gray-400 shrink-0" />
            {site.contact_name}
          </p>
        )}
        {site.contact_phone && (
          <a href={`tel:${site.contact_phone}${site.contact_ext ? `,${site.contact_ext}` : ''}`} className="text-sm text-blue-600 flex items-center gap-2 mb-1">
            <Phone size={14} className="shrink-0" />
            {site.contact_phone}{site.contact_ext ? ` ext. ${site.contact_ext}` : ''}
          </a>
        )}
        {site.contact_email && (
          <a href={`mailto:${site.contact_email}`} className="text-sm text-blue-600 flex items-center gap-2 mb-1">
            <Mail size={14} className="shrink-0" />
            {site.contact_email}
          </a>
        )}
        {site.notes && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 whitespace-pre-wrap">
            {site.notes}
          </p>
        )}

        {/* Stats */}
        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
          <div className="text-center flex-1">
            <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{points.length}</p>
            <p className="text-[10px] text-gray-400 uppercase font-semibold">Points</p>
          </div>
          <div className="text-center flex-1">
            <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{totalPhotos}</p>
            <p className="text-[10px] text-gray-400 uppercase font-semibold">Photos</p>
          </div>
          <div className="text-center flex-1">
            <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{Object.keys(grouped).length}</p>
            <p className="text-[10px] text-gray-400 uppercase font-semibold">Categories</p>
          </div>
        </div>
      </div>

      {/* Device List Header + Filter */}
      <div className="px-4 mt-5 flex items-center justify-between">
        <h2 className="text-sm font-bold text-gray-700 dark:text-gray-300">Devices</h2>
        <button
          onClick={() => setPhotoFilter((v) => !v)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            photoFilter
              ? 'bg-amber-500 text-white shadow-sm'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
          }`}
        >
          <Camera size={13} />
          {photoFilter ? 'Needs Photo' : 'All Devices'}
        </button>
      </div>

      {/* Category Sections */}
      <div className="mt-3 px-4 space-y-5">
        {Object.keys(grouped).length === 0 ? (
          <div className="text-center py-12">
            <Camera size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 dark:text-gray-400 font-medium mb-1">No inspection points yet</p>
            <p className="text-sm text-gray-400 mb-4">
              Start adding cameras, access control, and more
            </p>
          </div>
        ) : (
          Object.entries(grouped).map(([catId, catPoints]) => {
            const cat = getCategoryById(catId);
            const IconComponent = ICON_MAP[cat?.icon] || Package;
            const visiblePoints = photoFilter
              ? catPoints.filter((p) => !p.photo_count || p.photo_count === 0)
              : catPoints;
            if (visiblePoints.length === 0) return null;

            return (
              <div key={catId}>
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: cat?.bgColor || '#f8fafc' }}
                  >
                    <IconComponent size={15} style={{ color: cat?.color || '#64748b' }} />
                  </div>
                  <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 flex-1">{cat?.name || catId}</h3>
                  <span className="text-xs text-gray-400 font-medium">{visiblePoints.length}</span>
                </div>

                <div className="space-y-2">
                  {visiblePoints.map((point) => (
                    <Link
                      key={point.id}
                      to={`/sites/${siteId}/points/${point.id}`}
                      className="card flex items-center p-3 gap-3 active:bg-gray-50 dark:active:bg-gray-700 transition-colors"
                    >
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                        style={{ backgroundColor: cat?.bgColor || '#f8fafc' }}
                      >
                        <IconComponent size={18} style={{ color: cat?.color || '#64748b' }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">
                          {point.name || getSubcategoryName(catId, point.subcategory) || 'Unnamed'}
                        </p>
                        {point.location_description && (
                          <p className="text-xs text-gray-400 truncate">{point.location_description}</p>
                        )}
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          {point.subcategory && (
                            <span className="text-[10px] text-gray-400 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">
                              {getSubcategoryName(catId, point.subcategory)}
                            </span>
                          )}
                          {point.photo_count > 0 && (
                            <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
                              <Image size={10} /> {point.photo_count}
                            </span>
                          )}
                          {point.install_difficulty && (
                            <span className="flex items-center gap-0.5">
                              {[1,2,3,4,5].map(d => (
                                <span key={d} className={`w-2.5 h-2.5 rounded-sm ${d <= point.install_difficulty ? DIFFICULTY_COLORS[point.install_difficulty] : 'bg-gray-200 dark:bg-gray-600'}`} />
                              ))}
                            </span>
                          )}
                          {point.idf_point_id && (
                            <span className="text-[10px] text-blue-500 flex items-center gap-0.5">
                              <Link2 size={9} /> IDF
                            </span>
                          )}
                        </div>
                      </div>
                      <ChevronRight size={18} className="text-gray-300 shrink-0" />
                    </Link>
                  ))}
              </div>
            </div>
          );
        })
      )}
    </div>

    {/* Device Map */}
    {(site.latitude || points.some(p => p.latitude)) && (
      <div className="mx-4 mt-5 mb-2">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Map size={15} className="text-gray-400" />
            <h3 className="section-title mb-0">Device Map</h3>
          </div>
          {/* Tile layer switcher */}
          <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5">
            {Object.entries(TILE_LAYERS).map(([key, cfg]) => (
              <button
                key={key}
                onClick={() => setTileLayer(key)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                  tileLayer === key
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                {cfg.label}
              </button>
            ))}
          </div>
        </div>
        {/* isolation:isolate prevents Leaflet z-index from escaping this stacking context */}
        <div className="card overflow-hidden" style={{ isolation: 'isolate' }}>
          <div ref={mapRef} style={{ height: 300 }} className="w-full" />
        </div>
      </div>
    )}

    {/* Add Point FAB */}
    <Link to={`/sites/${siteId}/add`} className="fab">
      <Plus size={24} />
    </Link>
  </div>
  );
}
