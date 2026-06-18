import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Sparkles, X } from 'lucide-react';
import { navigationConfig } from '../../config/navigation';
import { SidebarItem } from './SidebarItem';
import styles from './Sidebar.module.css';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen
}) => {
  const handleToggleCollapse = () => {
    setCollapsed(!collapsed);
  };

  const handleExpandSidebar = () => {
    setCollapsed(false);
  };

  const handleCloseMobile = () => {
    setMobileOpen(false);
  };

  return (
    <>
      {/* Backdrop overlay for mobile drawer */}
      <div
        className={`${styles.backdrop} ${mobileOpen ? styles.backdropVisible : ''}`}
        onClick={handleCloseMobile}
      />

      <aside
        className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''} ${
          mobileOpen ? styles.mobileOpen : ''
        }`}
      >
        {/* Logo / Header Section */}
        <div className={styles.logoContainer}>
          <Link to="/" className={styles.logoDetails} onClick={handleCloseMobile}>
            <Sparkles className={styles.logoIcon} />
            <span className={styles.logoText}>Girnar Stock AI</span>
          </Link>
          
          {/* Close button for mobile drawer, toggle for desktop */}
          <button
            type="button"
            className={styles.toggleBtn}
            onClick={mobileOpen ? handleCloseMobile : handleToggleCollapse}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {mobileOpen ? (
              <X size={18} />
            ) : collapsed ? (
              <ChevronRight size={18} />
            ) : (
              <ChevronLeft size={18} />
            )}
          </button>
        </div>

        {/* Navigation list */}
        <nav className={styles.nav}>
          {navigationConfig.map((section, sectionIdx) => (
            <div key={section.title || sectionIdx} className={styles.navSection}>
              {section.title && (
                <div className={styles.sectionHeader}>{section.title}</div>
              )}
              {section.items.map((item, itemIdx) => (
                <SidebarItem
                  key={`${item.label}-${itemIdx}`}
                  item={item}
                  level={0}
                  collapsed={collapsed}
                  onExpandSidebar={handleExpandSidebar}
                  onCloseMobile={handleCloseMobile}
                />
              ))}
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
};
