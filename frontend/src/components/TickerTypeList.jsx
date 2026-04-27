import React from 'react';
import { TrendingUp, ChevronDown, ChevronUp } from 'lucide-react';

const TickerTypeList = ({ type, stocks, isExpanded, toggleTypeExpand }) => {
  const visibleStocks = isExpanded ? stocks : stocks.slice(0, 10);
  const hiddenCount = stocks.length - 10;

  return (
    <div style={{ marginBottom: '2rem' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1rem',
        paddingBottom: '0.5rem',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <h2 style={{ margin: 0, color: '#e2e8f0', fontSize: '1.25rem' }}>
          {type || 'Unknown'} <span style={{ color: '#64748b', fontSize: '0.875rem' }}>({stocks.length})</span>
        </h2>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '1rem',
        marginBottom: hiddenCount > 0 ? '1rem' : 0
      }}>
        {visibleStocks.map((stock) => (
          <div key={stock.ticker} className="glass-card" style={{
            padding: '1rem',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            background: 'rgba(30, 41, 59, 0.4)'
          }}>
            <div style={{ marginBottom: '0.5rem' }}>
              <div style={{
                fontSize: '1.125rem',
                fontWeight: 700,
                color: '#3b82f6'
              }}>
                {stock.ticker}
              </div>
              <div style={{
                fontSize: '0.875rem',
                color: '#cbd5e1',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {stock.name}
              </div>
            </div>

            <div style={{
              display: 'flex',
              gap: '0.5rem',
              marginBottom: '0.75rem',
              flexWrap: 'wrap'
            }}>
              <span className="category-tag" style={{ fontSize: '0.75rem' }}>
                {stock.market}
              </span>
              {stock.locale && (
                <span className="category-tag" style={{ fontSize: '0.75rem' }}>
                  {stock.locale}
                </span>
              )}
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.875rem',
              color: stock.active ? '#10b981' : '#ef4444'
            }}>
              <TrendingUp size={14} />
              {stock.active ? 'Active' : 'Inactive'}
            </div>
          </div>
        ))}
      </div>

      {hiddenCount > 0 && (
        <button
          onClick={() => toggleTypeExpand(type)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1rem',
            borderRadius: '0.5rem',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            background: 'rgba(15, 23, 42, 0.5)',
            color: '#3b82f6',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: 600,
            transition: 'all 0.3s ease'
          }}
        >
          {isExpanded ? (
            <>
              <ChevronUp size={16} />
              Show less
            </>
          ) : (
            <>
              <ChevronDown size={16} />
              Show {hiddenCount} more
            </>
          )}
        </button>
      )}
    </div>
  );
};

export default TickerTypeList;
