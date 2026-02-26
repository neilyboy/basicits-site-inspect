import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Save, Loader2, Navigation, AlertCircle, Flag } from 'lucide-react';
import { api } from '../utils/api';
import VoiceNote from '../components/VoiceNote';

export default function NewSite() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
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
    latitude: null,
    longitude: null,
  });

  function formatPhone(raw) {
    const digits = raw.replace(/\D/g, '').slice(0, 10);
    if (digits.length <= 3) return digits.length ? `(${digits}` : '';
    if (digits.length <= 6) return `(${digits.slice(0,3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0,3)}) ${digits.slice(3,6)}-${digits.slice(6)}`;
  }

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
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
      const site = await api.createSite(form);
      navigate(`/sites/${site.id}`, { replace: true });
    } catch (err) {
      alert('Failed to create site: ' + err.message);
      setSaving(false);
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

  return (
    <div className="page-container">
      <div className="header">
        <button onClick={() => navigate(-1)} className="p-1">
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-lg font-bold flex-1">New Site Survey</h1>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        <div>
          <label className="label">Site / Location Name *</label>
          <input
            type="text"
            className="input-field"
            placeholder="e.g. ABC Corp Main Office"
            value={form.name}
            onChange={(e) => updateField('name', e.target.value)}
            required
            autoFocus
          />
        </div>

        <div>
          <label className="label">Address</label>
          <input
            type="text"
            className="input-field"
            placeholder="123 Main St, City, State"
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
          {(gpsError || form.latitude) && (
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
          )}
        </div>

        <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
          <p className="section-title">Contact Information</p>
        </div>

        <div>
          <label className="label">Contact Name</label>
          <input
            type="text"
            className="input-field"
            placeholder="John Smith"
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
            placeholder="john@example.com"
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
            placeholder="General notes about the site..."
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
          {saving ? 'Creating...' : 'Create Site Survey'}
        </button>
      </form>
    </div>
  );
}
