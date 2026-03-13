import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import './returns.css';

const emptyItem = {
  product_id: '',
  quantity: 1,
};

const SalesReturnPage = () => {
  const navigate = useNavigate();

  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [invoiceProducts, setInvoiceProducts] = useState([]);
  const [form, setForm] = useState({
    invoice_id: '',
    customer_id: '',
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

      const [invoiceRes, customerRes] = await Promise.all([
        api.get('/invoices'),
        api.get('/customers'),
      ]);

      setInvoices(invoiceRes.data.data || []);
      setCustomers(customerRes.data.data || []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load sales return data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const selectedInvoice = invoices.find(
      (inv) => String(inv.id) === String(form.invoice_id)
    );

    if (selectedInvoice) {
      setForm((prev) => ({
        ...prev,
        customer_id: String(selectedInvoice.customer_id || ''),
      }));

      api.get(`/invoices/${selectedInvoice.id}`).then((res) => {
        const productItems = res.data.data?.items || [];
        setInvoiceProducts(productItems);
      });
    } else {
      setInvoiceProducts([]);
    }
  }, [form.invoice_id, invoices]);

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

    if (!form.invoice_id || !form.customer_id) {
      setError('Invoice and customer are required');
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

      await api.post('/returns/sales', {
        invoice_id: Number(form.invoice_id),
        customer_id: Number(form.customer_id),
        return_date: form.return_date,
        remarks: form.remarks || null,
        items: preparedItems,
      });

      navigate('/stock/movements');
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save sales return');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="page-loading">Loading sales return form...</div>;
  }

  return (
    <div className="return-page">
      <div className="page-header">
        <h1>Sales Return</h1>
        <p>Record returned goods from customers</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <form className="return-layout" onSubmit={handleSubmit}>
        <div className="return-main card">
          <h2>Return Details</h2>

          <div className="form-grid">
            <div className="form-group">
              <label>Invoice</label>
              <select
                name="invoice_id"
                value={form.invoice_id}
                onChange={handleFormChange}
              >
                <option value="">Select invoice</option>
                {invoices.map((invoice) => (
                  <option key={invoice.id} value={invoice.id}>
                    {invoice.invoice_no}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Customer</label>
              <select
                name="customer_id"
                value={form.customer_id}
                onChange={handleFormChange}
              >
                <option value="">Select customer</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.customer_name}
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
                        {invoiceProducts.map((product) => (
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
              onClick={() => navigate('/invoices')}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="primary-action-btn"
              disabled={submitting}
            >
              {submitting ? 'Saving...' : 'Save Sales Return'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default SalesReturnPage;