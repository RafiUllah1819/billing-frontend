import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../api/axios";
import "./print.css";

const InvoicePrint = () => {

  const { id } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [items, setItems] = useState([]);

  const fetchInvoice = async () => {

    const res = await api.get(`/invoices/${id}`);

    setInvoice(res.data.data.invoice);
    setItems(res.data.data.items);
  };

  useEffect(() => {
    fetchInvoice();
  }, []);

  if (!invoice) return <div>Loading...</div>;

  return (

    <div className="print-container">

      <div className="print-header">

        {invoice.company_logo && (
          <img
            src={`http://localhost:5000${invoice.company_logo}`}
            className="print-logo"
            alt="logo"
          />
        )}

        <div className="company-info">
          <h2>{invoice.company_name}</h2>
          <p>{invoice.company_address}</p>
          <p>
            Phone: {invoice.company_phone}
            <br />
            Email: {invoice.company_email}
          </p>
        </div>

      </div>

      <h1 className="document-title">SALES INVOICE</h1>

      <div className="invoice-meta">

        <div>
          <strong>Invoice No:</strong> {invoice.invoice_no}
          <br />
          <strong>Date:</strong> {invoice.invoice_date}
        </div>

        <div>
          <strong>Customer:</strong> {invoice.customer_name}
          <br />
          <strong>Phone:</strong> {invoice.phone}
        </div>

      </div>

      <table className="print-table">

        <thead>
          <tr>
            <th>#</th>
            <th>Product</th>
            <th>Qty</th>
            <th>Price</th>
            <th>Total</th>
          </tr>
        </thead>

        <tbody>

          {items.map((item, index) => (

            <tr key={item.id}>
              <td>{index + 1}</td>
              <td>{item.title}</td>
              <td>{item.quantity}</td>
              <td>{invoice.currency_symbol} {item.unit_price}</td>
              <td>{invoice.currency_symbol} {item.total}</td>
            </tr>

          ))}

        </tbody>

      </table>

      <div className="invoice-total">

        <h2>
          Total: {invoice.currency_symbol} {invoice.total_amount}
        </h2>

      </div>

      <button
        className="print-button"
        onClick={() => window.print()}
      >
        Print
      </button>

    </div>
  );
};

export default InvoicePrint;