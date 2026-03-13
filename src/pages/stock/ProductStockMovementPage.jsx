import { useEffect, useState } from 'react';
import { ArrowLeft, Printer } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import api from '../../api/axios';
import './stock.css';

const ProductStockMovementPage = () => {
  const { productId } = useParams();

  const [stockData, setStockData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStockData = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get(`/stock/movements/${productId}`);
      setStockData(response.data.data);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load product stock history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStockData();
  }, [productId]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <div className="page-loading">Loading stock history...</div>;
  }

  if (error) {
    return <div className="alert alert-error">{error}</div>;
  }

  if (!stockData) {
    return <div className="table-state">Stock history not found</div>;
  }

  const { product, movements } = stockData;

  return (
    <div className="stock-page">
      <div className="page-header-row no-print">
        <div className="page-header">
          <h1>Product Stock History</h1>
          <p>Track every stock movement for this product</p>
        </div>

        <div className="detail-header-actions">
          <button className="primary-header-btn" onClick={handlePrint}>
            <Printer size={18} />
            <span>Print</span>
          </button>

          <Link to="/stock/movements" className="secondary-header-btn link-btn">
            <ArrowLeft size={16} />
            <span>Back</span>
          </Link>
        </div>
      </div>

      <div className="stock-print-sheet print-area">
        <div className="print-header">
          <div>
            <h1 className="print-company-name">Your Company Name</h1>
            <p className="print-company-meta">Stock Movement Statement</p>
            <p className="print-company-meta">Company Address Here</p>
          </div>

          <div className="print-invoice-title-wrap">
            <h2 className="print-invoice-title">STOCK</h2>
          </div>
        </div>

        <div className="stock-info-grid">
          <div className="print-info-card">
            <h3>Product Information</h3>
            <p><strong>{product.title}</strong></p>
            <p>Code: {product.product_code}</p>
            <p>Unit: {product.unit}</p>
            <p>Current Stock: {product.current_stock}</p>
            <p>Min Alert: {product.min_stock_alert}</p>
          </div>

          <div className="print-info-card">
            <h3>Status</h3>
            <p><strong>Product Status:</strong> {product.is_active ? 'Active' : 'Inactive'}</p>
            <p><strong>Total Movements:</strong> {movements.length}</p>
          </div>
        </div>

        <div className="stock-card card">
          <h2 className="ledger-table-title">Movement Entries</h2>

          <div className="table-wrapper">
            <table className="modern-table print-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Movement Type</th>
                  <th>Reference Type</th>
                  <th>Reference ID</th>
                  <th>In</th>
                  <th>Out</th>
                  <th>Balance After</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {movements.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="table-state">
                      No stock movements found
                    </td>
                  </tr>
                ) : (
                  movements.map((movement) => (
                    <tr key={movement.id}>
                      <td>{movement.created_at?.slice(0, 10)}</td>
                      <td>{movement.movement_type}</td>
                      <td>{movement.reference_type}</td>
                      <td>{movement.reference_id}</td>
                      <td>{movement.quantity_in}</td>
                      <td>{movement.quantity_out}</td>
                      <td>{movement.balance_after}</td>
                      <td>{movement.remarks || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductStockMovementPage;