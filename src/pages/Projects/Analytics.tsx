import React from 'react';
import styles from '../pages.module.css';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

export const Analytics: React.FC = () => {
  useDocumentTitle('Projects Analytics');
  const weeklyWorkload = [
    { label: 'W1', value: 34, height: '34%' },
    { label: 'W2', value: 48, height: '48%' },
    { label: 'W3', value: 65, height: '65%' },
    { label: 'W4', value: 92, height: '92%' },
    { label: 'W5', value: 78, height: '78%' },
    { label: 'W6', value: 85, height: '85%' }
  ];

  return (
    <div>
      {/* Header */}
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Projects Analytics</h1>
        <p className={styles.pageSubtitle}>Review development velocities, sprint reports, and resource allocations.</p>
      </div>

      {/* Grid */}
      <div className={styles.dashboardGrid}>
        {/* Weekly Progress Bar Chart */}
        <div className={styles.card}>
          <h2 className={styles.sectionTitle}>Sprint Task Completion (Velocity)</h2>
          <p className={styles.pageSubtitle} style={{ marginBottom: '16px' }}>Total tasks closed by the development squad per week.</p>
          
          <div className={styles.chartWrapper}>
            <div className={styles.chartBarContainer}>
              {weeklyWorkload.map((wk, idx) => (
                <div key={idx} className={styles.chartBarCol}>
                  <div className={styles.chartBar} style={{ height: wk.height }}>
                    <span className={styles.chartBarValue}>{wk.value}</span>
                  </div>
                  <span className={styles.chartLabel}>{wk.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Resource Distribution (Donut Chart) */}
        <div className={styles.card}>
          <h2 className={styles.sectionTitle}>Project Portfolio Focus</h2>
          <p className={styles.pageSubtitle} style={{ marginBottom: '24px' }}>Distribution of active projects by type.</p>

          <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
            <svg viewBox="0 0 200 200" width="160" height="160" style={{ overflow: 'visible' }}>
              {/* Background Donut track */}
              <circle cx="100" cy="100" r="70" fill="none" stroke="var(--bg-tertiary)" strokeWidth="18"/>
              
              {/* Web Apps segment (50% -> 220 dash) */}
              <circle
                cx="100"
                cy="100"
                r="70"
                fill="none"
                stroke="var(--primary)"
                strokeWidth="18"
                strokeDasharray="220 440"
                strokeDashoffset="0"
                transform="rotate(-90 100 100)"
                strokeLinecap="round"
              />

              {/* Data Science segment (30% -> 132 dash, offset -220) */}
              <circle
                cx="100"
                cy="100"
                r="70"
                fill="none"
                stroke="var(--accent-info)"
                strokeWidth="18"
                strokeDasharray="132 440"
                strokeDashoffset="-220"
                transform="rotate(-90 100 100)"
                strokeLinecap="round"
              />

              {/* Database & Cloud segment (20% -> 88 dash, offset -352) */}
              <circle
                cx="100"
                cy="100"
                r="70"
                fill="none"
                stroke="var(--accent-success)"
                strokeWidth="18"
                strokeDasharray="88 440"
                strokeDashoffset="-352"
                transform="rotate(-90 100 100)"
                strokeLinecap="round"
              />
              
              {/* Inner details text */}
              <text x="100" y="95" fill="var(--text-primary)" fontSize="22" fontWeight="800" textAnchor="middle">12</text>
              <text x="100" y="115" fill="var(--text-muted)" fontSize="9" fontWeight="500" letterSpacing="0.2" textAnchor="middle">TOTAL PORTFOLIO</text>
            </svg>
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--primary)' }} />
                <span style={{ color: 'var(--text-secondary)' }}>Web Applications</span>
              </div>
              <strong style={{ color: 'var(--text-primary)' }}>50%</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--accent-info)' }} />
                <span style={{ color: 'var(--text-secondary)' }}>AI & Data Science</span>
              </div>
              <strong style={{ color: 'var(--text-primary)' }}>30%</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--accent-success)' }} />
                <span style={{ color: 'var(--text-secondary)' }}>Cloud & Database</span>
              </div>
              <strong style={{ color: 'var(--text-primary)' }}>20%</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Extra KPI metrics Card */}
      <div className={styles.card}>
        <h2 className={styles.sectionTitle}>Key Productivity Indicators (KPI)</h2>
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>KPI Metric</th>
                <th>Benchmark Status</th>
                <th>Target</th>
                <th>Actual</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Cycle Time per Task</td>
                <td><span className={`${styles.badge} ${styles.badgeSuccess}`}>Optimal</span></td>
                <td>5.0 Days</td>
                <td>4.2 Days</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>SLA Delivery Rate</td>
                <td><span className={`${styles.badge} ${styles.badgeSuccess}`}>Optimal</span></td>
                <td>90.0%</td>
                <td>92.5%</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Defect Leakage Ratio</td>
                <td><span className={`${styles.badge} ${styles.badgeSuccess}`}>Optimal</span></td>
                <td>&lt; 3.0%</td>
                <td>2.1%</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Automated Code Coverage</td>
                <td><span className={`${styles.badge} ${styles.badgeWarning}`}>Warning</span></td>
                <td>90.0%</td>
                <td>87.8%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default Analytics;
