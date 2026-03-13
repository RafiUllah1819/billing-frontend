import { useEffect, useState } from 'react';
import { RefreshCw, Search } from 'lucide-react';
import api from '../../api/axios';
import './audit.css';

const AuditLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/audit-logs');
      const data = response.data.data || [];
      setLogs(data);
      setFilteredLogs(data);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  useEffect(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      setFilteredLogs(logs);
      return;
    }

    const filtered = logs.filter((log) => {
      return (
        log.action_type?.toLowerCase().includes(keyword) ||
        log.module_name?.toLowerCase().includes(keyword) ||
        log.description?.toLowerCase().includes(keyword) ||
        log.username?.toLowerCase().includes(keyword) ||
        log.full_name?.toLowerCase().includes(keyword)
      );
    });

    setFilteredLogs(filtered);
  }, [search, logs]);

  return (
    <div className="audit-page">
      <div className="page-header">
        <h1>Audit Logs</h1>
        <p>Track important user actions across the system</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="audit-card card">
        <div className="table-topbar">
          <div>
            <h2>Activity History</h2>
            <p>{filteredLogs.length} record(s) found</p>
          </div>

          <div className="table-actions">
            <div className="search-box">
              <Search size={16} />
              <input
                type="text"
                placeholder="Search audit logs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <button className="refresh-btn" onClick={fetchLogs}>
              <RefreshCw size={16} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="table-state">Loading audit logs...</div>
        ) : filteredLogs.length === 0 ? (
          <div className="table-state">No audit logs found</div>
        ) : (
          <div className="table-wrapper">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>User</th>
                  <th>Action</th>
                  <th>Module</th>
                  <th>Description</th>
                  <th>Record ID</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => (
                  <tr key={log.id}>
                    <td>{log.created_at?.slice(0, 19).replace('T', ' ')}</td>
                    <td>{log.full_name || log.username || '-'}</td>
                    <td>{log.action_type}</td>
                    <td>{log.module_name}</td>
                    <td>{log.description || '-'}</td>
                    <td>{log.record_id || '-'}</td>
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

export default AuditLogsPage;