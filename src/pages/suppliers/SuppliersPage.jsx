import { useEffect, useState } from 'react';
import { Plus, RefreshCw, Search, X, Pencil, Trash2 } from 'lucide-react';
import api from '../../api/axios';
import './suppliers.css';

const initialForm = {
  supplier_name: '',
  phone: '',
  email: '',
  address: '',
  opening_balance: '',
};

const SuppliersPage = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [deletingSupplier, setDeletingSupplier] = useState(null);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/suppliers');
      const data = response.data.data || [];
      setSuppliers(data);
      setFilteredSuppliers(data);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load suppliers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  useEffect(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      setFilteredSuppliers(suppliers);
      return;
    }

    const filtered = suppliers.filter((supplier) => {
      return (
        supplier.supplier_name?.toLowerCase().includes(keyword) ||
        supplier.supplier_code?.toLowerCase().includes(keyword) ||
        supplier.phone?.toLowerCase().includes(keyword) ||
        supplier.email?.toLowerCase().includes(keyword)
      );
    });

    setFilteredSuppliers(filtered);
  }, [search, suppliers]);

  const openCreateModal = () => {
    setForm(initialForm);
    setEditingSupplier(null);
    setError('');
    setIsModalOpen(true);
  };

  const openEditModal = (supplier) => {
    setEditingSupplier(supplier);
    setForm({
      supplier_name: supplier.supplier_name || '',
      phone: supplier.phone || '',
      email: supplier.email || '',
      address: supplier.address || '',
      opening_balance: supplier.opening_balance || '',
    });
    setError('');
    setIsModalOpen(true);
  };

  const openDeleteConfirm = (supplier) => {
    setDeletingSupplier(supplier);
    setError('');
  };

  const closeModal = () => {
    if (submitting) return;
    setIsModalOpen(false);
    setForm(initialForm);
    setEditingSupplier(null);
    setError('');
  };

  const closeDeleteConfirm = () => {
    if (confirmLoading) return;
    setDeletingSupplier(null);
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

    if (!form.supplier_name.trim()) {
      setError('Supplier name is required');
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        supplier_name: form.supplier_name.trim(),
        phone: form.phone.trim() || null,
        email: form.email.trim() || null,
        address: form.address.trim() || null,
        opening_balance:
          form.opening_balance === '' ? 0 : Number(form.opening_balance),
      };

      if (editingSupplier) {
        await api.put(`/suppliers/${editingSupplier.id}`, payload);
      } else {
        await api.post('/suppliers', payload);
      }

      await fetchSuppliers();
      closeModal();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          `Failed to ${editingSupplier ? 'update' : 'create'} supplier`
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingSupplier) return;

    try {
      setConfirmLoading(true);
      await api.delete(`/suppliers/${deletingSupplier.id}`);
      await fetchSuppliers();
      setDeletingSupplier(null);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to delete supplier');
      setDeletingSupplier(null);
    } finally {
      setConfirmLoading(false);
    }
  };

  return (
    <div className="suppliers-page">
      <div className="page-header-row">
        <div className="page-header">
          <h1>Suppliers</h1>
          <p>Manage supplier records, payable balances, and contact details</p>
        </div>

        <button className="primary-header-btn" onClick={openCreateModal}>
          <Plus size={18} />
          <span>Add Supplier</span>
        </button>
      </div>

      {error && !isModalOpen && !deletingSupplier && (
        <div className="alert alert-error">{error}</div>
      )}

      <div className="supplier-table-card card">
        <div className="table-topbar">
          <div>
            <h2>Supplier List</h2>
            <p>{filteredSuppliers.length} record(s) found</p>
          </div>

          <div className="table-actions">
            <div className="search-box">
              <Search size={16} />
              <input
                type="text"
                placeholder="Search suppliers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <button className="refresh-btn" onClick={fetchSuppliers}>
              <RefreshCw size={16} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="table-state">Loading suppliers...</div>
        ) : filteredSuppliers.length === 0 ? (
          <div className="table-state">No suppliers found</div>
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
                {filteredSuppliers.map((supplier) => (
                  <tr key={supplier.id}>
                    <td>
                      <span className="code-badge">{supplier.supplier_code}</span>
                    </td>
                    <td>{supplier.supplier_name}</td>
                    <td>{supplier.phone || '-'}</td>
                    <td>{supplier.email || '-'}</td>
                    <td>{supplier.opening_balance}</td>
                    <td>
                      <div className="table-action-group">
                        <button
                          className="icon-edit-btn"
                          onClick={() => openEditModal(supplier)}
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          className="icon-delete-btn"
                          onClick={() => openDeleteConfirm(supplier)}
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
                <h2>{editingSupplier ? 'Edit Supplier' : 'Add Supplier'}</h2>
                <p>
                  {editingSupplier
                    ? 'Update supplier details'
                    : 'Create a new supplier record'}
                </p>
              </div>

              <button className="modal-close-btn" onClick={closeModal}>
                <X size={18} />
              </button>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            <form className="supplier-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="supplier_name">Supplier Name</label>
                <input
                  id="supplier_name"
                  name="supplier_name"
                  value={form.supplier_name}
                  onChange={handleChange}
                  placeholder="Enter supplier name"
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
                    : editingSupplier
                    ? 'Update Supplier'
                    : 'Add Supplier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deletingSupplier && (
        <div className="modal-overlay" onClick={closeDeleteConfirm}>
          <div className="confirm-card" onClick={(e) => e.stopPropagation()}>
            <h3>Delete Supplier</h3>
            <p>
              Are you sure you want to delete{' '}
              <strong>{deletingSupplier.supplier_name}</strong>?
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

export default SuppliersPage;