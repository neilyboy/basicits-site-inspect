import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Plus, MapPin, Camera, ChevronRight, ClipboardList, Building2 } from 'lucide-react';
import { api } from '../utils/api';
import { format } from 'date-fns';

const STATUS_TABS = [
  { id: 'all', label: 'All' },
  { id: 'active', label: 'Active' },
  { id: 'completed', label: 'Completed' },
];

export default function Home() {
  const [sites, setSites] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadSites();
  }, [statusFilter, search]);

  async function loadSites() {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (search) params.search = search;
      const data = await api.getSites(params);
      setSites(data);
    } catch (err) {
      console.error('Failed to load sites:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="header">
        <ClipboardList size={24} />
        <div className="flex-1">
          <h1 className="text-lg font-bold">Basic ITS</h1>
          <p className="text-xs text-slate-300 dark:text-slate-400">Site Inspect — Verkada Surveys</p>
        </div>
      </div>

      {/* Search */}
      <div className="px-4 pt-4 pb-2">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search sites..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10"
          />
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="px-4 pb-3 flex gap-2">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setStatusFilter(tab.id)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
              statusFilter === tab.id
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-200 dark:shadow-none'
                : 'bg-white/80 text-gray-500 border border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Site List */}
      <div className="px-4 space-y-3">
        {loading ? (
          <div className="text-center py-12 text-gray-400">
            <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-3" />
            Loading...
          </div>
        ) : sites.length === 0 ? (
          <div className="text-center py-16">
            <Building2 size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-500 dark:text-gray-400 mb-1">No Site Surveys Yet</h3>
            <p className="text-sm text-gray-400 dark:text-gray-500 mb-6">
              Tap the + button to start a new site inspection
            </p>
            <Link to="/sites/new" className="btn-primary inline-flex">
              <Plus size={18} />
              New Site Survey
            </Link>
          </div>
        ) : (
          sites.map((site) => (
            <Link
              key={site.id}
              to={`/sites/${site.id}`}
              className="card block p-4 active:scale-[0.99] active:bg-gray-50/80 dark:active:bg-gray-700/50 transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate text-[15px]">{site.name}</h3>
                    <span
                      className={`shrink-0 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide ${
                        site.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
                          : 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400'
                      }`}
                    >
                      {site.status}
                    </span>
                  </div>
                  {site.address && (
                    <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1.5 mb-2">
                      <MapPin size={11} className="shrink-0" />
                      {site.address}
                    </p>
                  )}
                  <div className="flex items-center gap-3 text-[11px] text-gray-400 dark:text-gray-500">
                    <span className="flex items-center gap-1">
                      <Camera size={11} />
                      {site.point_count} point{site.point_count !== 1 ? 's' : ''}
                    </span>
                    <span>{site.photo_count} photo{site.photo_count !== 1 ? 's' : ''}</span>
                    <span>{format(new Date(site.updated_at + 'Z'), 'MMM d, yyyy')}</span>
                  </div>
                </div>
                <ChevronRight size={18} className="text-gray-300 dark:text-gray-600 shrink-0 mt-0.5" />
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
