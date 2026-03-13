import { useEffect, useState } from 'react';
import { RefreshCw, Search ,Download} from 'lucide-react';
import api from '../../api/axios';
import { exportToCsv } from '../../utils/exportCsv';
import './aging.css';

const CustomerAgingPage = () => {
  const [report, setReport] = useState({ summary: {}, rows: [] });
  const [filteredRows, setFilteredRows] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchReport = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/aging/customers');
      const data = response.data.data || { summary: {}, rows: [] };
      setReport(data);
      setFilteredRows(data.rows || []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load customer aging report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  useEffect(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      setFilteredRows(report.rows || []);
      return;
    }

    const filtered = (report.rows || []).filter((row) => {
      return (
        row.customer_name?.toLowerCase().includes(keyword) ||
        row.invoice_no?.toLowerCase().includes(keyword)
      );
    });

    setFilteredRows(filtered);
  }, [search, report]);

  const handleExportCsv = () => {
  const exportRows = filteredRows.map((row) => ({
    bill_no: row.bill_no,
    supplier_name: row.supplier_name,
    bill_date: row.bill_date?.slice(0, 10),
    age_days: row.age_days,
    due_amount: row.due_amount,
    bucket_0_30: row.bucket_0_30,
    bucket_31_60: row.bucket_31_60,
    bucket_61_90: row.bucket_61_90,
    bucket_90_plus: row.bucket_90_plus,
  }));

  exportToCsv('supplier-aging-report', exportRows);
};

  return (
    <div className="aging-page">
      <div className="page-header">
        <h1>Customer Aging Report</h1>
        <p>Track receivables by age bucket</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="aging-summary-grid">
        <div className="aging-summary-card card">
          <span>Total Due</span>
          <strong>{report.summary?.total_due || 0}</strong>
        </div>
        <div className="aging-summary-card card">
          <span>0–30 Days</span>
          <strong>{report.summary?.bucket_0_30 || 0}</strong>
        </div>
        <div className="aging-summary-card card">
          <span>31–60 Days</span>
          <strong>{report.summary?.bucket_31_60 || 0}</strong>
        </div>
        <div className="aging-summary-card card">
          <span>61–90 Days</span>
          <strong>{report.summary?.bucket_61_90 || 0}</strong>
        </div>
        <div className="aging-summary-card card danger-aging">
          <span>90+ Days</span>
          <strong>{report.summary?.bucket_90_plus || 0}</strong>
        </div>
      </div>

      <div className="aging-card card">
        <div className="table-topbar">
          <div>
            <h2>Aging Details</h2>
            <p>{filteredRows.length} record(s) found</p>
          </div>

          <div className="table-actions">
            <div className="search-box">
              <Search size={16} />
              <input
                type="text"
                placeholder="Search invoices..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <button className="refresh-btn" onClick={fetchReport}>
              <RefreshCw size={16} />
              <span>Refresh</span>
            </button>
            <button className="secondary-header-btn" onClick={handleExportCsv}>
            <Download size={16} />
            <span>Export CSV</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="table-state">Loading customer aging report...</div>
        ) : filteredRows.length === 0 ? (
          <div className="table-state">No customer dues found</div>
        ) : (
          <div className="table-wrapper">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Age</th>
                  <th>Due</th>
                  <th>0–30</th>
                  <th>31–60</th>
                  <th>61–90</th>
                  <th>90+</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row) => (
                  <tr key={row.id}>
                    <td>{row.invoice_no}</td>
                    <td>{row.customer_name}</td>
                    <td>{row.invoice_date?.slice(0, 10)}</td>
                    <td>{row.age_days} days</td>
                    <td>{row.due_amount}</td>
                    <td>{row.bucket_0_30}</td>
                    <td>{row.bucket_31_60}</td>
                    <td>{row.bucket_61_90}</td>
                    <td>{row.bucket_90_plus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerAgingPage;