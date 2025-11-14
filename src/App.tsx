import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Sidebar } from "./components/Sidebar";
import { Topbar } from "./components/Topbar";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Sales from "./pages/Sales";
import Products from "./pages/Products";
import Clients from "./pages/Clients";
import Invoices from "./pages/Invoices";
import Reports from "./pages/Reports";
import CashManagement from "./pages/CashManagement";
import CashFlow from "./pages/CashFlow";
import Settings from "./pages/Settings";
import Suppliers from "./pages/Suppliers";
import Purchases from "./pages/Purchases";
import Expenses from "./pages/Expenses";
import Employees from "./pages/Employees";
import Budgets from "./pages/Budgets";
import ServiceOrders from "./pages/ServiceOrders";
import Contracts from "./pages/Contracts";
import CostCenters from "./pages/CostCenters";
import ChartOfAccounts from "./pages/ChartOfAccounts";
import FixedAssets from "./pages/FixedAssets";
import TimeClocks from "./pages/TimeClocks";
import ProductionOrders from "./pages/ProductionOrders";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppContent = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <Routes>
          <Route path="/login" element={<Navigate to="/" replace />} />
          <Route path="/" element={<ProtectedRoute><Sales /></ProtectedRoute>} />
        <Route path="/produtos" element={<ProtectedRoute allowedRoles={['admin']}><Products /></ProtectedRoute>} />
        <Route path="/clientes" element={<ProtectedRoute><Clients /></ProtectedRoute>} />
        <Route path="/fornecedores" element={<ProtectedRoute allowedRoles={['admin']}><Suppliers /></ProtectedRoute>} />
        <Route path="/compras" element={<ProtectedRoute allowedRoles={['admin']}><Purchases /></ProtectedRoute>} />
        <Route path="/despesas" element={<ProtectedRoute allowedRoles={['admin']}><Expenses /></ProtectedRoute>} />
        <Route path="/funcionarios" element={<ProtectedRoute allowedRoles={['admin']}><Employees /></ProtectedRoute>} />
        <Route path="/orcamentos" element={<ProtectedRoute><Budgets /></ProtectedRoute>} />
        <Route path="/ordens-servico" element={<ProtectedRoute><ServiceOrders /></ProtectedRoute>} />
        <Route path="/contratos" element={<ProtectedRoute allowedRoles={['admin']}><Contracts /></ProtectedRoute>} />
        <Route path="/centros-custo" element={<ProtectedRoute allowedRoles={['admin']}><CostCenters /></ProtectedRoute>} />
        <Route path="/plano-contas" element={<ProtectedRoute allowedRoles={['admin']}><ChartOfAccounts /></ProtectedRoute>} />
        <Route path="/ativo-fixo" element={<ProtectedRoute allowedRoles={['admin']}><FixedAssets /></ProtectedRoute>} />
        <Route path="/ponto-eletronico" element={<ProtectedRoute allowedRoles={['admin']}><TimeClocks /></ProtectedRoute>} />
        <Route path="/ordens-producao" element={<ProtectedRoute allowedRoles={['admin']}><ProductionOrders /></ProtectedRoute>} />
        <Route path="/faturas" element={<ProtectedRoute><Invoices /></ProtectedRoute>} />
        <Route path="/relatorios" element={<ProtectedRoute allowedRoles={['admin']}><Reports /></ProtectedRoute>} />
        <Route path="/caixa" element={<ProtectedRoute><CashManagement /></ProtectedRoute>} />
        <Route path="/fluxo-caixa" element={<ProtectedRoute allowedRoles={['admin']}><CashFlow /></ProtectedRoute>} />
        <Route path="/configuracoes" element={<ProtectedRoute allowedRoles={['admin']}><Settings /></ProtectedRoute>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      </div>
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
