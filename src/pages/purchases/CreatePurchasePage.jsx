import { useEffect, useMemo, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import './purchases.css';

const emptyItem = {
  product_id: '',
  quantity: 1,
  unit_cost: '',
};

const CreatePurchasePage = () => {
  const navigate = useNavigate();

  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);

  const [form, setForm] = useState({
    supplier_id: '',
    bill_date: new Date().toISOString().slice(0, 10),
    discount_amount: '',
    paid_amount: '',
    notes: '',
  });

  const [items, setItems] = useState([{ ...emptyItem }]);

  const [loadingData, setLoadingData] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchDropdownData = async () => {
    try {
      setLoadingData(true);
      const [suppliersRes, productsRes] = await Promise.all([
        api.get('/suppliers'),
        api.get('/products'),
      ]);

      setSuppliers(suppliersRes.data.data || []);
      setProducts(productsRes.data.data || []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load form data');
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    fetchDropdownData();
  }, []);

  const handleFormChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleItemChange = (index, field, value) => {
    setItems((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;

        const updated = { ...item, [field]: value };

        if (field === 'product_id') {
          const selectedProduct = products.find(
            (p) => String(p.id) === String(value)
          );

          if (selectedProduct) {
            updated.unit_cost = selectedProduct.purchase_price;
          }
        }

        return updated;
      })
    );
  };

  const addItemRow = () => {
    setItems((prev) => [...prev, { ...emptyItem }]);
  };

  const removeItemRow = (index) => {
    if (items.length === 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const calculation = useMemo(() => {
    let subtotal = 0;
    let taxAmount = 0;

    items.forEach((item) => {
      const product = products.find((p) => String(p.id) === String(item.product_id));
      const qty = Number(item.quantity || 0);
      const cost = Number(item.unit_cost || 0);
      const lineBase = qty * cost;
      const taxPercent = Number(product?.tax_percent || 0);
      const lineTax = (lineBase * taxPercent) / 100;

      subtotal += lineBase;
      taxAmount += lineTax;
    });

    const discount = Number(form.discount_amount || 0);
    const total = subtotal + taxAmount - discount;
    const paid = Number(form.paid_amount || 0);
    const due = total - paid;

    return {
      subtotal: subtotal.toFixed(2),
      taxAmount: taxAmount.toFixed(2),
      total: total.toFixed(2),
      due: due.toFixed(2),
    };
  }, [items, products, form.discount_amount, form.paid_amount]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.supplier_id) {
      setError('Supplier is required');
      return;
    }

    const preparedItems = items.map((item) => ({
      product_id: Number(item.product_id),
      quantity: Number(item.quantity),
      unit_cost: Number(item.unit_cost),
    }));

    const invalidItem = preparedItems.find(
      (item) => !item.product_id || item.quantity <= 0 || item.unit_cost < 0
    );

    if (invalidItem) {
      setError('Please enter valid product, quantity, and cost for all items');
      return;
    }

    try {
      setSubmitting(true);

      await api.post('/purchases', {
        supplier_id: Number(form.supplier_id),
        bill_date: form.bill_date,
        discount_amount: Number(form.discount_amount || 0),
        paid_amount: Number(form.paid_amount || 0),
        notes: form.notes.trim() || null,
        items: preparedItems,
      });

      navigate('/purchases');
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to create purchase bill');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingData) {
    return <div className="page-loading">Loading purchase form...</div>;
  }

  return (
    <div className="create-purchase-page">
      <div className="page-header-row">
        <div className="page-header">
          <h1>Create Purchase</h1>
          <p>Create a supplier bill and increase stock</p>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <form className="purchase-form-layout" onSubmit={handleSubmit}>
        <div className="purchase-main card">
          <div className="section-block">
            <h2>Purchase Details</h2>

            <div className="form-grid">
              <div className="form-group">
                <label>Supplier</label>
                <select
                  name="supplier_id"
                  value={form.supplier_id}
                  onChange={handleFormChange}
                >
                  <option value="">Select supplier</option>
                  {suppliers.map((supplier) => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.supplier_name} ({supplier.supplier_code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Bill Date</label>
                <input
                  type="date"
                  name="bill_date"
                  value={form.bill_date}
                  onChange={handleFormChange}
                />
              </div>

              <div className="form-group">
                <label>Paid Amount</label>
                <input
                  type="number"
                  name="paid_amount"
                  value={form.paid_amount}
                  onChange={handleFormChange}
                  placeholder="0"
                />
              </div>

              <div className="form-group">
                <label>Discount Amount</label>
                <input
                  type="number"
                  name="discount_amount"
                  value={form.discount_amount}
                  onChange={handleFormChange}
                  placeholder="0"
                />
              </div>

              <div className="form-group form-group-full">
                <label>Notes</label>
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleFormChange}
                  rows="3"
                  placeholder="Enter purchase notes"
                />
              </div>
            </div>
          </div>

          <div className="section-block">
            <div className="section-title-row">
              <h2>Purchase Items</h2>
              <button
                type="button"
                className="secondary-header-btn"
                onClick={addItemRow}
              >
                <Plus size={16} />
                <span>Add Row</span>
              </button>
            </div>

            <div className="purchase-items-table">
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Qty</th>
                    <th>Unit Cost</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={index}>
                      <td>
                        <select
                          value={item.product_id}
                          onChange={(e) =>
                            handleItemChange(index, 'product_id', e.target.value)
                          }
                        >
                          <option value="">Select product</option>
                          {products.map((product) => (
                            <option key={product.id} value={product.id}>
                              {product.title} ({product.product_code})
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) =>
                            handleItemChange(index, 'quantity', e.target.value)
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          min="0"
                          value={item.unit_cost}
                          onChange={(e) =>
                            handleItemChange(index, 'unit_cost', e.target.value)
                          }
                        />
                      </td>
                      <td>
                        <button
                          type="button"
                          className="icon-delete-btn"
                          onClick={() => removeItemRow(index)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="purchase-sidebar card">
          <h2>Summary</h2>

          <div className="summary-list">
            <div className="summary-row">
              <span>Subtotal</span>
              <strong>{calculation.subtotal}</strong>
            </div>
            <div className="summary-row">
              <span>Tax</span>
              <strong>{calculation.taxAmount}</strong>
            </div>
            <div className="summary-row">
              <span>Total</span>
              <strong>{calculation.total}</strong>
            </div>
            <div className="summary-row">
              <span>Due</span>
              <strong>{calculation.due}</strong>
            </div>
          </div>

          <div className="sidebar-actions">
            <button
              type="button"
              className="secondary-modal-btn"
              onClick={() => navigate('/purchases')}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="primary-action-btn"
              disabled={submitting}
            >
              {submitting ? 'Saving...' : 'Create Purchase'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreatePurchasePage;