import React, { useState, useEffect, useMemo } from 'react';
import { 
  RefreshCw, 
  AlertCircle, 
  Layers, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight, 
  Sparkles 
} from 'lucide-react';
import styles from '../../../pages/pages.module.css';
import { 
  getCategories, 
  getSymbols, 
  type CategoryResponse, 
  type StockSymbolResponse 
} from '../../../utils/api';

interface HeatmapCategory {
  id: number;
  name: string;
  symbolCount: number;
  performance: number; // Daily change %
  weight: number;      // Est weight
  symbols: string[];
}

// Generate consistent mock performance based on string hash
const getMockCategoryData = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const pct = (hash % 500) / 100; // range: -5.00% to +5.00%
  const weight = Math.abs((hash % 200) / 10) + 1; // range: 1.0% to 21.0%
  return {
    pct: parseFloat(pct.toFixed(2)),
    weight: parseFloat(weight.toFixed(1))
  };
};

export const CategoriesHeatmap: React.FC = () => {
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [symbols, setSymbols] = useState<StockSymbolResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Interactive sorting & filtering
  const [sortBy, setSortBy] = useState<'name' | 'size' | 'performance'>('performance');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [cats, syms] = await Promise.all([
        getCategories(),
        getSymbols()
      ]);
      setCategories(cats || []);
      setSymbols(syms || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch categories. Verify backend status.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Compute heatmap details
  const heatmapData = useMemo<HeatmapCategory[]>(() => {
    return categories.map(cat => {
      const catSymbols = symbols.filter(s => s.category === cat.name);
      const mock = getMockCategoryData(cat.name);
      return {
        id: cat.id,
        name: cat.name,
        symbolCount: catSymbols.length,
        performance: mock.pct,
        weight: mock.weight,
        symbols: catSymbols.map(s => s.symbol)
      };
    });
  }, [categories, symbols]);

  // Sort heatmap blocks
  const sortedData = useMemo(() => {
    const data = [...heatmapData];
    if (sortBy === 'name') {
      return data.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'size') {
      return data.sort((a, b) => b.symbolCount - a.symbolCount);
    } else {
      return data.sort((a, b) => b.performance - a.performance);
    }
  }, [heatmapData, sortBy]);

  const selectedCategory = useMemo(() => {
    return heatmapData.find(c => c.id === selectedCategoryId);
  }, [heatmapData, selectedCategoryId]);

  // Helper to determine background color based on daily performance
  const getCellStyles = (perf: number, isSelected: boolean) => {
    const abs = Math.abs(perf);
    const alpha = Math.min(0.1 + (abs / 5) * 0.85, 0.95); // Scale alpha based on intensity
    
    let backgroundColor = 'var(--bg-tertiary)';
    let color = 'var(--text-secondary)';
    let borderColor = 'var(--border-color)';

    if (perf > 0) {
      backgroundColor = `rgba(16, 185, 129, ${alpha})`;
      color = perf > 2 ? '#ffffff' : 'var(--accent-success)';
    } else if (perf < 0) {
      backgroundColor = `rgba(239, 68, 68, ${alpha})`;
      color = perf < -2 ? '#ffffff' : 'var(--accent-error)';
    }

    if (isSelected) {
      borderColor = 'var(--primary)';
    }

    return {
      backgroundColor,
      color,
      borderColor
    };
  };

  return (
    <div>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .spin-icon {
          animation: spin 1s linear infinite;
        }
        .heatmap-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 16px;
          margin-top: 20px;
        }
        .heatmap-cell {
          border-radius: var(--radius-md);
          border: 2px solid transparent;
          padding: 16px;
          min-height: 120px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          cursor: pointer;
          transition: transform var(--transition-fast), box-shadow var(--transition-fast), border-color var(--transition-fast);
          box-shadow: var(--shadow-sm);
        }
        .heatmap-cell:hover {
          transform: translateY(-4px) scale(1.02);
          box-shadow: var(--shadow-lg);
          z-index: 10;
        }
        .heatmap-pill {
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 700;
          display: inline-flex;
          align-items: center;
          gap: 2px;
        }
      `}</style>

      {/* Header */}
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Sector Heatmap</h1>
        <p className={styles.pageSubtitle}>Visualize sector sizes and daily price shifts across database stock categories.</p>
      </div>

      {/* Control Card */}
      <div className={styles.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          {/* Sorting controls */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Sort By:</span>
            <button
              onClick={() => setSortBy('performance')}
              className={styles.input}
              style={{
                padding: '6px 12px',
                fontSize: '12px',
                cursor: 'pointer',
                fontWeight: sortBy === 'performance' ? 700 : 500,
                backgroundColor: sortBy === 'performance' ? 'var(--primary-light)' : 'transparent',
                color: sortBy === 'performance' ? 'var(--primary)' : 'var(--text-secondary)',
                borderColor: sortBy === 'performance' ? 'var(--primary)' : 'var(--border-color)'
              }}
            >
              Performance
            </button>
            <button
              onClick={() => setSortBy('size')}
              className={styles.input}
              style={{
                padding: '6px 12px',
                fontSize: '12px',
                cursor: 'pointer',
                fontWeight: sortBy === 'size' ? 700 : 500,
                backgroundColor: sortBy === 'size' ? 'var(--primary-light)' : 'transparent',
                color: sortBy === 'size' ? 'var(--primary)' : 'var(--text-secondary)',
                borderColor: sortBy === 'size' ? 'var(--primary)' : 'var(--border-color)'
              }}
            >
              Company Count
            </button>
            <button
              onClick={() => setSortBy('name')}
              className={styles.input}
              style={{
                padding: '6px 12px',
                fontSize: '12px',
                cursor: 'pointer',
                fontWeight: sortBy === 'name' ? 700 : 500,
                backgroundColor: sortBy === 'name' ? 'var(--primary-light)' : 'transparent',
                color: sortBy === 'name' ? 'var(--primary)' : 'var(--text-secondary)',
                borderColor: sortBy === 'name' ? 'var(--primary)' : 'var(--border-color)'
              }}
            >
              Name
            </button>
          </div>

          <button
            onClick={fetchData}
            className={styles.input}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '8px 14px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '13px'
            }}
            disabled={loading}
          >
            <RefreshCw size={14} className={loading ? 'spin-icon' : ''} />
            Refresh
          </button>
        </div>

        {/* Offline warnings */}
        {error && (
          <div style={{
            backgroundColor: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid var(--accent-error)',
            borderRadius: 'var(--radius-md)',
            padding: '16px',
            marginTop: '20px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
            color: 'var(--accent-error)'
          }}>
            <AlertCircle style={{ flexShrink: 0, marginTop: '2px' }} size={20} />
            <div>
              <h4 style={{ fontWeight: 700, marginBottom: '4px', fontSize: '14px' }}>API Connection Error</h4>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {error} Ensure that the Spring Boot server is running on <code style={{ fontWeight: 600 }}>http://localhost:8080</code>.
              </p>
            </div>
          </div>
        )}

        {/* Categories Heatmap Grid */}
        {loading && categories.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '64px 0', gap: '12px' }}>
            <RefreshCw size={32} className="spin-icon" style={{ color: 'var(--primary)' }} />
            <span style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: 500 }}>Generating heatmap...</span>
          </div>
        ) : categories.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '64px 0', gap: '12px', color: 'var(--text-muted)' }}>
            <Layers size={36} style={{ opacity: 0.4 }} />
            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)' }}>No categories found in database</span>
          </div>
        ) : (
          <div className="heatmap-grid">
            {sortedData.map(cat => {
              const isSelected = selectedCategoryId === cat.id;
              const cellStyle = getCellStyles(cat.performance, isSelected);
              const isWhiteText = cat.performance > 2 || cat.performance < -2;
              
              return (
                <div
                  key={cat.id}
                  className="heatmap-cell"
                  style={{
                    backgroundColor: cellStyle.backgroundColor,
                    borderColor: cellStyle.borderColor
                  }}
                  onClick={() => setSelectedCategoryId(isSelected ? null : cat.id)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%', gap: '8px' }}>
                    <span style={{ 
                      fontWeight: 700, 
                      fontSize: '14px', 
                      color: isWhiteText ? '#ffffff' : 'var(--text-primary)',
                      lineHeight: 1.3
                    }}>
                      {cat.name}
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', width: '100%' }}>
                    <span style={{ 
                      fontSize: '12px', 
                      color: isWhiteText ? 'rgba(255, 255, 255, 0.8)' : 'var(--text-secondary)',
                      fontWeight: 500
                    }}>
                      {cat.symbolCount} {cat.symbolCount === 1 ? 'symbol' : 'symbols'}
                    </span>

                    <span 
                      className="heatmap-pill"
                      style={{
                        backgroundColor: isWhiteText ? 'rgba(255, 255, 255, 0.2)' : (cat.performance >= 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'),
                        color: isWhiteText ? '#ffffff' : cellStyle.color
                      }}
                    >
                      {cat.performance >= 0 ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                      {cat.performance >= 0 ? `+${cat.performance}%` : `${cat.performance}%`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Selected Category Details Card */}
      {selectedCategory && (
        <div className={styles.card} style={{ marginTop: '24px', animation: 'fadeIn 0.2s ease-out' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <TrendingUp size={20} style={{ color: 'var(--primary)' }} />
              <h3 className={styles.sectionTitle} style={{ margin: 0 }}>{selectedCategory.name} Analysis</h3>
            </div>
            <span 
              className={`${styles.badge} ${selectedCategory.performance >= 0 ? styles.badgeSuccess : styles.badgeError}`}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '6px 12px', fontSize: '13px' }}
            >
              {selectedCategory.performance >= 0 ? '+' : ''}{selectedCategory.performance}% Daily change
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '24px' }}>
            <div style={{ backgroundColor: 'var(--bg-tertiary)', padding: '16px', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>LISTED COMPANIES</span>
              <span style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)' }}>{selectedCategory.symbolCount}</span>
            </div>
            <div style={{ backgroundColor: 'var(--bg-tertiary)', padding: '16px', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>EST. SECTOR WEIGHTAGE</span>
              <span style={{ fontSize: '24px', fontWeight: 800, color: 'var(--primary)' }}>{selectedCategory.weight}%</span>
            </div>
          </div>

          {/* Registered Symbols */}
          <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '12px' }}>Registered Stock Symbols</h4>
          {selectedCategory.symbols.length === 0 ? (
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No stock symbols are currently mapped to this category.</p>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {selectedCategory.symbols.map(sym => (
                <span 
                  key={sym} 
                  style={{
                    backgroundColor: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '6px 12px',
                    fontSize: '13px',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Sparkles size={12} style={{ color: 'var(--primary)' }} />
                  {sym}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CategoriesHeatmap;
