import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../api/axios';
import './payments.css';

const SupplierPaymentPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const supplierFromLedger = searchParams.get('supplier_id');

  const [suppliers, setSuppliers] = useState([]);
  const [unpaidBills, setUnpaidBills] = useState([]);
  const [form, setForm] = useState({
    supplier_id: supplierFromLedger || '',
    amount: '',
    payment_date: new Date().toISOString().slice(0, 10),
    payment_method: '',
    remarks: '',
  });
  const [allocations, setAllocations] = useState({});
  const [loading, setLoading] = useState(true);
  const [billLoading, setBillLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/suppliers');
      setSuppliers(response.data.data || []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load suppliers');
    } finally {
      setLoading(false);
    }
  };

  const fetchUnpaidBills = async (supplierId) => {
    if (!supplierId) {
      setUnpaidBills([]);
      setAllocations({});
      return;
    }

    try {
      setBillLoading(true);
      const response = await api.get(`/payments/supplier-bills/${supplierId}`);
      const bills = response.data.data || [];
      setUnpaidBills(bills);

      const defaultAllocations = {};
      bills.forEach((bill) => {
        defaultAllocations[bill.id] = '';
      });
      setAllocations(defaultAllocations);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load unpaid bills');
      setUnpaidBills([]);
      setAllocations({});
    } finally {
      setBillLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  useEffect(() => {
    if (form.supplier_id) {
      fetchUnpaidBills(form.supplier_id);
    }
  }, [form.supplier_id]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'supplier_id') {
      setForm((prev) => ({
        ...prev,
        supplier_id: value,
        amount: '',
      }));
      setError('');
      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAllocationChange = (billId, value) => {
    setAllocations((prev) => ({
      ...prev,
      [billId]: value,
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
    unpaidBills.forEach((bill) => {
      if (remaining <= 0) {
        auto[bill.id] = '';
        return;
      }

      const due = Number(bill.due_amount || 0);
      const allocate = Math.min(remaining, due);
      auto[bill.id] = allocate > 0 ? allocate : '';
      remaining -= allocate;
    });

    setAllocations(auto);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.supplier_id || !form.amount) {
      setError('Supplier and amount are required');
      return;
    }

    const paymentAmount = Number(form.amount);

    if (paymentAmount <= 0) {
      setError('Payment amount must be greater than zero');
      return;
    }

    const preparedAllocations = Object.entries(allocations)
      .map(([purchase_bill_id, allocated_amount]) => ({
        purchase_bill_id: Number(purchase_bill_id),
        allocated_amount: Number(allocated_amount || 0),
      }))
      .filter((item) => item.allocated_amount > 0);

    if (preparedAllocations.length === 0) {
      setError('At least one bill allocation is required');
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

      await api.post('/payments/supplier-payment', {
        supplier_id: Number(form.supplier_id),
        amount: paymentAmount,
        payment_date: form.payment_date,
        payment_method: form.payment_method || null,
        remarks: form.remarks || null,
        allocations: preparedAllocations,
      });

      navigate('/payments');
    } catch (err) {
      setError(
        err?.response?.data?.message || 'Failed to save supplier payment'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="page-loading">Loading supplier payment form...</div>;
  }

  return (
    <div className="payment-form-page">
      <div className="page-header">
        <h1>Pay Supplier</h1>
        <p>Record a payment and allocate it against unpaid purchase bills</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <form className="payment-form card" onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-group">
            <label>Supplier</label>
            <select
              name="supplier_id"
              value={form.supplier_id}
              onChange={handleChange}
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
              <h2>Bill Allocation</h2>
              <p>Allocate this payment to one or more unpaid purchase bills</p>
            </div>

            <button
              type="button"
              className="secondary-header-btn"
              onClick={handleAutoAllocate}
            >
              Auto Allocate
            </button>
          </div>

          {billLoading ? (
            <div className="table-state">Loading unpaid purchase bills...</div>
          ) : unpaidBills.length === 0 ? (
            <div className="table-state">No unpaid purchase bills found for this supplier</div>
          ) : (
            <div className="table-wrapper">
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>Bill</th>
                    <th>Date</th>
                    <th>Total</th>
                    <th>Paid</th>
                    <th>Due</th>
                    <th>Allocate</th>
                  </tr>
                </thead>
                <tbody>
                  {unpaidBills.map((bill) => (
                    <tr key={bill.id}>
                      <td>{bill.bill_no}</td>
                      <td>{bill.bill_date?.slice(0, 10)}</td>
                      <td>{bill.total_amount}</td>
                      <td>{bill.paid_amount}</td>
                      <td>{bill.due_amount}</td>
                      <td>
                        <input
                          type="number"
                          min="0"
                          max={bill.due_amount}
                          value={allocations[bill.id] || ''}
                          onChange={(e) =>
                            handleAllocationChange(bill.id, e.target.value)
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
            {submitting ? 'Saving...' : 'Save Payment'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SupplierPaymentPage;