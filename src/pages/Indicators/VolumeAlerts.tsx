import React, { useState, useEffect } from 'react';
import { Bell, Volume2, AlertTriangle, RefreshCw, Info, Search } from 'lucide-react';
import styles from '../pages.module.css';
import { getAlerts, type VolumeAlertResponse } from '../../utils/api';

export const VolumeAlerts: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [alerts, setAlerts] = useState<VolumeAlertResponse[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Search, Filter and Sort states
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [sortField, setSortField] = useState<string>('alertDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Dynamically compute unique categories for the filter select
  const uniqueCategories = React.useMemo(() => {
    const categories = new Set<string>();
    alerts.forEach(alert => {
      const catName = alert.stockSymbol?.subcategory?.category?.name;
      if (catName) {
        categories.add(catName);
      }
    });
    return Array.from(categories).sort();
  }, [alerts]);

  // Handle click sorting
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
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

  // Memoized filter and sort of the alerts dataset
  const filteredAndSortedAlerts = React.useMemo(() => {
    // 1. Filter
    let result = alerts.filter(alert => {
      // Search query
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const sym = alert.stockSymbol?.symbol?.toLowerCase() || '';
        const cat = alert.stockSymbol?.subcategory?.category?.name?.toLowerCase() || '';
        const subcat = alert.stockSymbol?.subcategory?.name?.toLowerCase() || '';
        if (!sym.includes(q) && !cat.includes(q) && !subcat.includes(q)) {
          return false;
        }
      }

      // Category filter
      if (selectedCategory !== 'all') {
        const cat = alert.stockSymbol?.subcategory?.category?.name;
        if (cat !== selectedCategory) {
          return false;
        }
      }

      // Severity filter
      if (selectedSeverity !== 'all') {
        const severity = getAlertSeverity(alert.multiplier);
        if (severity !== selectedSeverity) {
          return false;
        }
      }

      return true;
    });

    // 2. Sort
    result.sort((a, b) => {
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

    return result;
  }, [alerts, searchQuery, selectedCategory, selectedSeverity, sortField, sortDirection]);


  const fetchAlerts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAlerts();
      setAlerts(data || []);
    } catch (e: any) {
      console.warn('Backend alerts fetch failed, falling back to mock dataset.', e);
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
        thresholdUsed: 1.5
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
        thresholdUsed: 1.5
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
        thresholdUsed: 1.5
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
        thresholdUsed: 1.5
      }
    ];
    setAlerts(mockAlerts);
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const formatVolume = (vol: number) => {
    if (vol >= 1000000) {
      return `${(vol / 1000000).toFixed(2)}M`;
    }
    if (vol >= 1000) {
      return `${(vol / 1000).toFixed(1)}K`;
    }
    return vol.toLocaleString();
  };

  const getAlertSeverity = (multiplier: number) => {
    if (multiplier >= 3.0) return 'critical';
    if (multiplier >= 2.0) return 'warning';
    return 'info';
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
            <div className={styles.statsVal} style={{ fontSize: '24px', marginTop: '4px' }}>{alerts.length}</div>
          </div>
          <div className={styles.statsIconContainer} style={{ padding: '8px' }}>
            <Bell size={18} />
          </div>
        </div>

        <div className={styles.card} style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div className={styles.statsLabel}>Critical ( &gt; 3x Avg )</div>
            <div className={styles.statsVal} style={{ fontSize: '24px', color: 'var(--accent-error)', marginTop: '4px' }}>
              {alerts.filter(a => getAlertSeverity(a.multiplier) === 'critical').length}
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
            {uniqueCategories.map(cat => (
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
                {filteredAndSortedAlerts.length > 0 ? (
                  filteredAndSortedAlerts.map((alert) => {
                    const severity = getAlertSeverity(alert.multiplier);
                    const symInfo = alert.stockSymbol;
                    const subcatName = symInfo?.subcategory?.name || 'N/A';
                    const catName = symInfo?.subcategory?.category?.name || 'N/A';
                    
                    return (
                      <tr key={alert.id}>
                        <td>
                          <span style={{ fontWeight: 700, color: 'var(--primary)' }}>
                            {symInfo?.symbol || 'UNKNOWN'}
                          </span>
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
                    <td colSpan={8} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                      No matching volume anomalies found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default VolumeAlerts;
