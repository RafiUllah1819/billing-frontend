import { useEffect, useState } from 'react';
import { RefreshCw, Search, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import './stock.css';

const StockMovementsPage = () => {
  const [movements, setMovements] = useState([]);
  const [filteredMovements, setFilteredMovements] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchMovements = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/stock/movements');
      const data = response.data.data || [];
      setMovements(data);
      setFilteredMovements(data);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load stock movements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovements();
  }, []);

  useEffect(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      setFilteredMovements(movements);
      return;
    }

    const filtered = movements.filter((movement) => {
      return (
        movement.title?.toLowerCase().includes(keyword) ||
        movement.product_code?.toLowerCase().includes(keyword) ||
        movement.movement_type?.toLowerCase().includes(keyword) ||
        movement.reference_type?.toLowerCase().includes(keyword)
      );
    });

    setFilteredMovements(filtered);
  }, [search, movements]);

  return (
    <div className="stock-page">
      <div className="page-header">
        <h1>Stock Movements</h1>
        <p>Track stock in, stock out, and product movement history</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="stock-card card">
        <div className="table-topbar">
          <div>
            <h2>Movement History</h2>
            <p>{filteredMovements.length} record(s) found</p>
          </div>

          <div className="table-actions">
            <div className="search-box">
              <Search size={16} />
              <input
                type="text"
                placeholder="Search stock movements..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <button className="refresh-btn" onClick={fetchMovements}>
              <RefreshCw size={16} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="table-state">Loading stock movements...</div>
        ) : filteredMovements.length === 0 ? (
          <div className="table-state">No stock movements found</div>
        ) : (
          <div className="table-wrapper">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Product</th>
                  <th>Movement Type</th>
                  <th>Reference</th>
                  <th>In</th>
                  <th>Out</th>
                  <th>Balance After</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredMovements.map((movement) => (
                  <tr key={movement.id}>
                    <td>{movement.created_at?.slice(0, 10)}</td>
                    <td>
                      <div className="movement-product-cell">
                        <strong>{movement.title}</strong>
                        <small>{movement.product_code}</small>
                      </div>
                    </td>
                    <td>
                      <span className="movement-type-badge">
                        {movement.movement_type}
                      </span>
                    </td>
                    <td>
                      {movement.reference_type} #{movement.reference_id}
                    </td>
                    <td>{movement.quantity_in}</td>
                    <td>{movement.quantity_out}</td>
                    <td>{movement.balance_after}</td>
                    <td>
                      <Link
                        to={`/stock/movements/${movement.product_id}`}
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

export default StockMovementsPage;