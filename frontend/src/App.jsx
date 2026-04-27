import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  RefreshCw, Search, TrendingUp, BarChart2,
  AlertCircle, X, Activity, Database
} from 'lucide-react';
import TickerTypeList from './components/TickerTypeList';
import './App.css';

const API = 'http://localhost:8080/api';

// Infer a color class from type string
const typeColorMap = {
  'Common Stock': 'blue', 'CS': 'blue',
  'ETF': 'green', 'ETP': 'green',
  'ADR': 'purple', 'UNIT': 'amber',
  'RIGHT': 'amber', 'WARRANT': 'amber',
};
const typeColor = (t) => typeColorMap[t] || 'gray';

function StatCard({ label, value, colorClass = '', badge }) {
  return (
    <div className="stat-card">
      <div className="stat-label">{label}</div>
      <div className={`stat-value ${colorClass}`}>
        {typeof value === 'number' ? value.toLocaleString() : (value ?? '—')}
      </div>
      {badge && <div className="stat-badge"><Activity size={10} />{badge}</div>}
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="skeleton-grid">
      {Array.from({ length: 8 }).map((_, i) => (
        <div className="skeleton-card" key={i}>
          <div className="skel" style={{ width: '55%', height: '14px' }} />
          <div className="skel" style={{ width: '85%', height: '11px' }} />
          <div className="skel" style={{ width: '40%', height: '10px', marginTop: '0.75rem' }} />
        </div>
      ))}
    </div>
  );
}

export default function App() {
  const [stocks, setStocks]               = useState([]);
  const [loading, setLoading]             = useState(false);
  const [fetching, setFetching]           = useState(false);
  const [search, setSearch]               = useState('');
  const [showDropdown, setShowDropdown]   = useState(false);
  const [expandedTypes, setExpandedTypes] = useState({});
  const [selectedTicker, setSelectedTicker] = useState(null);
  const [error, setError]                 = useState(null);
  const [stats, setStats]                 = useState(null);

  /* ── initial load ── */
  useEffect(() => {
    loadTickers();
    loadStats();
  }, []);

  const loadTickers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API}/tickers`, { timeout: 30000 });
      setStocks(res.data.results || []);
    } catch (err) {
      console.error(err);
      setError('Could not load tickers from database. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const res = await axios.get(`${API}/tickers/stats`, { timeout: 10000 });
      setStats(res.data);
    } catch (err) {
      console.error('Stats fetch failed:', err);
    }
  };

  const triggerFetch = async () => {
    setFetching(true);
    setError(null);
    try {
      await axios.post(`${API}/tickers/fetch`, {}, { timeout: 120000 });
      await loadTickers();
      await loadStats();
    } catch (err) {
      setError('Fetch from Finnhub failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setFetching(false);
    }
  };

  /* ── derived data ── */
  const sorted = [...stocks].sort((a, b) => a.ticker.localeCompare(b.ticker));

  const filtered = search.trim()
    ? sorted.filter(s =>
        s.ticker.toLowerCase().includes(search.toLowerCase()) ||
        s.name?.toLowerCase().includes(search.toLowerCase()))
    : sorted;

  const grouped = filtered.reduce((acc, s) => {
    const t = s.type || 'Unknown';
    if (!acc[t]) acc[t] = [];
    acc[t].push(s);
    return acc;
  }, {});

  const typeKeys = Object.keys(grouped).sort((a, b) => {
    // Priority order
    const order = ['Common Stock', 'CS', 'ETF', 'ETP', 'ADR'];
    const ai = order.indexOf(a), bi = order.indexOf(b);
    if (ai !== -1 && bi !== -1) return ai - bi;
    if (ai !== -1) return -1;
    if (bi !== -1) return 1;
    return a.localeCompare(b);
  });

  const dropdownResults = filtered.slice(0, 80);

  const toggleType = (type) =>
    setExpandedTypes(prev => ({ ...prev, [type]: !prev[type] }));

  const selectTicker = (stock) => {
    setSelectedTicker(stock);
    setSearch(stock.ticker);
    setShowDropdown(false);
  };

  /* ── stat card values ── */
  const totalInDb = stats?.totalTickers ?? stocks.length;
  const csCount   = stats?.types?.CS ?? stats?.types?.['Common Stock'] ?? null;
  const etfCount  = stats?.types?.ETF ?? stats?.types?.ETP ?? null;

  return (
    <div className="dashboard">
      {/* ── NAVBAR ── */}
      <nav className="navbar">
        <div className="navbar-inner">
          <a className="logo" href="#">
            <div className="logo-icon">📈</div>
            <span className="logo-text">Stock<span>Analyze</span></span>
          </a>
          <div className="navbar-actions">
            <button
              className="btn btn-secondary"
              onClick={loadStats}
              disabled={loading || fetching}
              title="Refresh stats"
            >
              <Database size={15} />
              Stats
            </button>
            <button
              className="btn btn-primary"
              onClick={triggerFetch}
              disabled={loading || fetching}
            >
              {fetching
                ? <RefreshCw size={15} className="spin" />
                : <RefreshCw size={15} />}
              {fetching ? 'Syncing…' : 'Sync Finnhub'}
            </button>
          </div>
        </div>
      </nav>

      <div className="dashboard-inner">
        {/* ── HERO ── */}
        <div className="hero">
          <div className="hero-label">
            <span className="dot" />
            US Markets · Finnhub
          </div>
          <h1 className="hero-title">
            US Stock <span className="gradient-text">Symbol Explorer</span>
          </h1>
          <p className="hero-subtitle">
            Browse and search every listed US equity, ETF, ADR and more — synced live from Finnhub.
          </p>
        </div>

        {/* ── STAT CARDS ── */}
        <div className="stats-row">
          <StatCard label="Total Symbols" value={totalInDb} colorClass="blue" badge="in DB" />
          <StatCard label="Common Stocks" value={csCount} colorClass="green" />
          <StatCard label="ETFs / ETPs" value={etfCount} colorClass="purple" />
          <StatCard label="Showing" value={filtered.length} colorClass="amber" />
        </div>

        {/* ── ERROR ── */}
        {error && (
          <div className="error-banner">
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <div className="error-banner-title">Error</div>
              <div className="error-banner-msg">{error}</div>
            </div>
            <button
              className="btn btn-ghost"
              style={{ marginLeft: 'auto', padding: '0.25rem' }}
              onClick={() => setError(null)}
            ><X size={16} /></button>
          </div>
        )}

        {/* ── TOOLBAR ── */}
        <div className="toolbar">
          <div className="search-wrap">
            <Search className="search-icon" size={16} />
            <input
              id="stock-search"
              className="search-input"
              type="text"
              placeholder="Search symbol or company name…"
              value={search}
              onFocus={() => setShowDropdown(true)}
              onBlur={() => setTimeout(() => setShowDropdown(false), 160)}
              onChange={e => { setSearch(e.target.value); setSelectedTicker(null); setShowDropdown(true); }}
              autoComplete="off"
            />
            {showDropdown && dropdownResults.length > 0 && (
              <div className="search-dropdown" id="search-dropdown">
                {dropdownResults.map(s => (
                  <div
                    key={s.ticker}
                    className="dropdown-item"
                    onMouseDown={() => selectTicker(s)}
                  >
                    <span className="dropdown-ticker">{s.ticker}</span>
                    <span className="dropdown-name">{s.name}</span>
                    <span className="dropdown-badge">{s.type || '—'}</span>
                  </div>
                ))}
                {filtered.length > 80 && (
                  <div style={{ padding: '0.5rem 1rem', fontSize: '0.75rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border)' }}>
                    +{filtered.length - 80} more — narrow your search
                  </div>
                )}
              </div>
            )}
            {search && (
              <div className="search-hint">
                {filtered.length.toLocaleString()} result{filtered.length !== 1 ? 's' : ''} · click to select
              </div>
            )}
          </div>

          <button
            className="btn btn-secondary"
            onClick={loadTickers}
            disabled={loading}
          >
            {loading ? <RefreshCw size={15} className="spin" /> : <BarChart2 size={15} />}
            {loading ? 'Loading…' : 'Reload'}
          </button>
        </div>

        {/* ── SELECTED TICKER DETAIL ── */}
        {selectedTicker && (
          <div className="ticker-panel">
            <div className="ticker-panel-header">
              <div>
                <div className="ticker-panel-symbol">{selectedTicker.ticker}</div>
                <div className="ticker-panel-name">{selectedTicker.name}</div>
              </div>
              <button
                className="btn btn-ghost"
                style={{ padding: '0.35rem' }}
                onClick={() => { setSelectedTicker(null); setSearch(''); }}
              ><X size={18} /></button>
            </div>
            <div className="ticker-panel-grid">
              {[
                { label: 'Type',     value: selectedTicker.type || '—' },
                { label: 'Market',   value: selectedTicker.market || '—' },
                { label: 'Exchange', value: selectedTicker.primaryExchange || selectedTicker.primary_exchange || '—' },
                { label: 'Currency', value: selectedTicker.currencyName || selectedTicker.currency_name || '—' },
                { label: 'Status',   value: null, active: selectedTicker.active },
                { label: 'Locale',   value: selectedTicker.locale || '—' },
              ].map(f => (
                <div className="ticker-field" key={f.label}>
                  <span className="ticker-field-label">{f.label}</span>
                  {f.value !== null
                    ? <span className="ticker-field-value">{f.value}</span>
                    : <span className={`active-chip`} style={f.active ? {} : { color: 'var(--red)', background: 'var(--red-dim)', borderColor: 'rgba(239,68,68,0.25)' }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor', display: 'inline-block' }} />
                        {f.active ? 'Active' : 'Inactive'}
                      </span>
                  }
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── LOADING STATE ── */}
        {loading && (
          <div>
            <SkeletonGrid />
            <div className="loading-state">
              <div className="loading-icon" />
              <div className="loading-title">Loading symbols…</div>
              <div className="loading-sub">Fetching from database</div>
            </div>
          </div>
        )}

        {/* ── EMPTY STATE ── */}
        {!loading && stocks.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <div className="empty-title">No symbols in database</div>
            <div className="empty-sub">Click <strong>Sync Finnhub</strong> to populate the database.</div>
          </div>
        )}

        {/* ── NO RESULTS ── */}
        {!loading && stocks.length > 0 && filtered.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <div className="empty-title">No results for "{search}"</div>
            <div className="empty-sub">Try a different ticker or company name.</div>
          </div>
        )}

        {/* ── TICKER LISTS BY TYPE ── */}
        {!loading && typeKeys.map(type => (
          <TickerTypeList
            key={type}
            type={type}
            stocks={grouped[type]}
            isExpanded={!!expandedTypes[type]}
            toggleTypeExpand={toggleType}
            colorClass={typeColor(type)}
          />
        ))}
      </div>
    </div>
  );
}
