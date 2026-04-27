import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { RefreshCw, Search, TrendingUp, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import TickerTypeList from './components/TickerTypeList';
import './App.css';

function App() {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [expandedTypes, setExpandedTypes] = useState({});
  const [selectedTicker, setSelectedTicker] = useState(null);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [stats, setStats] = useState(null);

  const fetchStocks = async (attempt = 0) => {
    setLoading(true);
    setError(null);
    try {
      // First, trigger comprehensive data fetch and storage
      if (stocks.length === 0) { // Only fetch from API if we don't have data
        console.log('Triggering comprehensive data fetch...');
        const fetchResponse = await axios.post(`http://localhost:8080/api/tickers/fetch`, {}, {
          timeout: 600000 // 10 minutes for comprehensive fetch
        });
        console.log('Data fetch completed:', fetchResponse.data);
      }

      // Then get data from database
      const response = await axios.get(`http://localhost:8080/api/tickers`, {
        params: {
          limit: 5000
        },
        timeout: 300000 // 5 minutes timeout for database query
      });
      setStocks(response.data.results || []);
      setRetryCount(attempt);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching stocks (attempt ' + (attempt + 1) + '):', err);

      // Retry logic: max 2 attempts (initial + 1 retry)
      if (attempt < 1) {
        setError(`First attempt failed. Retrying... (Attempt 2/2)`);
        setTimeout(() => {
          fetchStocks(attempt + 1);
        }, 10000); // Wait 10 seconds before retry
      } else {
        setError(`Failed to fetch tickers after 2 attempts. Please try again later.`);
        setStocks([]);
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/api/tickers`, { timeout: 300000 });
        setStocks(response.data.results || []);
      } catch (err) {
        console.error('Error loading initial tickers:', err);
      }
    };

    loadInitialData();
    fetchStats();
  }, []);

  const sortedStocks = [...stocks].sort((a, b) => a.ticker.localeCompare(b.ticker));

  // Group stocks by type
  const groupedStocks = sortedStocks.reduce((acc, stock) => {
    const type = stock.type || 'Unknown';
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(stock);
    return acc;
  }, {});

  const dropdownStocks = search
    ? sortedStocks.filter(stock =>
        stock.ticker.toLowerCase().includes(search.toLowerCase()) ||
        stock.name.toLowerCase().includes(search.toLowerCase())
      )
    : sortedStocks;

  // Filter grouped stocks by search
  const filteredGroupedStocks = Object.keys(groupedStocks).reduce((acc, type) => {
    const filtered = groupedStocks[type].filter(stock =>
      stock.ticker.toLowerCase().includes(search.toLowerCase()) ||
      stock.name.toLowerCase().includes(search.toLowerCase())
    );
    if (filtered.length > 0) {
      acc[type] = filtered;
    }
    return acc;
  }, {});

  const typeKeys = Object.keys(filteredGroupedStocks).sort();

  const searchResults = dropdownStocks;

  const fetchStats = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/api/tickers/stats`);
      setStats(response.data);
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError('Failed to fetch statistics');
    }
  };

  const toggleTypeExpand = (type) => {
    setExpandedTypes((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  return (
    <div className="dashboard">
      <div className="header">
        <div>
          <h1 style={{ margin: 0, fontSize: '1.875rem', fontWeight: 800, color: '#f8fafc' }}>
            Stock <span style={{ color: '#3b82f6' }}>Analyze</span>
          </h1>
          <p style={{ color: '#94a3b8', marginTop: '0.25rem' }}>Real-time market insights from Massive API</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button className="btn-fetch" onClick={fetchStocks} disabled={loading}>
            {loading ? <RefreshCw className="loading-spinner" size={18} /> : <RefreshCw size={18} />}
            Fetch all ticker
          </button>
          <button 
            className="btn-fetch" 
            onClick={fetchStats} 
            disabled={loading}
            style={{ background: 'rgba(34, 197, 94, 0.8)', border: '1px solid rgba(34, 197, 94, 0.3)' }}
          >
            View Stats
          </button>
        </div>
      </div>

      <div className="glass-card" style={{ marginBottom: '2rem' }}>
        <div style={{ position: 'relative', minWidth: '280px' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: '#94a3b8', fontSize: '0.875rem' }}>
            Search ticker (dropdown)
          </label>
          <Search style={{ position: 'absolute', left: '0.75rem', top: '3.25rem', color: '#64748b' }} size={18} />
          <input
            type="text"
            placeholder="Search ticker symbol or company name..."
            value={search}
            onFocus={() => setShowDropdown(true)}
            onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
            onChange={(e) => {
              setSearch(e.target.value);
              setSelectedTicker(null);
              setShowDropdown(true);
            }}
            style={{
              width: '100%',
              padding: '0.75rem 1rem 0.75rem 2.5rem',
              borderRadius: '0.5rem',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              background: 'rgba(15, 23, 42, 0.5)',
              color: 'white',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />

          {showDropdown && searchResults.length > 0 && (
            <div style={{
              position: 'absolute',
              top: '5.5rem',
              left: 0,
              right: 0,
              background: 'rgba(15, 23, 42, 0.95)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '0.75rem',
              maxHeight: '420px',
              overflowY: 'auto',
              zIndex: 10,
              boxShadow: '0 12px 32px rgba(0, 0, 0, 0.35)'
            }}>
              {searchResults.map((stock) => (
                <div
                  key={stock.ticker}
                  onDoubleClick={() => {
                    setSelectedTicker(stock);
                    setSearch(stock.ticker);
                    setShowDropdown(false);
                  }}
                  style={{
                    padding: '0.9rem 1rem',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                    <span style={{ color: '#f8fafc', fontWeight: 700 }}>{stock.ticker}</span>
                    <span style={{ color: '#94a3b8' }}>{stock.type || 'Unknown'}</span>
                  </div>
                  <div style={{ color: '#cbd5e1', fontSize: '0.9rem', marginTop: '0.25rem' }}>{stock.name}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {search && (
          <div style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#94a3b8' }}>
            Found: {searchResults.length} results (double-click to view details)
          </div>
        )}
      </div>

      {error && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '0.5rem',
          padding: '1rem',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          color: '#fca5a5'
        }}>
          <AlertCircle size={20} />
          <div>
            <p style={{ margin: '0 0 0.5rem 0', fontWeight: 600 }}>Error</p>
            <p style={{ margin: 0, fontSize: '0.875rem' }}>{error}</p>
          </div>
        </div>
      )}

      {stats && (
        <div className="glass-card" style={{ marginBottom: '2rem' }}>
          <h3 style={{ margin: '0 0 1rem 0', color: '#e2e8f0' }}>Database Statistics</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3b82f6' }}>{stats.totalTickers?.toLocaleString() || 0}</div>
              <div style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Total Tickers</div>
            </div>
            {stats.types && Object.entries(stats.types).map(([type, count]) => (
              <div key={type} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>{count.toLocaleString()}</div>
                <div style={{ color: '#94a3b8', fontSize: '0.875rem' }}>{type} Tickers</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedTicker && (
        <div className="glass-card" style={{ marginBottom: '2rem' }}>
          <h3 style={{ margin: '0 0 1rem 0', color: '#e2e8f0' }}>Ticker details: {selectedTicker.ticker}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            <div style={{ color: '#cbd5e1' }}><strong>Name:</strong> {selectedTicker.name}</div>
            <div style={{ color: '#cbd5e1' }}><strong>Type:</strong> {selectedTicker.type || 'Unknown'}</div>
            <div style={{ color: '#cbd5e1' }}><strong>Market:</strong> {selectedTicker.market}</div>
            <div style={{ color: '#cbd5e1' }}><strong>Active:</strong> {selectedTicker.active ? 'Yes' : 'No'}</div>
            <div style={{ color: '#cbd5e1' }}><strong>Locale:</strong> {selectedTicker.locale || 'N/A'}</div>
            <div style={{ color: '#cbd5e1' }}><strong>Currency:</strong> {selectedTicker.currency_name || 'N/A'}</div>
            <div style={{ color: '#cbd5e1' }}><strong>Primary Exchange:</strong> {selectedTicker.primary_exchange || 'N/A'}</div>
            <div style={{ color: '#cbd5e1' }}><strong>CIK:</strong> {selectedTicker.cik || 'N/A'}</div>
            <div style={{ color: '#cbd5e1' }}><strong>Updated:</strong> {selectedTicker.last_updated_utc || 'N/A'}</div>
          </div>
        </div>
      )}

      {loading && (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
          <RefreshCw className="loading-spinner" size={24} style={{ margin: '0 auto', marginBottom: '0.5rem' }} />
          <p style={{ margin: '0.5rem 0 0 0' }}>Fetching comprehensive ticker data from API and storing in database...</p>
          <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem' }}>This may take 5-10 minutes (includes API rate limiting and parallel processing)</p>
        </div>
      )}

      {!loading && Object.keys(filteredGroupedStocks).length === 0 && (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
          No tickers found. Try adjusting your search or click "Fetch Live" to refresh.
        </div>
      )}

      {!loading && typeKeys.map((type) => (
        <TickerTypeList
          key={type}
          type={type}
          stocks={filteredGroupedStocks[type]}
          isExpanded={expandedTypes[type]}
          toggleTypeExpand={toggleTypeExpand}
        />
      ))}
    </div>
  );
}

export default App;
