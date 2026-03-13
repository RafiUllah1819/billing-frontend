import { useEffect, useState } from 'react';
import { Plus, RefreshCw, Search, X, Pencil, Power } from 'lucide-react';
import api from '../../api/axios';
import './products.css';

const initialForm = {
  title: '',
  description: '',
  unit: 'pcs',
  sale_price: '',
  purchase_price: '',
  tax_percent: '',
  current_stock: '',
  min_stock_alert: '',
};

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deactivatingProduct, setDeactivatingProduct] = useState(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/products');
      const data = response.data.data || [];
      setProducts(data);
      setFilteredProducts(data);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      setFilteredProducts(products);
      return;
    }

    const filtered = products.filter((product) => {
      return (
        product.title?.toLowerCase().includes(keyword) ||
        product.product_code?.toLowerCase().includes(keyword) ||
        product.unit?.toLowerCase().includes(keyword)
      );
    });

    setFilteredProducts(filtered);
  }, [search, products]);

  const openCreateModal = () => {
    setForm(initialForm);
    setEditingProduct(null);
    setError('');
    setIsModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setForm({
      title: product.title || '',
      description: product.description || '',
      unit: product.unit || 'pcs',
      sale_price: product.sale_price || '',
      purchase_price: product.purchase_price || '',
      tax_percent: product.tax_percent || '',
      current_stock: product.current_stock || '',
      min_stock_alert: product.min_stock_alert || '',
    });
    setError('');
    setIsModalOpen(true);
  };

  const openDeactivateConfirm = (product) => {
    setDeactivatingProduct(product);
    setError('');
  };

  const closeModal = () => {
    if (submitting) return;
    setIsModalOpen(false);
    setForm(initialForm);
    setEditingProduct(null);
    setError('');
  };

  const closeDeactivateConfirm = () => {
    if (confirmLoading) return;
    setDeactivatingProduct(null);
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

    if (!form.title.trim()) {
      setError('Product title is required');
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        title: form.title.trim(),
        description: form.description.trim() || null,
        unit: form.unit.trim() || 'pcs',
        sale_price: form.sale_price === '' ? 0 : Number(form.sale_price),
        purchase_price:
          form.purchase_price === '' ? 0 : Number(form.purchase_price),
        tax_percent: form.tax_percent === '' ? 0 : Number(form.tax_percent),
        current_stock:
          form.current_stock === '' ? 0 : Number(form.current_stock),
        min_stock_alert:
          form.min_stock_alert === '' ? 0 : Number(form.min_stock_alert),
      };

      if (editingProduct) {
        await api.put(`/products/${editingProduct.id}`, payload);
      } else {
        await api.post('/products', payload);
      }

      await fetchProducts();
      closeModal();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          `Failed to ${editingProduct ? 'update' : 'create'} product`
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeactivate = async () => {
    if (!deactivatingProduct) return;

    try {
      setConfirmLoading(true);
      await api.delete(`/products/${deactivatingProduct.id}`);
      await fetchProducts();
      setDeactivatingProduct(null);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to deactivate product');
      setDeactivatingProduct(null);
    } finally {
      setConfirmLoading(false);
    }
  };

  return (
    <div className="products-page">
      <div className="page-header-row">
        <div className="page-header">
          <h1>Products</h1>
          <p>Manage products, pricing, stock, and tax settings</p>
        </div>

        <button className="primary-header-btn" onClick={openCreateModal}>
          <Plus size={18} />
          <span>Add Product</span>
        </button>
      </div>

      {error && !isModalOpen && !deactivatingProduct && (
        <div className="alert alert-error">{error}</div>
      )}

      <div className="product-table-card card">
        <div className="table-topbar">
          <div>
            <h2>Product List</h2>
            <p>{filteredProducts.length} record(s) found</p>
          </div>

          <div className="table-actions">
            <div className="search-box">
              <Search size={16} />
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <button className="refresh-btn" onClick={fetchProducts}>
              <RefreshCw size={16} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="table-state">Loading products...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="table-state">No products found</div>
        ) : (
          <div className="table-wrapper">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Title</th>
                  <th>Unit</th>
                  <th>Sale Price</th>
                  <th>Purchase Price</th>
                  <th>Tax %</th>
                  <th>Stock</th>
                  <th>Min Alert</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <span className="code-badge">{product.product_code}</span>
                    </td>
                    <td>{product.title}</td>
                    <td>{product.unit}</td>
                    <td>{product.sale_price}</td>
                    <td>{product.purchase_price}</td>
                    <td>{product.tax_percent}</td>
                    <td>{product.current_stock}</td>
                    <td>{product.min_stock_alert}</td>
                    <td>
                      <span
                        className={`status-pill ${
                          product.is_active ? 'status-active' : 'status-inactive'
                        }`}
                      >
                        {product.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="table-action-group">
                        <button
                          className="icon-edit-btn"
                          onClick={() => openEditModal(product)}
                        >
                          <Pencil size={16} />
                        </button>
                        {product.is_active && (
                          <button
                            className="icon-deactivate-btn"
                            onClick={() => openDeactivateConfirm(product)}
                          >
                            <Power size={16} />
                          </button>
                        )}
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
          <div className="modal-card modal-card-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>{editingProduct ? 'Edit Product' : 'Add Product'}</h2>
                <p>
                  {editingProduct
                    ? 'Update product details'
                    : 'Create a new product with pricing and stock'}
                </p>
              </div>

              <button className="modal-close-btn" onClick={closeModal}>
                <X size={18} />
              </button>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            <form className="product-form" onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group form-group-full">
                  <label htmlFor="title">Product Title</label>
                  <input
                    id="title"
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="Enter product title"
                  />
                </div>

                <div className="form-group form-group-full">
                  <label htmlFor="description">Description</label>
                  <textarea
                    id="description"
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Enter product description"
                    rows="3"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="unit">Unit</label>
                  <input
                    id="unit"
                    name="unit"
                    value={form.unit}
                    onChange={handleChange}
                    placeholder="pcs"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="tax_percent">Tax %</label>
                  <input
                    id="tax_percent"
                    name="tax_percent"
                    type="number"
                    value={form.tax_percent}
                    onChange={handleChange}
                    placeholder="0"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="sale_price">Sale Price</label>
                  <input
                    id="sale_price"
                    name="sale_price"
                    type="number"
                    value={form.sale_price}
                    onChange={handleChange}
                    placeholder="0"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="purchase_price">Purchase Price</label>
                  <input
                    id="purchase_price"
                    name="purchase_price"
                    type="number"
                    value={form.purchase_price}
                    onChange={handleChange}
                    placeholder="0"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="current_stock">Current Stock</label>
                  <input
                    id="current_stock"
                    name="current_stock"
                    type="number"
                    value={form.current_stock}
                    onChange={handleChange}
                    placeholder="0"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="min_stock_alert">Min Stock Alert</label>
                  <input
                    id="min_stock_alert"
                    name="min_stock_alert"
                    type="number"
                    value={form.min_stock_alert}
                    onChange={handleChange}
                    placeholder="0"
                  />
                </div>
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
                    : editingProduct
                    ? 'Update Product'
                    : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deactivatingProduct && (
        <div className="modal-overlay" onClick={closeDeactivateConfirm}>
          <div className="confirm-card" onClick={(e) => e.stopPropagation()}>
            <h3>Deactivate Product</h3>
            <p>
              Are you sure you want to deactivate{' '}
              <strong>{deactivatingProduct.title}</strong>?
            </p>

            <div className="modal-actions">
              <button
                type="button"
                className="secondary-modal-btn"
                onClick={closeDeactivateConfirm}
              >
                Cancel
              </button>

              <button
                type="button"
                className="danger-action-btn"
                onClick={handleDeactivate}
                disabled={confirmLoading}
              >
                {confirmLoading ? 'Processing...' : 'Deactivate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;