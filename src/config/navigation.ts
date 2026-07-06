import {
  LayoutDashboard,
  Folder,
  ListTodo,
  BarChart3,
  Settings,
  User,
  Shield,
  HelpCircle,
  TrendingUp,
  Activity,
  Layers,
  GitBranch,
  Flame,
  Bell
} from 'lucide-react';
import React from 'react';

export interface SidebarItemType {
  label: string;
  icon?: React.ComponentType<any>;
  path?: string;
  children?: SidebarItemType[];
}

export interface NavigationSection {
  title?: string;
  items: SidebarItemType[];
}

export const navigationConfig: NavigationSection[] = [
  {
    title: 'Core',
    items: [
      {
        label: 'Dashboard',
        icon: LayoutDashboard,
        path: '/'
      }
    ]
  },
  {
    title: 'Management',
    items: [
      {
        label: 'Projects',
        icon: Folder,
        children: [
          {
            label: 'Overview',
            icon: ListTodo,
            path: '/projects/overview'
          },
          {
            label: 'Analytics',
            icon: BarChart3,
            path: '/projects/analytics'
          }
        ]
      }
    ]
  },
  {
    title: 'Markets',
    items: [
      {
        label: 'NSE',
        icon: TrendingUp,
        children: [
          {
            label: 'Symbols',
            icon: Activity,
            path: '/markets/nse/symbols'
          },
          {
            label: 'Categories',
            icon: Layers,
            path: '/markets/nse/categories'
          },
          {
            label: 'Subcategories',
            icon: GitBranch,
            path: '/markets/nse/subcategories'
          }
        ]
      }
    ]
  },

  {
    title: 'Indicators',
    items: [
      {
        label: 'Heatmaps',
        icon: Flame,
        children: [
          {
            label: 'SubCategory',
            icon: GitBranch,
            path: '/indicators/heatmaps/subcategory'
          }
        ]
      },
      {
        label: 'Tagboard',
        icon: Layers,
        path: '/indicators/tagboard'
      },
      {
        label: 'Volume Alerts',
        icon: Bell,
        path: '/indicators/volume-alerts'
      },
      {
        label: 'VA Stacked',
        icon: Layers,
        path: '/indicators/va-stacked'
      }
    ]
  },

  {
    title: 'Config & Support',
    items: [
      {
        label: 'Settings',
        icon: Settings,
        children: [
          {
            label: 'Profile',
            icon: User,
            path: '/settings/profile'
          },
          {
            label: 'Security',
            icon: Shield,
            path: '/settings/security'
          }
        ]
      },
      {
        label: 'Help & FAQ',
        icon: HelpCircle,
        path: '/help'
      }
    ]
  }
];
