import React from 'react';
import styles from '../pages.module.css';

interface Project {
  id: string;
  name: string;
  desc: string;
  status: string;
  statusType: 'success' | 'warning' | 'error' | 'info';
  progress: number;
  dueDate: string;
  teamSize: number;
}

export const Overview: React.FC = () => {
  const projects: Project[] = [
    {
      id: '1',
      name: 'E-Commerce Re-platform',
      desc: 'Migrating monolithic online store infrastructure into modern microservices architecture with Next.js.',
      status: 'Active',
      statusType: 'warning',
      progress: 75,
      dueDate: 'June 30, 2026',
      teamSize: 4
    },
    {
      id: '2',
      name: 'AI Analytics Engine',
      desc: 'Developing predictive model layers to deliver personalized product suggestions and customer trends.',
      status: 'Completed',
      statusType: 'success',
      progress: 100,
      dueDate: 'Completed',
      teamSize: 3
    },
    {
      id: '3',
      name: 'CRM Cloud Migration',
      desc: 'Porting legacy on-prem customer profiles database over to highly secure AWS cloud instances.',
      status: 'Planning',
      statusType: 'info',
      progress: 15,
      dueDate: 'August 12, 2026',
      teamSize: 2
    },
    {
      id: '4',
      name: 'Antigravity UI Design System',
      desc: 'Creating an internal modular component system based on CSS variables, tokens, and React templates.',
      status: 'In Review',
      statusType: 'warning',
      progress: 90,
      dueDate: 'June 20, 2026',
      teamSize: 5
    },
    {
      id: '5',
      name: 'Automated Billing Portal',
      desc: 'Constructing customer payment endpoints supporting recurring Stripe cycles and invoice generators.',
      status: 'On Hold',
      statusType: 'error',
      progress: 40,
      dueDate: 'Suspended',
      teamSize: 1
    }
  ];

  return (
    <div>
      {/* Header */}
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Project Overview</h1>
        <p className={styles.pageSubtitle}>Manage and monitor progress across your active enterprise portfolios.</p>
      </div>

      {/* Projects Grid */}
      <div className={styles.projectGrid}>
        {projects.map((proj) => {
          let badgeClass = styles.badgeSuccess;
          if (proj.statusType === 'warning') badgeClass = styles.badgeWarning;
          if (proj.statusType === 'error') badgeClass = styles.badgeError;
          if (proj.statusType === 'info') badgeClass = styles.badgeInfo;

          return (
            <div key={proj.id} className={styles.card}>
              {/* Card Header */}
              <div className={proj.dueDate ? styles.projectCardHeader : ''}>
                <h3 className={styles.projectCardTitle}>{proj.name}</h3>
                <span className={`${styles.badge} ${badgeClass}`}>{proj.status}</span>
              </div>

              {/* Description */}
              <p className={styles.projectCardDesc}>{proj.desc}</p>

              {/* Progress Bar */}
              <div className={styles.progressContainer}>
                <div className={styles.progressBarHeader}>
                  <span>Progress</span>
                  <span style={{ fontWeight: 600 }}>{proj.progress}%</span>
                </div>
                <div className={styles.progressBarBg}>
                  <div
                    className={styles.progressBarFill}
                    style={{ width: `${proj.progress}%` }}
                  />
                </div>
              </div>

              {/* Card Footer */}
              <div className={styles.projectCardFooter}>
                <span>Due: <strong style={{ color: 'var(--text-secondary)' }}>{proj.dueDate}</strong></span>
                <span>Team: <strong style={{ color: 'var(--text-secondary)' }}>{proj.teamSize} members</strong></span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default Overview;
