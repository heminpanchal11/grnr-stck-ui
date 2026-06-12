import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import type { SidebarItemType } from '../../config/navigation';
import styles from './Sidebar.module.css';

interface SidebarItemProps {
  item: SidebarItemType;
  level: number;
  collapsed: boolean;
  onExpandSidebar: () => void;
  onCloseMobile?: () => void;
}

export const SidebarItem: React.FC<SidebarItemProps> = ({
  item,
  level,
  collapsed,
  onExpandSidebar,
  onCloseMobile
}) => {
  const { pathname } = useLocation();
  const hasChildren = item.children && item.children.length > 0;
  
  // Check if this item is currently active
  const isActive = item.path ? pathname === item.path : false;
  
  // Helper to check if any child (or nested grandchild) of this item is active
  const hasActiveChild = (node: SidebarItemType): boolean => {
    if (!node.children) return false;
    return node.children.some(child => {
      if (child.path && pathname === child.path) return true;
      if (child.children) return hasActiveChild(child);
      return false;
    });
  };

  const isChildActive = hasActiveChild(item);
  
  // Track open/collapsed state of nested menu
  const [isOpen, setIsOpen] = useState(isChildActive);

  // Automatically expand if a child becomes active (e.g. on direct page load or external nav)
  useEffect(() => {
    if (isChildActive) {
      setIsOpen(true);
    }
  }, [isChildActive, pathname]);

  // Collapse submenus if the sidebar collapses
  useEffect(() => {
    if (collapsed) {
      setIsOpen(false);
    }
  }, [collapsed]);

  const handleToggle = (e: React.MouseEvent) => {
    if (hasChildren) {
      e.preventDefault();
      if (collapsed) {
        // Expand the sidebar first, then open the menu
        onExpandSidebar();
        setIsOpen(true);
      } else {
        setIsOpen(!isOpen);
      }
    } else if (onCloseMobile) {
      // Close mobile drawer if clicked a leaf node
      onCloseMobile();
    }
  };

  const Icon = item.icon;
  const levelClass = styles[`level${level}`] || '';
  
  // Determine if we show tooltip (only level 0 collapsed items)
  const showTooltip = collapsed && level === 0;

  // The item's primary link/button element
  const itemElement = (
    <>
      <div className={styles.itemContent}>
        {Icon && <Icon className={styles.itemIcon} />}
        <span className={styles.itemLabel}>{item.label}</span>
      </div>
      
      {hasChildren && (
        <ChevronRight
          className={`${styles.chevron} ${isOpen ? styles.chevronExpanded : ''}`}
        />
      )}
      
      {showTooltip && <span className={styles.tooltip}>{item.label}</span>}
    </>
  );

  return (
    <div className={styles.itemWrapper}>
      {item.path ? (
        <Link
          to={item.path}
          className={`${styles.item} ${levelClass} ${isActive ? styles.itemActive : ''}`}
          onClick={handleToggle}
        >
          {itemElement}
        </Link>
      ) : (
        <button
          type="button"
          className={`${styles.item} ${levelClass} ${isChildActive ? styles.itemActive : ''}`}
          onClick={handleToggle}
        >
          {itemElement}
        </button>
      )}

      {hasChildren && (
        <div
          className={`${styles.childrenContainer} ${
            isOpen && !collapsed ? styles.childrenExpanded : ''
          }`}
        >
          <div className={styles.childrenInner}>
            {item.children!.map((child, idx) => (
              <SidebarItem
                key={`${child.label}-${idx}`}
                item={child}
                level={level + 1}
                collapsed={collapsed}
                onExpandSidebar={onExpandSidebar}
                onCloseMobile={onCloseMobile}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
