import React, { useState, useEffect } from 'react';
import { Bell, Volume2, AlertTriangle, RefreshCw, Info, Search } from 'lucide-react';
import styles from '../pages.module.css';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { getCategories, searchAlerts, type VolumeAlertResponse, type SearchAlertsParams } from '../../utils/api';

export const VolumeAlerts: React.FC = () => {
  useDocumentTitle('Volume Alerts');
  const [loading, setLoading] = useState<boolean>(true);
  const [alerts, setAlerts] = useState<VolumeAlertResponse[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Search, Filter and Sort states
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [sortField, setSortField] = useState<string>('alertDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Pagination states
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [totalElements, setTotalElements] = useState<number>(0);

  // Stats / categories states
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
    if (multiplier >= 3.0) return 'critical';
    if (multiplier >= 2.0) return 'warning';
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
      } else if (sortField === 'averageVolume' || sortField === 'latestVolume' || sortField === 'multiplier' || sortField === 'percentageChange' || sortField === 'deliveryPercentage') {
        sortBy = sortField;
      }

      // Map severity to minMultiplier
      let minMultiplier: number | undefined = undefined;
      if (selectedSeverity === 'critical') {
        minMultiplier = 3.0;
      } else if (selectedSeverity === 'warning') {
        minMultiplier = 2.0;
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
        minMultiplier: 3.0,
        page: 0,
        size: 1
      };

      const [data, criticalData] = await Promise.all([
        searchAlerts(params),
        searchAlerts(criticalParams)
      ]);

      setAlerts(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
      setCriticalCount(criticalData.totalElements || 0);
    } catch (e: any) {
      console.warn('Backend alerts search failed, falling back to mock dataset.', e);
      setError(e.message || 'Failed to retrieve volume alerts from backend.');
      useMockData();
    } finally {
      setLoading(false);
    }
  };

  const useMockData = () => {
    const mockAlerts: VolumeAlertResponse[] = [
      {
        id: 1,
        stockSymbol: {
          id: 101,
          symbol: 'RELIANCE',
          subcategory: {
            id: 201,
            name: 'OIL_REFINERY',
            category: {
              id: 301,
              name: 'ENERGY'
            }
          }
        },
        alertDate: '2026-06-18',
        averageVolume: 4200000,
        latestVolume: 14700000,
        multiplier: 3.5,
        thresholdUsed: 1.5,
        percentageChange: 3.45,
        tradedQty: 14700000,
        deliveryQty: 5880000,
        deliveryPercentage: 40.0
      },
      {
        id: 2,
        stockSymbol: {
          id: 102,
          symbol: 'INFY',
          subcategory: {
            id: 202,
            name: 'Software Services',
            category: {
              id: 302,
              name: 'IT'
            }
          }
        },
        alertDate: '2026-06-18',
        averageVolume: 2100000,
        latestVolume: 5460000,
        multiplier: 2.6,
        thresholdUsed: 1.5,
        percentageChange: -1.20,
        tradedQty: 5460000,
        deliveryQty: 1911000,
        deliveryPercentage: 35.0
      },
      {
        id: 3,
        stockSymbol: {
          id: 103,
          symbol: 'SBIN',
          subcategory: {
            id: 203,
            name: 'Public Banks',
            category: {
              id: 303,
              name: 'FINANCE'
            }
          }
        },
        alertDate: '2026-06-18',
        averageVolume: 5800000,
        latestVolume: 10440000,
        multiplier: 1.8,
        thresholdUsed: 1.5,
        percentageChange: 2.10,
        tradedQty: 10440000,
        deliveryQty: 4700000,
        deliveryPercentage: 45.0
      },
      {
        id: 4,
        stockSymbol: {
          id: 104,
          symbol: 'TATASTEEL',
          subcategory: {
            id: 204,
            name: 'Steel Products',
            category: {
              id: 304,
              name: 'METALS'
            }
          }
        },
        alertDate: '2026-06-18',
        averageVolume: 12000000,
        latestVolume: 15600000,
        multiplier: 1.3,
        thresholdUsed: 1.5,
        percentageChange: -0.85,
        tradedQty: 15600000,
        deliveryQty: 7800000,
        deliveryPercentage: 50.0
      }
    ];

    let filtered = mockAlerts.filter((alert) => {
      if (debouncedSearchQuery) {
        const query = debouncedSearchQuery.toLowerCase();
        const symbolMatch = alert.stockSymbol?.symbol?.toLowerCase().includes(query);
        const catMatch = alert.stockSymbol?.subcategory?.category?.name?.toLowerCase().includes(query);
        const subcatMatch = alert.stockSymbol?.subcategory?.name?.toLowerCase().includes(query);
        if (!symbolMatch && !catMatch && !subcatMatch) return false;
      }
      if (selectedCategory !== 'all') {
        if (alert.stockSymbol?.subcategory?.category?.name !== selectedCategory) return false;
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
      } else if (sortField === 'averageVolume') {
        comparison = a.averageVolume - b.averageVolume;
      } else if (sortField === 'latestVolume') {
        comparison = a.latestVolume - b.latestVolume;
      } else if (sortField === 'multiplier') {
        comparison = a.multiplier - b.multiplier;
      } else if (sortField === 'percentageChange') {
        comparison = (a.percentageChange ?? 0) - (b.percentageChange ?? 0);

      } else if (sortField === 'deliveryPercentage') {
        comparison = (a.deliveryPercentage ?? 0) - (b.deliveryPercentage ?? 0);
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
        <h1 className={styles.pageTitle}>Volume Alerts</h1>
        <p className={styles.pageSubtitle}>Monitor real-time trading volume spikes exceeding historic moving averages.</p>
      </div>

      {/* Stats Summary Grid */}
      <div className={styles.statsGrid} style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '20px' }}>
        <div className={styles.card} style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div className={styles.statsLabel}>Total Spike Alerts</div>
            <div className={styles.statsVal} style={{ fontSize: '24px', marginTop: '4px' }}>{totalElements}</div>
          </div>
          <div className={styles.statsIconContainer} style={{ padding: '8px' }}>
            <Bell size={18} />
          </div>
        </div>

        <div className={styles.card} style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div className={styles.statsLabel}>Critical ( &gt; 3x Avg )</div>
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
          <h2 className={styles.sectionTitle} style={{ margin: 0 }}>Active Volume Anomalies</h2>
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
          <Info size={16} style={{ color: 'var(--primary)', flexShrink: 0 }} />
          <span>
            Volume spike alerts track stocks whose daily trading volume exceeds their 20-day moving average. Critical alerts signify volume greater than 3x the daily average.
          </span>
        </div>

        {/* Search and Filters toolbar */}
        <div className={styles.tableControls}>
          <div className={styles.searchWrapper}>
            <span className={styles.searchIcon}>
              <Search size={16} />
            </span>
            <input
              type="text"
              className={`${styles.input} ${styles.searchInput}`}
              placeholder="Search by Symbol, Category, or Industry..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <select
            className={`${styles.input} ${styles.filterSelect}`}
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
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
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="warning">Warning</option>
            <option value="info">Info</option>
          </select>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
            <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Scanning markets for volume anomalies...</span>
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
                    onClick={() => handleSort('averageVolume')}
                  >
                    Historic Avg Volume {renderSortIndicator('averageVolume')}
                  </th>
                  <th 
                    className={styles.sortableHeader} 
                    onClick={() => handleSort('latestVolume')}
                  >
                    Today Traded Volume {renderSortIndicator('latestVolume')}
                  </th>
                  <th 
                    className={styles.sortableHeader} 
                    onClick={() => handleSort('multiplier')}
                  >
                    Spike Ratio {renderSortIndicator('multiplier')}
                  </th>
                  <th 
                    className={styles.sortableHeader} 
                    onClick={() => handleSort('deliveryPercentage')}
                  >
                    Delivery % {renderSortIndicator('deliveryPercentage')}
                  </th>
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
                    const subcatName = symInfo?.subcategory?.name || 'N/A';
                    const catName = symInfo?.subcategory?.category?.name || 'N/A';
                    
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
                        <td>{formatVolume(alert.averageVolume)}</td>
                        <td>{formatVolume(alert.latestVolume)}</td>
                        <td style={{ fontWeight: 700 }}>
                          <span style={{ color: severity === 'critical' ? 'var(--accent-error)' : severity === 'warning' ? 'var(--accent-warning)' : 'var(--text-primary)' }}>
                            {alert.multiplier.toFixed(2)}x
                          </span>
                        </td>

                        <td>
                          {alert.deliveryPercentage !== undefined && alert.deliveryPercentage !== null ? (
                            <span style={{ fontWeight: 600 }}>{alert.deliveryPercentage.toFixed(1)}%</span>
                          ) : (
                            <span style={{ color: 'var(--text-muted)' }}>-</span>
                          )}
                        </td>
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
                    <td colSpan={12} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                      No matching volume anomalies found.
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

export default VolumeAlerts;
