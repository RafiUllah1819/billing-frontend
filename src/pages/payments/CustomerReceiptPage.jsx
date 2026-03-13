import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../api/axios';
import './payments.css';

const CustomerReceiptPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const customerFromLedger = searchParams.get('customer_id');

  const [customers, setCustomers] = useState([]);
  const [unpaidInvoices, setUnpaidInvoices] = useState([]);
  const [form, setForm] = useState({
    customer_id: customerFromLedger || '',
    amount: '',
    payment_date: new Date().toISOString().slice(0, 10),
    payment_method: '',
    remarks: '',
  });
  const [allocations, setAllocations] = useState({});
  const [loading, setLoading] = useState(true);
  const [invoiceLoading, setInvoiceLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/customers');
      setCustomers(response.data.data || []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const fetchUnpaidInvoices = async (customerId) => {
    if (!customerId) {
      setUnpaidInvoices([]);
      setAllocations({});
      return;
    }

    try {
      setInvoiceLoading(true);
      const response = await api.get(`/payments/customer-invoices/${customerId}`);
      const invoices = response.data.data || [];
      setUnpaidInvoices(invoices);

      const defaultAllocations = {};
      invoices.forEach((invoice) => {
        defaultAllocations[invoice.id] = '';
      });
      setAllocations(defaultAllocations);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load unpaid invoices');
      setUnpaidInvoices([]);
      setAllocations({});
    } finally {
      setInvoiceLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    if (form.customer_id) {
      fetchUnpaidInvoices(form.customer_id);
    }
  }, [form.customer_id]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === 'customer_id') {
      setError('');
      setForm((prev) => ({
        ...prev,
        customer_id: value,
        amount: '',
      }));
    }
  };

  const handleAllocationChange = (invoiceId, value) => {
    setAllocations((prev) => ({
      ...prev,
      [invoiceId]: value,
    }));
  };

  const totalAllocated = Object.values(allocations).reduce(
    (sum, value) => sum + Number(value || 0),
    0
  );

  const handleAutoAllocate = () => {
    let remaining = Number(form.amount || 0);

    if (!remaining || remaining <= 0) {
      setError('Enter payment amount first');
      return;
    }

    const auto = {};
    unpaidInvoices.forEach((invoice) => {
      if (remaining <= 0) {
        auto[invoice.id] = '';
        return;
      }

      const due = Number(invoice.due_amount || 0);
      const allocate = Math.min(remaining, due);
      auto[invoice.id] = allocate > 0 ? allocate : '';
      remaining -= allocate;
    });

    setAllocations(auto);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.customer_id || !form.amount) {
      setError('Customer and amount are required');
      return;
    }

    const paymentAmount = Number(form.amount);

    if (paymentAmount <= 0) {
      setError('Payment amount must be greater than zero');
      return;
    }

    const preparedAllocations = Object.entries(allocations)
      .map(([invoice_id, allocated_amount]) => ({
        invoice_id: Number(invoice_id),
        allocated_amount: Number(allocated_amount || 0),
      }))
      .filter((item) => item.allocated_amount > 0);

    if (preparedAllocations.length === 0) {
      setError('At least one invoice allocation is required');
      return;
    }

    const allocatedTotal = preparedAllocations.reduce(
      (sum, item) => sum + item.allocated_amount,
      0
    );

    if (Number(allocatedTotal.toFixed(2)) !== Number(paymentAmount.toFixed(2))) {
      setError('Payment amount must exactly match total allocated amount');
      return;
    }

    try {
      setSubmitting(true);

      await api.post('/payments/customer-receipt', {
        customer_id: Number(form.customer_id),
        amount: paymentAmount,
        payment_date: form.payment_date,
        payment_method: form.payment_method || null,
        remarks: form.remarks || null,
        allocations: preparedAllocations,
      });

      navigate('/payments');
    } catch (err) {
      setError(
        err?.response?.data?.message || 'Failed to save customer receipt'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="page-loading">Loading customer receipt form...</div>;
  }

  return (
    <div className="payment-form-page">
      <div className="page-header">
        <h1>Receive Customer Payment</h1>
        <p>Record a payment and allocate it against unpaid invoices</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <form className="payment-form card" onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-group">
            <label>Customer</label>
            <select
              name="customer_id"
              value={form.customer_id}
              onChange={handleChange}
            >
              <option value="">Select customer</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.customer_name} ({customer.customer_code})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Amount</label>
            <input
              type="number"
              name="amount"
              value={form.amount}
              onChange={handleChange}
              placeholder="Enter amount"
            />
          </div>

          <div className="form-group">
            <label>Payment Date</label>
            <input
              type="date"
              name="payment_date"
              value={form.payment_date}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Payment Method</label>
            <input
              type="text"
              name="payment_method"
              value={form.payment_method}
              onChange={handleChange}
              placeholder="Cash / Bank / Cheque"
            />
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

        <div className="allocation-section">
          <div className="section-title-row">
            <div>
              <h2>Invoice Allocation</h2>
              <p>Allocate this payment to one or more unpaid invoices</p>
            </div>

            <button
              type="button"
              className="secondary-header-btn"
              onClick={handleAutoAllocate}
            >
              Auto Allocate
            </button>
          </div>

          {invoiceLoading ? (
            <div className="table-state">Loading unpaid invoices...</div>
          ) : unpaidInvoices.length === 0 ? (
            <div className="table-state">No unpaid invoices found for this customer</div>
          ) : (
            <div className="table-wrapper">
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>Invoice</th>
                    <th>Date</th>
                    <th>Total</th>
                    <th>Paid</th>
                    <th>Due</th>
                    <th>Allocate</th>
                  </tr>
                </thead>
                <tbody>
                  {unpaidInvoices.map((invoice) => (
                    <tr key={invoice.id}>
                      <td>{invoice.invoice_no}</td>
                      <td>{invoice.invoice_date?.slice(0, 10)}</td>
                      <td>{invoice.total_amount}</td>
                      <td>{invoice.paid_amount}</td>
                      <td>{invoice.due_amount}</td>
                      <td>
                        <input
                          type="number"
                          min="0"
                          max={invoice.due_amount}
                          value={allocations[invoice.id] || ''}
                          onChange={(e) =>
                            handleAllocationChange(invoice.id, e.target.value)
                          }
                          placeholder="0"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="allocation-summary">
            <div className="allocation-summary-row">
              <span>Payment Amount</span>
              <strong>{form.amount || 0}</strong>
            </div>
            <div className="allocation-summary-row">
              <span>Total Allocated</span>
              <strong>{totalAllocated.toFixed(2)}</strong>
            </div>
            <div className="allocation-summary-row">
              <span>Difference</span>
              <strong>
                {(Number(form.amount || 0) - Number(totalAllocated || 0)).toFixed(2)}
              </strong>
            </div>
          </div>
        </div>

        <div className="modal-actions">
          <button
            type="button"
            className="secondary-modal-btn"
            onClick={() => navigate('/payments')}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="primary-action-btn"
            disabled={submitting}
          >
            {submitting ? 'Saving...' : 'Save Receipt'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CustomerReceiptPage;