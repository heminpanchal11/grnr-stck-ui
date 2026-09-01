import React, { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts';
import { RefreshCw, Maximize2, Minimize2, BarChart3, Layers, Calendar, Info } from 'lucide-react';
import styles from '../pages.module.css';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import {
  getDailyAlertsSummary,
  getDailyAlertsSubcategorySummary,
  type VolumeAlertDailySummaryCategory,
  type VolumeAlertDailySummarySubcategory
} from '../../utils/api';

export const VAStacked: React.FC = () => {
  useDocumentTitle('VA Stacked');
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  // States
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTheme, setActiveTheme] = useState<string>('light');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Data states
  const [categoryData, setCategoryData] = useState<VolumeAlertDailySummaryCategory[]>([]);
  const [subcategoryData, setSubcategoryData] = useState<VolumeAlertDailySummarySubcategory[]>([]);

  // Filter states
  const [groupBy, setGroupBy] = useState<'category' | 'subcategory'>('category');
  const [dateRange, setDateRange] = useState<number | 'all'>(30); // 7, 15, 30, 'all'

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

  // Fetch alerts daily summaries
  const fetchSummaryData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [catRes, subcatRes] = await Promise.all([
        getDailyAlertsSummary(),
        getDailyAlertsSubcategorySummary()
      ]);
      
      setCategoryData(catRes || []);
      setSubcategoryData(subcatRes || []);
    } catch (e: any) {
      console.warn('Backend daily summary fetch failed, falling back to mock dataset.', e);
      setError(e.message || 'Failed to retrieve daily alert summaries from backend.');
      useMockData();
    } finally {
      setLoading(false);
    }
  };

  const useMockData = () => {
    const mockCategoryData: VolumeAlertDailySummaryCategory[] = [
      { alertDate: '2026-06-14', categoryName: 'ENERGY', alertCount: 3 },
      { alertDate: '2026-06-14', categoryName: 'IT', alertCount: 5 },
      { alertDate: '2026-06-14', categoryName: 'FINANCE', alertCount: 2 },
      { alertDate: '2026-06-15', categoryName: 'ENERGY', alertCount: 4 },
      { alertDate: '2026-06-15', categoryName: 'IT', alertCount: 6 },
      { alertDate: '2026-06-15', categoryName: 'FINANCE', alertCount: 8 },
      { alertDate: '2026-06-15', categoryName: 'METALS', alertCount: 3 },
      { alertDate: '2026-06-16', categoryName: 'ENERGY', alertCount: 2 },
      { alertDate: '2026-06-16', categoryName: 'IT', alertCount: 4 },
      { alertDate: '2026-06-16', categoryName: 'FINANCE', alertCount: 5 },
      { alertDate: '2026-06-17', categoryName: 'ENERGY', alertCount: 5 },
      { alertDate: '2026-06-17', categoryName: 'IT', alertCount: 7 },
      { alertDate: '2026-06-17', categoryName: 'FINANCE', alertCount: 3 },
      { alertDate: '2026-06-17', categoryName: 'METALS', alertCount: 4 },
      { alertDate: '2026-06-18', categoryName: 'ENERGY', alertCount: 8 },
      { alertDate: '2026-06-18', categoryName: 'IT', alertCount: 14 },
      { alertDate: '2026-06-18', categoryName: 'FINANCE', alertCount: 9 },
      { alertDate: '2026-06-18', categoryName: 'METALS', alertCount: 6 },
      { alertDate: '2026-06-19', categoryName: 'ENERGY', alertCount: 4 },
      { alertDate: '2026-06-19', categoryName: 'IT', alertCount: 5 },
      { alertDate: '2026-06-19', categoryName: 'FINANCE', alertCount: 3 },
      { alertDate: '2026-06-20', categoryName: 'ENERGY', alertCount: 1 },
      { alertDate: '2026-06-20', categoryName: 'IT', alertCount: 2 },
      { alertDate: '2026-06-20', categoryName: 'FINANCE', alertCount: 1 },
      { alertDate: '2026-06-21', categoryName: 'ENERGY', alertCount: 2 },
      { alertDate: '2026-06-21', categoryName: 'IT', alertCount: 3 },
      { alertDate: '2026-06-21', categoryName: 'FINANCE', alertCount: 4 },
      { alertDate: '2026-06-22', categoryName: 'ENERGY', alertCount: 6 },
      { alertDate: '2026-06-22', categoryName: 'IT', alertCount: 9 },
      { alertDate: '2026-06-22', categoryName: 'FINANCE', alertCount: 7 },
      { alertDate: '2026-06-22', categoryName: 'METALS', alertCount: 5 },
      { alertDate: '2026-06-23', categoryName: 'ENERGY', alertCount: 7 },
      { alertDate: '2026-06-23', categoryName: 'IT', alertCount: 11 },
      { alertDate: '2026-06-23', categoryName: 'FINANCE', alertCount: 8 },
      { alertDate: '2026-06-23', categoryName: 'METALS', alertCount: 3 }
    ];

    const mockSubcategoryData: VolumeAlertDailySummarySubcategory[] = [
      { alertDate: '2026-06-14', subcategoryName: 'OIL_REFINERY', alertCount: 3 },
      { alertDate: '2026-06-14', subcategoryName: 'Software Services', alertCount: 5 },
      { alertDate: '2026-06-14', subcategoryName: 'Public Banks', alertCount: 2 },
      { alertDate: '2026-06-15', subcategoryName: 'OIL_REFINERY', alertCount: 4 },
      { alertDate: '2026-06-15', subcategoryName: 'Software Services', alertCount: 6 },
      { alertDate: '2026-06-15', subcategoryName: 'Public Banks', alertCount: 8 },
      { alertDate: '2026-06-15', subcategoryName: 'Steel Products', alertCount: 3 },
      { alertDate: '2026-06-16', subcategoryName: 'OIL_REFINERY', alertCount: 2 },
      { alertDate: '2026-06-16', subcategoryName: 'Software Services', alertCount: 4 },
      { alertDate: '2026-06-16', subcategoryName: 'Public Banks', alertCount: 5 },
      { alertDate: '2026-06-17', subcategoryName: 'OIL_REFINERY', alertCount: 5 },
      { alertDate: '2026-06-17', subcategoryName: 'Software Services', alertCount: 7 },
      { alertDate: '2026-06-17', subcategoryName: 'Public Banks', alertCount: 3 },
      { alertDate: '2026-06-17', subcategoryName: 'Steel Products', alertCount: 4 },
      { alertDate: '2026-06-18', subcategoryName: 'OIL_REFINERY', alertCount: 8 },
      { alertDate: '2026-06-18', subcategoryName: 'Software Services', alertCount: 14 },
      { alertDate: '2026-06-18', subcategoryName: 'Public Banks', alertCount: 9 },
      { alertDate: '2026-06-18', subcategoryName: 'Steel Products', alertCount: 6 },
      { alertDate: '2026-06-19', subcategoryName: 'OIL_REFINERY', alertCount: 4 },
      { alertDate: '2026-06-19', subcategoryName: 'Software Services', alertCount: 5 },
      { alertDate: '2026-06-19', subcategoryName: 'Public Banks', alertCount: 3 },
      { alertDate: '2026-06-20', subcategoryName: 'OIL_REFINERY', alertCount: 1 },
      { alertDate: '2026-06-20', subcategoryName: 'Software Services', alertCount: 2 },
      { alertDate: '2026-06-20', subcategoryName: 'Public Banks', alertCount: 1 },
      { alertDate: '2026-06-21', subcategoryName: 'OIL_REFINERY', alertCount: 2 },
      { alertDate: '2026-06-21', subcategoryName: 'Software Services', alertCount: 3 },
      { alertDate: '2026-06-21', subcategoryName: 'Public Banks', alertCount: 4 },
      { alertDate: '2026-06-22', subcategoryName: 'OIL_REFINERY', alertCount: 6 },
      { alertDate: '2026-06-22', subcategoryName: 'Software Services', alertCount: 9 },
      { alertDate: '2026-06-22', subcategoryName: 'Public Banks', alertCount: 7 },
      { alertDate: '2026-06-22', subcategoryName: 'Steel Products', alertCount: 5 },
      { alertDate: '2026-06-23', subcategoryName: 'OIL_REFINERY', alertCount: 7 },
      { alertDate: '2026-06-23', subcategoryName: 'Software Services', alertCount: 11 },
      { alertDate: '2026-06-23', subcategoryName: 'Public Banks', alertCount: 8 },
      { alertDate: '2026-06-23', subcategoryName: 'Steel Products', alertCount: 3 }
    ];

    setCategoryData(mockCategoryData);
    setSubcategoryData(mockSubcategoryData);
  };

  useEffect(() => {
    fetchSummaryData();
  }, []);

  // Filter and process dataset based on active configurations
  const processedData = React.useMemo(() => {
    const isCategory = groupBy === 'category';
    const rawData = isCategory ? categoryData : subcategoryData;

    if (rawData.length === 0) return { dates: [], groups: [], series: [], rawData: [] };

    // Get all unique dates and sort them chronologically
    const allDates = Array.from(new Set(rawData.map(item => item.alertDate))).sort();

    // Slice based on date range selection
    let filteredDates = [...allDates];
    if (dateRange !== 'all') {
      filteredDates = allDates.slice(-dateRange);
    }

    const dateSet = new Set(filteredDates);

    // Filter raw items that belong to the filtered dates
    const filteredItems = rawData.filter(item => dateSet.has(item.alertDate));

    // Get all unique groups in the filtered dataset
    const allGroups = Array.from(
      new Set(
        filteredItems.map(item =>
          isCategory
            ? (item as VolumeAlertDailySummaryCategory).categoryName
            : (item as VolumeAlertDailySummarySubcategory).subcategoryName
        )
      )
    ).sort();

    // Construct series data for ECharts
    const series = allGroups.map(groupName => {
      const dataValues = filteredDates.map(d => {
        const match = filteredItems.find(item => {
          const matchDate = item.alertDate === d;
          const matchGroup = isCategory
            ? (item as VolumeAlertDailySummaryCategory).categoryName === groupName
            : (item as VolumeAlertDailySummarySubcategory).subcategoryName === groupName;
          return matchDate && matchGroup;
        });
        return match ? match.alertCount : 0;
      });

      return {
        name: groupName,
        type: 'bar',
        stack: 'total',
        emphasis: {
          focus: 'series'
        },
        barMaxWidth: 40,
        data: dataValues
      };
    });

    return {
      dates: filteredDates,
      groups: allGroups,
      series,
      rawData: filteredItems
    };
  }, [categoryData, subcategoryData, groupBy, dateRange]);

  // Compute Stats for top widgets
  const stats = React.useMemo(() => {
    const items = processedData.rawData;
    if (items.length === 0) {
      return { totalAlerts: 0, peakDate: 'N/A', peakVal: 0, topGroup: 'N/A', topGroupVal: 0 };
    }

    // Total alerts
    const totalAlerts = items.reduce((acc, curr) => acc + curr.alertCount, 0);

    // Peak Alerts Date
    const dailyCounts: { [key: string]: number } = {};
    items.forEach(item => {
      dailyCounts[item.alertDate] = (dailyCounts[item.alertDate] || 0) + item.alertCount;
    });

    let peakDate = 'N/A';
    let peakVal = 0;
    Object.entries(dailyCounts).forEach(([date, count]) => {
      if (count > peakVal) {
        peakVal = count;
        peakDate = date;
      }
    });

    // Top Alert Group (Category or Subcategory)
    const groupCounts: { [key: string]: number } = {};
    items.forEach(item => {
      const name = groupBy === 'category'
        ? (item as VolumeAlertDailySummaryCategory).categoryName
        : (item as VolumeAlertDailySummarySubcategory).subcategoryName;
      groupCounts[name] = (groupCounts[name] || 0) + item.alertCount;
    });

    let topGroup = 'N/A';
    let topGroupVal = 0;
    Object.entries(groupCounts).forEach(([name, count]) => {
      if (count > topGroupVal) {
        topGroupVal = count;
        topGroup = name;
      }
    });

    return {
      totalAlerts,
      peakDate,
      peakVal,
      topGroup,
      topGroupVal
    };
  }, [processedData, groupBy]);

  // Render & Update Stacked ECharts
  useEffect(() => {
    if (loading || processedData.dates.length === 0 || !chartRef.current) return;

    // Dispose old instance if it exists
    if (chartInstance.current) {
      chartInstance.current.dispose();
    }

    const isDark = activeTheme === 'dark';
    chartInstance.current = echarts.init(chartRef.current, isDark ? 'dark' : undefined);

    const colors = [
      '#3b82f6', // blue
      '#10b981', // emerald
      '#f59e0b', // amber
      '#ef4444', // red
      '#8b5cf6', // violet
      '#06b6d4', // cyan
      '#ec4899', // pink
      '#14b8a6', // teal
      '#f43f5e', // rose
      '#6366f1'  // indigo
    ];

    const option: echarts.EChartsOption = {
      backgroundColor: 'transparent',
      color: colors,
      grid: {
        left: '2%',
        right: '2%',
        bottom: '4%',
        top: '15%',
        containLabel: true
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        backgroundColor: isDark ? '#1f2937' : '#ffffff',
        borderColor: isDark ? '#374151' : '#e2e8f0',
        textStyle: {
          color: isDark ? '#f9fafb' : '#0f172a',
          fontSize: 13
        },
        formatter: (params: any) => {
          if (!params || params.length === 0) return '';
          let total = 0;
          let html = `<div style="font-family: var(--font-sans); padding: 6px; min-width: 200px;">`;
          html += `<div style="font-weight: 700; font-size: 14px; border-bottom: 1px solid ${isDark ? '#374151' : '#e2e8f0'}; padding-bottom: 6px; margin-bottom: 8px; display: flex; justify-content: space-between;">`;
          html += `<span>${params[0].axisValue}</span>`;
          html += `</div>`;
          html += `<div style="display: flex; flex-direction: column; gap: 6px; max-height: 180px; overflow-y: auto; padding-right: 4px;">`;

          // Sort items by value descending
          const sortedParams = [...params].sort((a: any, b: any) => (b.value || 0) - (a.value || 0));

          sortedParams.forEach((p: any) => {
            const val = p.value || 0;
            if (val > 0) {
              total += val;
              html += `<div style="display: flex; justify-content: space-between; align-items: center; gap: 16px; font-size: 12px;">`;
              html += `<span style="display: flex; align-items: center; gap: 8px;">`;
              html += `<span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background-color: ${p.color};"></span>`;
              html += `${p.seriesName}`;
              html += `</span>`;
              html += `<strong style="color: ${isDark ? '#f3f4f6' : '#1f2937'};">${val}</strong>`;
              html += `</div>`;
            }
          });
          html += `</div>`;
          html += `<div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid ${isDark ? '#374151' : '#e2e8f0'}; display: flex; justify-content: space-between; align-items: center; font-size: 12px; font-weight: 600;">`;
          html += `<span>Total Alerts</span>`;
          html += `<strong style="color: var(--primary); font-size: 14px;">${total}</strong>`;
          html += `</div>`;
          html += `</div>`;
          return html;
        }
      },
      legend: {
        show: true,
        type: 'scroll',
        orient: 'horizontal',
        top: 'top',
        left: 'center',
        padding: [0, 20, 15, 20],
        textStyle: {
          color: isDark ? '#9ca3af' : '#475569',
          fontFamily: 'var(--font-sans)',
          fontSize: 11
        },
        pageIconColor: isDark ? '#9ca3af' : '#475569',
        pageIconInactiveColor: isDark ? '#374151' : '#cbd5e1',
        pageTextStyle: {
          color: isDark ? '#9ca3af' : '#475569'
        }
      },
      xAxis: {
        type: 'category',
        data: processedData.dates,
        axisLine: {
          lineStyle: {
            color: isDark ? '#374151' : '#cbd5e1'
          }
        },
        axisLabel: {
          color: isDark ? '#9ca3af' : '#475569',
          fontFamily: 'var(--font-sans)',
          fontSize: 11,
          rotate: 15
        }
      },
      yAxis: {
        type: 'value',
        name: 'Alert Count',
        nameTextStyle: {
          color: isDark ? '#9ca3af' : '#475569',
          fontFamily: 'var(--font-sans)',
          fontSize: 11
        },
        splitLine: {
          lineStyle: {
            color: isDark ? '#1f2937' : '#f1f5f9'
          }
        },
        axisLabel: {
          color: isDark ? '#9ca3af' : '#475569',
          fontFamily: 'var(--font-sans)',
          fontSize: 11
        }
      },
      series: processedData.series as any
    };

    chartInstance.current.setOption(option);

    // Dynamic resize hook
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
  }, [loading, processedData, activeTheme]);

  // Clean-up chart on unmount
  useEffect(() => {
    return () => {
      chartInstance.current?.dispose();
    };
  }, []);

  // Compute daily totals for the details table
  const dailyTotalsTableData = React.useMemo(() => {
    if (processedData.dates.length === 0) return [];
    
    // Sort dates descending for the table (latest first)
    const reversedDates = [...processedData.dates].reverse();

    return reversedDates.map(date => {
      const itemsForDate = processedData.rawData.filter(item => item.alertDate === date);
      const total = itemsForDate.reduce((acc, curr) => acc + curr.alertCount, 0);

      // Create a nice breakdown text
      const breakdown = itemsForDate
        .map(item => {
          const name = groupBy === 'category'
            ? (item as VolumeAlertDailySummaryCategory).categoryName
            : (item as VolumeAlertDailySummarySubcategory).subcategoryName;
          return `${name}: ${item.alertCount}`;
        })
        .join(', ');

      return {
        date,
        total,
        breakdown
      };
    });
  }, [processedData, groupBy]);

  return (
    <div>
      {/* Header */}
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>VA Stacked</h1>
        <p className={styles.pageSubtitle}>
          Daily aggregate of Volume Alerts stacked by categories and sectors to track industry-wide momentum.
        </p>
      </div>

      {/* Stats Summary Grid */}
      <div className={styles.statsGrid} style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '20px' }}>
        
        {/* Total Volume Alerts */}
        <div className={styles.card} style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div className={styles.statsLabel}>Total Period Alerts</div>
            <div className={styles.statsVal} style={{ fontSize: '24px', marginTop: '4px' }}>
              {loading ? '-' : stats.totalAlerts}
            </div>
          </div>
          <div className={styles.statsIconContainer} style={{ padding: '8px' }}>
            <BarChart3 size={18} />
          </div>
        </div>

        {/* Peak Volume Alert Day */}
        <div className={styles.card} style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div className={styles.statsLabel}>Peak Day</div>
            <div className={styles.statsVal} style={{ fontSize: '24px', color: 'var(--primary)', marginTop: '4px' }}>
              {loading ? '-' : stats.peakVal > 0 ? `${stats.peakVal} Alerts` : '0 Alerts'}
            </div>
            {!loading && stats.peakVal > 0 && (
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Calendar size={10} /> {stats.peakDate}
              </div>
            )}
          </div>
          <div className={styles.statsIconContainer} style={{ padding: '8px', backgroundColor: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary)' }}>
            <Calendar size={18} />
          </div>
        </div>

        {/* Top Active Sector / Category */}
        <div className={styles.card} style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div className={styles.statsLabel}>Top Sector ({groupBy === 'category' ? 'Cat' : 'Sub'})</div>
            <div className={styles.statsVal} style={{ fontSize: '24px', color: 'var(--accent-success)', marginTop: '4px', maxWidth: '190px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={stats.topGroup}>
              {loading ? '-' : stats.topGroup}
            </div>
            {!loading && stats.topGroupVal > 0 && (
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                {stats.topGroupVal} Alerts generated
              </div>
            )}
          </div>
          <div className={styles.statsIconContainer} style={{ padding: '8px', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-success)' }}>
            <Layers size={18} />
          </div>
        </div>

      </div>

      {/* Main Stacked Bar Chart Card */}
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
        } : { position: 'relative', marginBottom: '24px' }}
      >
        {/* Chart Controller Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            Daily Momentum Stacked Chart
          </h2>
          
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            
            {/* Group By Selector */}
            <div style={{ display: 'inline-flex', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', padding: '2px' }}>
              <button
                type="button"
                style={{
                  border: 'none',
                  outline: 'none',
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '12px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  backgroundColor: groupBy === 'category' ? 'var(--bg-secondary)' : 'transparent',
                  color: groupBy === 'category' ? 'var(--text-primary)' : 'var(--text-secondary)',
                  boxShadow: groupBy === 'category' ? 'var(--shadow-sm)' : 'none',
                  transition: 'all var(--transition-fast)'
                }}
                onClick={() => setGroupBy('category')}
              >
                Category
              </button>
              <button
                type="button"
                style={{
                  border: 'none',
                  outline: 'none',
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '12px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  backgroundColor: groupBy === 'subcategory' ? 'var(--bg-secondary)' : 'transparent',
                  color: groupBy === 'subcategory' ? 'var(--text-primary)' : 'var(--text-secondary)',
                  boxShadow: groupBy === 'subcategory' ? 'var(--shadow-sm)' : 'none',
                  transition: 'all var(--transition-fast)'
                }}
                onClick={() => setGroupBy('subcategory')}
              >
                Subcategory
              </button>
            </div>

            {/* Date Range Selector */}
            <div style={{ display: 'inline-flex', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', padding: '2px' }}>
              {([7, 15, 30, 'all'] as const).map(range => (
                <button
                  key={range}
                  type="button"
                  style={{
                    border: 'none',
                    outline: 'none',
                    padding: '6px 10px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '12px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    backgroundColor: dateRange === range ? 'var(--bg-secondary)' : 'transparent',
                    color: dateRange === range ? 'var(--text-primary)' : 'var(--text-secondary)',
                    boxShadow: dateRange === range ? 'var(--shadow-sm)' : 'none',
                    transition: 'all var(--transition-fast)'
                  }}
                  onClick={() => setDateRange(range)}
                >
                  {range === 'all' ? 'All' : `${range}D`}
                </button>
              ))}
            </div>

            {/* Refresh Button */}
            <button
              type="button"
              className={styles.toggleBtn}
              onClick={fetchSummaryData}
              disabled={loading}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', padding: 0 }}
              title="Refresh Data"
            >
              <RefreshCw size={14} className={loading ? styles.spin : ''} />
            </button>

            {/* Fullscreen Button */}
            <button
              type="button"
              className={styles.toggleBtn}
              onClick={() => setIsFullscreen(!isFullscreen)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', height: '32px' }}
            >
              {isFullscreen ? (
                <>
                  <Minimize2 size={14} />
                  Exit
                </>
              ) : (
                <>
                  <Maximize2 size={14} />
                  Fullscreen
                </>
              )}
            </button>
          </div>
        </div>

        {/* ECharts Area wrapper */}
        {loading ? (
          <div style={{ height: isFullscreen ? 'calc(100vh - 160px)' : '420px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--text-muted)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              <RefreshCw size={24} className={styles.spin} />
              <span>Loading chart summaries...</span>
            </div>
          </div>
        ) : error && categoryData.length === 0 ? (
          <div style={{ height: isFullscreen ? 'calc(100vh - 160px)' : '420px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--accent-error)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', textAlign: 'center', padding: '24px' }}>
              <Info size={28} />
              <strong>Data Fetching Failed</strong>
              <span style={{ fontSize: '13px', opacity: 0.8, maxWidth: '400px' }}>{error}</span>
            </div>
          </div>
        ) : processedData.dates.length === 0 ? (
          <div style={{ height: isFullscreen ? 'calc(100vh - 160px)' : '420px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--text-muted)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              <Info size={24} />
              <span>No volume alert records found for the selected range.</span>
            </div>
          </div>
        ) : (
          <div
            ref={chartRef}
            style={{
              width: '100%',
              height: isFullscreen ? 'calc(100vh - 160px)' : '420px',
              minHeight: '300px'
            }}
          />
        )}
      </div>

      {/* Raw Data Detail Table */}
      {!loading && dailyTotalsTableData.length > 0 && !isFullscreen && (
        <div className={styles.card} style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 16px 0' }}>
            Daily Breakdown Details
          </h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                  <th style={{ padding: '10px 8px', color: 'var(--text-muted)', fontWeight: 500, width: '120px' }}>Date</th>
                  <th style={{ padding: '10px 8px', color: 'var(--text-muted)', fontWeight: 500, width: '100px', textAlign: 'center' }}>Total Alerts</th>
                  <th style={{ padding: '10px 8px', color: 'var(--text-muted)', fontWeight: 500 }}>Breakdown</th>
                </tr>
              </thead>
              <tbody>
                {dailyTotalsTableData.map((row, idx) => (
                  <tr
                    key={row.date}
                    style={{
                      borderBottom: idx < dailyTotalsTableData.length - 1 ? '1px solid var(--border-color)' : 'none',
                      backgroundColor: idx % 2 === 0 ? 'transparent' : 'rgba(255, 255, 255, 0.01)'
                    }}
                  >
                    <td style={{ padding: '10px 8px', fontWeight: 500, color: 'var(--text-secondary)' }}>{row.date}</td>
                    <td style={{ padding: '10px 8px', textAlign: 'center', fontWeight: 600, color: 'var(--primary)' }}>
                      {row.total}
                    </td>
                    <td style={{ padding: '10px 8px', color: 'var(--text-muted)', fontStyle: 'italic', maxWidth: '400px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={row.breakdown}>
                      {row.breakdown || 'No spikes'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default VAStacked;
