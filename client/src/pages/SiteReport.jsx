import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Download, Printer, MapPin, Phone, Mail, User,
  Camera, DoorOpen, Radio, ShieldAlert, Thermometer, Server,
  Monitor, Users, Package, FileText, Layers, Tag, Link2, Flag, Cable
} from 'lucide-react';
import { api } from '../utils/api';
import { getCategoryById, getSubcategoryName, getPhotoTypeName, CATEGORIES } from '../utils/verkada';
import { format } from 'date-fns';
import { generatePDF } from '../utils/pdf';

const DIFFICULTY_LABELS = ['', 'Easy', 'Low', 'Medium', 'Hard', 'Challenging'];
const DIFFICULTY_COLORS_HEX = ['', '#22c55e', '#84cc16', '#eab308', '#f97316', '#ef4444'];

const ICON_MAP = {
  Camera, DoorOpen, Radio, ShieldAlert, Thermometer, Server, Monitor, Users, Package,
};

export default function SiteReport() {
  const { siteId } = useParams();
  const navigate = useNavigate();
  const reportRef = useRef(null);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    loadReport();
  }, [siteId]);

  async function loadReport() {
    try {
      const reportData = await api.getReport(siteId);
      setData(reportData);
    } catch (err) {
      console.error('Failed to load report:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleExportPDF() {
    if (!data) return;
    setExporting(true);
    try {
      await generatePDF(data, reportRef.current);
    } catch (err) {
      alert('Failed to export PDF: ' + err.message);
    } finally {
      setExporting(false);
    }
  }

  function handlePrint() {
    window.print();
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white gap-4">
        <p className="text-gray-500">Report not found</p>
        <button onClick={() => navigate(-1)} className="btn-primary">Go Back</button>
      </div>
    );
  }

  const { site, points } = data;

  // Group points by category
  const grouped = {};
  for (const cat of CATEGORIES) {
    const catPoints = points.filter((p) => p.category === cat.id);
    if (catPoints.length > 0) {
      grouped[cat.id] = catPoints;
    }
  }

  const totalPhotos = points.reduce((sum, p) => sum + (p.photos?.length || 0), 0);
  const flaggedPoints = points.filter(p => p.is_flagged);

  // Cable totals by type
  const cableByType = {};
  for (const p of points) {
    if (p.cable_type && p.cable_length) {
      cableByType[p.cable_type] = (cableByType[p.cable_type] || 0) + Number(p.cable_length);
    }
  }
  const hasCableData = Object.keys(cableByType).length > 0;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Bar (non-print) */}
      <div className="no-print sticky top-0 z-30 bg-slate-800 text-white px-4 py-3 flex items-center gap-3 shadow-md">
        <button onClick={() => navigate(`/sites/${siteId}`)} className="p-1">
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-lg font-bold flex-1">Site Report</h1>
        <button onClick={handlePrint} className="p-1" title="Print">
          <Printer size={20} />
        </button>
        <button
          onClick={handleExportPDF}
          disabled={exporting}
          className="flex items-center gap-1 bg-blue-600 px-3 py-1.5 rounded-lg text-sm font-semibold"
        >
          {exporting ? (
            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
          ) : (
            <Download size={16} />
          )}
          PDF
        </button>
      </div>

      {/* Report Content */}
      <div ref={reportRef} className="max-w-4xl mx-auto bg-white shadow-sm min-h-screen">
        {/* Report Header */}
        <div className="bg-slate-800 text-white p-8">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-400 uppercase font-semibold tracking-wider mb-1">
                Site Inspection Report
              </p>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">{site.name}</h1>
              {site.address && (
                <p className="text-slate-300 flex items-center gap-2">
                  <MapPin size={16} />
                  {site.address}
                </p>
              )}
            </div>
            <div className="text-right text-sm text-slate-400">
              <p>{format(new Date(site.created_at + 'Z'), 'MMMM d, yyyy')}</p>
              <p className="mt-1">
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase ${
                  site.status === 'completed'
                    ? 'bg-green-600 text-white'
                    : 'bg-blue-600 text-white'
                }`}>
                  {site.status}
                </span>
              </p>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="flex items-center gap-8 mt-6 pt-4 border-t border-slate-700">
            <div>
              <p className="text-2xl font-bold">{points.length}</p>
              <p className="text-xs text-slate-400 uppercase">Inspection Points</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{totalPhotos}</p>
              <p className="text-xs text-slate-400 uppercase">Photos</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{Object.keys(grouped).length}</p>
              <p className="text-xs text-slate-400 uppercase">Categories</p>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        {(site.contact_name || site.contact_phone || site.contact_email) && (
          <div className="p-6 border-b border-gray-200 bg-gray-50">
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Contact Information</h2>
            <div className="flex flex-wrap gap-6 text-sm">
              {site.contact_name && (
                <span className="flex items-center gap-2 text-gray-700">
                  <User size={14} className="text-gray-400" />
                  {site.contact_name}
                </span>
              )}
              {site.contact_phone && (
                <span className="flex items-center gap-2 text-gray-700">
                  <Phone size={14} className="text-gray-400" />
                  {site.contact_phone}
                </span>
              )}
              {site.contact_email && (
                <span className="flex items-center gap-2 text-gray-700">
                  <Mail size={14} className="text-gray-400" />
                  {site.contact_email}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Job Flags Banner */}
        {site.job_flags && (
          <div className="p-6 border-b-4 border-amber-400 bg-amber-50">
            <h2 className="text-sm font-bold text-amber-700 uppercase tracking-wider mb-2 flex items-center gap-2">
              <Flag size={14} /> Job-Level Flags
            </h2>
            <p className="text-sm text-amber-800 whitespace-pre-wrap leading-relaxed">{site.job_flags}</p>
          </div>
        )}

        {/* Flagged Devices Summary */}
        {flaggedPoints.length > 0 && (
          <div className="p-6 border-b border-red-200 bg-red-50">
            <h2 className="text-sm font-bold text-red-700 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Flag size={14} /> {flaggedPoints.length} Device{flaggedPoints.length !== 1 ? 's' : ''} Require Attention Before Install
            </h2>
            <div className="space-y-2">
              {flaggedPoints.map(p => {
                const cat = getCategoryById(p.category);
                return (
                  <div key={p.id} className="flex items-start gap-3 bg-white rounded-lg p-3 border border-red-200">
                    <Flag size={14} className="text-red-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-gray-800">
                        {p.name || getSubcategoryName(p.category, p.subcategory) || 'Unnamed'}
                        <span className="ml-2 text-xs font-normal text-gray-500">{cat?.name}{p.floor ? ` — ${p.floor}` : ''}</span>
                      </p>
                      {p.flag_notes && <p className="text-sm text-red-700 mt-0.5">{p.flag_notes}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Site Notes */}
        {site.notes && (
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Site Notes</h2>
            <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{site.notes}</p>
          </div>
        )}

        {/* Cable Materials Summary */}
        {hasCableData && (
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Cable size={13} /> Cable Materials Required
            </h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 text-gray-500 font-semibold">Cable Type</th>
                  <th className="text-right py-2 text-gray-500 font-semibold">Total Length</th>
                  <th className="text-right py-2 text-gray-500 font-semibold">+10% Overage</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(cableByType).map(([type, total]) => (
                  <tr key={type} className="border-b border-gray-100">
                    <td className="py-2 font-medium text-gray-800">{type}</td>
                    <td className="py-2 text-right text-gray-600">{total.toFixed(0)} ft</td>
                    <td className="py-2 text-right font-semibold text-gray-800">{Math.ceil(total * 1.1)} ft</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-xs text-gray-400 mt-2">Devices with existing infrastructure not included. Lengths are estimates — verify on-site.</p>
          </div>
        )}

        {/* Summary Table */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Summary</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 text-gray-500 font-semibold">Category</th>
                  <th className="text-center py-2 text-gray-500 font-semibold">Count</th>
                  <th className="text-center py-2 text-gray-500 font-semibold">Photos</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(grouped).map(([catId, catPoints]) => {
                  const cat = getCategoryById(catId);
                  const photoCount = catPoints.reduce((s, p) => s + (p.photos?.length || 0), 0);
                  return (
                    <tr key={catId} className="border-b border-gray-100">
                      <td className="py-2 font-medium text-gray-800 flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full inline-block"
                          style={{ backgroundColor: cat?.color }}
                        />
                        {cat?.name || catId}
                      </td>
                      <td className="py-2 text-center text-gray-600">{catPoints.length}</td>
                      <td className="py-2 text-center text-gray-600">{photoCount}</td>
                    </tr>
                  );
                })}
                <tr className="font-bold">
                  <td className="py-2 text-gray-900">Total</td>
                  <td className="py-2 text-center text-gray-900">{points.length}</td>
                  <td className="py-2 text-center text-gray-900">{totalPhotos}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Detailed Sections by Category */}
        {Object.entries(grouped).map(([catId, catPoints]) => {
          const cat = getCategoryById(catId);
          const IconComponent = ICON_MAP[cat?.icon] || Package;

          return (
            <div key={catId} className="border-b border-gray-200">
              {/* Category Header */}
              <div
                className="px-6 py-4 flex items-center gap-3"
                style={{ borderLeft: `4px solid ${cat?.color || '#64748b'}` }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: cat?.bgColor }}
                >
                  <IconComponent size={20} style={{ color: cat?.color }} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">{cat?.name || catId}</h2>
                  <p className="text-xs text-gray-500">{catPoints.length} point{catPoints.length !== 1 ? 's' : ''}</p>
                </div>
              </div>

              {/* Points in this category */}
              {catPoints.map((point, idx) => (
                <div key={point.id} className="px-6 py-4 border-t border-gray-100">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        {idx + 1}. {point.name || getSubcategoryName(catId, point.subcategory) || 'Unnamed'}
                      </h3>
                      {point.subcategory && (
                        <span
                          className="inline-block text-xs px-2 py-0.5 rounded-full mt-1 font-medium"
                          style={{ backgroundColor: cat?.bgColor, color: cat?.color }}
                        >
                          {getSubcategoryName(catId, point.subcategory)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1 text-sm mt-2">
                    {point.location_description && (
                      <p className="text-gray-600 flex items-center gap-2">
                        <MapPin size={13} className="text-gray-400 shrink-0" />
                        {point.location_description}
                      </p>
                    )}
                    {point.floor && (
                      <p className="text-gray-600 flex items-center gap-2">
                        <Layers size={13} className="text-gray-400 shrink-0" />
                        {point.floor}
                      </p>
                    )}
                    {point.product_model && (
                      <p className="text-gray-600 flex items-center gap-2">
                        <Tag size={13} className="text-gray-400 shrink-0" />
                        Model: {point.product_model}
                      </p>
                    )}
                    {point.install_difficulty && point.category !== 'network' && (
                      <p className="text-gray-600 flex items-center gap-2">
                        <span className="flex gap-0.5">
                          {[1,2,3,4,5].map(d => (
                            <span
                              key={d}
                              style={{ width: 12, height: 12, borderRadius: 3, display: 'inline-block',
                                backgroundColor: d <= point.install_difficulty ? DIFFICULTY_COLORS_HEX[point.install_difficulty] : '#e5e7eb' }}
                            />
                          ))}
                        </span>
                        Install Difficulty: <strong>{DIFFICULTY_LABELS[point.install_difficulty]}</strong> ({point.install_difficulty}/5)
                      </p>
                    )}
                    {point.idf_point_id && (() => {
                      const idf = points.find(p => p.id === point.idf_point_id);
                      return idf ? (
                        <p className="text-gray-600 flex items-center gap-2">
                          <Link2 size={13} className="text-gray-400 shrink-0" />
                          Network Closet: <span className="font-medium">{idf.name || getSubcategoryName(idf.category, idf.subcategory)}{idf.floor ? ` (${idf.floor})` : ''}</span>
                        </p>
                      ) : null;
                    })()}
                    {(point.cable_type || point.cable_length) && point.category !== 'network' && (
                      <p className="text-gray-600 flex items-center gap-2">
                        <Cable size={13} className="text-gray-400 shrink-0" />
                        Cable: <span className="font-medium">{point.cable_type || 'TBD'}{point.cable_length ? ` — ${point.cable_length} ft` : ''}</span>
                      </p>
                    )}
                  </div>

                  {point.notes && (
                    <div className="mt-2 bg-gray-50 rounded-lg p-3">
                      <p className="text-sm text-gray-600 whitespace-pre-wrap">{point.notes}</p>
                    </div>
                  )}
                  {point.is_flagged && (
                    <div className="mt-2 bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
                      <Flag size={13} className="text-amber-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-amber-700 uppercase">Flagged — Action Required Before Install</p>
                        {point.flag_notes && <p className="text-sm text-amber-800 mt-0.5">{point.flag_notes}</p>}
                      </div>
                    </div>
                  )}

                  {/* Photos Grid */}
                  {point.photos && point.photos.length > 0 && (
                    <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-2">
                      {point.photos.map((photo) => (
                        <div key={photo.id} className="rounded-lg overflow-hidden border border-gray-200">
                          <img
                            src={`/uploads/${photo.thumbnail || photo.filename}`}
                            alt=""
                            className="w-full aspect-[4/3] object-cover"
                            loading="lazy"
                          />
                          <div className="px-2 py-1 bg-gray-50 text-[10px] text-gray-500 font-medium">
                            {getPhotoTypeName(photo.photo_type)}
                            {photo.notes && <span className="ml-1">— {photo.notes}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          );
        })}

        {/* Footer */}
        <div className="p-6 text-center text-xs text-gray-400">
          <p>Generated by Site Inspect — {format(new Date(), 'MMMM d, yyyy h:mm a')}</p>
          <p className="mt-1">Verkada Installation Survey Tool</p>
        </div>
      </div>
    </div>
  );
}
