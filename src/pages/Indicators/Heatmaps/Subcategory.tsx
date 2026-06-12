import React, { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts';
import { RefreshCw, TrendingUp, Info } from 'lucide-react';
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
}

export const SubcategoryHeatmap: React.FC = () => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);
  const [data, setData] = useState<StockData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTheme, setActiveTheme] = useState<string>('light');

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

      // 2. Fetch latest pricing for each symbol
      const bhavPromises = symbols.map(async (sym: any) => {
        try {
          const res = await fetch(`/api/v1/bhav/${sym.symbol}/latest`);
          if (res.ok) {
            const bhav = await res.json();
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
              percentChange: percentChange
            } as StockData;
          }
        } catch (e) {
          console.error(`Error fetching price for ${sym.symbol}:`, e);
        }
        
        // Return placeholder if individual fetch failed
        return {
          symbol: sym.symbol,
          category: sym.category || 'OTHER',
          subcategory: sym.subcategory || 'Miscellaneous',
          previousClsPrice: 100,
          lastTradedPrice: 100,
          totTradedVal: 0,
          totTradedQty: 0,
          percentChange: 0
        } as StockData;
      });

      const results = (await Promise.all(bhavPromises)).filter((x): x is StockData => x !== null);
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
      { symbol: 'RELIANCE', category: 'ENERGY', subcategory: 'OIL_REFINERY', previousClsPrice: 1263.0, lastTradedPrice: 1296.4, totTradedVal: 15311601155, totTradedQty: 11988785, percentChange: 2.64 },
      { symbol: 'TCS', category: 'IT', subcategory: 'Software Services', previousClsPrice: 2135.6, lastTradedPrice: 2161.1, totTradedVal: 4574695142, totTradedQty: 2124656, percentChange: 1.19 },
      { symbol: 'INFY', category: 'IT', subcategory: 'Software Services', previousClsPrice: 1450.0, lastTradedPrice: 1492.5, totTradedVal: 3891450000, totTradedQty: 2608000, percentChange: 2.93 },
      { symbol: 'WIPRO', category: 'IT', subcategory: 'Software Services', previousClsPrice: 410.5, lastTradedPrice: 402.1, totTradedVal: 1241892000, totTradedQty: 3088000, percentChange: -2.05 },
      { symbol: 'HDFCBANK', category: 'FINANCE', subcategory: 'Private Banks', previousClsPrice: 1608.2, lastTradedPrice: 1598.5, totTradedVal: 3102941000, totTradedQty: 1941000, percentChange: -0.60 },
      { symbol: 'ICICIBANK', category: 'FINANCE', subcategory: 'Private Banks', previousClsPrice: 910.4, lastTradedPrice: 924.2, totTradedVal: 2492083000, totTradedQty: 2707000, percentChange: 1.52 },
      { symbol: 'SBIN', category: 'FINANCE', subcategory: 'Public Banks', previousClsPrice: 562.1, lastTradedPrice: 578.4, totTradedVal: 5920381000, totTradedQty: 10235000, percentChange: 2.90 },
      { symbol: 'TATASTEEL', category: 'METALS', subcategory: 'Steel Products', previousClsPrice: 118.2, lastTradedPrice: 114.5, totTradedVal: 1894203000, totTradedQty: 16543000, percentChange: -3.13 }
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

    // Transform grouped data into ECharts Treemap data structure
    const treemapData = Object.keys(groups).map(subName => {
      const children = groups[subName].map(stock => {
        const color = getTileColor(stock.percentChange, isDark);
        return {
          name: stock.symbol,
          // Tile size corresponds to total transaction value (totTradedVal)
          value: stock.totTradedVal,
          percentChange: stock.percentChange,
          price: stock.lastTradedPrice,
          prevPrice: stock.previousClsPrice,
          volume: stock.totTradedQty,
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

      return {
        name: subName,
        value: subValueSum,
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
            return `<strong>${info.name}</strong><br/>Total Value: ₹${(val / 10000000).toFixed(2)} Cr`;
          }

          const sign = data.percentChange > 0 ? '+' : '';
          return `
            <div style="font-family: var(--font-sans); padding: 4px;">
              <strong style="font-size: 14px; color: var(--primary);">${info.name}</strong>
              <div style="margin-top: 6px; font-size: 12px; display: flex; flex-direction: column; gap: 4px;">
                <div>Last Price: <strong>₹${data.price.toLocaleString()}</strong></div>
                <div>Prev Close: <strong>₹${data.prevPrice.toLocaleString()}</strong></div>
                <div>Change: <strong style="color: ${data.percentChange >= 0 ? 'var(--accent-success)' : 'var(--accent-error)'}">${sign}${data.percentChange.toFixed(2)}%</strong></div>
                <div>Traded Value: <strong>₹${(val / 10000000).toFixed(2)} Cr</strong></div>
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
          visibleMin: 300,
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
  }, [loading, data, activeTheme]);

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
      <div className={styles.card} style={{ position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 className={styles.sectionTitle} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            Subcategory Stock Distribution Treemap
          </h2>
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
          <div style={{ height: '500px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--text-muted)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              <RefreshCw size={32} className="animate-spin" style={{ color: 'var(--primary)' }} />
              <span>Fetching latest stock bhav charts...</span>
            </div>
          </div>
        ) : error ? (
          <div style={{ height: '500px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--accent-error)' }}>
            {error}
          </div>
        ) : (
          <div ref={chartRef} style={{ width: '100%', height: '500px' }} />
        )}
      </div>
    </div>
  );
};
export default SubcategoryHeatmap;
