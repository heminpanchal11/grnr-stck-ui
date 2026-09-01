import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as echarts from 'echarts';
import {
  Plus,
  Trash2,
  Edit2,
  RefreshCw,
  TrendingUp,
  Info,
  X,
  Search,
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import styles from '../pages.module.css';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import {
  getTagBoards,
  createTagBoard,
  updateTagBoard,
  deleteTagBoard,
  getSymbols,
  getLatestBhavForSymbol,
  getHistoricBhav,
  type TagBoardResponse,
  type StockSymbolResponse,
  type DailyBhav
} from '../../utils/api';

// Sub-component to handle rendering individual tagboard heatmaps
interface TagBoardChartProps {
  tagboard: TagBoardResponse;
  bhavMap: Record<string, any>;
  isDark: boolean;
  isFullscreen: boolean;
  sizeMetric: 'equal' | 'volume' | 'logVolume';
}

const TagBoardChart: React.FC<TagBoardChartProps> = ({ tagboard, bhavMap, isDark, isFullscreen, sizeMetric }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    if (chartInstance.current) {
      chartInstance.current.dispose();
    }

    chartInstance.current = echarts.init(chartRef.current, isDark ? 'dark' : undefined);

    // Get color based on percentage change and theme
    const getTileColor = (change: number) => {
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
      return isDark ? '#374151' : '#e2e8f0'; // Neutral
    };

    const getStockValue = (bhav: any) => {
      const vol = bhav?.totTradedVal || 10000000;
      if (sizeMetric === 'equal') {
        return 1;
      } else if (sizeMetric === 'logVolume') {
        return Math.log10(Math.max(vol, 1));
      } else {
        return vol;
      }
    };

    // Prepare treemap data
    const children = tagboard.symbols.map(sym => {
      const bhav = bhavMap[sym.symbol.toUpperCase()];
      const prev = bhav?.previousClsPrice || 0;
      const ltp = bhav?.lastTradedPrice || 0;
      const percentChange = prev > 0 ? ((ltp - prev) / prev) * 100 : 0;
      const value = getStockValue(bhav);
      const color = getTileColor(percentChange);

      return {
        name: sym.symbol,
        value: value,
        totTradedVal: bhav?.totTradedVal || 0,
        percentChange: percentChange,
        price: ltp || prev || 0,
        prevPrice: prev,
        volume: bhav?.totTradedQty || 0,
        date: bhav?.tradeDate || 'N/A',
        itemStyle: {
          color: color,
          borderColor: isDark ? '#111827' : '#ffffff',
          borderWidth: 2,
          gapWidth: 1
        },
        label: {
          show: true,
          position: 'inside' as const,
          formatter: (params: any) => {
            const d = params.data || {};
            const sym = d.name || params.name || '';
            const pct = typeof d.percentChange === 'number' ? `${d.percentChange > 0 ? '+' : ''}${d.percentChange.toFixed(2)}%` : '';
            const prc = d.price ? `₹${d.price.toLocaleString()}` : '';
            return prc ? `{sym|${sym}}\n{pct|${pct}}\n{prc|${prc}}` : `{sym|${sym}}\n{pct|${pct}}`;
          },
          rich: {
            sym: {
              fontSize: 11,
              fontWeight: 'bold' as const,
              lineHeight: 14,
              color: '#ffffff',
              textShadowColor: 'rgba(0, 0, 0, 0.5)',
              textShadowBlur: 2,
              align: 'center' as const
            },
            pct: {
              fontSize: 10,
              fontWeight: 600,
              lineHeight: 13,
              color: '#ffffff',
              textShadowColor: 'rgba(0, 0, 0, 0.5)',
              textShadowBlur: 2,
              align: 'center' as const
            },
            prc: {
              fontSize: 9,
              lineHeight: 12,
              color: 'rgba(255, 255, 255, 0.9)',
              textShadowColor: 'rgba(0, 0, 0, 0.5)',
              textShadowBlur: 2,
              align: 'center' as const
            }
          },
          overflow: 'truncate' as const,
          ellipsis: '...'
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
          const data = info.data;
          if (!data || data.percentChange === undefined) return `<strong>${info.name}</strong>`;

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
          name: tagboard.name,
          type: 'treemap',
          visibleMin: sizeMetric === 'equal' || sizeMetric === 'logVolume' ? 0 : 300,
          breadcrumb: { show: false },
          label: {
            show: true,
            formatter: '{b}',
            overflow: 'truncate' as const,
            ellipsis: '...'
          },
          levels: [
            {
              itemStyle: {
                borderWidth: 2,
                borderColor: isDark ? '#111827' : '#f8fafc',
                gapWidth: 2
              },
              label: {
                show: true,
                position: 'inside' as const,
                overflow: 'truncate' as const,
                ellipsis: '...'
              }
            }
          ],
          data: children
        }
      ]
    };

    chartInstance.current.setOption(option);

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
      chartInstance.current?.dispose();
    };
  }, [tagboard, bhavMap, isDark, sizeMetric]);

  return (
    <div
      ref={chartRef}
      style={{
        width: '100%',
        height: isFullscreen ? 'calc(100vh - 220px)' : '240px',
        borderRadius: '8px',
        overflow: 'hidden'
      }}
    />
  );
};

export const Tagboard: React.FC = () => {
  useDocumentTitle('Tagboard Heatmaps');
  const [tagboards, setTagboards] = useState<TagBoardResponse[]>([]);
  const [symbols, setSymbols] = useState<StockSymbolResponse[]>([]);
  const [bhavMap, setBhavMap] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTheme, setActiveTheme] = useState<string>('light');
  const [sizeMetric, setSizeMetric] = useState<'equal' | 'volume' | 'logVolume'>('equal');

  // Form State
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [editingTagboard, setEditingTagboard] = useState<TagBoardResponse | null>(null);
  const [formName, setFormName] = useState<string>('');
  const [selectedSymbols, setSelectedSymbols] = useState<string[]>([]);
  const [symbolSearchQuery, setSymbolSearchQuery] = useState<string>('');

  // Compare State
  const [compareTagboard, setCompareTagboard] = useState<TagBoardResponse | null>(null);
  const [compareTimeframe, setCompareTimeframe] = useState<'1D' | '1W' | '1Y'>('1W');
  const [compareChartLoading, setCompareChartLoading] = useState<boolean>(false);
  const compareChartRef = useRef<HTMLDivElement>(null);
  const compareChartInstance = useRef<echarts.ECharts | null>(null);

  // Load theme preference
  useEffect(() => {
    const checkTheme = () => {
      const theme = document.documentElement.getAttribute('data-theme') || 'light';
      setActiveTheme(theme);
    };
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  // Fetch initial data
  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Get TagBoards
      let boards: TagBoardResponse[] = [];
      try {
        boards = await getTagBoards();
      } catch (err) {
        console.warn('API getTagBoards failed, loading mock tagboards.', err);
      }

      // If empty list or API failure, load fallback mock tagboards
      if (!boards || boards.length === 0) {
        boards = getMockTagboards();
      }

      // 2. Fetch all registered symbols for the tag board creator
      let allSymbols: StockSymbolResponse[] = [];
      try {
        allSymbols = await getSymbols();
      } catch (err) {
        console.warn('API getSymbols failed, loading mock symbols.', err);
      }
      if (!allSymbols || allSymbols.length === 0) {
        allSymbols = getMockSymbols();
      }
      setSymbols(allSymbols);

      // 3. Gather unique symbols across all boards to fetch latest pricing
      const uniqueSymbolsSet = new Set<string>();
      boards.forEach(b => {
        b.symbols.forEach(s => uniqueSymbolsSet.add(s.symbol.toUpperCase()));
      });
      const uniqueSymbolsList = Array.from(uniqueSymbolsSet);

      let priceMap: Record<string, any> = {};
      if (uniqueSymbolsList.length > 0) {
        try {
          const bhavData = await getLatestBhavForSymbol(uniqueSymbolsList.join(','));
          const bhavList = Array.isArray(bhavData) ? bhavData : bhavData ? [bhavData] : [];
          bhavList.forEach((bhav: any) => {
            if (bhav && bhav.symbol) {
              priceMap[bhav.symbol.toUpperCase()] = bhav;
            }
          });
        } catch (err) {
          console.warn('API getLatestBhavForSymbol failed, using mock prices.', err);
          priceMap = getMockBhavMap();
        }
      } else {
        priceMap = getMockBhavMap();
      }

      setBhavMap(priceMap);
      setTagboards(boards);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Trigger ECharts resize for comparison chart on open/timeframe change
  useEffect(() => {
    if (!compareTagboard || !compareChartRef.current) return;

    if (compareChartInstance.current) {
      compareChartInstance.current.dispose();
    }

    const isDark = activeTheme === 'dark';
    compareChartInstance.current = echarts.init(compareChartRef.current, isDark ? 'dark' : undefined);

    const renderCompareChart = async () => {
      setCompareChartLoading(true);
      try {
        const uniqueSymbols = compareTagboard.symbols.map(s => s.symbol);
        
        if (compareTimeframe === '1D') {
          // Bar chart comparison for 1 Day % change
          const barData = uniqueSymbols.map(sym => {
            const bhav = bhavMap[sym.toUpperCase()];
            const prev = bhav?.previousClsPrice || 0;
            const ltp = bhav?.lastTradedPrice || 0;
            const pct = prev > 0 ? ((ltp - prev) / prev) * 100 : 0;
            return {
              value: parseFloat(pct.toFixed(2)),
              itemStyle: {
                color: pct >= 0 ? '#10b981' : '#ef4444'
              }
            };
          });

          const option: echarts.EChartsOption = {
            backgroundColor: 'transparent',
            tooltip: {
              trigger: 'axis',
              axisPointer: { type: 'shadow' },
              formatter: (params: any) => {
                const item = params[0];
                return `<strong>${item.name}</strong>: ${item.value >= 0 ? '+' : ''}${item.value}%`;
              }
            },
            grid: { top: '10%', bottom: '15%', left: '10%', right: '10%' },
            xAxis: {
              type: 'category',
              data: uniqueSymbols,
              axisLabel: { color: isDark ? '#94a3b8' : '#475569' },
              axisLine: { lineStyle: { color: isDark ? '#374151' : '#e2e8f0' } }
            },
            yAxis: {
              type: 'value',
              axisLabel: {
                formatter: '{value}%',
                color: isDark ? '#94a3b8' : '#475569'
              },
              splitLine: { lineStyle: { color: isDark ? '#1f2937' : '#f1f5f9' } }
            },
            series: [{
              type: 'bar',
              data: barData,
              label: {
                show: true,
                position: 'top',
                formatter: '{c}%',
                color: isDark ? '#f9fafb' : '#0f172a'
              }
            }]
          };

          compareChartInstance.current?.setOption(option);
        } else {
          // Line chart comparison (1W or 1Y)
          // Compute date range
          const todayStr = new Date().toISOString().split('T')[0];
          const startDaysAgo = compareTimeframe === '1W' ? 10 : 365; // Fetch slightly more than 7 days to cover weekends
          const startStr = new Date(Date.now() - startDaysAgo * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

          // Fetch historical data for all symbols
          const seriesList: any[] = [];
          let allDatesSet = new Set<string>();
          const fetchedBhavsMap: Record<string, DailyBhav[]> = {};

          for (const sym of uniqueSymbols) {
            let bhavs: DailyBhav[] = [];
            try {
              bhavs = await getHistoricBhav(sym, startStr, todayStr);
            } catch (err) {
              console.warn(`Failed to fetch history for ${sym}, generating mock history.`, err);
              bhavs = getMockHistoricBhav(sym, compareTimeframe === '1W' ? 7 : 250);
            }

            if (!bhavs || bhavs.length === 0) {
              bhavs = getMockHistoricBhav(sym, compareTimeframe === '1W' ? 7 : 250);
            }

            // Sort by tradeDate ascending
            bhavs.sort((a, b) => new Date(a.tradeDate).getTime() - new Date(b.tradeDate).getTime());
            fetchedBhavsMap[sym] = bhavs;
            bhavs.forEach(b => allDatesSet.add(b.tradeDate));
          }

          // Sort dates
          const sortedDates = Array.from(allDatesSet).sort(
            (a, b) => new Date(a).getTime() - new Date(b).getTime()
          );

          // Build normalized series data
          uniqueSymbols.forEach((sym) => {
            const bhavs = fetchedBhavsMap[sym] || [];
            
            // Find base price (first closing price or last traded price)
            const firstBhav = bhavs.find(b => b.closingPrice > 0 || b.lastTradedPrice > 0);
            const basePrice = firstBhav ? (firstBhav.closingPrice || firstBhav.lastTradedPrice) : 100;

            const normalizedData = sortedDates.map(dStr => {
              // Find bhav on or before this date
              const matchingBhav = bhavs.find(b => b.tradeDate === dStr);
              if (matchingBhav) {
                const currentPrice = matchingBhav.closingPrice || matchingBhav.lastTradedPrice || basePrice;
                const percentChange = ((currentPrice - basePrice) / basePrice) * 100;
                return parseFloat(percentChange.toFixed(2));
              }
              // If date is missing, return null to show gaps or fill with previous value
              return null;
            });

            // Fill missing values forward if possible
            let lastVal = 0;
            const filledData = normalizedData.map(v => {
              if (v !== null) {
                lastVal = v;
                return v;
              }
              return lastVal;
            });

            seriesList.push({
              name: sym,
              type: 'line',
              data: filledData,
              smooth: true,
              showSymbol: compareTimeframe === '1W',
              lineStyle: { width: 3 },
              emphasis: { focus: 'series' }
            });
          });

          const option: echarts.EChartsOption = {
            backgroundColor: 'transparent',
            tooltip: {
              trigger: 'axis',
              axisPointer: { type: 'cross' },
              formatter: (params: any) => {
                let html = `<div style="font-family: var(--font-sans); padding: 4px;">`;
                html += `<strong>Date: ${params[0].name}</strong><br/>`;
                params.forEach((p: any) => {
                  const val = p.value;
                  html += `<span style="color: ${p.color}; font-weight: bold; margin-right: 8px;">●</span> ${p.seriesName}: <strong>${val >= 0 ? '+' : ''}${val}%</strong><br/>`;
                });
                html += `</div>`;
                return html;
              }
            },
            legend: {
              data: uniqueSymbols,
              textStyle: { color: isDark ? '#d1d5db' : '#374151' }
            },
            grid: { top: '15%', bottom: '15%', left: '8%', right: '5%' },
            xAxis: {
              type: 'category',
              data: sortedDates,
              axisLabel: {
                color: isDark ? '#94a3b8' : '#475569',
                formatter: (val: string) => {
                  if (compareTimeframe === '1Y') {
                    // Show month/year for 1Y
                    const d = new Date(val);
                    return d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
                  }
                  // Show day/month for 1W
                  const d = new Date(val);
                  return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
                }
              },
              axisLine: { lineStyle: { color: isDark ? '#374151' : '#e2e8f0' } }
            },
            yAxis: {
              type: 'value',
              axisLabel: {
                formatter: '{value}%',
                color: isDark ? '#94a3b8' : '#475569'
              },
              splitLine: { lineStyle: { color: isDark ? '#1f2937' : '#f1f5f9' } }
            },
            series: seriesList
          };

          compareChartInstance.current?.setOption(option);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setCompareChartLoading(false);
      }
    };

    renderCompareChart();

    const handleResize = () => {
      compareChartInstance.current?.resize();
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      compareChartInstance.current?.dispose();
    };
  }, [compareTagboard, compareTimeframe, activeTheme]);

  // Open Form Modal for Create
  const handleOpenCreate = () => {
    setEditingTagboard(null);
    setFormName('');
    setSelectedSymbols([]);
    setSymbolSearchQuery('');
    setIsFormModalOpen(true);
  };

  // Open Form Modal for Edit
  const handleOpenEdit = (board: TagBoardResponse) => {
    setEditingTagboard(board);
    setFormName(board.name);
    setSelectedSymbols(board.symbols.map(s => s.symbol));
    setSymbolSearchQuery('');
    setIsFormModalOpen(true);
  };

  // Handle Save (Create or Update)
  const handleSaveTagboard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      alert('Tagboard name cannot be empty');
      return;
    }
    if (selectedSymbols.length === 0) {
      alert('Please select at least one stock symbol');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: formName.trim(),
        symbols: selectedSymbols
      };

      if (editingTagboard) {
        // Update API
        try {
          const updated = await updateTagBoard(editingTagboard.id, payload);
          setTagboards(prev => prev.map(t => t.id === editingTagboard.id ? updated : t));
        } catch (err) {
          // If server failed, update state locally (mock)
          console.warn('API Update failed, updating state locally (mock mode)', err);
          const mockUpdated: TagBoardResponse = {
            id: editingTagboard.id,
            name: payload.name,
            symbols: payload.symbols.map(s => {
              const symObj = symbols.find(x => x.symbol === s);
              return symObj || { id: Math.floor(Math.random() * 1000), symbol: s, category: 'MOCK', subcategory: 'MOCK' };
            })
          };
          setTagboards(prev => prev.map(t => t.id === editingTagboard.id ? mockUpdated : t));
        }
      } else {
        // Create API
        try {
          const created = await createTagBoard(payload);
          setTagboards(prev => [...prev, created]);
        } catch (err) {
          // If server failed, create state locally (mock)
          console.warn('API Create failed, creating locally (mock mode)', err);
          const mockCreated: TagBoardResponse = {
            id: Date.now(),
            name: payload.name,
            symbols: payload.symbols.map(s => {
              const symObj = symbols.find(x => x.symbol === s);
              return symObj || { id: Math.floor(Math.random() * 1000), symbol: s, category: 'MOCK', subcategory: 'MOCK' };
            })
          };
          setTagboards(prev => [...prev, mockCreated]);
        }
      }

      setIsFormModalOpen(false);
      // Trigger a pricing reload for new symbols if any
      loadData();
    } catch (err: any) {
      alert(err.message || 'Error saving tagboard');
      setLoading(false);
    }
  };

  // Handle Delete
  const handleDeleteTagboard = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this Tagboard?')) {
      return;
    }
    setLoading(true);
    try {
      try {
        await deleteTagBoard(id);
      } catch (err) {
        console.warn('API Delete failed, removing locally (mock mode)', err);
      }
      setTagboards(prev => prev.filter(t => t.id !== id));
    } catch (err: any) {
      alert(err.message || 'Error deleting tagboard');
    } finally {
      setLoading(false);
    }
  };

  // Handle symbol checkbox selection
  const handleToggleSymbol = (symbolName: string) => {
    setSelectedSymbols(prev =>
      prev.includes(symbolName)
        ? prev.filter(s => s !== symbolName)
        : [...prev, symbolName]
    );
  };

  // Filter symbols based on search
  const filteredSymbols = useMemo(() => {
    const q = symbolSearchQuery.trim().toLowerCase();
    if (!q) return symbols.slice(0, 100); // Limit list to first 100 if no search
    return symbols.filter(
      s =>
        s.symbol.toLowerCase().includes(q) ||
        s.category?.toLowerCase().includes(q) ||
        s.subcategory?.toLowerCase().includes(q)
    );
  }, [symbols, symbolSearchQuery]);

  // Mock fallbacks
  const getMockTagboards = (): TagBoardResponse[] => [
    {
      id: 101,
      name: 'Nifty IT Leaders',
      symbols: [
        { id: 2, symbol: 'TCS', category: 'IT', subcategory: 'Software Services' },
        { id: 3, symbol: 'INFY', category: 'IT', subcategory: 'Software Services' },
        { id: 4, symbol: 'WIPRO', category: 'IT', subcategory: 'Software Services' }
      ]
    },
    {
      id: 102,
      name: 'Energy & Metals',
      symbols: [
        { id: 1, symbol: 'RELIANCE', category: 'ENERGY', subcategory: 'OIL_REFINERY' },
        { id: 8, symbol: 'TATASTEEL', category: 'METALS', subcategory: 'Steel Products' }
      ]
    },
    {
      id: 103,
      name: 'Banking Giants',
      symbols: [
        { id: 5, symbol: 'HDFCBANK', category: 'FINANCE', subcategory: 'Private Banks' },
        { id: 6, symbol: 'ICICIBANK', category: 'FINANCE', subcategory: 'Private Banks' },
        { id: 7, symbol: 'SBIN', category: 'FINANCE', subcategory: 'Public Banks' }
      ]
    }
  ];

  const getMockSymbols = (): StockSymbolResponse[] => [
    { id: 1, symbol: 'RELIANCE', category: 'ENERGY', subcategory: 'OIL_REFINERY' },
    { id: 2, symbol: 'TCS', category: 'IT', subcategory: 'Software Services' },
    { id: 3, symbol: 'INFY', category: 'IT', subcategory: 'Software Services' },
    { id: 4, symbol: 'WIPRO', category: 'IT', subcategory: 'Software Services' },
    { id: 5, symbol: 'HDFCBANK', category: 'FINANCE', subcategory: 'Private Banks' },
    { id: 6, symbol: 'ICICIBANK', category: 'FINANCE', subcategory: 'Private Banks' },
    { id: 7, symbol: 'SBIN', category: 'FINANCE', subcategory: 'Public Banks' },
    { id: 8, symbol: 'TATASTEEL', category: 'METALS', subcategory: 'Steel Products' }
  ];

  const getMockBhavMap = (): Record<string, any> => ({
    RELIANCE: { symbol: 'RELIANCE', previousClsPrice: 1263.0, lastTradedPrice: 1296.4, totTradedVal: 15311601155, totTradedQty: 11988785, tradeDate: '2026-06-22' },
    TCS: { symbol: 'TCS', previousClsPrice: 2135.6, lastTradedPrice: 2161.1, totTradedVal: 4574695142, totTradedQty: 2124656, tradeDate: '2026-06-22' },
    INFY: { symbol: 'INFY', previousClsPrice: 1450.0, lastTradedPrice: 1492.5, totTradedVal: 3891450000, totTradedQty: 2608000, tradeDate: '2026-06-22' },
    WIPRO: { symbol: 'WIPRO', previousClsPrice: 410.5, lastTradedPrice: 402.1, totTradedVal: 1241892000, totTradedQty: 3088000, tradeDate: '2026-06-22' },
    HDFCBANK: { symbol: 'HDFCBANK', previousClsPrice: 1608.2, lastTradedPrice: 1598.5, totTradedVal: 3102941000, totTradedQty: 1941000, tradeDate: '2026-06-22' },
    ICICIBANK: { symbol: 'ICICIBANK', previousClsPrice: 910.4, lastTradedPrice: 924.2, totTradedVal: 2492083000, totTradedQty: 2707000, tradeDate: '2026-06-22' },
    SBIN: { symbol: 'SBIN', previousClsPrice: 562.1, lastTradedPrice: 578.4, totTradedVal: 5920381000, totTradedQty: 10235000, tradeDate: '2026-06-22' },
    TATASTEEL: { symbol: 'TATASTEEL', previousClsPrice: 118.2, lastTradedPrice: 114.5, totTradedVal: 1894203000, totTradedQty: 16543000, tradeDate: '2026-06-22' }
  });

  const getMockHistoricBhav = (symbol: string, length: number): DailyBhav[] => {
    const list: DailyBhav[] = [];
    const basePriceMap: Record<string, number> = {
      RELIANCE: 1280, TCS: 2150, INFY: 1470, WIPRO: 405,
      HDFCBANK: 1600, ICICIBANK: 920, SBIN: 570, TATASTEEL: 116
    };
    
    const basePrice = basePriceMap[symbol.toUpperCase()] || 100;
    const nowMs = Date.now();
    let currentPrice = basePrice;

    for (let i = length - 1; i >= 0; i--) {
      const date = new Date(nowMs - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      // Add random price walk
      const volatility = 0.015; // 1.5% daily volatility
      const changePercent = (Math.random() - 0.49) * volatility; // slight positive bias
      const prevPrice = currentPrice;
      currentPrice = currentPrice * (1 + changePercent);

      list.push({
        id: Math.floor(Math.random() * 100000),
        stockSymbol: { id: 0, symbol, category: '', subcategory: '' },
        series: 'EQ',
        tradeDate: date,
        previousClsPrice: prevPrice,
        openingPrice: prevPrice * 1.002,
        tradeHighPrice: Math.max(prevPrice, currentPrice) * 1.01,
        tradeLowPrice: Math.min(prevPrice, currentPrice) * 0.99,
        lastTradedPrice: currentPrice,
        closingPrice: currentPrice,
        totTradedQty: 100000 + Math.floor(Math.random() * 1000000),
        totTradedVal: currentPrice * (100000 + Math.floor(Math.random() * 1000000))
      });
    }
    return list;
  };

  const isDark = activeTheme === 'dark';

  return (
    <div style={{ position: 'relative', minHeight: '80vh' }}>
      {/* Styles Injection for Modal and Custom Layouts */}
      <style>{`
        .custom-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background-color: rgba(15, 23, 42, 0.45);
          backdrop-filter: blur(8px);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: modalFadeIn 0.25s ease-out;
        }

        .custom-modal-container {
          background-color: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-xl);
          width: 90%;
          max-width: 680px;
          max-height: 85vh;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          animation: modalScaleIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .custom-modal-header {
          padding: 20px 24px;
          border-bottom: 1px solid var(--border-color);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .custom-modal-title {
          font-size: 18px;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0;
        }

        .custom-modal-close {
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 4px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background-color 0.2s, color 0.2s;
        }

        .custom-modal-close:hover {
          background-color: var(--bg-tertiary);
          color: var(--text-primary);
        }

        .custom-modal-body {
          padding: 24px;
          overflow-y: auto;
          flex: 1;
        }

        .custom-modal-footer {
          padding: 16px 24px;
          border-top: 1px solid var(--border-color);
          background-color: var(--bg-tertiary);
          display: flex;
          justify-content: flex-end;
          gap: 12px;
        }

        .symbol-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 20px;
          background-color: var(--primary-light);
          border: 1px solid var(--primary-glow);
          color: var(--primary);
          font-size: 13px;
          font-weight: 600;
          margin-right: 8px;
          margin-bottom: 8px;
          transition: all 0.2s;
        }

        .symbol-badge button {
          background: none;
          border: none;
          color: var(--primary);
          cursor: pointer;
          display: flex;
          align-items: center;
          padding: 1px;
          border-radius: 50%;
        }

        .symbol-badge button:hover {
          background-color: var(--primary-glow);
        }

        .grid-symbols-select {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
          gap: 10px;
          max-height: 250px;
          overflow-y: auto;
          padding: 12px;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          background-color: var(--bg-primary);
        }

        .symbol-checkbox-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px;
          border-radius: var(--radius-sm);
          cursor: pointer;
          user-select: none;
          font-size: 13px;
          font-weight: 500;
          transition: background-color 0.2s;
        }

        .symbol-checkbox-item:hover {
          background-color: var(--bg-tertiary);
        }

        .symbol-checkbox-item input {
          width: 16px;
          height: 16px;
          accent-color: var(--primary);
          cursor: pointer;
        }

        .tagboard-grid {
          display: flex;
          flex-direction: column;
          gap: 24px;
          margin-top: 10px;
        }

        .tagboard-card {
          background-color: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-sm);
          overflow: hidden;
          transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
          display: flex;
          flex-direction: column;
        }

        .tagboard-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
          border-color: var(--primary-glow);
        }

        .tagboard-card-header {
          padding: 18px 24px;
          border-bottom: 1px solid var(--border-color);
          display: flex;
          justify-content: space-between;
          align-items: center;
          background-color: var(--bg-tertiary);
        }

        .tagboard-card-title {
          font-size: 16px;
          font-weight: 700;
          color: var(--text-primary);
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .tagboard-count-badge {
          font-size: 11px;
          font-weight: 700;
          background-color: var(--primary-light);
          color: var(--primary);
          padding: 2px 8px;
          border-radius: 12px;
          border: 1px solid var(--primary-glow);
        }

        .tagboard-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .compare-timeframe-btn {
          padding: 6px 16px;
          border-radius: 20px;
          border: 1px solid var(--border-color);
          background-color: var(--bg-secondary);
          color: var(--text-secondary);
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .compare-timeframe-btn.active {
          background-color: var(--primary);
          border-color: var(--primary);
          color: white;
        }

        .compare-timeframe-btn:hover:not(.active) {
          background-color: var(--bg-tertiary);
          color: var(--text-primary);
        }

        @keyframes modalFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes modalScaleIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>

      {/* Page Header */}
      <div className={styles.pageHeader}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 className={styles.pageTitle}>Tagboard Heatmaps</h1>
            <p className={styles.pageSubtitle}>
              Monitor customized groups of symbols, visualize change in treemaps, and compare historical behaviors.
            </p>
          </div>
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
              className={styles.btnPrimary}
              onClick={handleOpenCreate}
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <Plus size={16} />
              Create Tagboard
            </button>
          </div>
        </div>
      </div>

      {/* Info Warning */}
      {error && (
        <div
          style={{
            padding: '16px',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid var(--accent-error)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--accent-error)',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}
        >
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Tagboards Layout */}
      {loading && tagboards.length === 0 ? (
        <div style={{ height: '300px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <RefreshCw size={36} className="animate-spin" style={{ color: 'var(--primary)' }} />
            <span style={{ color: 'var(--text-muted)' }}>Loading tagboards and stock pricing...</span>
          </div>
        </div>
      ) : tagboards.length === 0 ? (
        <div
          className={styles.card}
          style={{
            padding: '48px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px'
          }}
        >
          <HelpCircle size={48} style={{ color: 'var(--text-muted)' }} />
          <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>No Tagboards Found</h3>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', margin: 0 }}>
            Create custom portfolios to watch stock price swings in a compact heatmap treemap layout.
          </p>
          <button
            type="button"
            className={styles.btnPrimary}
            onClick={handleOpenCreate}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Plus size={16} />
            Create Tagboard
          </button>
        </div>
      ) : (
        <div className="tagboard-grid">
          {tagboards.map(tb => (
            <div key={tb.id} className="tagboard-card">
              {/* Card Header */}
              <div className="tagboard-card-header">
                <div className="tagboard-card-title">
                  {tb.name}
                  <span className="tagboard-count-badge">{tb.symbols.length} Symbols</span>
                </div>
                <div className="tagboard-actions">
                  <button
                    type="button"
                    className={styles.btnPrimary}
                    onClick={() => setCompareTagboard(tb)}
                    style={{
                      padding: '6px 14px',
                      fontSize: '12px',
                      backgroundColor: 'var(--primary-light)',
                      border: '1px solid var(--primary-glow)',
                      color: 'var(--primary)',
                      boxShadow: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <TrendingUp size={14} />
                    Compare Historic
                  </button>
                  <button
                    type="button"
                    className={styles.toggleBtn}
                    onClick={() => handleOpenEdit(tb)}
                    title="Edit tagboard"
                    style={{
                      border: '1px solid var(--border-color)',
                      padding: '6px',
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    type="button"
                    className={styles.toggleBtn}
                    onClick={() => handleDeleteTagboard(tb.id)}
                    title="Delete tagboard"
                    style={{
                      border: '1px solid var(--accent-error)',
                      color: 'var(--accent-error)',
                      padding: '6px',
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Heatmap Chart Render */}
              <div style={{ padding: '16px 20px', backgroundColor: 'var(--bg-secondary)' }}>
                <TagBoardChart
                  tagboard={tb}
                  bhavMap={bhavMap}
                  isDark={isDark}
                  isFullscreen={false}
                  sizeMetric={sizeMetric}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE & EDIT FORM MODAL */}
      {isFormModalOpen && (
        <div className="custom-modal-overlay">
          <div className="custom-modal-container">
            <form onSubmit={handleSaveTagboard}>
              {/* Header */}
              <div className="custom-modal-header">
                <h3 className="custom-modal-title">
                  {editingTagboard ? 'Edit Tagboard' : 'Create New Tagboard'}
                </h3>
                <button
                  type="button"
                  className="custom-modal-close"
                  onClick={() => setIsFormModalOpen(false)}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Body */}
              <div className="custom-modal-body">
                {/* Tagboard Name */}
                <div className={styles.inputGroup} style={{ marginBottom: '20px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                    Tagboard Name
                  </label>
                  <input
                    type="text"
                    className={styles.input}
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. IT leaders, Banking Sector"
                    required
                    style={{ width: '100%' }}
                  />
                </div>

                {/* Selected Badges */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
                    Selected Symbols ({selectedSymbols.length})
                  </label>
                  {selectedSymbols.length === 0 ? (
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: '12px' }}>
                      No symbols selected. Check symbols below to add them.
                    </div>
                  ) : (
                    <div style={{ maxHeight: '100px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '10px 10px 2px 10px', backgroundColor: 'var(--bg-primary)' }}>
                      {selectedSymbols.map(sym => (
                        <span key={sym} className="symbol-badge">
                          {sym}
                          <button type="button" onClick={() => handleToggleSymbol(sym)}>
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Symbols Checklist Search */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 600 }}>Select Stock Symbols</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid var(--border-color)', borderRadius: '15px', padding: '2px 10px', backgroundColor: 'var(--bg-primary)' }}>
                      <Search size={12} style={{ color: 'var(--text-muted)' }} />
                      <input
                        type="text"
                        placeholder="Search symbols..."
                        value={symbolSearchQuery}
                        onChange={(e) => setSymbolSearchQuery(e.target.value)}
                        style={{
                          border: 'none',
                          background: 'none',
                          outline: 'none',
                          fontSize: '11px',
                          color: 'var(--text-primary)',
                          width: '120px'
                        }}
                      />
                    </div>
                  </div>

                  {/* Checklist Grid */}
                  <div className="grid-symbols-select">
                    {filteredSymbols.map((s: StockSymbolResponse) => {
                      const isChecked = selectedSymbols.includes(s.symbol);
                      return (
                        <label key={s.id} className="symbol-checkbox-item" style={{
                          backgroundColor: isChecked ? 'var(--primary-light)' : 'transparent',
                          border: isChecked ? '1px solid var(--primary-glow)' : '1px solid transparent'
                        }}>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleSymbol(s.symbol)}
                          />
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontWeight: 600 }}>{s.symbol}</span>
                            <span style={{ fontSize: '10px', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100px' }}>
                              {s.category || 'OTHER'}
                            </span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="custom-modal-footer">
                <button
                  type="button"
                  className={styles.toggleBtn}
                  onClick={() => setIsFormModalOpen(false)}
                  style={{ border: '1px solid var(--border-color)', padding: '10px 18px', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button type="submit" className={styles.btnPrimary}>
                  {editingTagboard ? 'Save Changes' : 'Create Tagboard'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* COMPARE HISTORICAL DIALOG */}
      {compareTagboard && (
        <div className="custom-modal-overlay">
          <div className="custom-modal-container" style={{ maxWidth: '780px' }}>
            {/* Header */}
            <div className="custom-modal-header">
              <h3 className="custom-modal-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <TrendingUp size={20} style={{ color: 'var(--primary)' }} />
                <span>Historic Comparison: {compareTagboard.name}</span>
              </h3>
              <button
                type="button"
                className="custom-modal-close"
                onClick={() => setCompareTagboard(null)}
              >
                <X size={18} />
              </button>
            </div>

            {/* Timeframe selector header bar */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '14px 24px',
              backgroundColor: 'var(--bg-tertiary)',
              borderBottom: '1px solid var(--border-color)'
            }}>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>
                Select comparative time range:
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  className={`compare-timeframe-btn ${compareTimeframe === '1D' ? 'active' : ''}`}
                  onClick={() => setCompareTimeframe('1D')}
                >
                  1 Day (Today)
                </button>
                <button
                  type="button"
                  className={`compare-timeframe-btn ${compareTimeframe === '1W' ? 'active' : ''}`}
                  onClick={() => setCompareTimeframe('1W')}
                >
                  1 Week
                </button>
                <button
                  type="button"
                  className={`compare-timeframe-btn ${compareTimeframe === '1Y' ? 'active' : ''}`}
                  onClick={() => setCompareTimeframe('1Y')}
                >
                  1 Year
                </button>
              </div>
            </div>

            {/* Chart Body */}
            <div className="custom-modal-body" style={{ minHeight: '360px', position: 'relative' }}>
              {compareChartLoading && (
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  backgroundColor: 'rgba(255,255,255,0.4)',
                  zIndex: 5,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}>
                  <RefreshCw size={36} className="animate-spin" style={{ color: 'var(--primary)' }} />
                </div>
              )}
              
              <div
                ref={compareChartRef}
                style={{ width: '100%', height: '360px' }}
              />

              {compareTimeframe !== '1D' && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '11px',
                  color: 'var(--text-secondary)',
                  backgroundColor: 'var(--bg-primary)',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  marginTop: '12px'
                }}>
                  <Info size={14} style={{ color: 'var(--primary)' }} />
                  <span>
                    Prices are normalized to % returns starting from 0% at the beginning of the selected window to compare performance relatively.
                  </span>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="custom-modal-footer">
              <button
                type="button"
                className={styles.btnPrimary}
                onClick={() => setCompareTagboard(null)}
              >
                Close Comparison
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tagboard;
