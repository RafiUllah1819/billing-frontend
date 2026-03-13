import { useEffect, useState } from 'react';
import { Database, Download, RefreshCw } from 'lucide-react';
import api from '../../api/axios';
import './backup.css';

const BackupPage = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const fetchBackups = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/backups');
      setFiles(response.data.data || []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load backups');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBackups();
  }, []);

  const handleCreateBackup = async () => {
    try {
      setCreating(true);
      setError('');
      setMessage('');

      const response = await api.post('/backups/create');
      setMessage(response.data.message || 'Backup created successfully');

      await fetchBackups();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to create backup');
    } finally {
      setCreating(false);
    }
  };

  const handleDownload = async (filename) => {
    try {
      const response = await api.get(`/backups/download/${filename}`, {
        responseType: 'blob',
      });

      const blob = new Blob([response.data], { type: 'application/sql' });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to download backup');
    }
  };

  const formatBytes = (bytes) => {
    if (!bytes && bytes !== 0) return '-';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="backup-page">
      <div className="page-header-row">
        <div className="page-header">
          <h1>Database Backups</h1>
          <p>Create and download database snapshot files</p>
        </div>

        <div className="backup-header-actions">
          <button className="secondary-header-btn" onClick={fetchBackups}>
            <RefreshCw size={16} />
            <span>Refresh</span>
          </button>

          <button
            className="primary-header-btn"
            onClick={handleCreateBackup}
            disabled={creating}
          >
            <Database size={18} />
            <span>{creating ? 'Creating...' : 'Create Backup'}</span>
          </button>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {message && <div className="alert alert-success">{message}</div>}

      <div className="backup-card card">
        <div className="table-topbar">
          <div>
            <h2>Backup Files</h2>
            <p>{files.length} file(s) found</p>
          </div>
        </div>

        {loading ? (
          <div className="table-state">Loading backup files...</div>
        ) : files.length === 0 ? (
          <div className="table-state">No backup files found</div>
        ) : (
          <div className="table-wrapper">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Filename</th>
                  <th>Size</th>
                  <th>Created At</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {files.map((file) => (
                  <tr key={file.filename}>
                    <td>{file.filename}</td>
                    <td>{formatBytes(file.size_bytes)}</td>
                    <td>
                      {file.created_at
                        ? new Date(file.created_at).toLocaleString()
                        : '-'}
                    </td>
                    <td>
                      <button
                        className="icon-link-btn"
                        onClick={() => handleDownload(file.filename)}
                      >
                        <Download size={16} />
                      </button>
                    </td>
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

export default BackupPage;