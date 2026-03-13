import { useEffect, useState } from 'react';
import { Search, RefreshCw, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import './ledger.css';

const CustomerLedgerListPage = () => {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchLedgerCustomers = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/ledger/customers');
      const data = response.data.data || [];
      setCustomers(data);
      setFilteredCustomers(data);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load customer ledger list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLedgerCustomers();
  }, []);

  useEffect(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      setFilteredCustomers(customers);
      return;
    }

    const filtered = customers.filter((customer) => {
      return (
        customer.customer_name?.toLowerCase().includes(keyword) ||
        customer.customer_code?.toLowerCase().includes(keyword) ||
        customer.phone?.toLowerCase().includes(keyword)
      );
    });

    setFilteredCustomers(filtered);
  }, [search, customers]);

  return (
    <div className="ledger-page">
      <div className="page-header">
        <h1>Customer Ledger</h1>
        <p>View customer balances and ledger statements</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="ledger-card card">
        <div className="table-topbar">
          <div>
            <h2>Customers</h2>
            <p>{filteredCustomers.length} record(s) found</p>
          </div>

          <div className="table-actions">
            <div className="search-box">
              <Search size={16} />
              <input
                type="text"
                placeholder="Search customers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <button className="refresh-btn" onClick={fetchLedgerCustomers}>
              <RefreshCw size={16} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="table-state">Loading customer ledger list...</div>
        ) : filteredCustomers.length === 0 ? (
          <div className="table-state">No customers found</div>
        ) : (
          <div className="table-wrapper">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Opening Balance</th>
                  <th>Current Balance</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id}>
                    <td>
                      <span className="code-badge">{customer.customer_code}</span>
                    </td>
                    <td>{customer.customer_name}</td>
                    <td>{customer.phone || '-'}</td>
                    <td>{customer.opening_balance}</td>
                    <td>{customer.current_balance}</td>
                    <td>
                      <Link
                        to={`/ledger/customers/${customer.id}`}
                        className="icon-link-btn"
                      >
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

export default CustomerLedgerListPage;