import React, { useState, useEffect, useMemo } from 'react';
import { 
  RefreshCw, 
  AlertCircle, 
  GitBranch, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight, 
  Sparkles,
  Filter
} from 'lucide-react';
import styles from '../../../pages/pages.module.css';
import { 
  getSubcategories, 
  getCategories,
  getSymbols, 
  type SubcategoryResponse, 
  type CategoryResponse,
  type StockSymbolResponse 
} from '../../../utils/api';

interface HeatmapSubcategory {
  id: number;
  name: string;
  categoryId: number;
  categoryName: string;
  symbolCount: number;
  performance: number; // Daily change %
  symbols: string[];
}

// Generate consistent mock performance based on subcategory string hash
const getMockSubcategoryData = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const pct = (hash % 600) / 100; // range: -6.00% to +6.00%
  return {
    pct: parseFloat(pct.toFixed(2))
  };
};

export const SubcategoriesHeatmap: React.FC = () => {
  const [subcategories, setSubcategories] = useState<SubcategoryResponse[]>([]);
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [symbols, setSymbols] = useState<StockSymbolResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Interactive sorting & filtering
  const [sortBy, setSortBy] = useState<'name' | 'size' | 'performance'>('performance');
  const [filterCategoryId, setFilterCategoryId] = useState<string>('all');
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<number | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [subs, cats, syms] = await Promise.all([
        getSubcategories(),
        getCategories(),
        getSymbols()
      ]);
      setSubcategories(subs || []);
      setCategories(cats || []);
      setSymbols(syms || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch subcategories. Verify backend status.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Compute heatmap details
  const heatmapData = useMemo<HeatmapSubcategory[]>(() => {
    return subcategories.map(sub => {
      const subSymbols = symbols.filter(s => s.subcategory === sub.name);
      const mock = getMockSubcategoryData(sub.name);
      
      // Attempt to resolve categoryName if empty in response
      let resolvedCategoryName = sub.categoryName;
      if (!resolvedCategoryName) {
        const cat = categories.find(c => c.id === sub.categoryId);
        resolvedCategoryName = cat ? cat.name : `Category #${sub.categoryId}`;
      }

      return {
        id: sub.id,
        name: sub.name,
        categoryId: sub.categoryId,
        categoryName: resolvedCategoryName,
        symbolCount: subSymbols.length,
        performance: mock.pct,
        symbols: subSymbols.map(s => s.symbol)
      };
    });
  }, [subcategories, categories, symbols]);

  // Filter based on selected category
  const filteredData = useMemo(() => {
    if (filterCategoryId === 'all') return heatmapData;
    const catIdNum = parseInt(filterCategoryId, 10);
    return heatmapData.filter(s => s.categoryId === catIdNum);
  }, [heatmapData, filterCategoryId]);

  // Sort heatmap blocks
  const sortedData = useMemo(() => {
    const data = [...filteredData];
    if (sortBy === 'name') {
      return data.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'size') {
      return data.sort((a, b) => b.symbolCount - a.symbolCount);
    } else {
      return data.sort((a, b) => b.performance - a.performance);
    }
  }, [filteredData, sortBy]);

  const selectedSubcategory = useMemo(() => {
    return heatmapData.find(s => s.id === selectedSubcategoryId);
  }, [heatmapData, selectedSubcategoryId]);

  // Helper to determine background color based on daily performance
  const getCellStyles = (perf: number, isSelected: boolean) => {
    const abs = Math.abs(perf);
    const alpha = Math.min(0.1 + (abs / 6) * 0.85, 0.95);
    
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
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 16px;
          margin-top: 20px;
        }
        .heatmap-cell {
          border-radius: var(--radius-md);
          border: 2px solid transparent;
          padding: 16px;
          min-height: 130px;
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
        .filter-select {
          height: 38px;
          padding: 0 10px;
          font-size: 13px;
          border-radius: var(--radius-md);
          border: 1px solid var(--border-color);
          background-color: var(--bg-tertiary);
          color: var(--text-primary);
          outline: none;
          cursor: pointer;
          font-family: inherit;
          font-weight: 500;
          transition: border-color var(--transition-fast);
        }
        .filter-select:focus {
          border-color: var(--primary);
        }
      `}</style>

      {/* Header */}
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Subcategory Heatmap</h1>
        <p className={styles.pageSubtitle}>Drill down into industry subcategories, weights, and daily swings.</p>
      </div>

      {/* Control Card */}
      <div className={styles.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          
          {/* Filters & Sorting */}
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Category Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Filter size={16} style={{ color: 'var(--text-muted)' }} />
              <select
                className="filter-select"
                value={filterCategoryId}
                onChange={(e) => setFilterCategoryId(e.target.value)}
                disabled={loading}
              >
                <option value="all">All Sectors</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Sorting controls */}
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
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
                Stock Count
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

        {/* Subcategories Heatmap Grid */}
        {loading && subcategories.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '64px 0', gap: '12px' }}>
            <RefreshCw size={32} className="spin-icon" style={{ color: 'var(--primary)' }} />
            <span style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: 500 }}>Generating heatmap...</span>
          </div>
        ) : sortedData.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '64px 0', gap: '12px', color: 'var(--text-muted)' }}>
            <GitBranch size={36} style={{ opacity: 0.4 }} />
            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)' }}>
              {subcategories.length === 0 ? 'No subcategories found in database' : 'No subcategories match filter criteria'}
            </span>
          </div>
        ) : (
          <div className="heatmap-grid">
            {sortedData.map(sub => {
              const isSelected = selectedSubcategoryId === sub.id;
              const cellStyle = getCellStyles(sub.performance, isSelected);
              const isWhiteText = sub.performance > 2 || sub.performance < -2;
              
              return (
                <div
                  key={sub.id}
                  className="heatmap-cell"
                  style={{
                    backgroundColor: cellStyle.backgroundColor,
                    borderColor: cellStyle.borderColor
                  }}
                  onClick={() => setSelectedSubcategoryId(isSelected ? null : sub.id)}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', width: '100%', gap: '4px' }}>
                    <span style={{ 
                      fontWeight: 700, 
                      fontSize: '14px', 
                      color: isWhiteText ? '#ffffff' : 'var(--text-primary)',
                      lineHeight: 1.3
                    }}>
                      {sub.name}
                    </span>
                    <span style={{ 
                      fontSize: '11px', 
                      color: isWhiteText ? 'rgba(255, 255, 255, 0.7)' : 'var(--text-muted)',
                      fontWeight: 600
                    }}>
                      {sub.categoryName}
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', width: '100%' }}>
                    <span style={{ 
                      fontSize: '12px', 
                      color: isWhiteText ? 'rgba(255, 255, 255, 0.8)' : 'var(--text-secondary)',
                      fontWeight: 500
                    }}>
                      {sub.symbolCount} {sub.symbolCount === 1 ? 'company' : 'companies'}
                    </span>

                    <span 
                      className="heatmap-pill"
                      style={{
                        backgroundColor: isWhiteText ? 'rgba(255, 255, 255, 0.2)' : (sub.performance >= 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'),
                        color: isWhiteText ? '#ffffff' : cellStyle.color
                      }}
                    >
                      {sub.performance >= 0 ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                      {sub.performance >= 0 ? `+${sub.performance}%` : `${sub.performance}%`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Selected Subcategory Details Card */}
      {selectedSubcategory && (
        <div className={styles.card} style={{ marginTop: '24px', animation: 'fadeIn 0.2s ease-out' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <TrendingUp size={20} style={{ color: 'var(--primary)' }} />
              <h3 className={styles.sectionTitle} style={{ margin: 0 }}>{selectedSubcategory.name} Analysis</h3>
            </div>
            <span 
              className={`${styles.badge} ${selectedSubcategory.performance >= 0 ? styles.badgeSuccess : styles.badgeError}`}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '6px 12px', fontSize: '13px' }}
            >
              {selectedSubcategory.performance >= 0 ? '+' : ''}{selectedSubcategory.performance}% Daily change
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '24px' }}>
            <div style={{ backgroundColor: 'var(--bg-tertiary)', padding: '16px', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>PARENT SECTOR</span>
              <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>{selectedSubcategory.categoryName}</span>
            </div>
            <div style={{ backgroundColor: 'var(--bg-tertiary)', padding: '16px', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>REGISTERED LISTINGS</span>
              <span style={{ fontSize: '24px', fontWeight: 800, color: 'var(--primary)' }}>{selectedSubcategory.symbolCount} companies</span>
            </div>
          </div>

          {/* Registered Symbols */}
          <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '12px' }}>Mapped Stock Symbols</h4>
          {selectedSubcategory.symbols.length === 0 ? (
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No stock symbols are currently registered under this industry subcategory.</p>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {selectedSubcategory.symbols.map(sym => (
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

export default SubcategoriesHeatmap;
