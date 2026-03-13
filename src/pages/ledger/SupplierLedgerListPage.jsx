import { useEffect, useState } from 'react';
import { Search, RefreshCw, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import './ledger.css';

const SupplierLedgerListPage = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchLedgerSuppliers = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/ledger/suppliers');
      const data = response.data.data || [];
      setSuppliers(data);
      setFilteredSuppliers(data);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load supplier ledger list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLedgerSuppliers();
  }, []);

  useEffect(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      setFilteredSuppliers(suppliers);
      return;
    }

    const filtered = suppliers.filter((supplier) => {
      return (
        supplier.supplier_name?.toLowerCase().includes(keyword) ||
        supplier.supplier_code?.toLowerCase().includes(keyword) ||
        supplier.phone?.toLowerCase().includes(keyword)
      );
    });

    setFilteredSuppliers(filtered);
  }, [search, suppliers]);

  return (
    <div className="ledger-page">
      <div className="page-header">
        <h1>Supplier Ledger</h1>
        <p>View supplier balances and payable statements</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="ledger-card card">
        <div className="table-topbar">
          <div>
            <h2>Suppliers</h2>
            <p>{filteredSuppliers.length} record(s) found</p>
          </div>

          <div className="table-actions">
            <div className="search-box">
              <Search size={16} />
              <input
                type="text"
                placeholder="Search suppliers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <button className="refresh-btn" onClick={fetchLedgerSuppliers}>
              <RefreshCw size={16} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="table-state">Loading supplier ledger list...</div>
        ) : filteredSuppliers.length === 0 ? (
          <div className="table-state">No suppliers found</div>
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
                {filteredSuppliers.map((supplier) => (
                  <tr key={supplier.id}>
                    <td>
                      <span className="code-badge">{supplier.supplier_code}</span>
                    </td>
                    <td>{supplier.supplier_name}</td>
                    <td>{supplier.phone || '-'}</td>
                    <td>{supplier.opening_balance}</td>
                    <td>{supplier.current_balance}</td>
                    <td>
                      <Link
                        to={`/ledger/suppliers/${supplier.id}`}
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

export default SupplierLedgerListPage;