import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Archive, Upload, CheckCircle, XCircle,
  AlertCircle, Loader2, FileArchive, Info
} from 'lucide-react';
import JSZip from 'jszip';

const STEPS = {
  IDLE: 'idle',
  READING: 'reading',
  PREVIEW: 'preview',
  UPLOADING: 'uploading',
  DONE: 'done',
  ERROR: 'error',
};

export default function ArchiveManager() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [step, setStep] = useState(STEPS.IDLE);
  const [dragOver, setDragOver] = useState(false);
  const [manifest, setManifest] = useState(null);
  const [zipFile, setZipFile] = useState(null);
  const [progress, setProgress] = useState({ current: 0, total: 0, label: '' });
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  async function handleFile(file) {
    if (!file || !file.name.endsWith('.zip')) {
      setError('Please select a valid .zip archive file.');
      setStep(STEPS.ERROR);
      return;
    }
    setStep(STEPS.READING);
    setError('');
    try {
      const zip = await JSZip.loadAsync(file);
      const manifestFile = zip.file('manifest.json');
      if (!manifestFile) throw new Error('No manifest.json found — this does not appear to be a valid Site Inspect archive.');
      const manifestText = await manifestFile.async('string');
      const data = JSON.parse(manifestText);
      if (!data.site || !data.points) throw new Error('Archive manifest is missing site or points data.');
      setManifest(data);
      setZipFile(file);
      setStep(STEPS.PREVIEW);
    } catch (err) {
      setError(err.message);
      setStep(STEPS.ERROR);
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  }

  function handleFileInput(e) {
    const file = e.target.files[0];
    e.target.value = '';
    if (file) handleFile(file);
  }

  async function handleImport() {
    if (!manifest || !zipFile) return;
    setStep(STEPS.UPLOADING);

    try {
      const zip = await JSZip.loadAsync(zipFile);
      const photoFiles = {};
      zip.folder('photos').forEach((relPath, zipEntry) => {
        photoFiles[relPath] = zipEntry;
      });

      const totalPhotos = Object.keys(photoFiles).length;
      setProgress({ current: 0, total: totalPhotos + 1, label: 'Importing site data...' });

      // Step 1: import site + points via manifest
      const importRes = await fetch('/api/archive/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(manifest),
      });
      if (!importRes.ok) {
        const err = await importRes.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to import site data');
      }
      const { siteId: newSiteId } = await importRes.json();

      // Step 2: re-upload photos
      let uploaded = 0;
      // Build a map: original filename -> new point info
      // We need to match photos to their new point IDs.
      // The import endpoint returned the new siteId; fetch the new points to map them.
      const newPointsRes = await fetch(`/api/sites/${newSiteId}/points`);
      const newPoints = await newPointsRes.json();

      // Build a name-based map from original points to new points (by index order)
      const origPoints = manifest.points;

      for (let pi = 0; pi < origPoints.length; pi++) {
        const origPoint = origPoints[pi];
        const newPoint = newPoints[pi]; // same order guaranteed by import
        if (!newPoint) continue;

        for (const photo of origPoint.photos || []) {
          setProgress({
            current: uploaded + 1,
            total: totalPhotos + 1,
            label: `Uploading photo ${uploaded + 1} of ${totalPhotos}...`,
          });

          const entry = photoFiles[photo.filename];
          if (!entry) { uploaded++; continue; }

          try {
            const blob = await entry.async('blob');
            const file = new File([blob], photo.filename, { type: 'image/jpeg' });
            const formData = new FormData();
            formData.append('photos', file);
            formData.append('photo_type', photo.photo_type || 'general');
            await fetch(`/api/photos/points/${newPoint.id}/photos`, {
              method: 'POST',
              body: formData,
            });
          } catch {
            // Non-fatal: skip missing/corrupt photo
          }
          uploaded++;
        }
      }

      setResult({ siteId: newSiteId, siteName: manifest.site.name, photoCount: uploaded });
      setStep(STEPS.DONE);
    } catch (err) {
      setError(err.message);
      setStep(STEPS.ERROR);
    }
  }

  function reset() {
    setStep(STEPS.IDLE);
    setManifest(null);
    setZipFile(null);
    setError('');
    setResult(null);
    setProgress({ current: 0, total: 0, label: '' });
  }

  const totalPhotos = manifest?.points?.reduce((s, p) => s + (p.photos?.length || 0), 0) ?? 0;

  return (
    <div className="page-container">
      {/* Header */}
      <div className="header">
        <button onClick={() => navigate(-1)} className="p-1">
          <ArrowLeft size={22} />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-bold">Archive Manager</h1>
          <p className="text-xs text-slate-300">Import &amp; restore site archives</p>
        </div>
        <Archive size={22} className="text-slate-300" />
      </div>

      <div className="px-4 pt-5 pb-24 space-y-5">

        {/* Info card */}
        {step === STEPS.IDLE && (
          <div className="rounded-2xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 flex gap-3">
            <Info size={18} className="text-blue-500 shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
              <p className="font-semibold">How to restore an archive</p>
              <ol className="list-decimal list-inside space-y-1 text-xs text-blue-700 dark:text-blue-400">
                <li>Download a site archive using the <Archive size={11} className="inline" /> button on any site page</li>
                <li>To restore it later, come here and select that <strong>.zip</strong> file</li>
                <li>The site will be re-created with all devices and photos</li>
                <li>Original site stays untouched — a new copy is created</li>
              </ol>
            </div>
          </div>
        )}

        {/* Drop zone / file picker */}
        {(step === STEPS.IDLE || step === STEPS.ERROR) && (
          <div>
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Select archive file</p>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-10 cursor-pointer transition-all
                ${dragOver
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 active:bg-gray-100 dark:active:bg-gray-700'
                }`}
            >
              <FileArchive size={40} className={dragOver ? 'text-blue-500' : 'text-gray-300 dark:text-gray-600'} />
              <div className="text-center">
                <p className="font-semibold text-gray-700 dark:text-gray-300 text-sm">
                  {dragOver ? 'Drop it!' : 'Tap to select .zip file'}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">or drag and drop here</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".zip"
                onChange={handleFileInput}
                className="hidden"
              />
            </div>

            {step === STEPS.ERROR && (
              <div className="mt-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 flex items-start gap-2">
                <XCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
              </div>
            )}
          </div>
        )}

        {/* Reading spinner */}
        {step === STEPS.READING && (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <Loader2 size={36} className="animate-spin text-blue-500" />
            <p className="text-sm text-gray-500 dark:text-gray-400">Reading archive...</p>
          </div>
        )}

        {/* Preview */}
        {step === STEPS.PREVIEW && manifest && (
          <div className="space-y-4">
            <div className="rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
              {/* Site header */}
              <div className="px-4 py-4 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center shrink-0">
                    <Archive size={20} className="text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="font-bold text-gray-900 dark:text-gray-100 text-base truncate">
                      {manifest.site.name}
                    </h2>
                    {manifest.site.address && (
                      <p className="text-xs text-gray-400 mt-0.5 truncate">{manifest.site.address}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-0.5">
                      Archived {new Date(manifest.exportedAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 divide-x divide-gray-100 dark:divide-gray-700">
                <div className="px-3 py-3 text-center">
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{manifest.points.length}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">Devices</p>
                </div>
                <div className="px-3 py-3 text-center">
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalPhotos}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">Photos</p>
                </div>
                <div className="px-3 py-3 text-center">
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {manifest.points.filter(p => p.is_flagged).length}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-0.5">Flagged</p>
                </div>
              </div>
            </div>

            {/* Warning */}
            <div className="rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 p-3 flex gap-2">
              <AlertCircle size={15} className="text-amber-500 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700 dark:text-amber-400">
                A <strong>new copy</strong> of this site will be created. The original site (if still present) won't be affected.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={reset}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleImport}
                className="btn-primary flex-1"
              >
                <Upload size={16} />
                Restore Site
              </button>
            </div>
          </div>
        )}

        {/* Uploading progress */}
        {step === STEPS.UPLOADING && (
          <div className="space-y-5">
            <div className="rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 text-center space-y-4">
              <Loader2 size={36} className="animate-spin text-blue-500 mx-auto" />
              <div>
                <p className="font-semibold text-gray-800 dark:text-gray-200">Restoring archive...</p>
                <p className="text-sm text-gray-400 mt-1">{progress.label}</p>
              </div>
              {progress.total > 0 && (
                <div className="space-y-1.5">
                  <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-blue-500 h-2.5 rounded-full transition-all duration-300"
                      style={{ width: `${Math.round((progress.current / progress.total) * 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-400">
                    {progress.current} / {progress.total}
                  </p>
                </div>
              )}
              <p className="text-xs text-gray-400">Please keep the app open...</p>
            </div>
          </div>
        )}

        {/* Done */}
        {step === STEPS.DONE && result && (
          <div className="space-y-4">
            <div className="rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center mx-auto">
                <CheckCircle size={32} className="text-emerald-500" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Restore Complete!</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  <strong className="text-gray-700 dark:text-gray-300">{result.siteName}</strong> has been restored with {result.photoCount} photo{result.photoCount !== 1 ? 's' : ''}.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={reset} className="btn-secondary flex-1">
                Import Another
              </button>
              <button
                onClick={() => navigate(`/sites/${result.siteId}`)}
                className="btn-primary flex-1"
              >
                Open Site
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
