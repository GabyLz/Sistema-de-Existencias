import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProductsPage } from './pages/ProductsPage';
import { SuppliersPage } from './pages/SuppliersPage';
import { PurchaseOrdersPage } from './pages/PurchaseOrdersPage';
import { InventoryPage } from './pages/InventoryPage';
import { ParametersPage } from './pages/ParametersPage';
import { ReportsPage } from './pages/ReportsPage';
import { RolesPage } from './pages/RolesPage';
import { UsersPage } from './pages/UsersPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="*"
            element={
              <ProtectedRoute>
                <Layout>
                  <Routes>
                    <Route path="/" element={<DashboardPage />} />
                    <Route path="/productos" element={<ProductsPage />} />
                    <Route path="/proveedores" element={<SuppliersPage />} />
                    <Route path="/compras" element={<PurchaseOrdersPage />} />
                    <Route path="/inventario" element={<InventoryPage />} />
                    <Route path="/parametros" element={<ParametersPage />} />
                    <Route path="/reportes" element={<ReportsPage />} />
                    <Route path="/roles" element={<RolesPage />} />
                    <Route
                      path="/usuarios"
                      element={
                        <ProtectedRoute roles={['administrador']}>
                          <UsersPage />
                        </ProtectedRoute>
                      }
                    />
                  </Routes>
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
