import React, { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts';
import { RefreshCw, TrendingUp, Info, Maximize2, Minimize2 } from 'lucide-react';
import styles from '../../pages.module.css';

interface StockData {
  symbol: string;
  category: string;
  subcategory: string;
  previousClsPrice: number;
  lastTradedPrice: number;
  totTradedVal: number;
  totTradedQty: number;
  percentChange: number;
  date: string;
}

export const SubcategoryHeatmap: React.FC = () => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);
  const [data, setData] = useState<StockData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTheme, setActiveTheme] = useState<string>('light');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [sizeMetric, setSizeMetric] = useState<'equal' | 'volume' | 'logVolume'>('equal');

  // Handle body overflow to prevent background scrolling when fullscreen
  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isFullscreen]);

  // Handle escape key to exit fullscreen mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  // Trigger ECharts resize after state transitions to fullscreen
  useEffect(() => {
    if (chartInstance.current) {
      const timer = setTimeout(() => {
        chartInstance.current?.resize();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isFullscreen]);

  // Detect current layout theme
  useEffect(() => {
    const checkTheme = () => {
      const theme = document.documentElement.getAttribute('data-theme') || 'light';
      setActiveTheme(theme);
    };

    // Initial check
    checkTheme();

    // Set up mutation observer to listen to theme changes on html node
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    return () => observer.disconnect();
  }, []);

  // Fetch stocks and pricing data
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch all symbols to know their categories and subcategories
      const symbolsRes = await fetch('/api/v1/symbols');
      if (!symbolsRes.ok) {
        throw new Error(`Failed to fetch symbols: ${symbolsRes.status}`);
      }
      const symbols = await symbolsRes.json();

      if (!Array.isArray(symbols) || symbols.length === 0) {
        // Fallback if DB is empty
        useMockData();
        return;
      }

      // 2. Fetch latest pricing for all symbols in batch
      const symbolNames = symbols.map((sym: any) => sym.symbol).join(',');
      const res = await fetch(`/api/v1/bhav/${encodeURIComponent(symbolNames)}/latest`);
      
      let bhavList: any[] = [];
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json)) {
          bhavList = json;
        } else if (json && typeof json === 'object') {
          bhavList = [json];
        }
      }

      const bhavMap: Record<string, any> = {};
      bhavList.forEach(bhav => {
        if (bhav && bhav.symbol) {
          bhavMap[bhav.symbol.toUpperCase()] = bhav;
        }
      });

      const results = symbols.map((sym: any) => {
        const bhav = bhavMap[sym.symbol.toUpperCase()];
        if (bhav) {
          const prev = bhav.previousClsPrice || 0;
          const ltp = bhav.lastTradedPrice || 0;
          const percentChange = prev > 0 ? ((ltp - prev) / prev) * 100 : 0;
          
          return {
            symbol: sym.symbol,
            category: sym.category || 'OTHER',
            subcategory: sym.subcategory || 'Miscellaneous',
            previousClsPrice: prev,
            lastTradedPrice: ltp,
            totTradedVal: bhav.totTradedVal || 0,
            totTradedQty: bhav.totTradedQty || 0,
            percentChange: percentChange,
            date: bhav.tradeDate || (bhav.timestamp ? bhav.timestamp.split('T')[0] : 'N/A')
          } as StockData;
        } else {
          return {
            symbol: sym.symbol,
            category: sym.category || 'OTHER',
            subcategory: sym.subcategory || 'Miscellaneous',
            previousClsPrice: 100,
            lastTradedPrice: 100,
            totTradedVal: 0,
            totTradedQty: 0,
            percentChange: 0,
            date: 'N/A'
          } as StockData;
        }
      });

      setData(results);
    } catch (e: any) {
      console.warn('Backend fetch failed, falling back to mock dataset.', e);
      useMockData();
    } finally {
      setLoading(false);
    }
  };

  const useMockData = () => {
    // High quality mock dataset representing the actual backend structure
    const mockData: StockData[] = [
      { symbol: 'RELIANCE', category: 'ENERGY', subcategory: 'OIL_REFINERY', previousClsPrice: 1263.0, lastTradedPrice: 1296.4, totTradedVal: 15311601155, totTradedQty: 11988785, percentChange: 2.64, date: '2026-06-22' },
      { symbol: 'TCS', category: 'IT', subcategory: 'Software Services', previousClsPrice: 2135.6, lastTradedPrice: 2161.1, totTradedVal: 4574695142, totTradedQty: 2124656, percentChange: 1.19, date: '2026-06-22' },
      { symbol: 'INFY', category: 'IT', subcategory: 'Software Services', previousClsPrice: 1450.0, lastTradedPrice: 1492.5, totTradedVal: 3891450000, totTradedQty: 2608000, percentChange: 2.93, date: '2026-06-22' },
      { symbol: 'WIPRO', category: 'IT', subcategory: 'Software Services', previousClsPrice: 410.5, lastTradedPrice: 402.1, totTradedVal: 1241892000, totTradedQty: 3088000, percentChange: -2.05, date: '2026-06-22' },
      { symbol: 'HDFCBANK', category: 'FINANCE', subcategory: 'Private Banks', previousClsPrice: 1608.2, lastTradedPrice: 1598.5, totTradedVal: 3102941000, totTradedQty: 1941000, percentChange: -0.60, date: '2026-06-22' },
      { symbol: 'ICICIBANK', category: 'FINANCE', subcategory: 'Private Banks', previousClsPrice: 910.4, lastTradedPrice: 924.2, totTradedVal: 2492083000, totTradedQty: 2707000, percentChange: 1.52, date: '2026-06-22' },
      { symbol: 'SBIN', category: 'FINANCE', subcategory: 'Public Banks', previousClsPrice: 562.1, lastTradedPrice: 578.4, totTradedVal: 5920381000, totTradedQty: 10235000, percentChange: 2.90, date: '2026-06-22' },
      { symbol: 'TATASTEEL', category: 'METALS', subcategory: 'Steel Products', previousClsPrice: 118.2, lastTradedPrice: 114.5, totTradedVal: 1894203000, totTradedQty: 16543000, percentChange: -3.13, date: '2026-06-22' }
    ];
    setData(mockData);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Get color based on percentage change and active theme
  const getTileColor = (change: number, isDark: boolean) => {
    if (change > 0) {
      if (change >= 2.5) return '#065f46'; // Deep Emerald
      if (change >= 1.2) return '#047857'; // Mid Emerald
      return '#10b981'; // Standard Emerald
    } else if (change < 0) {
      const abs = Math.abs(change);
      if (abs >= 2.5) return '#991b1b'; // Deep Crimson
      if (abs >= 1.2) return '#b91c1c'; // Mid Crimson
      return '#ef4444'; // Standard Crimson
    }
    return isDark ? '#374151' : '#e2e8f0'; // Gray/Neutral
  };

  // Render/update ECharts Treemap
  useEffect(() => {
    if (loading || data.length === 0 || !chartRef.current) return;

    // Dispose old instance if it exists
    if (chartInstance.current) {
      chartInstance.current.dispose();
    }

    const isDark = activeTheme === 'dark';
    chartInstance.current = echarts.init(chartRef.current, isDark ? 'dark' : undefined);

    // Group symbols by subcategory
    const groups: { [key: string]: StockData[] } = {};
    data.forEach(stock => {
      const sub = stock.subcategory;
      if (!groups[sub]) {
        groups[sub] = [];
      }
      groups[sub].push(stock);
    });

    const getStockValue = (stock: StockData) => {
      if (sizeMetric === 'equal') {
        return 1;
      } else if (sizeMetric === 'logVolume') {
        return Math.log10(Math.max(stock.totTradedVal, 1));
      } else {
        return stock.totTradedVal;
      }
    };

    // Transform grouped data into ECharts Treemap data structure
    const treemapData = Object.keys(groups).map(subName => {
      const children = groups[subName].map(stock => {
        const color = getTileColor(stock.percentChange, isDark);
        return {
          name: stock.symbol,
          value: getStockValue(stock),
          totTradedVal: stock.totTradedVal,
          percentChange: stock.percentChange,
          price: stock.lastTradedPrice,
          prevPrice: stock.previousClsPrice,
          volume: stock.totTradedQty,
          date: stock.date,
          itemStyle: {
            color: color,
            borderColor: isDark ? '#111827' : '#ffffff',
            borderWidth: 2,
            gapWidth: 1
          },
          label: {
            show: true,
            position: 'inside' as const,
            formatter: `${stock.symbol}\n${stock.percentChange > 0 ? '+' : ''}${stock.percentChange.toFixed(2)}%`,
            color: '#ffffff',
            fontWeight: 'bold' as const,
            fontSize: 12
          }
        };
      });

      // Sum values of children for subcategory weight
      const subValueSum = children.reduce((sum, child) => sum + child.value, 0);
      const actualSubValueSum = children.reduce((sum, child) => sum + child.totTradedVal, 0);

      return {
        name: subName,
        value: subValueSum,
        actualValue: actualSubValueSum,
        children: children,
        itemStyle: {
          borderColor: isDark ? '#1f2937' : '#f1f5f9',
          borderWidth: 4,
          gapWidth: 2
        },
        upperLabel: {
          show: true,
          height: 24,
          color: isDark ? '#d1d5db' : '#374151',
          fontWeight: 'bold' as const,
          fontSize: 11
        }
      };
    });

    const option: echarts.EChartsOption = {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item',
        backgroundColor: isDark ? '#1f2937' : '#ffffff',
        borderColor: isDark ? '#374151' : '#e2e8f0',
        textStyle: {
          color: isDark ? '#f9fafb' : '#0f172a',
          fontSize: 13
        },
        formatter: (info: any) => {
          const val = info.value;
          const data = info.data;
          
          // Only show stock symbol details, not the outer subcategory headers
          if (!data || data.percentChange === undefined) {
            const actualVal = data ? data.actualValue : val;
            const count = data && data.children ? data.children.length : 0;
            return `<strong>${info.name}</strong><br/>Companies: ${count}<br/>Total Value: ₹${(actualVal / 10000000).toFixed(2)} Cr`;
          }

          const sign = data.percentChange > 0 ? '+' : '';
          const actualTradedVal = data.totTradedVal;
          return `
            <div style="font-family: var(--font-sans); padding: 4px; min-width: 170px;">
              <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid ${isDark ? '#374151' : '#e2e8f0'}; padding-bottom: 6px; margin-bottom: 6px; gap: 12px;">
                <strong style="font-size: 14px; color: var(--primary);">${info.name}</strong>
                <span style="font-size: 11px; color: var(--text-muted); font-weight: 500;">${data.date}</span>
              </div>
              <div style="font-size: 12px; display: flex; flex-direction: column; gap: 4px;">
                <div>Last Price: <strong>₹${data.price.toLocaleString()}</strong></div>
                <div>Prev Close: <strong>₹${data.prevPrice.toLocaleString()}</strong></div>
                <div>Change: <strong style="color: ${data.percentChange >= 0 ? 'var(--accent-success)' : 'var(--accent-error)'}">${sign}${data.percentChange.toFixed(2)}%</strong></div>
                <div>Traded Value: <strong>₹${(actualTradedVal / 10000000).toFixed(2)} Cr</strong></div>
                <div>Traded Qty: <strong>${data.volume.toLocaleString()}</strong></div>
              </div>
            </div>
          `;
        }
      },
      series: [
        {
          name: 'NSE Stock Market',
          type: 'treemap',
          visibleMin: sizeMetric === 'equal' || sizeMetric === 'logVolume' ? 0 : 300,
          label: {
            show: true,
            formatter: '{b}'
          },
          breadcrumb: {
            show: true,
            height: 26,
            itemStyle: {
              textStyle: {
                color: isDark ? '#d1d5db' : '#374151',
                fontSize: 11
              },
              color: isDark ? '#1f2937' : '#e2e8f0',
              borderColor: isDark ? '#111827' : '#ffffff'
            }
          },
          levels: [
            {
              itemStyle: {
                borderWidth: 4,
                borderColor: isDark ? '#111827' : '#f8fafc',
                gapWidth: 4
              }
            },
            {
              itemStyle: {
                borderWidth: 2,
                gapWidth: 2
              }
            }
          ],
          data: treemapData
        }
      ]
    };

    chartInstance.current.setOption(option);

    // Dynamic resize hooks
    const handleResize = () => {
      chartInstance.current?.resize();
    };

    window.addEventListener('resize', handleResize);

    const resizeObserver = new ResizeObserver(() => {
      chartInstance.current?.resize();
    });
    resizeObserver.observe(chartRef.current);

    return () => {
      window.removeEventListener('resize', handleResize);
      resizeObserver.disconnect();
    };
  }, [loading, data, activeTheme, sizeMetric]);

  // Clean-up chart on unmount
  useEffect(() => {
    return () => {
      chartInstance.current?.dispose();
    };
  }, []);

  const gainers = data.filter(s => s.percentChange > 0).length;
  const losers = data.filter(s => s.percentChange < 0).length;

  return (
    <div>
      {/* Header */}
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Subcategory Heatmap</h1>
        <p className={styles.pageSubtitle}>Group symbols by industry sectors, sized by transaction value and colored by percentage swing.</p>
      </div>

      {/* Grid summary */}
      <div className={styles.statsGrid} style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
        
        {/* Total Listed */}
        <div className={styles.card} style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div className={styles.statsLabel}>Stocks Listed</div>
            <div className={styles.statsVal} style={{ fontSize: '24px', marginTop: '4px' }}>{data.length}</div>
          </div>
          <div className={styles.statsIconContainer} style={{ padding: '8px' }}>
            <TrendingUp size={18} />
          </div>
        </div>

        {/* Gainers */}
        <div className={styles.card} style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div className={styles.statsLabel}>Daily Gainers</div>
            <div className={styles.statsVal} style={{ fontSize: '24px', color: 'var(--accent-success)', marginTop: '4px' }}>{loading ? '-' : gainers}</div>
          </div>
          <div className={styles.statsIconContainer} style={{ padding: '8px', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-success)' }}>
            ▲
          </div>
        </div>

        {/* Losers */}
        <div className={styles.card} style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div className={styles.statsLabel}>Daily Losers</div>
            <div className={styles.statsVal} style={{ fontSize: '24px', color: 'var(--accent-error)', marginTop: '4px' }}>{loading ? '-' : losers}</div>
          </div>
          <div className={styles.statsIconContainer} style={{ padding: '8px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--accent-error)' }}>
            ▼
          </div>
        </div>
      </div>

      {/* Heatmap Card */}
      <div 
        className={styles.card} 
        style={isFullscreen ? {
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 9999,
          backgroundColor: 'var(--bg-secondary)',
          padding: '24px',
          overflowY: 'auto',
          borderRadius: 0,
          transform: 'none',
          boxShadow: 'none',
          border: 'none',
          display: 'flex',
          flexDirection: 'column'
        } : { position: 'relative' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 className={styles.sectionTitle} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            Subcategory Stock Distribution Treemap
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Size By:</span>
              <select
                value={sizeMetric}
                onChange={(e) => setSizeMetric(e.target.value as any)}
                style={{
                  height: '34px',
                  padding: '0 8px',
                  fontSize: '13px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-tertiary)',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  cursor: 'pointer',
                  fontWeight: 500,
                  transition: 'border-color var(--transition-fast)'
                }}
              >
                <option value="equal">Equal Sizing (See More Tiles)</option>
                <option value="volume">Traded Value (Linear)</option>
                <option value="logVolume">Traded Value (Log Scale)</option>
              </select>
            </div>
            <button
              type="button"
              className={styles.toggleBtn}
              onClick={() => setIsFullscreen(!isFullscreen)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
            >
              {isFullscreen ? (
                <>
                  <Minimize2 size={14} />
                  Exit Fullscreen
                </>
              ) : (
                <>
                  <Maximize2 size={14} />
                  Fullscreen
                </>
              )}
            </button>
            <button
              type="button"
              className={styles.toggleBtn}
              onClick={fetchData}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
              disabled={loading}
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              Refresh Prices
            </button>
          </div>
        </div>

        {/* Info label */}
        <div 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            fontSize: '12px', 
            color: 'var(--text-secondary)', 
            backgroundColor: 'var(--bg-tertiary)', 
            padding: '10px 14px', 
            borderRadius: 'var(--radius-md)', 
            marginBottom: '20px' 
          }}
        >
          <Info size={16} style={{ color: 'var(--primary)' }} />
          <span>
            Hover on any stock tile to see its daily values. Tile size is determined by <strong>total traded value (totTradedVal)</strong> and color indicates price change.
          </span>
        </div>

        {/* Chart Area */}
        {loading ? (
          <div style={{ height: isFullscreen ? 'calc(100vh - 180px)' : '500px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--text-muted)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              <RefreshCw size={32} className="animate-spin" style={{ color: 'var(--primary)' }} />
              <span>Fetching latest stock bhav charts...</span>
            </div>
          </div>
        ) : error ? (
          <div style={{ height: isFullscreen ? 'calc(100vh - 180px)' : '500px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--accent-error)' }}>
            {error}
          </div>
        ) : (
          <div ref={chartRef} style={{ width: '100%', height: isFullscreen ? 'calc(100vh - 180px)' : '500px' }} />
        )}
      </div>
    </div>
  );
};
export default SubcategoryHeatmap;
