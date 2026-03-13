import { useEffect, useState } from 'react';
import { ArrowLeft, Printer } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import api from '../../api/axios';
import './invoices.css';

const InvoiceDetailPage = () => {
  const { id } = useParams();

  const [invoiceData, setInvoiceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);

  const fetchInvoice = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get(`/invoices/${id}`);
      setInvoiceData(response.data.data);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load invoice');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoice();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <div className="page-loading">Loading invoice...</div>;
  }

  if (error) {
    return <div className="alert alert-error">{error}</div>;
  }

  if (!invoiceData) {
    return <div className="table-state">Invoice not found</div>;
  }

  const { invoice, items } = invoiceData;
  const handleCancelInvoice = async () => {
  const confirmed = window.confirm('Are you sure you want to cancel this invoice?');
  if (!confirmed) return;

  try {
    setCancelLoading(true);
    await api.post(`/invoices/${id}/cancel`);
    await fetchInvoice();
  } catch (err) {
    alert(err?.response?.data?.message || 'Failed to cancel invoice');
  } finally {
    setCancelLoading(false);
  }
};

  return (
    <div className="invoice-detail-page">
      <div className="page-header-row no-print">
        <div className="page-header">
          <h1>Invoice Detail</h1>
          <p>View invoice information, customer details, and line items</p>
        </div>

        <div className="detail-header-actions">
          <button className="primary-header-btn" onClick={handlePrint}>
            <Printer size={18} />
            <span>Print Invoice</span>
          </button>

          <Link to="/invoices" className="secondary-header-btn link-btn">
            <ArrowLeft size={16} />
            <span>Back to Invoices</span>
          </Link>
          {invoice.status !== 'CANCELLED' && (
            <button
              className="danger-action-btn"
              onClick={handleCancelInvoice}
              disabled={cancelLoading}
            >
              {cancelLoading ? 'Cancelling...' : 'Cancel Invoice'}
            </button>
          )}
        </div>
      </div>

      <div className="invoice-print-sheet print-area">
        <div className="print-header">
          <div>
            <h1 className="print-company-name">Your Company Name</h1>
            <p className="print-company-meta">Billing & Inventory Management Software</p>
            <p className="print-company-meta">Company Address Here</p>
            <p className="print-company-meta">Phone: 0300-0000000 | Email: company@example.com</p>
          </div>

          <div className="print-invoice-title-wrap">
            <h2 className="print-invoice-title">INVOICE</h2>
            <span className="print-status-badge">{invoice.status}</span>
          </div>
        </div>

        <div className="print-info-grid">
          <div className="print-info-card">
            <h3>Bill To</h3>
            <p><strong>{invoice.customer_name}</strong></p>
            <p>Code: {invoice.customer_code}</p>
            <p>Phone: {invoice.phone || '-'}</p>
            <p>Address: {invoice.address || '-'}</p>
          </div>

          <div className="print-info-card">
            <h3>Invoice Info</h3>
            <p><strong>Invoice No:</strong> {invoice.invoice_no}</p>
            <p><strong>Date:</strong> {invoice.invoice_date?.slice(0, 10)}</p>
            <p><strong>Type:</strong> {invoice.invoice_type}</p>
            <p><strong>Status:</strong> {invoice.status}</p>
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
                <th>Unit Price</th>
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
                  <td>{item.unit_price}</td>
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
            <p>{invoice.notes || 'No notes added.'}</p>
          </div>

          <div className="print-summary-box">
            <div className="print-summary-row">
              <span>Subtotal</span>
              <strong>{invoice.subtotal}</strong>
            </div>
            <div className="print-summary-row">
              <span>Tax Amount</span>
              <strong>{invoice.tax_amount}</strong>
            </div>
            <div className="print-summary-row">
              <span>Discount</span>
              <strong>{invoice.discount_amount}</strong>
            </div>
            <div className="print-summary-row print-summary-total">
              <span>Total</span>
              <strong>{invoice.total_amount}</strong>
            </div>
            <div className="print-summary-row">
              <span>Paid</span>
              <strong>{invoice.paid_amount}</strong>
            </div>
            <div className="print-summary-row">
              <span>Due</span>
              <strong>{invoice.due_amount}</strong>
            </div>
          </div>
        </div>

        <div className="print-footer">
          <div className="signature-box">
            <span>Authorized Signature</span>
          </div>
          <div className="signature-box">
            <span>Customer Signature</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetailPage;