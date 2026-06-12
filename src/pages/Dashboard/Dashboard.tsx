import React from 'react';
import { Folder, ListTodo, Users, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import styles from '../pages.module.css';

export const Dashboard: React.FC = () => {
  const stats = [
    {
      label: 'Active Projects',
      value: '12',
      change: '+8.3%',
      positive: true,
      icon: Folder
    },
    {
      label: 'Completed Tasks',
      value: '184',
      change: '+14.5%',
      positive: true,
      icon: ListTodo
    },
    {
      label: 'Team Members',
      value: '8',
      change: '0%',
      positive: true,
      icon: Users
    },
    {
      label: 'Success Rate',
      value: '94.2%',
      change: '-1.2%',
      positive: false,
      icon: TrendingUp
    }
  ];

  const recentProjects = [
    { name: 'E-Commerce Platform', category: 'Web App', status: 'Active', statusType: 'warning', completion: '75%' },
    { name: 'AI Analytics Engine', category: 'Data Science', status: 'Completed', statusType: 'success', completion: '100%' },
    { name: 'Mobile Companion App', category: 'iOS/Android', status: 'Planning', statusType: 'info', completion: '15%' },
    { name: 'Legacy CRM Migration', category: 'Database', status: 'On Hold', statusType: 'error', completion: '40%' }
  ];

  return (
    <div>
      {/* Header */}
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Dashboard</h1>
        <p className={styles.pageSubtitle}>Welcome back, John! Here is what is happening across your projects today.</p>
      </div>

      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        {stats.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className={`${styles.card} ${styles.statsCard}`}>
              <div className={styles.statsInfo}>
                <span className={styles.statsLabel}>{item.label}</span>
                <span className={styles.statsVal}>{item.value}</span>
                <span className={`${styles.statsChange} ${item.positive ? styles.changePositive : styles.changeNegative}`}>
                  {item.positive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                  {item.change} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>vs last month</span>
                </span>
              </div>
              <div className={styles.statsIconContainer}>
                <Icon size={20} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className={styles.dashboardGrid}>
        {/* Performance Chart */}
        <div className={styles.card}>
          <h2 className={styles.sectionTitle}>Task Completion Velocity</h2>
          <div className={styles.chartWrapper}>
            <svg viewBox="0 0 600 220" width="100%" height="220" style={{ overflow: 'visible' }}>
              <defs>
                <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.25"/>
                  <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.0"/>
                </linearGradient>
              </defs>
              
              {/* Grid Lines */}
              <line x1="40" y1="30" x2="580" y2="30" stroke="var(--border-color)" strokeDasharray="3 3" />
              <line x1="40" y1="80" x2="580" y2="80" stroke="var(--border-color)" strokeDasharray="3 3" />
              <line x1="40" y1="130" x2="580" y2="130" stroke="var(--border-color)" strokeDasharray="3 3" />
              <line x1="40" y1="180" x2="580" y2="180" stroke="var(--border-color)" strokeWidth="1.5" />
              
              {/* Y Axis Labels */}
              <text x="25" y="34" fill="var(--text-muted)" fontSize="10" textAnchor="end">100</text>
              <text x="25" y="84" fill="var(--text-muted)" fontSize="10" textAnchor="end">50</text>
              <text x="25" y="134" fill="var(--text-muted)" fontSize="10" textAnchor="end">25</text>
              <text x="25" y="184" fill="var(--text-muted)" fontSize="10" textAnchor="end">0</text>
              
              {/* X Axis Labels */}
              <text x="60" y="202" fill="var(--text-muted)" fontSize="11" textAnchor="middle">Mon</text>
              <text x="160" y="202" fill="var(--text-muted)" fontSize="11" textAnchor="middle">Tue</text>
              <text x="260" y="202" fill="var(--text-muted)" fontSize="11" textAnchor="middle">Wed</text>
              <text x="360" y="202" fill="var(--text-muted)" fontSize="11" textAnchor="middle">Thu</text>
              <text x="460" y="202" fill="var(--text-muted)" fontSize="11" textAnchor="middle">Fri</text>
              <text x="560" y="202" fill="var(--text-muted)" fontSize="11" textAnchor="middle">Sat</text>

              {/* Chart Shading Area */}
              <path
                d="M 60 160 Q 160 120 260 140 T 360 60 T 460 80 T 560 40 L 560 180 L 60 180 Z"
                fill="url(#chartGlow)"
              />

              {/* Chart Line */}
              <path
                d="M 60 160 Q 160 120 260 140 T 360 60 T 460 80 T 560 40"
                fill="none"
                stroke="var(--primary)"
                strokeWidth="3.5"
                strokeLinecap="round"
              />

              {/* Interaction Nodes */}
              <circle cx="260" cy="140" r="5" fill="var(--bg-secondary)" stroke="var(--primary)" strokeWidth="3" />
              <circle cx="360" cy="60" r="5" fill="var(--bg-secondary)" stroke="var(--primary)" strokeWidth="3" />
              <circle cx="560" cy="40" r="5" fill="var(--bg-secondary)" stroke="var(--primary)" strokeWidth="3" />
            </svg>
          </div>
        </div>

        {/* Project List */}
        <div className={styles.card}>
          <h2 className={styles.sectionTitle}>Project Status</h2>
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Project</th>
                  <th>Status</th>
                  <th>Progress</th>
                </tr>
              </thead>
              <tbody>
                {recentProjects.map((project, idx) => {
                  let badgeClass = styles.badgeSuccess;
                  if (project.statusType === 'warning') badgeClass = styles.badgeWarning;
                  if (project.statusType === 'error') badgeClass = styles.badgeError;
                  if (project.statusType === 'info') badgeClass = styles.badgeInfo;

                  return (
                    <tr key={idx}>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{project.name}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{project.category}</div>
                      </td>
                      <td>
                        <span className={`${styles.badge} ${badgeClass}`}>
                          {project.status}
                        </span>
                      </td>
                      <td style={{ fontWeight: 500 }}>{project.completion}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Dashboard;
