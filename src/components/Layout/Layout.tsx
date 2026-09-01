import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from '../Sidebar/Sidebar';
import { Header } from '../Header/Header';
import styles from './Layout.module.css';

const routeTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/projects/overview': 'Project Overview',
  '/projects/analytics': 'Project Analytics',
  '/markets/nse/symbols': 'NSE Symbols',
  '/markets/nse/categories': 'NSE Sector Categories',
  '/markets/nse/subcategories': 'NSE Subcategories',
  '/indicators/heatmaps/subcategory': 'Subcategory Heatmap',
  '/indicators/heatmaps/deliveries': 'Deliveries Heatmap',
  '/indicators/tagboard': 'Tagboard Heatmaps',
  '/indicators/volume-alerts': 'Volume Alerts',
  '/indicators/delivery-alerts': 'Delivery Alerts',
  '/indicators/va-stacked': 'VA Stacked',
  '/settings/profile': 'Profile Settings',
  '/settings/security': 'Security Settings',
  '/help': 'Help & Support'
};

export const Layout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const title = routeTitles[location.pathname];
    if (title) {
      document.title = `${title} | Girnar Stock AI`;
    }
  }, [location.pathname]);

  return (
    <div className={styles.layoutContainer}>
      {/* Sidebar Component */}
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main Wrapper: shifts right based on Sidebar state */}
      <div className={`${styles.mainWrapper} ${collapsed ? styles.collapsed : ''}`}>
        {/* Header Component */}
        <Header
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          setMobileOpen={setMobileOpen}
        />

        {/* Content Area */}
        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};
export default Layout;
