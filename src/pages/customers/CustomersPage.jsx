import { useEffect, useState } from 'react';
import { Plus, RefreshCw, Search, X, Pencil, Trash2 } from 'lucide-react';
import api from '../../api/axios';
import './customers.css';

const initialForm = {
  customer_name: '',
  phone: '',
  email: '',
  address: '',
  opening_balance: '',
};

const CustomersPage = () => {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [deletingCustomer, setDeletingCustomer] = useState(null);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/customers');
      const data = response.data.data || [];
      setCustomers(data);
      setFilteredCustomers(data);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      setFilteredCustomers(customers);
      return;
    }

    const filtered = customers.filter((customer) => {
      return (
        customer.customer_name?.toLowerCase().includes(keyword) ||
        customer.customer_code?.toLowerCase().includes(keyword) ||
        customer.phone?.toLowerCase().includes(keyword) ||
        customer.email?.toLowerCase().includes(keyword)
      );
    });

    setFilteredCustomers(filtered);
  }, [search, customers]);

  const openCreateModal = () => {
    setForm(initialForm);
    setEditingCustomer(null);
    setError('');
    setIsModalOpen(true);
  };

  const openEditModal = (customer) => {
    setEditingCustomer(customer);
    setForm({
      customer_name: customer.customer_name || '',
      phone: customer.phone || '',
      email: customer.email || '',
      address: customer.address || '',
      opening_balance: customer.opening_balance || '',
    });
    setError('');
    setIsModalOpen(true);
  };

  const openDeleteConfirm = (customer) => {
    setDeletingCustomer(customer);
    setError('');
  };

  const closeModal = () => {
    if (submitting) return;
    setIsModalOpen(false);
    setForm(initialForm);
    setEditingCustomer(null);
    setError('');
  };

  const closeDeleteConfirm = () => {
    if (confirmLoading) return;
    setDeletingCustomer(null);
  };

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.customer_name.trim()) {
      setError('Customer name is required');
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        customer_name: form.customer_name.trim(),
        phone: form.phone.trim() || null,
        email: form.email.trim() || null,
        address: form.address.trim() || null,
        opening_balance:
          form.opening_balance === '' ? 0 : Number(form.opening_balance),
      };

      if (editingCustomer) {
        await api.put(`/customers/${editingCustomer.id}`, payload);
      } else {
        await api.post('/customers', payload);
      }

      await fetchCustomers();
      closeModal();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          `Failed to ${editingCustomer ? 'update' : 'create'} customer`
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingCustomer) return;

    try {
      setConfirmLoading(true);
      await api.delete(`/customers/${deletingCustomer.id}`);
      await fetchCustomers();
      setDeletingCustomer(null);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to delete customer');
      setDeletingCustomer(null);
    } finally {
      setConfirmLoading(false);
    }
  };

  return (
    <div className="customers-page">
      <div className="page-header-row">
        <div className="page-header">
          <h1>Customers</h1>
          <p>Manage customer records, balances, and contact details</p>
        </div>

        <button className="primary-header-btn" onClick={openCreateModal}>
          <Plus size={18} />
          <span>Add Customer</span>
        </button>
      </div>

      {error && !isModalOpen && !deletingCustomer && (
        <div className="alert alert-error">{error}</div>
      )}

      <div className="customer-table-card card">
        <div className="table-topbar">
          <div>
            <h2>Customer List</h2>
            <p>{filteredCustomers.length} record(s) found</p>
          </div>

          <div className="table-actions">
            <div className="search-box">
              <Search size={16} />
              <input
                type="text"
                placeholder="Search customers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <button className="refresh-btn" onClick={fetchCustomers}>
              <RefreshCw size={16} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="table-state">Loading customers...</div>
        ) : filteredCustomers.length === 0 ? (
          <div className="table-state">No customers found</div>
        ) : (
          <div className="table-wrapper">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>Opening Balance</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id}>
                    <td>
                      <span className="code-badge">{customer.customer_code}</span>
                    </td>
                    <td>{customer.customer_name}</td>
                    <td>{customer.phone || '-'}</td>
                    <td>{customer.email || '-'}</td>
                    <td>{customer.opening_balance}</td>
                    <td>
                      <div className="table-action-group">
                        <button
                          className="icon-edit-btn"
                          onClick={() => openEditModal(customer)}
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          className="icon-delete-btn"
                          onClick={() => openDeleteConfirm(customer)}
                        >
                          <Trash2 size={16} />
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

      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>{editingCustomer ? 'Edit Customer' : 'Add Customer'}</h2>
                <p>
                  {editingCustomer
                    ? 'Update customer details'
                    : 'Create a new customer record'}
                </p>
              </div>

              <button className="modal-close-btn" onClick={closeModal}>
                <X size={18} />
              </button>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            <form className="customer-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="customer_name">Customer Name</label>
                <input
                  id="customer_name"
                  name="customer_name"
                  value={form.customer_name}
                  onChange={handleChange}
                  placeholder="Enter customer name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone</label>
                <input
                  id="phone"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Enter email"
                />
              </div>

              <div className="form-group">
                <label htmlFor="address">Address</label>
                <textarea
                  id="address"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="Enter address"
                  rows="4"
                />
              </div>

              <div className="form-group">
                <label htmlFor="opening_balance">Opening Balance</label>
                <input
                  id="opening_balance"
                  name="opening_balance"
                  type="number"
                  value={form.opening_balance}
                  onChange={handleChange}
                  placeholder="0"
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-modal-btn"
                  onClick={closeModal}
                >
                  Cancel
                </button>

                <button
                  className="primary-action-btn"
                  type="submit"
                  disabled={submitting}
                >
                  {submitting
                    ? 'Saving...'
                    : editingCustomer
                    ? 'Update Customer'
                    : 'Add Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deletingCustomer && (
        <div className="modal-overlay" onClick={closeDeleteConfirm}>
          <div className="confirm-card" onClick={(e) => e.stopPropagation()}>
            <h3>Delete Customer</h3>
            <p>
              Are you sure you want to delete{' '}
              <strong>{deletingCustomer.customer_name}</strong>?
            </p>

            <div className="modal-actions">
              <button
                type="button"
                className="secondary-modal-btn"
                onClick={closeDeleteConfirm}
              >
                Cancel
              </button>

              <button
                type="button"
                className="danger-action-btn"
                onClick={handleDelete}
                disabled={confirmLoading}
              >
                {confirmLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomersPage;