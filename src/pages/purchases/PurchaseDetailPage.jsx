import { useEffect, useState } from 'react';
import { ArrowLeft, Printer } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import api from '../../api/axios';
import './purchases.css';

const PurchaseDetailPage = () => {
  const { id } = useParams();

  const [purchaseData, setPurchaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);

  const fetchPurchase = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get(`/purchases/${id}`);
      setPurchaseData(response.data.data);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load purchase bill');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchase();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <div className="page-loading">Loading purchase bill...</div>;
  }

  if (error) {
    return <div className="alert alert-error">{error}</div>;
  }

  if (!purchaseData) {
    return <div className="table-state">Purchase bill not found</div>;
  }

  const { bill, items } = purchaseData;

  const handleCancelBill = async () => {
  const confirmed = window.confirm('Are you sure you want to cancel this purchase bill?');
  if (!confirmed) return;

  try {
    setCancelLoading(true);
    await api.post(`/purchases/${id}/cancel`);
    await fetchPurchase();
  } catch (err) {
    alert(err?.response?.data?.message || 'Failed to cancel purchase bill');
  } finally {
    setCancelLoading(false);
  }
};

  return (
    <div className="purchase-detail-page">
      <div className="page-header-row no-print">
        <div className="page-header">
          <h1>Purchase Detail</h1>
          <p>View purchase bill information, supplier details, and line items</p>
        </div>

        <div className="detail-header-actions">
          <button className="primary-header-btn" onClick={handlePrint}>
            <Printer size={18} />
            <span>Print Bill</span>
          </button>

          <Link to="/purchases" className="secondary-header-btn link-btn">
            <ArrowLeft size={16} />
            <span>Back to Purchases</span>
          </Link>
          {bill.status !== 'CANCELLED' && (
            <button
              className="danger-action-btn"
              onClick={handleCancelBill}
              disabled={cancelLoading}
            >
              {cancelLoading ? 'Cancelling...' : 'Cancel Bill'}
            </button>
          )}
        </div>
      </div>

      <div className="purchase-print-sheet print-area">
        <div className="print-header">
          <div>
            <h1 className="print-company-name">Your Company Name</h1>
            <p className="print-company-meta">Billing & Inventory Management Software</p>
            <p className="print-company-meta">Company Address Here</p>
            <p className="print-company-meta">Phone: 0300-0000000 | Email: company@example.com</p>
          </div>

          <div className="print-invoice-title-wrap">
            <h2 className="print-invoice-title">PURCHASE BILL</h2>
            <span className="print-status-badge">{bill.status}</span>
          </div>
        </div>

        <div className="print-info-grid">
          <div className="print-info-card">
            <h3>Supplier</h3>
            <p><strong>{bill.supplier_name}</strong></p>
            <p>Code: {bill.supplier_code}</p>
            <p>Phone: {bill.phone || '-'}</p>
            <p>Address: {bill.address || '-'}</p>
          </div>

          <div className="print-info-card">
            <h3>Bill Info</h3>
            <p><strong>Bill No:</strong> {bill.bill_no}</p>
            <p><strong>Date:</strong> {bill.bill_date?.slice(0, 10)}</p>
            <p><strong>Status:</strong> {bill.status}</p>
          </div>
        </div>

        <div className="print-items-wrap">
          <table className="print-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Product Code</th>
                <th>Product</th>
                <th>Qty</th>
                <th>Unit Cost</th>
                <th>Tax %</th>
                <th>Tax Amount</th>
                <th>Line Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={item.id}>
                  <td>{index + 1}</td>
                  <td>{item.product_code}</td>
                  <td>{item.title}</td>
                  <td>{item.quantity}</td>
                  <td>{item.unit_cost}</td>
                  <td>{item.tax_percent}</td>
                  <td>{item.tax_amount}</td>
                  <td>{item.line_total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="print-summary-wrap">
          <div className="print-notes">
            <h3>Notes</h3>
            <p>{bill.notes || 'No notes added.'}</p>
          </div>

          <div className="print-summary-box">
            <div className="print-summary-row">
              <span>Subtotal</span>
              <strong>{bill.subtotal}</strong>
            </div>
            <div className="print-summary-row">
              <span>Tax Amount</span>
              <strong>{bill.tax_amount}</strong>
            </div>
            <div className="print-summary-row">
              <span>Discount</span>
              <strong>{bill.discount_amount}</strong>
            </div>
            <div className="print-summary-row print-summary-total">
              <span>Total</span>
              <strong>{bill.total_amount}</strong>
            </div>
            <div className="print-summary-row">
              <span>Paid</span>
              <strong>{bill.paid_amount}</strong>
            </div>
            <div className="print-summary-row">
              <span>Due</span>
              <strong>{bill.due_amount}</strong>
            </div>
          </div>
        </div>

        <div className="print-footer">
          <div className="signature-box">
            <span>Authorized Signature</span>
          </div>
          <div className="signature-box">
            <span>Supplier Signature</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseDetailPage;