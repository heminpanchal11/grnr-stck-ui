import React, { useState, useEffect } from 'react';
import { Bell, Volume2, AlertTriangle, RefreshCw, Info, Search } from 'lucide-react';
import styles from '../pages.module.css';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { getCategories, searchDeliveryAlerts, type DeliveryAlertResponse, type SearchAlertsParams } from '../../utils/api';

const getTodayDateString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const DeliveryAlerts: React.FC = () => {
  useDocumentTitle('Delivery Alerts');
  const [loading, setLoading] = useState<boolean>(true);
  const [alerts, setAlerts] = useState<DeliveryAlertResponse[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Search, Filter and Sort states
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString);
  const [sortField, setSortField] = useState<string>('alertDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Pagination states
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [totalElements, setTotalElements] = useState<number>(0);

  // Stats states
  const [criticalCount, setCriticalCount] = useState<number>(0);
  const [categoriesList, setCategoriesList] = useState<string[]>([]);
  const [activeActionRowId, setActiveActionRowId] = useState<number | null>(null);

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Load categories list on mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const cats = await getCategories();
        setCategoriesList(cats.map(c => c.name).sort());
      } catch (e) {
        console.warn('Failed to load categories, using default categories list.', e);
        setCategoriesList(['ENERGY', 'FINANCE', 'IT', 'METALS']);
      }
    };
    loadCategories();
  }, []);

  // Close symbol popover on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.symbol-popover-trigger')) {
        setActiveActionRowId(null);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  // Handle click sorting
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('desc'); // default to desc for metrics/dates
    }
    setCurrentPage(0);
  };

  // Render sorting arrows
  const renderSortIndicator = (field: string) => {
    if (sortField !== field) {
      return <span style={{ marginLeft: '4px', opacity: 0.4, fontSize: '11px' }}>↕</span>;
    }
    return sortDirection === 'asc' ? 
      <span style={{ marginLeft: '4px', color: 'var(--primary)', fontSize: '11px' }}>▲</span> : 
      <span style={{ marginLeft: '4px', color: 'var(--primary)', fontSize: '11px' }}>▼</span>;
  };

  const getAlertSeverity = (multiplier: number) => {
    if (multiplier >= 2.5) return 'critical';
    if (multiplier >= 1.5) return 'warning';
    return 'info';
  };

  const fetchAlerts = async () => {
    setLoading(true);
    setError(null);
    try {
      // Map sort fields
      let sortBy = 'alertDate';
      if (sortField === 'symbol') {
        sortBy = 'stockSymbol.symbol';
      } else if (sortField === 'severity') {
        sortBy = 'multiplier';
      } else if (
        sortField === 'averageDeliveryPercentage' || 
        sortField === 'latestDeliveryPercentage' || 
        sortField === 'multiplier' || 
        sortField === 'percentageChange'
      ) {
        sortBy = sortField;
      }

      // Map severity to minMultiplier
      let minMultiplier: number | undefined = undefined;
      if (selectedSeverity === 'critical') {
        minMultiplier = 2.5;
      } else if (selectedSeverity === 'warning') {
        minMultiplier = 1.5;
      }

      const params: SearchAlertsParams = {
        symbol: debouncedSearchQuery ? debouncedSearchQuery.trim() : undefined,
        category: selectedCategory === 'all' ? undefined : selectedCategory,
        startDate: selectedDate || undefined,
        endDate: selectedDate || undefined,
        minMultiplier,
        page: currentPage,
        size: pageSize,
        sortBy,
        sortDir: sortDirection
      };

      const criticalParams: SearchAlertsParams = {
        symbol: debouncedSearchQuery ? debouncedSearchQuery.trim() : undefined,
        category: selectedCategory === 'all' ? undefined : selectedCategory,
        startDate: selectedDate || undefined,
        endDate: selectedDate || undefined,
        minMultiplier: 2.5,
        page: 0,
        size: 1
      };

      const [data, criticalData] = await Promise.all([
        searchDeliveryAlerts(params).catch(() => null),
        searchDeliveryAlerts(criticalParams).catch(() => null)
      ]);

      if (data && Array.isArray(data.content)) {
        setAlerts(data.content);
        setTotalPages(data.totalPages ?? Math.ceil(data.content.length / pageSize));
        setTotalElements(data.totalElements ?? data.content.length);
        setCriticalCount(criticalData?.totalElements ?? 0);
      } else {
        useMockData();
      }
    } catch (e: any) {
      console.warn('Backend delivery alerts search failed, falling back to mock dataset.', e);
      setError(e.message || 'Failed to retrieve delivery alerts from backend.');
      useMockData();
    } finally {
      setLoading(false);
    }
  };

  const useMockData = () => {
    const todayStr = getTodayDateString();
    const mockAlerts: DeliveryAlertResponse[] = [
      {
        id: 1,
        stockSymbol: {
          id: 101,
          symbol: 'RELIANCE',
          category: 'ENERGY',
          subcategory: 'OIL_REFINERY'
        } as any,
        alertDate: todayStr,
        averageDeliveryPercentage: 25.5,
        latestDeliveryPercentage: 76.5,
        multiplier: 3.0,
        thresholdUsed: 1.5,
        percentageChange: 3.45,
        tradedQty: 14700000,
        deliveryQty: 11245500
      },
      {
        id: 2,
        stockSymbol: {
          id: 102,
          symbol: 'INFY',
          category: 'IT',
          subcategory: 'Software Services'
        } as any,
        alertDate: todayStr,
        averageDeliveryPercentage: 30.0,
        latestDeliveryPercentage: 75.0,
        multiplier: 2.5,
        thresholdUsed: 1.5,
        percentageChange: -1.20,
        tradedQty: 5460000,
        deliveryQty: 4095000
      },
      {
        id: 3,
        stockSymbol: {
          id: 103,
          symbol: 'SBIN',
          category: 'FINANCE',
          subcategory: 'Public Banks'
        } as any,
        alertDate: todayStr,
        averageDeliveryPercentage: 20.0,
        latestDeliveryPercentage: 36.0,
        multiplier: 1.8,
        thresholdUsed: 1.5,
        percentageChange: 2.10,
        tradedQty: 10440000,
        deliveryQty: 3758400
      },
      {
        id: 4,
        stockSymbol: {
          id: 104,
          symbol: 'TATASTEEL',
          category: 'METALS',
          subcategory: 'Steel Products'
        } as any,
        alertDate: todayStr,
        averageDeliveryPercentage: 35.0,
        latestDeliveryPercentage: 45.5,
        multiplier: 1.3,
        thresholdUsed: 1.5,
        percentageChange: -0.85,
        tradedQty: 15600000,
        deliveryQty: 7098000
      }
    ];

    let filtered = mockAlerts.filter((alert) => {
      const symInfo = alert.stockSymbol;
      const subcatName = typeof symInfo?.subcategory === 'object' ? (symInfo.subcategory as any).name : (symInfo?.subcategory || '');
      const catName = typeof symInfo?.subcategory === 'object' && (symInfo.subcategory as any).category ? (symInfo.subcategory as any).category.name : (symInfo?.category || '');
      
      if (debouncedSearchQuery) {
        const query = debouncedSearchQuery.toLowerCase();
        const symbolMatch = symInfo?.symbol?.toLowerCase().includes(query);
        const catMatch = catName.toLowerCase().includes(query);
        const subcatMatch = subcatName.toLowerCase().includes(query);
        if (!symbolMatch && !catMatch && !subcatMatch) return false;
      }
      if (selectedCategory !== 'all') {
        if (catName !== selectedCategory) return false;
      }
      if (selectedDate !== '') {
        if (alert.alertDate !== selectedDate) return false;
      }
      if (selectedSeverity !== 'all') {
        const severity = getAlertSeverity(alert.multiplier);
        if (severity !== selectedSeverity) return false;
      }
      return true;
    });

    filtered.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'symbol') {
        const aVal = a.stockSymbol?.symbol || '';
        const bVal = b.stockSymbol?.symbol || '';
        comparison = aVal.localeCompare(bVal);
      } else if (sortField === 'averageDeliveryPercentage') {
        comparison = a.averageDeliveryPercentage - b.averageDeliveryPercentage;
      } else if (sortField === 'latestDeliveryPercentage') {
        comparison = a.latestDeliveryPercentage - b.latestDeliveryPercentage;
      } else if (sortField === 'multiplier') {
        comparison = a.multiplier - b.multiplier;
      } else if (sortField === 'percentageChange') {
        comparison = (a.percentageChange ?? 0) - (b.percentageChange ?? 0);
      } else if (sortField === 'alertDate') {
        comparison = a.alertDate.localeCompare(b.alertDate);
      } else if (sortField === 'severity') {
        const getSeverityWeight = (m: number) => {
          const s = getAlertSeverity(m);
          if (s === 'critical') return 3;
          if (s === 'warning') return 2;
          return 1;
        };
        comparison = getSeverityWeight(a.multiplier) - getSeverityWeight(b.multiplier);
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    const total = filtered.length;
    const pages = Math.ceil(total / pageSize);
    const startIdx = currentPage * pageSize;
    const paginated = filtered.slice(startIdx, startIdx + pageSize);

    const critical = filtered.filter(a => getAlertSeverity(a.multiplier) === 'critical').length;

    setAlerts(paginated);
    setTotalPages(pages);
    setTotalElements(total);
    setCriticalCount(critical);
  };

  // Reset page to 0 when filters change
  useEffect(() => {
    setCurrentPage(0);
  }, [debouncedSearchQuery, selectedCategory, selectedSeverity, selectedDate]);

  // Fetch when page, size, sorting or debounced filters change
  useEffect(() => {
    fetchAlerts();
  }, [currentPage, pageSize, debouncedSearchQuery, selectedCategory, selectedSeverity, selectedDate, sortField, sortDirection]);

  // Client-side display filtering for Warning/Info severity ranges (if active)
  const displayAlerts = React.useMemo(() => {
    if (selectedSeverity === 'warning') {
      return alerts.filter(a => getAlertSeverity(a.multiplier) === 'warning');
    }
    if (selectedSeverity === 'info') {
      return alerts.filter(a => getAlertSeverity(a.multiplier) === 'info');
    }
    return alerts;
  }, [alerts, selectedSeverity]);

  const formatVolume = (vol: number) => {
    if (vol >= 1000000) {
      return `${(vol / 1000000).toFixed(2)}M`;
    }
    if (vol >= 1000) {
      return `${(vol / 1000).toFixed(1)}K`;
    }
    return vol.toLocaleString();
  };

  return (
    <div>
      {/* Header */}
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Delivery Alerts</h1>
        <p className={styles.pageSubtitle}>Monitor real-time delivery percentage spikes exceeding historic moving averages.</p>
      </div>

      {/* Stats Summary Grid */}
      <div className={styles.statsGrid} style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '20px' }}>
        <div className={styles.card} style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div className={styles.statsLabel}>Total Delivery Alerts</div>
            <div className={styles.statsVal} style={{ fontSize: '24px', marginTop: '4px' }}>{totalElements}</div>
          </div>
          <div className={styles.statsIconContainer} style={{ padding: '8px' }}>
            <Bell size={18} />
          </div>
        </div>

        <div className={styles.card} style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div className={styles.statsLabel}>Critical ( &gt; 2.5x Avg )</div>
            <div className={styles.statsVal} style={{ fontSize: '24px', color: 'var(--accent-error)', marginTop: '4px' }}>
              {criticalCount}
            </div>
          </div>
          <div className={styles.statsIconContainer} style={{ padding: '8px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--accent-error)' }}>
            <AlertTriangle size={18} />
          </div>
        </div>

        <div className={styles.card} style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div className={styles.statsLabel}>Active Threshold</div>
            <div className={styles.statsVal} style={{ fontSize: '24px', color: 'var(--primary)', marginTop: '4px' }}>
              {alerts.length > 0 ? `${alerts[0].thresholdUsed}x` : '1.5x'}
            </div>
          </div>
          <div className={styles.statsIconContainer} style={{ padding: '8px' }}>
            <Volume2 size={18} />
          </div>
        </div>
      </div>

      {/* Error / Warning Alert */}
      {error && (
        <div style={{
          backgroundColor: 'rgba(245, 158, 11, 0.08)',
          border: '1px solid var(--accent-warning)',
          borderRadius: 'var(--radius-md)',
          padding: '12px 16px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          color: 'var(--accent-warning)',
          fontSize: '13px',
          fontWeight: 600
        }}>
          <AlertTriangle size={16} style={{ flexShrink: 0 }} />
          <span>Using offline mock dataset. Backend warning: {error}</span>
        </div>
      )}

      {/* Main Alert List Card */}
      <div className={styles.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 className={styles.sectionTitle} style={{ margin: 0 }}>Active Delivery Anomalies</h2>
          <button
            type="button"
            className={styles.input}
            onClick={fetchAlerts}
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
            Refresh Alerts
          </button>
        </div>

        {/* Info box */}
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
            Click on any stock symbol below to view research links for Screener or TradingView. Spike ratio indicates today's delivery percentage relative to its historic moving average.
          </span>
        </div>

        {/* Filter Controls Row */}
        <div style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '20px',
          flexWrap: 'wrap',
          alignItems: 'center'
        }}>
          {/* Search bar */}
          <div style={{ position: 'relative', flex: '1', minWidth: '200px' }}>
            <input
              type="text"
              placeholder="Search by symbol, sector or industry..."
              className={styles.input}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', paddingLeft: '36px' }}
            />
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <select
              className={`${styles.input} ${styles.filterSelect}`}
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              title="Filter by Sector"
            >
              <option value="all">All Sectors</option>
              {categoriesList.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            <select
              className={`${styles.input} ${styles.filterSelect}`}
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              title="Filter by Severity"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical (≥ 2.5x)</option>
              <option value="warning">Warning (1.5x - 2.49x)</option>
              <option value="info">Info (&lt; 1.5x)</option>
            </select>

            <input
              type="date"
              className={`${styles.input} ${styles.filterSelect}`}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              title="Filter by Alert Date"
            />
            {selectedDate && (
              <button
                type="button"
                onClick={() => setSelectedDate('')}
                className={styles.input}
                style={{
                  padding: '10px 12px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'var(--bg-tertiary)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-secondary)'
                }}
                title="Clear Date Filter"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Alerts Table */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '64px 0', gap: '12px' }}>
            <RefreshCw size={32} className="spin-icon" style={{ color: 'var(--primary)' }} />
            <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Scanning markets for delivery anomalies...</span>
          </div>
        ) : (
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th 
                    className={styles.sortableHeader} 
                    onClick={() => handleSort('symbol')}
                  >
                    Symbol {renderSortIndicator('symbol')}
                  </th>
                  <th>Category / Sector</th>
                  <th>Subcategory / Industry</th>
                  <th 
                    className={styles.sortableHeader} 
                    onClick={() => handleSort('averageDeliveryPercentage')}
                  >
                    Historic Avg Delivery % {renderSortIndicator('averageDeliveryPercentage')}
                  </th>
                  <th 
                    className={styles.sortableHeader} 
                    onClick={() => handleSort('latestDeliveryPercentage')}
                  >
                    Today Delivery % {renderSortIndicator('latestDeliveryPercentage')}
                  </th>
                  <th 
                    className={styles.sortableHeader} 
                    onClick={() => handleSort('multiplier')}
                  >
                    Spike Ratio {renderSortIndicator('multiplier')}
                  </th>
                  <th>Delivery Volume</th>
                  <th>Today Traded Volume</th>
                  <th 
                    className={styles.sortableHeader} 
                    onClick={() => handleSort('percentageChange')}
                  >
                    % Change {renderSortIndicator('percentageChange')}
                  </th>
                  <th 
                    className={styles.sortableHeader} 
                    onClick={() => handleSort('alertDate')}
                  >
                    Alert Date {renderSortIndicator('alertDate')}
                  </th>
                  <th 
                    className={styles.sortableHeader} 
                    onClick={() => handleSort('severity')}
                  >
                    Severity {renderSortIndicator('severity')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {displayAlerts.length > 0 ? (
                  displayAlerts.map((alert) => {
                    const severity = getAlertSeverity(alert.multiplier);
                    const symInfo = alert.stockSymbol;
                    const subcatName = typeof symInfo?.subcategory === 'object' ? (symInfo.subcategory as any).name : (symInfo?.subcategory || 'N/A');
                    const catName = typeof symInfo?.subcategory === 'object' && (symInfo.subcategory as any).category ? (symInfo.subcategory as any).category.name : (symInfo?.category || 'N/A');
                    
                    return (
                      <tr key={alert.id}>
                        <td>
                          <div style={{ position: 'relative' }} className="symbol-popover-trigger">
                            <span 
                              onClick={() => setActiveActionRowId(activeActionRowId === alert.id ? null : alert.id)}
                              style={{ 
                                fontWeight: 700, 
                                color: 'var(--primary)', 
                                cursor: 'pointer',
                                borderBottom: '1px dotted var(--primary)'
                              }}
                              title="Click for research links"
                            >
                              {symInfo?.symbol || 'UNKNOWN'}
                            </span>
                            
                            {activeActionRowId === alert.id && symInfo?.symbol && (
                              <div style={{
                                position: 'absolute',
                                top: 'calc(100% + 6px)',
                                left: 0,
                                zIndex: 100,
                                backgroundColor: 'var(--bg-secondary)',
                                border: '1px solid var(--border-color)',
                                borderRadius: 'var(--radius-md)',
                                padding: '10px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '8px',
                                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.15)',
                                minWidth: '160px',
                                backdropFilter: 'blur(8px)',
                              }}>
                                <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '2px', textAlign: 'left', display: 'block' }}>
                                  Research {symInfo.symbol}
                                </span>
                                <a
                                  href={`https://www.screener.in/company/${symInfo.symbol}/consolidated/`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{
                                    fontSize: '12px',
                                    padding: '6px 10px',
                                    borderRadius: 'var(--radius-sm)',
                                    backgroundColor: 'var(--bg-tertiary)',
                                    color: 'var(--text-primary)',
                                    border: '1px solid var(--border-color)',
                                    textDecoration: 'none',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    fontWeight: 500,
                                  }}
                                  className={styles.popoverLink}
                                >
                                  🔍 Screener.in
                                </a>
                                <a
                                  href={`https://www.tradingview.com/chart/YCQiJhNa/?symbol=NSE%3A${symInfo.symbol}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{
                                    fontSize: '12px',
                                    padding: '6px 10px',
                                    borderRadius: 'var(--radius-sm)',
                                    backgroundColor: 'var(--bg-tertiary)',
                                    color: 'var(--text-primary)',
                                    border: '1px solid var(--border-color)',
                                    textDecoration: 'none',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    fontWeight: 500,
                                  }}
                                  className={styles.popoverLink}
                                >
                                  📈 TradingView
                                </a>
                              </div>
                            )}
                          </div>
                        </td>
                        <td>
                          <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                            {catName}
                          </span>
                        </td>
                        <td>
                          <span className={styles.badge} style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)', textTransform: 'none', letterSpacing: 0 }}>
                            {subcatName}
                          </span>
                        </td>
                        <td>{alert.averageDeliveryPercentage.toFixed(1)}%</td>
                        <td>{alert.latestDeliveryPercentage.toFixed(1)}%</td>
                        <td style={{ fontWeight: 700 }}>
                          <span style={{ color: severity === 'critical' ? 'var(--accent-error)' : severity === 'warning' ? 'var(--accent-warning)' : 'var(--text-primary)' }}>
                            {alert.multiplier.toFixed(2)}x
                          </span>
                        </td>
                        <td>{alert.deliveryQty ? formatVolume(alert.deliveryQty) : '-'}</td>
                        <td>{alert.tradedQty ? formatVolume(alert.tradedQty) : '-'}</td>
                        <td>
                          {alert.percentageChange !== undefined && alert.percentageChange !== null ? (
                            <span style={{ 
                              color: alert.percentageChange > 0 ? 'var(--accent-success)' : alert.percentageChange < 0 ? 'var(--accent-error)' : 'var(--text-primary)',
                              fontWeight: 600 
                            }}>
                              {alert.percentageChange > 0 ? '+' : ''}{alert.percentageChange.toFixed(2)}%
                            </span>
                          ) : (
                            <span style={{ color: 'var(--text-muted)' }}>-</span>
                          )}
                        </td>
                        <td style={{ color: 'var(--text-muted)' }}>{alert.alertDate}</td>
                        <td>
                          <span 
                            className={styles.badge} 
                            style={{
                              backgroundColor: severity === 'critical' ? 'rgba(239, 68, 68, 0.1)' : severity === 'warning' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(14, 165, 233, 0.1)',
                              color: severity === 'critical' ? 'var(--accent-error)' : severity === 'warning' ? 'var(--accent-warning)' : 'var(--accent-info)',
                              fontWeight: 700
                            }}
                          >
                            {severity.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={11} style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-secondary)' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                        <span>No matching delivery anomalies found{selectedDate ? ` for ${selectedDate}` : ''}.</span>
                        {selectedDate && (
                          <button
                            type="button"
                            onClick={() => setSelectedDate('')}
                            style={{
                              marginTop: '6px',
                              padding: '6px 14px',
                              borderRadius: 'var(--radius-sm)',
                              backgroundColor: 'var(--primary-light)',
                              color: 'var(--primary)',
                              border: '1px solid var(--border-color)',
                              cursor: 'pointer',
                              fontSize: '12px',
                              fontWeight: 600
                            }}
                          >
                            View All Recorded Dates
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        {!loading && totalPages > 1 && (
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '20px',
            padding: '12px 16px',
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                Showing <strong>{totalElements === 0 ? 0 : currentPage * pageSize + 1}</strong> to <strong>{Math.min((currentPage + 1) * pageSize, totalElements)}</strong> of <strong>{totalElements}</strong> alerts
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Show:</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(0);
                  }}
                  className={styles.filterSelect}
                  style={{ padding: '4px 8px', fontSize: '12px', width: 'auto', minWidth: '60px', height: 'auto' }}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button
                type="button"
                onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                disabled={currentPage === 0}
                className={styles.input}
                style={{
                  padding: '6px 12px',
                  cursor: currentPage === 0 ? 'not-allowed' : 'pointer',
                  opacity: currentPage === 0 ? 0.5 : 1,
                  fontSize: '13px',
                  fontWeight: 600,
                  backgroundColor: 'var(--bg-tertiary)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-primary)',
                  height: 'auto'
                }}
              >
                Previous
              </button>

              {/* Page numbers */}
              {Array.from({ length: totalPages }, (_, i) => {
                const isSelected = i === currentPage;
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setCurrentPage(i)}
                    className={styles.input}
                    style={{
                      padding: '6px 12px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: 600,
                      backgroundColor: isSelected ? 'var(--primary)' : 'var(--bg-tertiary)',
                      borderColor: isSelected ? 'var(--primary)' : 'var(--border-color)',
                      color: isSelected ? '#ffffff' : 'var(--text-primary)',
                      height: 'auto'
                    }}
                  >
                    {i + 1}
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                disabled={currentPage === totalPages - 1}
                className={styles.input}
                style={{
                  padding: '6px 12px',
                  cursor: currentPage === totalPages - 1 ? 'not-allowed' : 'pointer',
                  opacity: currentPage === totalPages - 1 ? 0.5 : 1,
                  fontSize: '13px',
                  fontWeight: 600,
                  backgroundColor: 'var(--bg-tertiary)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-primary)',
                  height: 'auto'
                }}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeliveryAlerts;
