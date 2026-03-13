import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import './returns.css';

const emptyItem = {
  product_id: '',
  quantity: 1,
};

const PurchaseReturnPage = () => {
  const navigate = useNavigate();

  const [bills, setBills] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [billProducts, setBillProducts] = useState([]);
  const [form, setForm] = useState({
    purchase_bill_id: '',
    supplier_id: '',
    return_date: new Date().toISOString().slice(0, 10),
    remarks: '',
  });
  const [items, setItems] = useState([{ ...emptyItem }]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);

      const [billRes, supplierRes] = await Promise.all([
        api.get('/purchases'),
        api.get('/suppliers'),
      ]);

      setBills(billRes.data.data || []);
      setSuppliers(supplierRes.data.data || []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load purchase return data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const selectedBill = bills.find(
      (bill) => String(bill.id) === String(form.purchase_bill_id)
    );

    if (selectedBill) {
      setForm((prev) => ({
        ...prev,
        supplier_id: String(selectedBill.supplier_id || ''),
      }));

      api.get(`/purchases/${selectedBill.id}`).then((res) => {
        const productItems = res.data.data?.items || [];
        setBillProducts(productItems);
      });
    } else {
      setBillProducts([]);
    }
  }, [form.purchase_bill_id, bills]);

  const handleFormChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleItemChange = (index, field, value) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const addItemRow = () => {
    setItems((prev) => [...prev, { ...emptyItem }]);
  };

  const removeItemRow = (index) => {
    if (items.length === 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.purchase_bill_id || !form.supplier_id) {
      setError('Purchase bill and supplier are required');
      return;
    }

    const preparedItems = items.map((item) => ({
      product_id: Number(item.product_id),
      quantity: Number(item.quantity),
    }));

    const invalidItem = preparedItems.find(
      (item) => !item.product_id || item.quantity <= 0
    );

    if (invalidItem) {
      setError('Please enter valid product and quantity for all items');
      return;
    }

    try {
      setSubmitting(true);

      await api.post('/returns/purchases', {
        purchase_bill_id: Number(form.purchase_bill_id),
        supplier_id: Number(form.supplier_id),
        return_date: form.return_date,
        remarks: form.remarks || null,
        items: preparedItems,
      });

      navigate('/stock/movements');
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save purchase return');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="page-loading">Loading purchase return form...</div>;
  }

  return (
    <div className="return-page">
      <div className="page-header">
        <h1>Purchase Return</h1>
        <p>Record returned goods to suppliers</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <form className="return-layout" onSubmit={handleSubmit}>
        <div className="return-main card">
          <h2>Return Details</h2>

          <div className="form-grid">
            <div className="form-group">
              <label>Purchase Bill</label>
              <select
                name="purchase_bill_id"
                value={form.purchase_bill_id}
                onChange={handleFormChange}
              >
                <option value="">Select purchase bill</option>
                {bills.map((bill) => (
                  <option key={bill.id} value={bill.id}>
                    {bill.bill_no}
                  </option>
                ))}
              </select>
            </div>

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
                    {supplier.supplier_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group form-group-full">
              <label>Return Date</label>
              <input
                type="date"
                name="return_date"
                value={form.return_date}
                onChange={handleFormChange}
              />
            </div>

            <div className="form-group form-group-full">
              <label>Remarks</label>
              <textarea
                name="remarks"
                value={form.remarks}
                onChange={handleFormChange}
                rows="3"
                placeholder="Enter return remarks"
              />
            </div>
          </div>

          <div className="section-title-row">
            <h2>Return Items</h2>
            <button
              type="button"
              className="secondary-header-btn"
              onClick={addItemRow}
            >
              <Plus size={16} />
              <span>Add Row</span>
            </button>
          </div>

          <div className="table-wrapper">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Quantity</th>
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
                        {billProducts.map((product) => (
                          <option key={product.product_id} value={product.product_id}>
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

        <div className="return-sidebar card">
          <h2>Actions</h2>
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
              {submitting ? 'Saving...' : 'Save Purchase Return'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default PurchaseReturnPage;