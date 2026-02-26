import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, Edit, Trash2, Camera, Save, X, Loader2, Pencil,
  DoorOpen, Radio, ShieldAlert, Thermometer, Server,
  Monitor, Users, Package, MapPin, Layers, Tag, FileText, Link2, Flag, Cable
} from 'lucide-react';
import { api } from '../utils/api';
import { getCategoryById, getSubcategoryName, PHOTO_TYPES, getPhotoTypeName } from '../utils/verkada';
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

export default function PointDetail() {
  const { siteId, pointId } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [point, setPoint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [sitePoints, setSitePoints] = useState([]);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [showOriginal, setShowOriginal] = useState(false);
  const [pendingFiles, setPendingFiles] = useState(null);
  const [pendingType, setPendingType] = useState('general');

  useEffect(() => {
    loadPoint();
  }, [pointId]);

  async function loadPoint() {
    try {
      const data = await api.getPoint(pointId);
      setPoint(data);
      setEditForm({
        name: data.name || '',
        location_description: data.location_description || '',
        floor: data.floor || '',
        notes: data.notes || '',
        product_model: data.product_model || '',
        install_difficulty: data.install_difficulty || null,
        idf_point_id: data.idf_point_id || null,
        is_flagged: data.is_flagged ? true : false,
        flag_notes: data.flag_notes || '',
        cable_type: data.cable_type || '',
        cable_length: data.cable_length ?? '',
      });
      const pts = await api.getPoints(siteId);
      setSitePoints(pts);
    } catch (err) {
      console.error('Failed to load point:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveEdit(e) {
    e.preventDefault();
    try {
      const updated = await api.updatePoint(pointId, editForm);
      setPoint(updated);
      setEditing(false);
    } catch (err) {
      alert('Failed to save: ' + err.message);
    }
  }

  async function handleDelete() {
    if (!window.confirm('Delete this inspection point and all its photos?')) return;
    try {
      await api.deletePoint(pointId);
      navigate(`/sites/${siteId}`, { replace: true });
    } catch (err) {
      alert('Failed to delete: ' + err.message);
    }
  }

  function handlePhotoCapture(e) {
    const files = Array.from(e.target.files);
    e.target.value = '';
    if (files.length === 0) return;
    setPendingType(point?.photos?.length === 0 ? 'overview' : 'general');
    setPendingFiles(files);
  }

  async function handleConfirmUpload() {
    if (!pendingFiles) return;
    setUploading(true);
    setPendingFiles(null);
    try {
      const formData = new FormData();
      pendingFiles.forEach((f) => formData.append('photos', f));
      formData.append('photo_type', pendingType);
      await api.uploadPhotos(pointId, formData);
      await loadPoint();
    } catch (err) {
      alert('Failed to upload: ' + err.message);
    } finally {
      setUploading(false);
    }
  }

  async function handleDeletePhoto(photoId) {
    if (!window.confirm('Delete this photo?')) return;
    try {
      await api.deletePhoto(photoId);
      await loadPoint();
      setSelectedPhoto(null);
      setShowOriginal(false);
    } catch (err) {
      alert('Failed to delete photo: ' + err.message);
    }
  }

  async function handleUpdatePhotoType(photoId, photoType) {
    try {
      await api.updatePhoto(photoId, { photo_type: photoType });
      await loadPoint();
    } catch (err) {
      alert('Failed to update: ' + err.message);
    }
  }

  function handleVoiceTranscript(text, isFinal) {
    if (isFinal) {
      setEditForm((prev) => ({
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

  if (!point) {
    return (
      <div className="page-container flex flex-col items-center justify-center min-h-screen">
        <p className="text-gray-500 mb-4">Point not found</p>
        <button onClick={() => navigate(-1)} className="btn-primary">Go Back</button>
      </div>
    );
  }

  const cat = getCategoryById(point.category);
  const IconComponent = ICON_MAP[cat?.icon] || Package;

  return (
    <div className="page-container">
      {/* Header */}
      <div className="header">
        <button onClick={() => navigate(`/sites/${siteId}`)} className="p-1">
          <ArrowLeft size={22} />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-bold truncate">
            {point.name || getSubcategoryName(point.category, point.subcategory)}
          </h1>
        </div>
        <button onClick={() => setEditing(!editing)} className="p-1">
          <Edit size={20} />
        </button>
        <button onClick={handleDelete} className="p-1 text-red-400">
          <Trash2 size={20} />
        </button>
      </div>

      {/* Category Badge */}
      <div className="mx-4 mt-4 flex items-center gap-2">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: cat?.bgColor }}
        >
          <IconComponent size={16} style={{ color: cat?.color }} />
        </div>
        <div>
          <span className="text-sm font-semibold" style={{ color: cat?.color }}>{cat?.name}</span>
          {point.subcategory && (
            <span className="text-xs text-gray-400 ml-2">
              {getSubcategoryName(point.category, point.subcategory)}
            </span>
          )}
        </div>
      </div>

      {/* Edit Form or Detail View */}
      {editing ? (
        <form onSubmit={handleSaveEdit} className="p-4 space-y-3">
          <div>
            <label className="label">Name</label>
            <input
              type="text"
              className="input-field"
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Location</label>
            <input
              type="text"
              className="input-field"
              value={editForm.location_description}
              onChange={(e) => setEditForm({ ...editForm, location_description: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Floor</label>
              <input
                type="text"
                className="input-field"
                value={editForm.floor}
                onChange={(e) => setEditForm({ ...editForm, floor: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Model</label>
              <input
                type="text"
                className="input-field"
                value={editForm.product_model}
                onChange={(e) => setEditForm({ ...editForm, product_model: e.target.value })}
              />
            </div>
          </div>

          {/* Installation Difficulty — only for non-IDF categories */}
          {!IDF_CATEGORIES.includes(point.category) && (
            <div>
              <label className="label">Install Difficulty</label>
              <div className="flex gap-1.5">
                {DIFFICULTY_LABELS.map(d => (
                  <button
                    key={d.value}
                    type="button"
                    onClick={() => setEditForm({ ...editForm, install_difficulty: editForm.install_difficulty === d.value ? null : d.value })}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
                      editForm.install_difficulty === d.value
                        ? `${d.color} text-white shadow-sm`
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    {d.value}
                  </button>
                ))}
              </div>
              {editForm.install_difficulty && (
                <p className="text-xs text-gray-400 mt-1 text-center">
                  {DIFFICULTY_LABELS.find(d => d.value === editForm.install_difficulty)?.label}
                </p>
              )}
            </div>
          )}

          {/* IDF/MDF Link — only for non-network categories */}
          {!IDF_CATEGORIES.includes(point.category) && (
            <div>
              <label className="label">Network Closet (IDF/MDF)</label>
              <select
                className="input-field"
                value={editForm.idf_point_id || ''}
                onChange={(e) => setEditForm({ ...editForm, idf_point_id: e.target.value || null })}
              >
                <option value="">— Not assigned —</option>
                {sitePoints
                  .filter(p => IDF_CATEGORIES.includes(p.category) && p.id !== pointId)
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
          {!IDF_CATEGORIES.includes(point.category) && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Cable Type</label>
                <select
                  className="input-field"
                  value={editForm.cable_type}
                  onChange={(e) => setEditForm({ ...editForm, cable_type: e.target.value })}
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
                  value={editForm.cable_length}
                  onChange={(e) => setEditForm({ ...editForm, cable_length: e.target.value === '' ? '' : parseFloat(e.target.value) })}
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
              value={editForm.notes}
              onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
              rows={3}
            />
          </div>

          {/* Device Flag */}
          <div className="rounded-xl border-2 border-dashed border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20 p-3 space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 rounded accent-amber-500"
                checked={editForm.is_flagged}
                onChange={(e) => setEditForm({ ...editForm, is_flagged: e.target.checked })}
              />
              <Flag size={15} className="text-amber-500" />
              <span className="text-sm font-semibold text-amber-700 dark:text-amber-400">Flag this device</span>
            </label>
            {editForm.is_flagged && (
              <textarea
                className="input-field min-h-[70px] resize-none text-sm border-amber-300 dark:border-amber-700"
                placeholder="Describe what needs attention before install (e.g. power needed, strike plate replacement)..."
                value={editForm.flag_notes}
                onChange={(e) => setEditForm({ ...editForm, flag_notes: e.target.value })}
                rows={2}
              />
            )}
          </div>

          <div className="flex gap-2">
            <button type="submit" className="btn-primary flex-1">
              <Save size={16} /> Save
            </button>
            <button type="button" onClick={() => setEditing(false)} className="btn-secondary flex-1">
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="mx-4 mt-3 card p-4 space-y-2">
          {point.location_description && (
            <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-2">
              <MapPin size={14} className="text-gray-400 shrink-0" />
              {point.location_description}
            </p>
          )}
          {point.floor && (
            <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-2">
              <Layers size={14} className="text-gray-400 shrink-0" />
              {point.floor}
            </p>
          )}
          {point.product_model && (
            <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-2">
              <Tag size={14} className="text-gray-400 shrink-0" />
              Model: {point.product_model}
            </p>
          )}
          {point.install_difficulty && !IDF_CATEGORIES.includes(point.category) && (
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                {DIFFICULTY_LABELS.map(d => (
                  <span
                    key={d.value}
                    className={`w-4 h-4 rounded-sm ${
                      d.value <= point.install_difficulty ? DIFFICULTY_LABELS[d.value - 1].color : 'bg-gray-200 dark:bg-gray-600'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Install Difficulty: {DIFFICULTY_LABELS.find(d => d.value === point.install_difficulty)?.label} ({point.install_difficulty}/5)
              </span>
            </div>
          )}
          {point.idf_point_id && (() => {
            const idf = sitePoints.find(p => p.id === point.idf_point_id);
            return idf ? (
              <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-2">
                <Link2 size={14} className="text-gray-400 shrink-0" />
                Network Closet: <Link to={`/sites/${siteId}/points/${idf.id}`} className="text-blue-600 dark:text-blue-400">{idf.name || getSubcategoryName(idf.category, idf.subcategory)}{idf.floor ? ` (${idf.floor})` : ''}</Link>
              </p>
            ) : null;
          })()}
          {(point.cable_type || point.cable_length) && !IDF_CATEGORIES.includes(point.category) && (
            <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-2">
              <Cable size={14} className="text-gray-400 shrink-0" />
              Cable: {point.cable_type || 'TBD'}{point.cable_length ? ` — ${point.cable_length} ft` : ''}
            </p>
          )}
          {point.notes && (
            <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400 whitespace-pre-wrap flex items-start gap-2">
                <FileText size={14} className="text-gray-400 shrink-0 mt-0.5" />
                {point.notes}
              </p>
            </div>
          )}
          {point.is_flagged && (
            <div className="mt-2 rounded-xl bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 p-3">
              <p className="text-xs font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5 mb-1">
                <Flag size={13} /> FLAGGED — Action Required
              </p>
              {point.flag_notes && (
                <p className="text-sm text-amber-800 dark:text-amber-300 whitespace-pre-wrap">{point.flag_notes}</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Photos Section */}
      <div className="mx-4 mt-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="section-title mb-0">Photos ({point.photos?.length || 0})</h3>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {point.photos?.map((photo) => (
            <div
              key={photo.id}
              className="relative rounded-xl overflow-hidden border border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 aspect-square cursor-pointer"
              onClick={() => { setSelectedPhoto(photo); setShowOriginal(false); }}
            >
              <img
                src={`/uploads/${photo.thumbnail || photo.filename}`}
                alt=""
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 pt-6">
                <span className="text-[10px] text-white font-medium">
                  {getPhotoTypeName(photo.photo_type)}
                </span>
              </div>
              {photo.annotations && (
                <div className="absolute top-1 right-1 w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center">
                  <Pencil size={10} />
                </div>
              )}
            </div>
          ))}

          {/* Add Photo Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="aspect-square rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center gap-2 text-gray-400 active:bg-gray-50 dark:active:bg-gray-700"
          >
            {uploading ? (
              <Loader2 size={24} className="animate-spin" />
            ) : (
              <>
                <Camera size={24} />
                <span className="text-xs font-medium">Add Photo</span>
              </>
            )}
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
      </div>

      {/* Photo Type Picker sheet */}
      {pendingFiles && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 pb-16">
          <div className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-t-2xl shadow-xl flex flex-col"
               style={{maxHeight: 'calc(100dvh - 120px)'}}>
            {/* Fixed header */}
            <div className="p-4 pb-2 shrink-0">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                  Label {pendingFiles.length > 1 ? `${pendingFiles.length} photos` : 'photo'}
                </h3>
                <button onClick={() => setPendingFiles(null)} className="text-gray-400 p-1"><X size={20} /></button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">What type of photo is this?</p>
            </div>
            {/* Scrollable grid */}
            <div className="flex-1 overflow-y-auto px-4 py-2">
              <div className="grid grid-cols-2 gap-1.5">
                {PHOTO_TYPES.map(pt => (
                  <button
                    key={pt.id}
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
            {/* Pinned upload button */}
            <div className="p-4 pt-2 pb-8 shrink-0 border-t border-gray-100 dark:border-gray-800">
              <button onClick={handleConfirmUpload} disabled={uploading} className="btn-primary w-full">
                {uploading ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
                Upload Photo{pendingFiles.length > 1 ? 's' : ''}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Photo Lightbox */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col">
          <div className="flex items-center justify-between p-3 bg-black/80">
            <button onClick={() => { setSelectedPhoto(null); setShowOriginal(false); }} className="text-white p-1">
              <X size={24} />
            </button>
            <div className="flex items-center gap-3">
              {selectedPhoto.thumbnail && selectedPhoto.thumbnail !== selectedPhoto.filename && (
                <button
                  onClick={() => setShowOriginal(v => !v)}
                  className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-colors ${
                    showOriginal
                      ? 'border-white text-white bg-white/10'
                      : 'border-blue-400 text-blue-400 bg-blue-400/10'
                  }`}
                >
                  {showOriginal ? 'Annotated' : 'Original'}
                </button>
              )}
              <Link
                to={`/sites/${siteId}/photos/${selectedPhoto.id}/annotate`}
                className="text-white p-1"
              >
                <Pencil size={20} />
              </Link>
              <button
                onClick={() => handleDeletePhoto(selectedPhoto.id)}
                className="text-red-400 p-1"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-auto">
            <img
              src={`/uploads/${
                !showOriginal && selectedPhoto.thumbnail && selectedPhoto.thumbnail !== selectedPhoto.filename
                  ? selectedPhoto.thumbnail
                  : selectedPhoto.filename
              }`}
              alt=""
              className="w-full h-auto block"
            />
          </div>
          <div className="p-3 bg-black/80">
            <select
              value={selectedPhoto.photo_type}
              onChange={(e) => {
                handleUpdatePhotoType(selectedPhoto.id, e.target.value);
                setSelectedPhoto({ ...selectedPhoto, photo_type: e.target.value });
              }}
              className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 text-sm border border-gray-600"
            >
              {PHOTO_TYPES.map((pt) => (
                <option key={pt.id} value={pt.id}>{pt.name}</option>
              ))}
            </select>
            {selectedPhoto.notes && (
              <p className="text-sm text-gray-300 mt-2">{selectedPhoto.notes}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
