import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import './adjustments.css';

const StockAdjustmentPage = () => {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [reasons, setReasons] = useState([]);
  const [form, setForm] = useState({
    product_id: '',
    adjustment_type: 'IN',
    quantity: '',
    reason: '',
    remarks: '',
  });
  const [productPreview, setProductPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');

      const [productsRes, reasonsRes] = await Promise.all([
        api.get('/products'),
        api.get('/adjustments/reasons'),
      ]);

      const activeProducts = (productsRes.data.data || []).filter(
        (product) => product.is_active !== false
      );

      setProducts(activeProducts);
      setReasons(reasonsRes.data.data || []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load adjustment data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const selected = products.find(
      (product) => String(product.id) === String(form.product_id)
    );
    setProductPreview(selected || null);
  }, [form.product_id, products]);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setError('');
    setSuccess('');
  };

  const predictedStock = () => {
    if (!productPreview) return '-';

    const current = Number(productPreview.current_stock || 0);
    const qty = Number(form.quantity || 0);

    if (form.adjustment_type === 'IN') {
      return current + qty;
    }

    return current - qty;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.product_id) {
      setError('Product is required');
      return;
    }

    if (!form.quantity || Number(form.quantity) <= 0) {
      setError('Valid quantity is required');
      return;
    }

    try {
      setSubmitting(true);

      await api.post('/adjustments', {
        product_id: Number(form.product_id),
        adjustment_type: form.adjustment_type,
        quantity: Number(form.quantity),
        reason: form.reason || null,
        remarks: form.remarks || null,
      });

      setSuccess('Stock adjustment recorded successfully');

      setForm({
        product_id: '',
        adjustment_type: 'IN',
        quantity: '',
        reason: '',
        remarks: '',
      });

      await fetchData();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to record stock adjustment');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="page-loading">Loading stock adjustment form...</div>;
  }

  return (
    <div className="adjustment-page">
      <div className="page-header-row">
        <div className="page-header">
          <h1>Manual Stock Adjustment</h1>
          <p>Add or remove stock with a reason and full movement history</p>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <form className="adjustment-layout" onSubmit={handleSubmit}>
        <div className="adjustment-main card">
          <h2>Adjustment Details</h2>

          <div className="form-grid">
            <div className="form-group form-group-full">
              <label>Product</label>
              <select
                name="product_id"
                value={form.product_id}
                onChange={handleChange}
              >
                <option value="">Select product</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.title} ({product.product_code})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Adjustment Type</label>
              <select
                name="adjustment_type"
                value={form.adjustment_type}
                onChange={handleChange}
              >
                <option value="IN">Stock In</option>
                <option value="OUT">Stock Out</option>
              </select>
            </div>

            <div className="form-group">
              <label>Quantity</label>
              <input
                type="number"
                name="quantity"
                value={form.quantity}
                onChange={handleChange}
                placeholder="Enter quantity"
              />
            </div>

            <div className="form-group form-group-full">
              <label>Reason</label>
              <select
                name="reason"
                value={form.reason}
                onChange={handleChange}
              >
                <option value="">Select reason</option>
                {reasons.map((reason) => (
                  <option key={reason} value={reason}>
                    {reason}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group form-group-full">
              <label>Remarks</label>
              <textarea
                name="remarks"
                value={form.remarks}
                onChange={handleChange}
                rows="4"
                placeholder="Enter remarks"
              />
            </div>
          </div>
        </div>

        <div className="adjustment-sidebar card">
          <h2>Stock Preview</h2>

          {productPreview ? (
            <div className="adjustment-preview">
              <div className="preview-row">
                <span>Product</span>
                <strong>{productPreview.title}</strong>
              </div>
              <div className="preview-row">
                <span>Code</span>
                <strong>{productPreview.product_code}</strong>
              </div>
              <div className="preview-row">
                <span>Current Stock</span>
                <strong>{productPreview.current_stock}</strong>
              </div>
              <div className="preview-row">
                <span>Adjustment</span>
                <strong>
                  {form.adjustment_type === 'IN' ? '+' : '-'}
                  {form.quantity || 0}
                </strong>
              </div>
              <div className="preview-row preview-row-total">
                <span>Predicted Stock</span>
                <strong>{predictedStock()}</strong>
              </div>
            </div>
          ) : (
            <div className="empty-widget">Select a product to preview stock impact</div>
          )}

          <div className="sidebar-actions">
            <button
              type="button"
              className="secondary-modal-btn"
              onClick={() => navigate('/stock/movements')}
            >
              View Movements
            </button>

            <button
              type="submit"
              className="primary-action-btn"
              disabled={submitting}
            >
              {submitting ? 'Saving...' : 'Save Adjustment'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default StockAdjustmentPage;