/**
 * Offline upload queue using IndexedDB.
 * Queued uploads are retried automatically when the app comes back online.
 *
 * Each queue item: { id, pointId, photoType, files: [{ name, type, data: ArrayBuffer }], createdAt }
 */

const DB_NAME = 'site-inspect-queue';
const DB_VERSION = 1;
const STORE = 'uploads';

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      e.target.result.createObjectStore(STORE, { keyPath: 'id' });
    };
    req.onsuccess = (e) => resolve(e.target.result);
    req.onerror = (e) => reject(e.target.error);
  });
}

export async function queueUpload(pointId, photoType, files) {
  const db = await openDB();
  const fileData = await Promise.all(
    files.map(async (f) => ({
      name: f.name,
      type: f.type,
      data: await f.arrayBuffer(),
    }))
  );
  const item = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    pointId,
    photoType,
    files: fileData,
    createdAt: new Date().toISOString(),
  };
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).add(item);
    tx.oncomplete = () => resolve(item.id);
    tx.onerror = (e) => reject(e.target.error);
  });
}

export async function getPendingUploads() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly');
    const req = tx.objectStore(STORE).getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = (e) => reject(e.target.error);
  });
}

export async function removeQueuedUpload(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).delete(id);
    tx.oncomplete = resolve;
    tx.onerror = (e) => reject(e.target.error);
  });
}

export async function getQueueCount() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly');
    const req = tx.objectStore(STORE).count();
    req.onsuccess = () => resolve(req.result);
    req.onerror = (e) => reject(e.target.error);
  });
}

/**
 * Attempt to flush all queued uploads.
 * Returns { succeeded, failed } counts.
 */
export async function flushQueue(uploadFn) {
  const pending = await getPendingUploads();
  let succeeded = 0;
  let failed = 0;

  for (const item of pending) {
    try {
      const files = item.files.map(
        (f) => new File([f.data], f.name, { type: f.type })
      );
      const formData = new FormData();
      files.forEach((f) => formData.append('photos', f));
      formData.append('photo_type', item.photoType);
      await uploadFn(item.pointId, formData);
      await removeQueuedUpload(item.id);
      succeeded++;
    } catch {
      failed++;
    }
  }

  return { succeeded, failed };
}
