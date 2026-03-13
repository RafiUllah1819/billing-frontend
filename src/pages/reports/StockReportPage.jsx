import { useEffect, useState } from 'react';
import { Search, RefreshCw } from 'lucide-react';
import api from '../../api/axios';
import { Download } from 'lucide-react';
import { exportToCsv } from '../../utils/exportCsv';
import './reports.css';

const StockReportPage = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchStock = async () => {
    try {
      setLoading(true);

      const response = await api.get('/reports/stock');

      setProducts(response.data.data);
      setFilteredProducts(response.data.data);
    } catch (error) {
      console.error('Stock report error', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStock();
  }, []);

  useEffect(() => {
    const keyword = search.toLowerCase();

    const filtered = products.filter((p) =>
      p.title.toLowerCase().includes(keyword) ||
      p.product_code.toLowerCase().includes(keyword)
    );

    setFilteredProducts(filtered);
  }, [search, products]);

  const handleExportCsv = () => {
  const exportRows = filteredProducts.map((product) => ({
    product_code: product.product_code,
    title: product.title,
    unit: product.unit,
    purchase_price: product.purchase_price,
    sale_price: product.sale_price,
    current_stock: product.current_stock,
    min_stock_alert: product.min_stock_alert,
    stock_value: product.stock_value,
  }));

  exportToCsv('stock-report', exportRows);
};

  return (
    <div className="stock-report-page">

      <div className="page-header">
        <h1>Stock Report</h1>
        <p>Overview of all product inventory and stock value</p>
      </div>

      <div className="card stock-report-card">

        <div className="table-topbar">

          <div>
            <h2>Inventory</h2>
            <p>{filteredProducts.length} products</p>
          </div>

          <div className="table-actions">

            <div className="search-box">
              <Search size={16}/>
              <input
                type="text"
                placeholder="Search product..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <button className="refresh-btn" onClick={fetchStock}>
              <RefreshCw size={16}/>
              Refresh
            </button>

            <button className="refresh-btn" onClick={handleExportCsv}>
              <Download size={16} />
              <span>Export CSV</span>
            </button>

          </div>

        </div>

        {loading ? (
          <div className="table-state">Loading stock...</div>
        ) : (

        <div className="table-wrapper">

          <table className="modern-table">

            <thead>
              <tr>
                <th>Code</th>
                <th>Product</th>
                <th>Unit</th>
                <th>Purchase Price</th>
                <th>Sale Price</th>
                <th>Stock</th>
                <th>Min Stock</th>
                <th>Stock Value</th>
              </tr>
            </thead>

            <tbody>

              {filteredProducts.map((product) => (

                <tr key={product.id}>

                  <td>
                    <span className="code-badge">
                      {product.product_code}
                    </span>
                  </td>

                  <td>{product.title}</td>

                  <td>{product.unit}</td>

                  <td>{product.purchase_price}</td>

                  <td>{product.sale_price}</td>

                  <td>
                    <span
                      className={
                        product.current_stock <= product.min_stock_alert
                        ? "stock-badge low"
                        : "stock-badge"
                      }
                    >
                      {product.current_stock}
                    </span>
                  </td>

                  <td>{product.min_stock_alert}</td>

                  <td>{product.stock_value}</td>

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

export default StockReportPage;