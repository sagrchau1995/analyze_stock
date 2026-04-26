import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { RefreshCw, Search, TrendingUp } from 'lucide-react';
import './App.css';

function App() {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('stocks');

  const fetchStocks = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:8080/api/tickers`, {
        params: {
          market: filter,
          limit: 100
        }
      });
      setStocks(response.data.results || []);
    } catch (error) {
      console.error('Error fetching stocks:', error);
      // Fallback data for demo if backend is not running
      // setStocks([{ ticker: 'AAPL', name: 'Apple Inc.', market: 'stocks', type: 'CS', active: true }]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStocks();
  }, [filter]);

  const filteredStocks = stocks.filter(stock =>
    stock.ticker.toLowerCase().includes(search.toLowerCase()) ||
    stock.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="dashboard">
      <div className="header">
        <div>
          <h1 style={{ margin: 0, fontSize: '1.875rem', fontWeight: 800, color: '#f8fafc' }}>
            Stock <span style={{ color: '#3b82f6' }}>Analyze</span>
          </h1>
          <p style={{ color: '#94a3b8', marginTop: '0.25rem' }}>Real-time market insights from Massive API</p>
        </div>
        <button className="btn-fetch" onClick={fetchStocks} disabled={loading}>
          {loading ? <RefreshCw className="loading-spinner" size={18} /> : <RefreshCw size={18} />}
          Fetch Live
        </button>
      </div>

      <div className="glass-card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} size={18} />
            <input
              type="text"
              placeholder="Search ticker or company..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem 0.75rem 2.5rem',
                borderRadius: '0.5rem',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                background: 'rgba(15, 23, 42, 0.5)',
                color: 'white',
                outline: 'none'
              }}
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{
              padding: '0.75rem',
              borderRadius: '0.5rem',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              background: 'rgba(15, 23, 42, 0.5)',
              color: 'white',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="stocks">Stocks</option>
            <option value="crypto">Crypto</option>
            <option value="fx">Forex</option>
            <option value="indices">Indices</option>
          </select>
        </div>
      </div>

      <div className="glass-card">
        <table className="stock-table">
          <thead>
            <tr>
              <th>Ticker</th>
              <th>Name</th>
              <th>Market</th>
              <th>Type</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredStocks.map((stock) => (
              <tr key={stock.ticker}>
                <td className="stock-ticker">{stock.ticker}</td>
                <td>{stock.name}</td>
                <td><span className="category-tag">{stock.market}</span></td>
                <td>{stock.type}</td>
                <td>
                  <span style={{
                    color: stock.active ? '#10b981' : '#ef4444',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    fontSize: '0.875rem'
                  }}>
                    <TrendingUp size={14} />
                    {stock.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
              </tr>
            ))}
            {filteredStocks.length === 0 && !loading && (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                  No tickers found. Click "Fetch Live" to refresh.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;
