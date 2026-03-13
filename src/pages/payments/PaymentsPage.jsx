import { useEffect, useState } from 'react';
import { RefreshCw, Search, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import './payments.css';

const PaymentsPage = () => {
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/payments');
      const data = response.data.data || [];
      setPayments(data);
      setFilteredPayments(data);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to fetch payments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  useEffect(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      setFilteredPayments(payments);
      return;
    }

    const filtered = payments.filter((payment) => {
      return (
        payment.payment_type?.toLowerCase().includes(keyword) ||
        payment.customer_name?.toLowerCase().includes(keyword) ||
        payment.supplier_name?.toLowerCase().includes(keyword) ||
        payment.payment_method?.toLowerCase().includes(keyword) ||
        payment.remarks?.toLowerCase().includes(keyword)
      );
    });

    setFilteredPayments(filtered);
  }, [search, payments]);

  return (
    <div className="payments-page">
      <div className="page-header-row">
        <div className="page-header">
          <h1>Payments</h1>
          <p>View all customer receipts and supplier payments</p>
        </div>

        <div className="payment-header-actions">
          <Link to="/payments/customer-receipt" className="primary-header-btn link-btn">
            <ArrowDownCircle size={18} />
            <span>Receive Payment</span>
          </Link>

          <Link to="/payments/supplier-payment" className="secondary-header-btn link-btn">
            <ArrowUpCircle size={18} />
            <span>Pay Supplier</span>
          </Link>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="payments-card card">
        <div className="table-topbar">
          <div>
            <h2>Payment History</h2>
            <p>{filteredPayments.length} record(s) found</p>
          </div>

          <div className="table-actions">
            <div className="search-box">
              <Search size={16} />
              <input
                type="text"
                placeholder="Search payments..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <button className="refresh-btn" onClick={fetchPayments}>
              <RefreshCw size={16} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="table-state">Loading payments...</div>
        ) : filteredPayments.length === 0 ? (
          <div className="table-state">No payments found</div>
        ) : (
          <div className="table-wrapper">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Customer / Supplier</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((payment) => {
                  const isCustomerReceipt =
                    payment.payment_type === 'CUSTOMER_RECEIPT';

                  return (
                    <tr key={payment.id}>
                      <td>{payment.payment_date?.slice(0, 10)}</td>
                      <td>
                        <span
                          className={`payment-type-badge ${
                            isCustomerReceipt
                              ? 'payment-type-receipt'
                              : 'payment-type-supplier'
                          }`}
                        >
                          {payment.payment_type}
                        </span>
                      </td>
                      <td>{payment.customer_name || payment.supplier_name || '-'}</td>
                      <td>{payment.amount}</td>
                      <td>{payment.payment_method || '-'}</td>
                      <td>{payment.remarks || '-'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentsPage;