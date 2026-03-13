import { useEffect, useState } from 'react';
import { ArrowLeft, Printer } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import api from '../../api/axios';
import './ledger.css';

const CustomerLedgerDetailPage = () => {
    const { customerId } = useParams();

    const [ledgerData, setLedgerData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchLedger = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await api.get(`/ledger/customers/${customerId}`);
            setLedgerData(response.data.data);
        } catch (err) {
            setError(err?.response?.data?.message || 'Failed to load customer ledger');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLedger();
    }, [customerId]);

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return <div className="page-loading">Loading customer ledger...</div>;
    }

    if (error) {
        return <div className="alert alert-error">{error}</div>;
    }

    if (!ledgerData) {
        return <div className="table-state">Ledger not found</div>;
    }

    const { customer, summary, entries } = ledgerData;

    return (
        <div className="ledger-page">
            <div className="page-header-row no-print">
                <div className="page-header">
                    <h1>Customer Ledger Statement</h1>
                    <p>Full statement and running balance for this customer</p>
                </div>

                <div className="detail-header-actions">
                    <Link
                        to={`/payments/customer-receipt?customer_id=${customer.id}`}
                        className="primary-header-btn link-btn"
                    >
                        Receive Payment
                    </Link>

                    <button className="secondary-header-btn" onClick={handlePrint}>
                        Print Statement
                    </button>

                    <Link to="/ledger/customers" className="secondary-header-btn link-btn">
                        Back
                    </Link>
                </div>
            </div>

            <div className="ledger-print-sheet print-area">
                <div className="print-header">
                    <div>
                        <h1 className="print-company-name">Your Company Name</h1>
                        <p className="print-company-meta">Customer Ledger Statement</p>
                        <p className="print-company-meta">Company Address Here</p>
                    </div>

                    <div className="print-invoice-title-wrap">
                        <h2 className="print-invoice-title">LEDGER</h2>
                    </div>
                </div>

                <div className="ledger-info-grid">
                    <div className="print-info-card">
                        <h3>Customer Information</h3>
                        <p><strong>{customer.customer_name}</strong></p>
                        <p>Code: {customer.customer_code}</p>
                        <p>Phone: {customer.phone || '-'}</p>
                        <p>Email: {customer.email || '-'}</p>
                        <p>Address: {customer.address || '-'}</p>
                    </div>

                    <div className="print-info-card">
                        <h3>Summary</h3>
                        <p><strong>Opening Balance:</strong> {summary.opening_balance}</p>
                        <p><strong>Total Debit:</strong> {summary.total_debit}</p>
                        <p><strong>Total Credit:</strong> {summary.total_credit}</p>
                        <p><strong>Closing Balance:</strong> {summary.closing_balance}</p>
                    </div>
                </div>

                <div className="ledger-summary-cards no-print">
                    <div className="ledger-summary-card card">
                        <span>Opening Balance</span>
                        <strong>{summary.opening_balance}</strong>
                    </div>
                    <div className="ledger-summary-card card">
                        <span>Total Debit</span>
                        <strong>{summary.total_debit}</strong>
                    </div>
                    <div className="ledger-summary-card card">
                        <span>Total Credit</span>
                        <strong>{summary.total_credit}</strong>
                    </div>
                    <div className="ledger-summary-card card">
                        <span>Closing Balance</span>
                        <strong>{summary.closing_balance}</strong>
                    </div>
                </div>

                <div className="ledger-card card">
                    <h2 className="ledger-table-title">Ledger Entries</h2>

                    <div className="table-wrapper">
                        <table className="modern-table print-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Reference Type</th>
                                    <th>Reference ID</th>
                                    <th>Remarks</th>
                                    <th>Debit</th>
                                    <th>Credit</th>
                                    <th>Balance</th>
                                </tr>
                            </thead>
                            <tbody>
                                {entries.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="table-state">
                                            No ledger entries found
                                        </td>
                                    </tr>
                                ) : (
                                    entries.map((entry) => (
                                        <tr key={entry.id}>
                                            <td>{entry.entry_date?.slice(0, 10)}</td>
                                            <td>{entry.reference_type}</td>
                                            <td>{entry.reference_id}</td>
                                            <td>{entry.remarks || '-'}</td>
                                            <td>{entry.debit}</td>
                                            <td>{entry.credit}</td>
                                            <td>{entry.balance}</td>
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

export default CustomerLedgerDetailPage;