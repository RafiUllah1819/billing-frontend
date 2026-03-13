import { useEffect, useState } from 'react';
import { Plus, RefreshCw, Search, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import './invoices.css';

const InvoicesPage = () => {
  const [invoices, setInvoices] = useState([]);
  const [filteredInvoices, setFilteredInvoices] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/invoices');
      const data = response.data.data || [];
      setInvoices(data);
      setFilteredInvoices(data);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  useEffect(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      setFilteredInvoices(invoices);
      return;
    }

    const filtered = invoices.filter((invoice) => {
      return (
        invoice.invoice_no?.toLowerCase().includes(keyword) ||
        invoice.customer_name?.toLowerCase().includes(keyword) ||
        invoice.invoice_type?.toLowerCase().includes(keyword) ||
        invoice.status?.toLowerCase().includes(keyword)
      );
    });

    setFilteredInvoices(filtered);
  }, [search, invoices]);

  return (
    <div className="invoices-page">
      <div className="page-header-row">
        <div className="page-header">
          <h1>Invoices</h1>
          <p>Manage sales invoices, customer billing, and dues</p>
        </div>

        <Link to="/invoices/create" className="primary-header-btn link-btn">
          <Plus size={18} />
          <span>Create Invoice</span>
        </Link>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="invoice-table-card card">
        <div className="table-topbar">
          <div>
            <h2>Invoice List</h2>
            <p>{filteredInvoices.length} record(s) found</p>
          </div>

          <div className="table-actions">
            <div className="search-box">
              <Search size={16} />
              <input
                type="text"
                placeholder="Search invoices..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <button className="refresh-btn" onClick={fetchInvoices}>
              <RefreshCw size={16} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="table-state">Loading invoices...</div>
        ) : filteredInvoices.length === 0 ? (
          <div className="table-state">No invoices found</div>
        ) : (
          <div className="table-wrapper">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Invoice No</th>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Type</th>
                  <th>Total</th>
                  <th>Paid</th>
                  <th>Due</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice.id}>
                    <td>
                      <span className="code-badge">{invoice.invoice_no}</span>
                    </td>
                    <td>{invoice.invoice_date?.slice(0, 10)}</td>
                    <td>{invoice.customer_name}</td>
                    <td>
                      <span
                        className={`type-badge ${
                          invoice.invoice_type === 'TAX' ? 'type-tax' : 'type-non-tax'
                        }`}
                      >
                        {invoice.invoice_type}
                      </span>
                    </td>
                    <td>{invoice.total_amount}</td>
                    <td>{invoice.paid_amount}</td>
                    <td>{invoice.due_amount}</td>
                    <td>
                      <span className="status-badge">{invoice.status}</span>
                    </td>
                    <td>
                      <Link to={`/invoices/${invoice.id}`} className="icon-link-btn">
                        <Eye size={16} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoicesPage;