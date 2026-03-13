import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Truck,
  Package,
  FileText,
  ShoppingCart,
  LogOut,
  Menu,
  ClipboardList,
  Wallet,
  Receipt,
  BarChart3,
  RotateCcw,
  Database
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import './layout.css';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navGroups = [
    {
      title: 'Overview',
      items: [
        {
          label: 'Dashboard',
          path: '/dashboard',
          icon: LayoutDashboard,
          roles: ['admin', 'manager', 'sales', 'inventory', 'accountant'],
        },
      ],
    },
    {
      title: 'Masters',
      items: [
        {
          label: 'Customers',
          path: '/customers',
          icon: Users,
          roles: ['admin', 'manager', 'sales', 'accountant'],
        },
        {
          label: 'Suppliers',
          path: '/suppliers',
          icon: Truck,
          roles: ['admin', 'manager', 'inventory', 'accountant'],
        },
        {
          label: 'Products',
          path: '/products',
          icon: Package,
          roles: ['admin', 'manager', 'inventory', 'sales', 'accountant'],
        },
        {
          label: 'Users',
          path: '/users',
          icon: Users,
          roles: ['admin']
        },
      ],
    },
    {
      title: 'Sales',
      items: [
        {
          label: 'Invoices',
          path: '/invoices',
          icon: FileText,
          roles: ['admin', 'manager', 'sales', 'accountant'],
        },
        {
          label: 'Receive Payment',
          path: '/payments/customer-receipt',
          icon: Receipt,
          roles: ['admin', 'manager', 'sales', 'accountant'],
        },
        {
          label: 'Sales Return',
          path: '/returns/sales',
          icon: RotateCcw,
          roles: ['admin', 'manager', 'sales'],
        },
      ],
    },
    {
      title: 'Purchases',
      items: [
        {
          label: 'Purchases',
          path: '/purchases',
          icon: ShoppingCart,
          roles: ['admin', 'manager', 'inventory', 'accountant'],
        },
        {
          label: 'Pay Supplier',
          path: '/payments/supplier-payment',
          icon: Wallet,
          roles: ['admin', 'manager', 'inventory', 'accountant'],
        },
        {
          label: 'Purchase Return',
          path: '/returns/purchases',
          icon: RotateCcw,
          roles: ['admin', 'manager', 'inventory'],
        },
      ],
    },
    {
      title: 'Reports',
      items: [
        {
          label: 'Stock Report',
          path: '/reports/stock',
          icon: BarChart3,
          roles: ['admin', 'manager', 'inventory', 'accountant'],
        },
        {
          label: 'Stock Movements',
          path: '/stock/movements',
          icon: ClipboardList,
          roles: ['admin', 'manager', 'inventory', 'accountant'],
        },
        {
          label: 'Stock Adjustment',
          path: '/stock/adjustments',
          icon: ClipboardList,
          roles: ['admin', 'manager', 'inventory'],
        },
      ],
    },
    {
      title: 'Accounts',
      items: [
        {
          label: 'Customer Ledger',
          path: '/ledger/customers',
          icon: ClipboardList,
          roles: ['admin', 'manager', 'sales', 'accountant'],
        },
        {
          label: 'Supplier Ledger',
          path: '/ledger/suppliers',
          icon: ClipboardList,
          roles: ['admin', 'manager', 'inventory', 'accountant'],
        },
        {
          label: 'Payments',
          path: '/payments',
          icon: Wallet,
          roles: ['admin', 'manager', 'sales', 'inventory', 'accountant'],
        },
        {
          label: 'Audit Logs',
          path: '/audit-logs',
          icon: ClipboardList,
          roles: ['admin'],
        },
        {
          label: 'Settings',
          path: '/settings',
          icon: ClipboardList,
          roles: ['admin']
        },
        {
        label: 'Customer Aging',
        path: '/aging/customers',
        icon: ClipboardList,
        roles: ['admin', 'manager', 'sales', 'accountant'],
      },
      {
        label: 'Supplier Aging',
        path: '/aging/suppliers',
        icon: ClipboardList,
        roles: ['admin', 'manager', 'inventory', 'accountant'],
      },
      {
        label: 'Backups',
        path: '/backups',
        icon: Database,
        roles: ['admin'],
      },
      ],
    },
  ];

  const currentUserRole = String(user?.role || '').toLowerCase();

  const visibleGroups = navGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) =>
        !item.roles ||
        item.roles.map((r) => r.toLowerCase()).includes(currentUserRole)
      ),
    }))
    .filter((group) => group.items.length > 0);

  const isActivePath = (path) => {
    if (path === '/dashboard') {
      return location.pathname === path;
    }

    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <div className="admin-shell">
      <aside className={`sidebar ${sidebarOpen ? 'open' : 'collapsed'}`}>
        <div className="sidebar-brand">
          <div className="brand-logo">B</div>
          {sidebarOpen && (
            <div>
              <h2>Billing Pro</h2>
              <p>Management System</p>
            </div>
          )}
        </div>

        <div className="sidebar-scroll">
          {visibleGroups.map((group) => (
            <div className="sidebar-group" key={group.title}>
              {sidebarOpen && (
                <div className="sidebar-group-title">{group.title}</div>
              )}

              <nav className="sidebar-nav">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = isActivePath(item.path);

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`sidebar-link ${isActive ? 'active' : ''}`}
                      title={!sidebarOpen ? item.label : ''}
                    >
                      <Icon size={18} />
                      {sidebarOpen && <span>{item.label}</span>}
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>

        <div className="sidebar-footer">
          {sidebarOpen && (
            <div className="sidebar-user">
              <strong>{user?.full_name || user?.username}</strong>
              <small>{user?.role}</small>
            </div>
          )}

          <button className="sidebar-logout" onClick={handleLogout}>
            <LogOut size={18} />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      <div className="main-area">
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="menu-toggle"
              onClick={() => setSidebarOpen((prev) => !prev)}
            >
              <Menu size={20} />
            </button>
            <div>
              <h1 className="topbar-title">Welcome back</h1>
              <p className="topbar-subtitle">
                Manage invoices, stock, customers, and purchases
              </p>
            </div>
          </div>

          <div className="topbar-right">
            <div className="topbar-user-badge">
              <span>{user?.full_name || user?.username}</span>
            </div>
          </div>
        </header>

        <main className="content-area">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;