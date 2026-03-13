import { useEffect, useState } from 'react';
import { Plus, RefreshCw, Search, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import './purchases.css';

const PurchasesPage = () => {
  const [bills, setBills] = useState([]);
  const [filteredBills, setFilteredBills] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchBills = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/purchases');
      const data = response.data.data || [];
      setBills(data);
      setFilteredBills(data);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load purchase bills');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBills();
  }, []);

  useEffect(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      setFilteredBills(bills);
      return;
    }

    const filtered = bills.filter((bill) => {
      return (
        bill.bill_no?.toLowerCase().includes(keyword) ||
        bill.supplier_name?.toLowerCase().includes(keyword) ||
        bill.status?.toLowerCase().includes(keyword)
      );
    });

    setFilteredBills(filtered);
  }, [search, bills]);

  return (
    <div className="purchases-page">
      <div className="page-header-row">
        <div className="page-header">
          <h1>Purchases</h1>
          <p>Manage supplier bills, stock purchases, and payable amounts</p>
        </div>

        <Link to="/purchases/create" className="primary-header-btn link-btn">
          <Plus size={18} />
          <span>Create Purchase</span>
        </Link>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="purchase-table-card card">
        <div className="table-topbar">
          <div>
            <h2>Purchase Bill List</h2>
            <p>{filteredBills.length} record(s) found</p>
          </div>

          <div className="table-actions">
            <div className="search-box">
              <Search size={16} />
              <input
                type="text"
                placeholder="Search purchase bills..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <button className="refresh-btn" onClick={fetchBills}>
              <RefreshCw size={16} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="table-state">Loading purchase bills...</div>
        ) : filteredBills.length === 0 ? (
          <div className="table-state">No purchase bills found</div>
        ) : (
          <div className="table-wrapper">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Bill No</th>
                  <th>Date</th>
                  <th>Supplier</th>
                  <th>Total</th>
                  <th>Paid</th>
                  <th>Due</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredBills.map((bill) => (
                  <tr key={bill.id}>
                    <td>
                      <span className="code-badge">{bill.bill_no}</span>
                    </td>
                    <td>{bill.bill_date?.slice(0, 10)}</td>
                    <td>{bill.supplier_name}</td>
                    <td>{bill.total_amount}</td>
                    <td>{bill.paid_amount}</td>
                    <td>{bill.due_amount}</td>
                    <td>
                      <span className="status-badge">{bill.status}</span>
                    </td>
                    <td>
                      <Link to={`/purchases/${bill.id}`} className="icon-link-btn">
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

export default PurchasesPage;