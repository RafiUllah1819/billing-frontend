import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import LoginPage from '../pages/auth/LoginPage';
import DashboardPage from '../pages/dashboard/DashboardPage';
import CustomersPage from '../pages/customers/CustomersPage';
import SuppliersPage from '../pages/suppliers/SuppliersPage';
import ProductsPage from '../pages/products/ProductsPage';
import InvoicesPage from '../pages/invoices/InvoicesPage';
import CreateInvoicePage from '../pages/invoices/CreateInvoicePage';
import InvoiceDetailPage from '../pages/invoices/InvoiceDetailPage';
import PurchasesPage from '../pages/purchases/PurchasesPage';
import CreatePurchasePage from '../pages/purchases/CreatePurchasePage';
import PurchaseDetailPage from '../pages/purchases/PurchaseDetailPage';
import ProtectedRoute from '../components/ProtectedRoute';
import StockReportPage from '../pages/reports/StockReportPage';
import CustomerLedgerListPage from '../pages/ledger/CustomerLedgerListPage';
import CustomerLedgerDetailPage from '../pages/ledger/CustomerLedgerDetailPage';
import SupplierLedgerListPage from '../pages/ledger/SupplierLedgerListPage';
import SupplierLedgerDetailPage from '../pages/ledger/SupplierLedgerDetailPage';
import PaymentsPage from '../pages/payments/PaymentsPage';
import CustomerReceiptPage from '../pages/payments/CustomerReceiptPage';
import SupplierPaymentPage from '../pages/payments/SupplierPaymentPage';
import ProductStockMovementPage from '../pages/stock/ProductStockMovementPage';
import StockMovementsPage from '../pages/stock/StockMovementsPage';
import StockAdjustmentPage from '../pages/adjustments/StockAdjustmentPage';
import SalesReturnPage from '../pages/returns/SalesReturnPage';
import PurchaseReturnPage from '../pages/returns/PurchaseReturnPage';
import UsersPage from '../pages/users/UsersPage';
import AuditLogsPage from '../pages/audit/AuditLogsPage';
import SettingsPage from '../pages/settings/SettingsPage';
import InvoicePrint from "../pages/invoices/InvoicePrint";
import PurchasePrint from "../pages/purchases/PurchasePrint";
import LedgerPrint from "../pages/ledger/LedgerPrint";
import CustomerAgingPage from '../pages/aging/CustomerAgingPage';
import SupplierAgingPage from '../pages/aging/SupplierAgingPage';
import BackupPage from '../pages/backup/BackupPage';
import UnauthorizedPage from '../pages/auth/UnauthorizedPage';
import RoleRoute from './RoleRoutes';
import Layout from '../components/Layout';

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/customers" element={<CustomersPage />} />
          <Route path="/suppliers" element={<SuppliersPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/invoices" element={<InvoicesPage />} />
          <Route path="/invoices/create" element={<CreateInvoicePage />} />
          <Route path="/invoices/:id" element={<InvoiceDetailPage />} />
          <Route path="/purchases" element={<PurchasesPage />} />
          <Route path="/purchases/create" element={<CreatePurchasePage />} />
          <Route path="/purchases/:id" element={<PurchaseDetailPage />} />
          <Route path="/reports/stock" element={<StockReportPage />} />
          <Route path="/ledger/customers" element={<CustomerLedgerListPage />} />
          <Route path="/ledger/customers/:customerId" element={<CustomerLedgerDetailPage />} />
          <Route path="/ledger/suppliers" element={<SupplierLedgerListPage />} />
          <Route path="/ledger/suppliers/:supplierId" element={<SupplierLedgerDetailPage />} />
          <Route path="/payments" element={<PaymentsPage />} />
          <Route path="/payments/customer-receipt" element={<CustomerReceiptPage />} />
          <Route path="/payments/supplier-payment" element={<SupplierPaymentPage />} />
          <Route path="/stock/movements" element={<StockMovementsPage />} />
          <Route path="/stock/movements/:productId" element={<ProductStockMovementPage />} />
          <Route path="/stock/adjustments" element={<StockAdjustmentPage />} />
          <Route path="/returns/sales" element={<SalesReturnPage />} />
          <Route path="/returns/purchases" element={<PurchaseReturnPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/audit-logs" element={<AuditLogsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/print/invoice/:id" element={<InvoicePrint />} />
          <Route path="/print/purchase/:id" element={<PurchasePrint />} />
          <Route path="/print/ledger/:id" element={<LedgerPrint />} />
          <Route path="/aging/customers" element={<CustomerAgingPage />} />
          <Route path="/aging/suppliers" element={<SupplierAgingPage />} />
          <Route path="/backups" element={<BackupPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;