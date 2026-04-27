import React from 'react';
import { ChevronDown, ChevronUp, TrendingUp, TrendingDown } from 'lucide-react';

const CHIP_CLASS = {
  blue: 'chip chip-blue',
  green: 'chip chip-green',
  purple: 'chip chip-purple',
  amber: 'chip chip-blue',   // fallback to blue for amber
  gray: 'chip chip-gray',
};

const TickerTypeList = ({ type, stocks, isExpanded, toggleTypeExpand, colorClass = 'blue' }) => {
  const visibleStocks = isExpanded ? stocks : stocks.slice(0, 12);
  const hiddenCount = stocks.length - 12;

  return (
    <div className="type-section">
      {/* Section Header */}
      <div
        className="type-header"
        role="button"
        tabIndex={0}
        onClick={() => toggleTypeExpand(type)}
        onKeyDown={e => e.key === 'Enter' && toggleTypeExpand(type)}
      >
        <div className="type-title">
          <span className={CHIP_CLASS[colorClass] || 'chip chip-blue'} style={{ fontSize: '0.7rem' }}>
            {type || 'Unknown'}
          </span>
          <span className="type-count">{stocks.length.toLocaleString()}</span>
        </div>
        <ChevronDown
          size={16}
          className={`type-chevron${isExpanded ? ' expanded' : ''}`}
        />
      </div>

      {/* Cards Grid */}
      <div className="ticker-grid">
        {visibleStocks.map(stock => (
          <TickerCard key={stock.ticker} stock={stock} colorClass={colorClass} />
        ))}
      </div>

      {/* Show more / less */}
      {hiddenCount > 0 && (
        <button
          className="show-more-btn"
          onClick={() => toggleTypeExpand(type)}
        >
          {isExpanded
            ? <><ChevronUp size={14} /> Show less</>
            : <><ChevronDown size={14} /> Show {hiddenCount.toLocaleString()} more</>}
        </button>
      )}
    </div>
  );
};

function TickerCard({ stock, colorClass }) {
  const chipClass = CHIP_CLASS[colorClass] || 'chip chip-blue';

  return (
    <div className="ticker-card" id={`ticker-${stock.ticker}`}>
      <div className="card-symbol">{stock.ticker}</div>
      <div className="card-name" title={stock.name}>{stock.name || '—'}</div>

      <div className="card-footer">
        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
          {stock.market && (
            <span className={chipClass}>{stock.market}</span>
          )}
          {stock.primaryExchange || stock.primary_exchange ? (
            <span className="chip chip-gray">
              {stock.primaryExchange || stock.primary_exchange}
            </span>
          ) : null}
          {stock.currencyName || stock.currency_name ? (
            <span className="chip chip-gray">
              {stock.currencyName || stock.currency_name}
            </span>
          ) : null}
        </div>

        <div className={stock.active !== false ? 'card-active' : 'card-inactive'}>
          {stock.active !== false
            ? <><TrendingUp size={11} />Active</>
            : <><TrendingDown size={11} />Inactive</>}
        </div>
      </div>
    </div>
  );
}

export default TickerTypeList;
