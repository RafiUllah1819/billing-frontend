import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../api/axios";
import "../invoices/print.css";

const PurchasePrint = () => {

  const { id } = useParams();

  const [bill, setBill] = useState(null);
  const [items, setItems] = useState([]);

  const fetchBill = async () => {

    const res = await api.get(`/purchases/${id}`);

    setBill(res.data.data.bill);
    setItems(res.data.data.items);
  };

  useEffect(() => {
    fetchBill();
  }, []);

  if (!bill) return <div>Loading...</div>;

  return (

    <div className="print-container">

      <div className="print-header">

        {bill.company_logo && (
          <img
            src={`http://localhost:5000${bill.company_logo}`}
            className="print-logo"
            alt="logo"
          />
        )}

        <div className="company-info">
          <h2>{bill.company_name}</h2>
          <p>{bill.company_address}</p>
        </div>

      </div>

      <h1 className="document-title">PURCHASE BILL</h1>

      <div className="invoice-meta">

        <div>
          <strong>Bill No:</strong> {bill.bill_no}
          <br />
          <strong>Date:</strong> {bill.bill_date}
        </div>

        <div>
          <strong>Supplier:</strong> {bill.supplier_name}
        </div>

      </div>

      <table className="print-table">

        <thead>
          <tr>
            <th>#</th>
            <th>Product</th>
            <th>Qty</th>
            <th>Cost</th>
            <th>Total</th>
          </tr>
        </thead>

        <tbody>

          {items.map((item, index) => (

            <tr key={item.id}>
              <td>{index + 1}</td>
              <td>{item.title}</td>
              <td>{item.quantity}</td>
              <td>{bill.currency_symbol} {item.cost_price}</td>
              <td>{bill.currency_symbol} {item.total}</td>
            </tr>

          ))}

        </tbody>

      </table>

      <div className="invoice-total">
        <h2>
          Total: {bill.currency_symbol} {bill.total_amount}
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

export default PurchasePrint;