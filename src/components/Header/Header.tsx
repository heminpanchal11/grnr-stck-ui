import React, { useState, useEffect } from 'react';
import { Menu, Search, Sun, Moon } from 'lucide-react';
import styles from './Header.module.css';

interface HeaderProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  setMobileOpen: (open: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  collapsed,
  setCollapsed,
  setMobileOpen
}) => {
  // Theme state synced with localStorage and html data-theme attribute
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('theme') as 'light' | 'dark') || 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const handleToggleSidebar = () => {
    if (window.innerWidth <= 768) {
      setMobileOpen(true);
    } else {
      setCollapsed(!collapsed);
    }
  };

  return (
    <header className={styles.header}>
      {/* Left side: Hamburger and Search */}
      <div className={styles.left}>
        <button
          type="button"
          className={styles.toggleBtn}
          onClick={handleToggleSidebar}
          aria-label="Toggle Navigation Menu"
        >
          <Menu size={20} />
        </button>

        <div className={styles.searchContainer}>
          <Search className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search dashboard..."
            className={styles.searchInput}
          />
        </div>
      </div>

      {/* Right side: Theme Toggle and Profile Info */}
      <div className={styles.right}>
        {/* Theme Switcher Button */}
        <button
          type="button"
          className={styles.iconBtn}
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>

        {/* Profile Pill */}
        <div className={styles.profile}>
          <div className={styles.avatar}>JD</div>
          <div className={styles.profileInfo}>
            <span className={styles.profileName}>John Doe</span>
            <span className={styles.profileRole}>Administrator</span>
          </div>
        </div>
      </div>
    </header>
  );
};
