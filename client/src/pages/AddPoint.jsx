import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Save, Loader2, Camera, X, Plus,
  DoorOpen, Radio, ShieldAlert, Thermometer, Server,
  Monitor, Users, Package, Flag, Cable
} from 'lucide-react';
import { api } from '../utils/api';
import { compressImages } from '../utils/imageCompress';
import { CATEGORIES, getCategoryById, PHOTO_TYPES, getSubcategoryName } from '../utils/verkada';
import VoiceNote from '../components/VoiceNote';

const DIFFICULTY_LABELS = [
  { value: 1, label: 'Easy', color: 'bg-green-500' },
  { value: 2, label: 'Low', color: 'bg-lime-500' },
  { value: 3, label: 'Medium', color: 'bg-yellow-500' },
  { value: 4, label: 'Hard', color: 'bg-orange-500' },
  { value: 5, label: 'Challenging', color: 'bg-red-500' },
];

const IDF_CATEGORIES = ['network'];

const ICON_MAP = {
  Camera, DoorOpen, Radio, ShieldAlert, Thermometer, Server, Monitor, Users, Package,
};

export default function AddPoint() {
  const { siteId } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [step, setStep] = useState(1); // 1: category, 2: subcategory, 3: details
  const [saving, setSaving] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [sitePoints, setSitePoints] = useState([]);
  const [photos, setPhotos] = useState([]); // { file, preview, type }
  const [pendingFiles, setPendingFiles] = useState(null);
  const [pendingType, setPendingType] = useState('general');
  const [form, setForm] = useState({
    subcategory: '',
    name: '',
    location_description: '',
    floor: '',
    notes: '',
    product_model: '',
    install_difficulty: null,
    idf_point_id: null,
    cable_type: '',
    cable_length: '',
    is_flagged: false,
    flag_notes: '',
  });

  useEffect(() => {
    api.getPoints(siteId).then(setSitePoints).catch(() => {});
  }, [siteId]);

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleCategorySelect(catId) {
    setSelectedCategory(catId);
    const cat = getCategoryById(catId);
    if (cat.subcategories.length === 1) {
      setForm((prev) => ({ ...prev, subcategory: cat.subcategories[0].id }));
      setStep(3);
    } else {
      setStep(2);
    }
  }

  function handleSubcategorySelect(subId) {
    setForm((prev) => ({ ...prev, subcategory: subId }));
    setStep(3);
  }

  function handlePhotoCapture(e) {
    const files = Array.from(e.target.files);
    e.target.value = '';
    if (files.length === 0) return;
    setPendingType(photos.length === 0 ? 'overview' : 'general');
    setPendingFiles(files);
  }

  async function handleConfirmPhotos() {
    const filesToAdd = pendingFiles;
    setPendingFiles(null);
    const compressed = await compressImages(filesToAdd);
    const newPhotos = compressed.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      type: pendingType,
    }));
    setPhotos((prev) => [...prev, ...newPhotos]);
  }

  function removePhoto(index) {
    setPhotos((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      // Create the inspection point
      const point = await api.createPoint(siteId, {
        category: selectedCategory,
        ...form,
      });

      // Upload photos if any, grouped by type
      if (photos.length > 0) {
        const byType = {};
        photos.forEach((p) => {
          if (!byType[p.type]) byType[p.type] = [];
          byType[p.type].push(p.file);
        });
        for (const [type, files] of Object.entries(byType)) {
          const formData = new FormData();
          files.forEach((f) => formData.append('photos', f));
          formData.append('photo_type', type);
          await api.uploadPhotos(point.id, formData);
        }
      }

      navigate(`/sites/${siteId}/points/${point.id}`, { replace: true });
    } catch (err) {
      alert('Failed to save: ' + err.message);
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
        <button
          onClick={() => {
            if (step > 1) setStep(step - 1);
            else navigate(-1);
          }}
          className="p-1"
        >
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-lg font-bold flex-1">
          {step === 1 ? 'Select Category' : step === 2 ? 'Select Type' : 'Add Details'}
        </h1>
      </div>

      {/* Step 1: Category Selection */}
      {step === 1 && (
        <div className="p-4 grid grid-cols-2 gap-3">
          {CATEGORIES.map((cat) => {
            const IconComponent = ICON_MAP[cat.icon] || Package;
            return (
              <button
                key={cat.id}
                onClick={() => handleCategorySelect(cat.id)}
                className="card p-4 flex flex-col items-center gap-2 active:scale-95 transition-transform text-center"

              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: cat.bgColor }}
                >
                  <IconComponent size={26} style={{ color: cat.color }} />
                </div>
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">{cat.name}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Step 2: Subcategory Selection */}
      {step === 2 && selectedCategory && (
        <div className="p-4 space-y-2">
          {getCategoryById(selectedCategory)?.subcategories.map((sub) => {
            const cat = getCategoryById(selectedCategory);
            const IconComponent = ICON_MAP[cat.icon] || Package;
            return (
              <button
                key={sub.id}
                onClick={() => handleSubcategorySelect(sub.id)}
                className="card w-full p-4 flex items-center gap-3 active:bg-gray-50 dark:active:bg-gray-700 transition-colors text-left"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: cat.bgColor }}
                >
                  <IconComponent size={18} style={{ color: cat.color }} />
                </div>
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">{sub.name}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Step 3: Details & Photos */}
      {step === 3 && (
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Category badge */}
          {selectedCategory && (
            <div className="flex items-center gap-2 mb-2">
              {(() => {
                const cat = getCategoryById(selectedCategory);
                const IconComponent = ICON_MAP[cat?.icon] || Package;
                return (
                  <>
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: cat?.bgColor }}
                    >
                      <IconComponent size={16} style={{ color: cat?.color }} />
                    </div>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {cat?.name}
                      {form.subcategory && ` → ${getCategoryById(selectedCategory)?.subcategories.find(s => s.id === form.subcategory)?.name}`}
                    </span>
                  </>
                );
              })()}
            </div>
          )}

          <div>
            <label className="label">Label / Name</label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. Front Entrance Camera, Server Room Door"
              value={form.name}
              onChange={(e) => updateField('name', e.target.value)}
            />
          </div>

          <div>
            <label className="label">Location Description</label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. Above front door, facing parking lot"
              value={form.location_description}
              onChange={(e) => updateField('location_description', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Floor / Area</label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. 1st Floor, Bldg A"
                value={form.floor}
                onChange={(e) => updateField('floor', e.target.value)}
              />
            </div>
            <div>
              <label className="label">Product Model</label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. CD52, AD15"
                value={form.product_model}
                onChange={(e) => updateField('product_model', e.target.value)}
              />
            </div>
          </div>

          {/* Installation Difficulty — only for non-IDF categories */}
          {selectedCategory && !IDF_CATEGORIES.includes(selectedCategory) && (
            <div>
              <label className="label">Install Difficulty</label>
              <div className="flex gap-1.5">
                {DIFFICULTY_LABELS.map(d => (
                  <button
                    key={d.value}
                    type="button"
                    onClick={() => updateField('install_difficulty', form.install_difficulty === d.value ? null : d.value)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
                      form.install_difficulty === d.value
                        ? `${d.color} text-white shadow-sm`
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    {d.value}
                  </button>
                ))}
              </div>
              {form.install_difficulty && (
                <p className="text-xs text-gray-400 mt-1 text-center">
                  {DIFFICULTY_LABELS.find(d => d.value === form.install_difficulty)?.label}
                </p>
              )}
            </div>
          )}

          {/* IDF/MDF Link — only for non-network categories */}
          {selectedCategory && !IDF_CATEGORIES.includes(selectedCategory) && (
            <div>
              <label className="label">Network Closet (IDF/MDF)</label>
              <select
                className="input-field"
                value={form.idf_point_id || ''}
                onChange={(e) => updateField('idf_point_id', e.target.value || null)}
              >
                <option value="">— Not assigned —</option>
                {sitePoints
                  .filter(p => IDF_CATEGORIES.includes(p.category))
                  .map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name || getSubcategoryName(p.category, p.subcategory) || 'Unnamed Closet'}
                      {p.floor ? ` (${p.floor})` : ''}
                    </option>
                  ))
                }
              </select>
            </div>
          )}

          {/* Cable Run — only for non-IDF */}
          {selectedCategory && !IDF_CATEGORIES.includes(selectedCategory) && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Cable Type</label>
                <select
                  className="input-field"
                  value={form.cable_type}
                  onChange={(e) => updateField('cable_type', e.target.value)}
                >
                  <option value="">— None / Existing —</option>
                  <option value="Cat5e">Cat5e</option>
                  <option value="Cat6">Cat6</option>
                  <option value="Cat6A">Cat6A</option>
                  <option value="Fiber SM">Fiber SM</option>
                  <option value="Fiber MM">Fiber MM</option>
                  <option value="Coax RG6">Coax RG6</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="label">Cable Length (ft)</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  className="input-field"
                  placeholder="e.g. 150"
                  value={form.cable_length}
                  onChange={(e) => updateField('cable_length', e.target.value === '' ? '' : parseFloat(e.target.value))}
                />
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="label mb-0">Notes</label>
              <VoiceNote onTranscript={handleVoiceTranscript} />
            </div>
            <textarea
              className="input-field min-h-[80px] resize-none"
              placeholder="Notes about this location..."
              value={form.notes}
              onChange={(e) => updateField('notes', e.target.value)}
              rows={3}
            />
          </div>

          {/* Device Flag */}
          <div className="rounded-xl border-2 border-dashed border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20 p-3 space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 rounded accent-amber-500"
                checked={form.is_flagged}
                onChange={(e) => updateField('is_flagged', e.target.checked)}
              />
              <Flag size={15} className="text-amber-500" />
              <span className="text-sm font-semibold text-amber-700 dark:text-amber-400">Flag this device</span>
            </label>
            {form.is_flagged && (
              <textarea
                className="input-field min-h-[70px] resize-none text-sm border-amber-300 dark:border-amber-700"
                placeholder="Describe what needs attention before install (e.g. power needed, strike plate replacement)..."
                value={form.flag_notes}
                onChange={(e) => updateField('flag_notes', e.target.value)}
                rows={2}
              />
            )}
          </div>

          {/* Photo Capture Section */}
          <div>
            <label className="label">Photos</label>
            <div className="flex flex-wrap gap-2">
              {photos.map((photo, i) => (
                <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200">
                  <img src={photo.preview} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removePhoto(i)}
                    className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center gap-1 text-gray-400 active:bg-gray-50 dark:active:bg-gray-700"
              >
                <Camera size={20} />
                <span className="text-[10px] font-medium">Add</span>
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              multiple
              onChange={handlePhotoCapture}
              className="hidden"
            />
            <p className="text-xs text-gray-400 mt-1">Tap to take a photo or choose from gallery</p>
          </div>

          <button type="submit" disabled={saving} className="btn-primary w-full mt-6">
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            {saving ? 'Saving...' : 'Save Inspection Point'}
          </button>
        </form>
      )}

      {/* Photo Type Picker sheet */}
      {pendingFiles && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 pb-16">
          <div
            className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-t-2xl shadow-xl flex flex-col"
            style={{ maxHeight: 'calc(100dvh - 120px)' }}
          >
            <div className="p-4 pb-2 shrink-0">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                  Label {pendingFiles.length > 1 ? `${pendingFiles.length} photos` : 'photo'}
                </h3>
                <button onClick={() => setPendingFiles(null)} className="text-gray-400 p-1"><X size={20} /></button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">What type of photo is this?</p>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-2">
              <div className="grid grid-cols-2 gap-1.5">
                {PHOTO_TYPES.map((pt) => (
                  <button
                    key={pt.id}
                    type="button"
                    onClick={() => setPendingType(pt.id)}
                    className={`px-3 py-2.5 rounded-xl text-sm font-medium text-left transition-all ${
                      pendingType === pt.id
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {pt.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="p-4 pt-2 pb-8 shrink-0 border-t border-gray-100 dark:border-gray-800">
              <button
                type="button"
                onClick={handleConfirmPhotos}
                className="btn-primary w-full"
              >
                <Camera size={16} />
                Add Photo{pendingFiles.length > 1 ? 's' : ''}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
