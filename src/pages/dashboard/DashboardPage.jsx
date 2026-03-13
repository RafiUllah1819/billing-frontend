import { useEffect, useState } from 'react';
import {
  ArrowRight,
  AlertTriangle,
  FileText,
  Package,
  ShoppingCart,
  Users,
  Wallet,
  Receipt,
  TrendingUp,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
} from 'recharts';
import api from '../../api/axios';
import './dashboard.css';

const DashboardPage = () => {
  const [summary, setSummary] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [lowStock, setLowStock] = useState([]);
  const [recentSales, setRecentSales] = useState([]);
  const [recentPurchases, setRecentPurchases] = useState([]);
  const [recentPayments, setRecentPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  const safeArray = (value) => (Array.isArray(value) ? value : []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const [
        summaryRes,
        analyticsRes,
        lowStockRes,
        recentSalesRes,
        recentPurchasesRes,
        paymentsRes,
      ] = await Promise.allSettled([
        api.get('/dashboard/summary'),
        api.get('/dashboard/analytics'),
        api.get('/dashboard/low-stock'),
        api.get('/dashboard/recent-sales'),
        api.get('/dashboard/recent-purchases'),
        api.get('/payments'),
      ]);

      if (summaryRes.status === 'fulfilled') {
        setSummary(summaryRes.value?.data?.data || {});
      } else {
        setSummary({});
      }

      if (analyticsRes.status === 'fulfilled') {
        setAnalytics(analyticsRes.value?.data?.data || {});
      } else {
        setAnalytics({});
      }

      if (lowStockRes.status === 'fulfilled') {
        setLowStock(safeArray(lowStockRes.value?.data?.data));
      } else {
        setLowStock([]);
      }

      if (recentSalesRes.status === 'fulfilled') {
        setRecentSales(safeArray(recentSalesRes.value?.data?.data));
      } else {
        setRecentSales([]);
      }

      if (recentPurchasesRes.status === 'fulfilled') {
        setRecentPurchases(safeArray(recentPurchasesRes.value?.data?.data));
      } else {
        setRecentPurchases([]);
      }

      if (paymentsRes.status === 'fulfilled') {
        const paymentsData = safeArray(paymentsRes.value?.data?.data);
        setRecentPayments(paymentsData.slice(0, 6));
      } else {
        setRecentPayments([]);
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return <div className="page-loading">Loading dashboard...</div>;
  }

  const summaryCards = [
    {
      label: 'Total Sales',
      value: summary?.total_sales ?? 0,
      icon: FileText,
      link: '/invoices',
    },
    {
      label: 'Total Purchases',
      value: summary?.total_purchases ?? 0,
      icon: ShoppingCart,
      link: '/purchases',
    },
    {
      label: 'Customer Due',
      value: summary?.total_customer_due ?? 0,
      icon: Users,
      link: '/ledger/customers',
    },
    {
      label: 'Supplier Due',
      value: summary?.total_supplier_due ?? 0,
      icon: Package,
      link: '/ledger/suppliers',
    },
    {
      label: 'Low Stock Items',
      value: summary?.low_stock_count ?? lowStock.length ?? 0,
      icon: AlertTriangle,
      link: '/stock/movements',
      warning: true,
    },
  ];

  const analyticsCards = [
    {
      label: 'Sales Today',
      value: analytics?.sales_today ?? 0,
      icon: Receipt,
      tone: 'success',
    },
    {
      label: 'Purchases Today',
      value: analytics?.purchases_today ?? 0,
      icon: ShoppingCart,
      tone: 'info',
    },
    {
      label: 'Receivables',
      value: analytics?.total_receivables ?? 0,
      icon: Wallet,
      tone: 'warning',
    },
    {
      label: 'Payables',
      value: analytics?.total_payables ?? 0,
      icon: TrendingUp,
      tone: 'purple',
    },
  ];

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Business overview, analytics, stock alerts, and recent activity</p>
      </div>

      <div className="dashboard-summary-grid">
        {summaryCards.map((card) => {
          const Icon = card.icon;

          return (
            <Link
              to={card.link}
              className={`dashboard-summary-card ${card.warning ? 'warning-card' : ''}`}
              key={card.label}
            >
              <div className="summary-card-top">
                <div
                  className={`summary-icon-wrap ${
                    card.warning ? 'warning-icon' : ''
                  }`}
                >
                  <Icon size={18} />
                </div>
                <ArrowRight size={16} className="summary-arrow" />
              </div>

              <span>{card.label}</span>
              <h3>{card.value}</h3>
            </Link>
          );
        })}
      </div>

      <div className="dashboard-analytics-grid">
        {analyticsCards.map((card) => {
          const Icon = card.icon;

          return (
            <div className="dashboard-mini-card" key={card.label}>
              <div className={`mini-card-icon ${card.tone}`}>
                <Icon size={18} />
              </div>
              <div>
                <span>{card.label}</span>
                <h3>{card.value}</h3>
              </div>
            </div>
          );
        })}
      </div>

      <div className="dashboard-main-grid">
        <div className="dashboard-panel card">
          <div className="panel-header">
            <div>
              <h2>Quick Actions</h2>
              <p>Jump directly into daily workflows</p>
            </div>
          </div>

          <div className="quick-actions-grid">
            <Link to="/invoices/create" className="quick-action-box">
              <FileText size={18} />
              <span>Create Invoice</span>
            </Link>

            <Link to="/purchases/create" className="quick-action-box">
              <ShoppingCart size={18} />
              <span>Create Purchase</span>
            </Link>

            <Link to="/payments/customer-receipt" className="quick-action-box">
              <Receipt size={18} />
              <span>Receive Payment</span>
            </Link>

            <Link to="/payments/supplier-payment" className="quick-action-box">
              <Wallet size={18} />
              <span>Pay Supplier</span>
            </Link>

            <Link to="/stock/adjustments" className="quick-action-box">
              <Package size={18} />
              <span>Stock Adjustment</span>
            </Link>

            <Link to="/reports/stock" className="quick-action-box">
              <AlertTriangle size={18} />
              <span>Stock Report</span>
            </Link>
          </div>
        </div>

        <div className="dashboard-panel card">
          <div className="panel-header">
            <div>
              <h2>Top Selling Products</h2>
              <p>Best performing products by quantity sold</p>
            </div>
          </div>

          {safeArray(analytics?.top_products).length ? (
            <div className="mini-list">
              {safeArray(analytics?.top_products).map((item) => (
                <div className="mini-list-row" key={item.id}>
                  <div className="product-mini-cell">
                    {item.image_url ? (
                      <img
                        src={`http://localhost:5000${item.image_url}`}
                        alt={item.title}
                        className="mini-product-image"
                      />
                    ) : (
                      <div className="mini-product-placeholder">P</div>
                    )}

                    <div>
                      <strong>{item.title}</strong>
                      <small>{item.product_code}</small>
                    </div>
                  </div>

                  <div className="mini-list-right success-count">
                    <span>{item.total_qty_sold ?? item.total_sold ?? 0}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-widget">No sales data found</div>
          )}
        </div>
      </div>

      <div className="dashboard-chart-grid">
        <div className="dashboard-panel card">
          <div className="panel-header">
            <div>
              <h2>Monthly Sales</h2>
              <p>Last 6 months sales trend</p>
            </div>
          </div>

          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={safeArray(analytics?.monthly_sales)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="total" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="dashboard-panel card">
          <div className="panel-header">
            <div>
              <h2>Monthly Purchases</h2>
              <p>Last 6 months purchase trend</p>
            </div>
          </div>

          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={safeArray(analytics?.monthly_purchases)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="total" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="dashboard-bottom-grid">
        <div className="dashboard-panel card">
          <div className="panel-header">
            <div>
              <h2>Low Stock Products</h2>
              <p>Products that need restocking soon</p>
            </div>
            <Link to="/reports/stock" className="panel-link">
              View All
            </Link>
          </div>

          {lowStock.length === 0 ? (
            <div className="empty-widget">No low stock products found</div>
          ) : (
            <div className="mini-list">
              {lowStock.slice(0, 6).map((item) => (
                <div className="mini-list-row" key={item.id}>
                  <div className="product-mini-cell">
                    {item.image_url ? (
                      <img
                        src={`http://localhost:5000${item.image_url}`}
                        alt={item.title}
                        className="mini-product-image"
                      />
                    ) : (
                      <div className="mini-product-placeholder">P</div>
                    )}

                    <div>
                      <strong>{item.title}</strong>
                      <small>{item.product_code}</small>
                    </div>
                  </div>

                  <div className="mini-list-right danger-count">
                    <span>{item.current_stock}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="dashboard-panel card">
          <div className="panel-header">
            <div>
              <h2>Recent Payments</h2>
              <p>Latest customer receipts and supplier payments</p>
            </div>
            <Link to="/payments" className="panel-link">
              View All
            </Link>
          </div>

          {recentPayments.length === 0 ? (
            <div className="empty-widget">No recent payments found</div>
          ) : (
            <div className="table-wrapper">
              <table className="modern-table compact-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Party</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {recentPayments.map((payment) => (
                    <tr key={payment.id}>
                      <td>{payment.payment_date?.slice(0, 10)}</td>
                      <td>{payment.payment_type}</td>
                      <td>{payment.customer_name || payment.supplier_name || '-'}</td>
                      <td>{payment.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <div className="dashboard-bottom-grid">
        <div className="dashboard-panel card">
          <div className="panel-header">
            <div>
              <h2>Recent Sales</h2>
              <p>Latest sales invoices</p>
            </div>
            <Link to="/invoices" className="panel-link">
              View All
            </Link>
          </div>

          {recentSales.length === 0 ? (
            <div className="empty-widget">No recent sales found</div>
          ) : (
            <div className="table-wrapper">
              <table className="modern-table compact-table">
                <thead>
                  <tr>
                    <th>Invoice</th>
                    <th>Customer</th>
                    <th>Total</th>
                    <th>Due</th>
                  </tr>
                </thead>
                <tbody>
                  {recentSales.map((sale) => (
                    <tr key={sale.id}>
                      <td>{sale.invoice_no}</td>
                      <td>{sale.customer_name}</td>
                      <td>{sale.total_amount}</td>
                      <td>{sale.due_amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="dashboard-panel card">
          <div className="panel-header">
            <div>
              <h2>Recent Purchases</h2>
              <p>Latest purchase bills</p>
            </div>
            <Link to="/purchases" className="panel-link">
              View All
            </Link>
          </div>

          {recentPurchases.length === 0 ? (
            <div className="empty-widget">No recent purchases found</div>
          ) : (
            <div className="table-wrapper">
              <table className="modern-table compact-table">
                <thead>
                  <tr>
                    <th>Bill</th>
                    <th>Supplier</th>
                    <th>Total</th>
                    <th>Due</th>
                  </tr>
                </thead>
                <tbody>
                  {recentPurchases.map((bill) => (
                    <tr key={bill.id}>
                      <td>{bill.bill_no}</td>
                      <td>{bill.supplier_name}</td>
                      <td>{bill.total_amount}</td>
                      <td>{bill.due_amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;