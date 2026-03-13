import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../api/axios";
import "../invoices/print.css";

const LedgerPrint = () => {

  const { id } = useParams();

  const [ledger, setLedger] = useState([]);

  const fetchLedger = async () => {

    const res = await api.get(`/ledger/customers/${id}`);

    setLedger(res.data.data);
  };

  useEffect(() => {
    fetchLedger();
  }, []);

  return (

    <div className="print-container">

      <h1 className="document-title">
        Customer Ledger
      </h1>

      <table className="print-table">

        <thead>
          <tr>
            <th>Date</th>
            <th>Description</th>
            <th>Debit</th>
            <th>Credit</th>
            <th>Balance</th>
          </tr>
        </thead>

        <tbody>

          {ledger.map((row, index) => (

            <tr key={index}>
              <td>{row.date}</td>
              <td>{row.description}</td>
              <td>{row.debit}</td>
              <td>{row.credit}</td>
              <td>{row.balance}</td>
            </tr>

          ))}

        </tbody>

      </table>

      <button
        className="print-button"
        onClick={() => window.print()}
      >
        Print
      </button>

    </div>
  );
};

export default LedgerPrint;