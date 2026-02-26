const API_BASE = '/api';

async function request(url, options = {}) {
  const { body, ...rest } = options;
  const config = { ...rest };

  if (body && !(body instanceof FormData)) {
    config.headers = { 'Content-Type': 'application/json', ...config.headers };
    config.body = JSON.stringify(body);
  } else if (body) {
    config.body = body;
  }

  const res = await fetch(`${API_BASE}${url}`, config);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
    throw new Error(err.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

export const api = {
  // Sites
  getSites: (params) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/sites${qs ? `?${qs}` : ''}`);
  },
  getSite: (id) => request(`/sites/${id}`),
  createSite: (data) => request('/sites', { method: 'POST', body: data }),
  updateSite: (id, data) => request(`/sites/${id}`, { method: 'PUT', body: data }),
  deleteSite: (id) => request(`/sites/${id}`, { method: 'DELETE' }),

  // Points
  getPoints: (siteId) => request(`/sites/${siteId}/points`),
  getPoint: (pointId) => request(`/points/${pointId}`),
  createPoint: (siteId, data) => request(`/sites/${siteId}/points`, { method: 'POST', body: data }),
  updatePoint: (pointId, data) => request(`/points/${pointId}`, { method: 'PUT', body: data }),
  deletePoint: (pointId) => request(`/points/${pointId}`, { method: 'DELETE' }),

  // Photos
  getPhotos: (pointId) => request(`/photos/points/${pointId}/photos`),
  uploadPhotos: (pointId, formData) =>
    request(`/photos/points/${pointId}/photos`, { method: 'POST', body: formData }),
  updatePhoto: (photoId, data) => request(`/photos/photos/${photoId}`, { method: 'PUT', body: data }),
  deletePhoto: (photoId) => request(`/photos/photos/${photoId}`, { method: 'DELETE' }),
  saveAnnotation: (photoId, formData) =>
    request(`/photos/photos/${photoId}/annotate`, { method: 'POST', body: formData }),

  // Report
  getReport: (siteId) => request(`/photos/report/${siteId}`),
};
