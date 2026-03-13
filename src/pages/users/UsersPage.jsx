import { useEffect, useState } from 'react';
import { Plus, RefreshCw, KeyRound, Pencil, Power } from 'lucide-react';
import api from '../../api/axios';
import './users.css';

const emptyForm = {
  username: '',
  email: '',
  full_name: '',
  password: '',
  role: 'sales',
};

const emptyEditForm = {
  email: '',
  full_name: '',
  role: 'sales',
  is_active: true,
};

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const [createForm, setCreateForm] = useState(emptyForm);
  const [editForm, setEditForm] = useState(emptyEditForm);
  const [passwordForm, setPasswordForm] = useState({ new_password: '' });

  const [selectedUser, setSelectedUser] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const roles = ['admin', 'manager', 'sales', 'inventory', 'accountant'];

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/users');
      setUsers(res.data.data || []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const resetMessages = () => {
    setError('');
    setSuccess('');
  };

  const openCreateModal = () => {
    resetMessages();
    setCreateForm(emptyForm);
    setShowCreateModal(true);
  };

  const openEditModal = (user) => {
    resetMessages();
    setSelectedUser(user);
    setEditForm({
      email: user.email || '',
      full_name: user.full_name || '',
      role: user.role || 'sales',
      is_active: user.is_active,
    });
    setShowEditModal(true);
  };

  const openPasswordModal = (user) => {
    resetMessages();
    setSelectedUser(user);
    setPasswordForm({ new_password: '' });
    setShowPasswordModal(true);
  };

  const handleCreateChange = (e) => {
    setCreateForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handlePasswordChange = (e) => {
    setPasswordForm({ new_password: e.target.value });
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    resetMessages();

    if (!createForm.username || !createForm.password) {
      setError('Username and password are required');
      return;
    }

    try {
      setSubmitting(true);

      await api.post('/users', createForm);

      setSuccess('User created successfully');
      setShowCreateModal(false);
      setCreateForm(emptyForm);
      await fetchUsers();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to create user');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditUser = async (e) => {
    e.preventDefault();
    resetMessages();

    if (!selectedUser) return;

    try {
      setSubmitting(true);

      await api.put(`/users/${selectedUser.id}`, editForm);

      setSuccess('User updated successfully');
      setShowEditModal(false);
      setSelectedUser(null);
      await fetchUsers();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update user');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    resetMessages();

    if (!selectedUser) return;

    if (!passwordForm.new_password) {
      setError('New password is required');
      return;
    }

    try {
      setSubmitting(true);

      await api.post(`/users/${selectedUser.id}/reset-password`, passwordForm);

      setSuccess('Password reset successfully');
      setShowPasswordModal(false);
      setSelectedUser(null);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to reset password');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (user) => {
    resetMessages();

    try {
      await api.put(`/users/${user.id}`, {
        email: user.email || '',
        full_name: user.full_name || '',
        role: user.role,
        is_active: !user.is_active,
      });

      setSuccess(
        `User ${!user.is_active ? 'activated' : 'deactivated'} successfully`
      );
      await fetchUsers();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update user status');
    }
  };

  return (
    <div className="users-page">
      <div className="page-header-row">
        <div className="page-header">
          <h1>User Management</h1>
          <p>Create users, assign roles, reset passwords, and manage access</p>
        </div>

        <div className="users-header-actions">
          <button className="secondary-header-btn" onClick={fetchUsers}>
            <RefreshCw size={16} />
            <span>Refresh</span>
          </button>

          <button className="primary-header-btn" onClick={openCreateModal}>
            <Plus size={18} />
            <span>Add User</span>
          </button>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="users-card card">
        {loading ? (
          <div className="table-state">Loading users...</div>
        ) : users.length === 0 ? (
          <div className="table-state">No users found</div>
        ) : (
          <div className="table-wrapper">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Full Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.username}</td>
                    <td>{user.full_name || '-'}</td>
                    <td>{user.email || '-'}</td>
                    <td>
                      <span className="role-badge">{user.role}</span>
                    </td>
                    <td>
                      <span
                        className={`status-badge ${
                          user.is_active ? 'active' : 'inactive'
                        }`}
                      >
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      {user.created_at
                        ? new Date(user.created_at).toLocaleDateString()
                        : '-'}
                    </td>
                    <td>
                      <div className="user-actions">
                        <button
                          className="icon-link-btn"
                          onClick={() => openEditModal(user)}
                          title="Edit User"
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          className="icon-link-btn"
                          onClick={() => openPasswordModal(user)}
                          title="Reset Password"
                        >
                          <KeyRound size={16} />
                        </button>

                        <button
                          className="icon-link-btn"
                          onClick={() => handleToggleStatus(user)}
                          title={user.is_active ? 'Deactivate' : 'Activate'}
                        >
                          <Power size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showCreateModal && (
        <div className="modal-overlay">
          <div className="custom-modal">
            <div className="modal-header">
              <h2>Add User</h2>
            </div>

            <form onSubmit={handleCreateUser}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Username</label>
                  <input
                    name="username"
                    value={createForm.username}
                    onChange={handleCreateChange}
                    placeholder="Enter username"
                  />
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <input
                    name="email"
                    value={createForm.email}
                    onChange={handleCreateChange}
                    placeholder="Enter email"
                  />
                </div>

                <div className="form-group form-group-full">
                  <label>Full Name</label>
                  <input
                    name="full_name"
                    value={createForm.full_name}
                    onChange={handleCreateChange}
                    placeholder="Enter full name"
                  />
                </div>

                <div className="form-group">
                  <label>Password</label>
                  <input
                    type="password"
                    name="password"
                    value={createForm.password}
                    onChange={handleCreateChange}
                    placeholder="Enter password"
                  />
                </div>

                <div className="form-group">
                  <label>Role</label>
                  <select
                    name="role"
                    value={createForm.role}
                    onChange={handleCreateChange}
                  >
                    {roles.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-modal-btn"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-action-btn"
                  disabled={submitting}
                >
                  {submitting ? 'Saving...' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && selectedUser && (
        <div className="modal-overlay">
          <div className="custom-modal">
            <div className="modal-header">
              <h2>Edit User</h2>
            </div>

            <form onSubmit={handleEditUser}>
              <div className="form-grid">
                <div className="form-group form-group-full">
                  <label>Full Name</label>
                  <input
                    name="full_name"
                    value={editForm.full_name}
                    onChange={handleEditChange}
                    placeholder="Enter full name"
                  />
                </div>

                <div className="form-group form-group-full">
                  <label>Email</label>
                  <input
                    name="email"
                    value={editForm.email}
                    onChange={handleEditChange}
                    placeholder="Enter email"
                  />
                </div>

                <div className="form-group">
                  <label>Role</label>
                  <select
                    name="role"
                    value={editForm.role}
                    onChange={handleEditChange}
                  >
                    {roles.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={editForm.is_active}
                      onChange={handleEditChange}
                    />
                    <span>Active User</span>
                  </label>
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-modal-btn"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedUser(null);
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-action-btn"
                  disabled={submitting}
                >
                  {submitting ? 'Saving...' : 'Update User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showPasswordModal && selectedUser && (
        <div className="modal-overlay">
          <div className="custom-modal small-modal">
            <div className="modal-header">
              <h2>Reset Password</h2>
              <p className="modal-subtext">
                Reset password for <strong>{selectedUser.username}</strong>
              </p>
            </div>

            <form onSubmit={handleResetPassword}>
              <div className="form-grid">
                <div className="form-group form-group-full">
                  <label>New Password</label>
                  <input
                    type="password"
                    value={passwordForm.new_password}
                    onChange={handlePasswordChange}
                    placeholder="Enter new password"
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-modal-btn"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setSelectedUser(null);
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-action-btn"
                  disabled={submitting}
                >
                  {submitting ? 'Saving...' : 'Reset Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;