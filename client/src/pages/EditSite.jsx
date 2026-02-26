import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Loader2, Navigation, MapPin, Trash2, AlertCircle, Flag } from 'lucide-react';
import { api } from '../utils/api';
import VoiceNote from '../components/VoiceNote';

export default function EditSite() {
  const { siteId } = useParams();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [locating, setLocating] = useState(false);
  const [gpsError, setGpsError] = useState('');
  const [form, setForm] = useState({
    name: '',
    address: '',
    contact_name: '',
    contact_phone: '',
    contact_ext: '',
    contact_email: '',
    notes: '',
    job_flags: '',
    status: 'active',
    latitude: null,
    longitude: null,
  });

  useEffect(() => {
    loadSite();
  }, [siteId]);

  async function loadSite() {
    try {
      const site = await api.getSite(siteId);
      setForm({
        name: site.name || '',
        address: site.address || '',
        contact_name: site.contact_name || '',
        contact_phone: site.contact_phone || '',
        contact_ext: site.contact_ext || '',
        contact_email: site.contact_email || '',
        notes: site.notes || '',
        job_flags: site.job_flags || '',
        status: site.status || 'active',
        latitude: site.latitude,
        longitude: site.longitude,
      });
    } catch (err) {
      alert('Failed to load site');
      navigate(-1);
    } finally {
      setLoading(false);
    }
  }

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function formatPhone(raw) {
    const digits = raw.replace(/\D/g, '').slice(0, 10);
    if (digits.length <= 3) return digits.length ? `(${digits}` : '';
    if (digits.length <= 6) return `(${digits.slice(0,3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0,3)}) ${digits.slice(3,6)}-${digits.slice(6)}`;
  }

  async function handleGetLocation() {
    setGpsError('');

    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by this browser.');
      return;
    }

    if (!window.isSecureContext) {
      setGpsError('GPS requires HTTPS. You can manually enter coordinates below, or access this app via HTTPS.');
      return;
    }

    setLocating(true);
    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 300000,
        });
      });
      setForm((prev) => ({
        ...prev,
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      }));
    } catch (err) {
      const messages = {
        1: 'Location permission denied. Please allow location access in your browser/phone settings.',
        2: 'Location unavailable. Make sure GPS/Location is enabled on your device.',
        3: 'Location request timed out. Please try again.',
      };
      setGpsError(messages[err.code] || 'Failed to get location: ' + err.message);
    } finally {
      setLocating(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      await api.updateSite(siteId, form);
      navigate(`/sites/${siteId}`, { replace: true });
    } catch (err) {
      alert('Failed to update site: ' + err.message);
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm('Delete this entire site survey and all its data? This cannot be undone.')) return;
    try {
      await api.deleteSite(siteId);
      navigate('/', { replace: true });
    } catch (err) {
      alert('Failed to delete: ' + err.message);
    }
  }

  function handleVoiceTranscript(text, isFinal) {
    if (isFinal) {
      setForm((prev) => ({
        ...prev,
        notes: prev.notes ? prev.notes + ' ' + text : text,
      }));
    }
  }

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="header">
        <button onClick={() => navigate(-1)} className="p-1">
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-lg font-bold flex-1">Edit Site</h1>
        <button onClick={handleDelete} className="p-1 text-red-400">
          <Trash2 size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        <div>
          <label className="label">Site Name *</label>
          <input
            type="text"
            className="input-field"
            value={form.name}
            onChange={(e) => updateField('name', e.target.value)}
            required
          />
        </div>

        <div>
          <label className="label">Address</label>
          <input
            type="text"
            className="input-field"
            value={form.address}
            onChange={(e) => updateField('address', e.target.value)}
          />
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <button
              type="button"
              onClick={handleGetLocation}
              disabled={locating}
              className="text-xs text-blue-600 flex items-center gap-1 font-medium"
            >
              {locating ? <Loader2 size={14} className="animate-spin" /> : <Navigation size={14} />}
              {locating ? 'Getting location...' : 'Use Current GPS Location'}
            </button>
            {form.latitude && (
              <span className="text-xs text-green-600 flex items-center gap-1">
                <MapPin size={12} />
                {form.latitude.toFixed(4)}, {form.longitude.toFixed(4)}
              </span>
            )}
          </div>
          {gpsError && (
            <div className="mt-2 p-2.5 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 rounded-lg">
              <p className="text-xs text-amber-700 dark:text-amber-300 flex items-start gap-1.5">
                <AlertCircle size={14} className="shrink-0 mt-0.5" />
                {gpsError}
              </p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div>
              <label className="text-[10px] font-medium text-gray-500 dark:text-gray-400">Latitude</label>
              <input
                type="number"
                step="any"
                className="input-field text-xs !py-2"
                placeholder="e.g. 32.7767"
                value={form.latitude || ''}
                onChange={(e) => updateField('latitude', e.target.value ? parseFloat(e.target.value) : null)}
              />
            </div>
            <div>
              <label className="text-[10px] font-medium text-gray-500 dark:text-gray-400">Longitude</label>
              <input
                type="number"
                step="any"
                className="input-field text-xs !py-2"
                placeholder="e.g. -96.7970"
                value={form.longitude || ''}
                onChange={(e) => updateField('longitude', e.target.value ? parseFloat(e.target.value) : null)}
              />
            </div>
          </div>
        </div>

        <div>
          <label className="label">Status</label>
          <select
            className="input-field"
            value={form.status}
            onChange={(e) => updateField('status', e.target.value)}
          >
            <option value="active">Active</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
          <p className="section-title">Contact Information</p>
        </div>

        <div>
          <label className="label">Contact Name</label>
          <input
            type="text"
            className="input-field"
            value={form.contact_name}
            onChange={(e) => updateField('contact_name', e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Phone</label>
            <input
              type="tel"
              className="input-field"
              placeholder="(555) 123-4567"
              value={form.contact_phone}
              onChange={(e) => updateField('contact_phone', formatPhone(e.target.value))}
              maxLength={14}
            />
          </div>
          <div>
            <label className="label">Ext. <span className="text-gray-400 font-normal">(optional)</span></label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. 204"
              value={form.contact_ext}
              onChange={(e) => updateField('contact_ext', e.target.value.replace(/\D/g, '').slice(0, 6))}
              maxLength={6}
            />
          </div>
        </div>
        <div>
          <label className="label">Email</label>
          <input
            type="email"
            className="input-field"
            value={form.contact_email}
            onChange={(e) => updateField('contact_email', e.target.value)}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="label mb-0">Notes</label>
            <VoiceNote onTranscript={handleVoiceTranscript} />
          </div>
          <textarea
            className="input-field min-h-[100px] resize-none"
            value={form.notes}
            onChange={(e) => updateField('notes', e.target.value)}
            rows={4}
          />
        </div>

        <div className="rounded-xl border-2 border-dashed border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20 p-3 space-y-2">
          <label className="flex items-center gap-2">
            <Flag size={15} className="text-amber-500" />
            <span className="text-sm font-semibold text-amber-700 dark:text-amber-400">Job-Level Flags / Notes</span>
          </label>
          <p className="text-xs text-amber-600 dark:text-amber-500">Use this for overall job concerns — e.g. lift required, customer to provide materials, existing infrastructure notes.</p>
          <textarea
            className="input-field min-h-[80px] resize-none text-sm border-amber-300 dark:border-amber-700"
            placeholder="e.g. Customer needs to provide lift access. Building has existing Cat6 in west wing."
            value={form.job_flags}
            onChange={(e) => updateField('job_flags', e.target.value)}
            rows={3}
          />
        </div>

        <button type="submit" disabled={saving || !form.name.trim()} className="btn-primary w-full mt-6">
          {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}
