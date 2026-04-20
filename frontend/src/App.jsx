import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { NotificationProvider } from './context/NotificationContext'
import { OrderProvider } from './context/OrderContext'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import TableManagement from './pages/TableManagement'
import MenuManagement from './pages/MenuManagement'
import OrderManagement from './pages/OrderManagement'
import ReservationManagement from './pages/ReservationManagement'
import StaffManagement from './pages/StaffManagement'
import PaymentProcessing from './pages/PaymentProcessing'
import ProtectedRoute from './components/ProtectedRoute'
import NotificationContainer from './components/NotificationContainer'
import Layout from './components/Layout'

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <NotificationProvider>
          <OrderProvider>
            <NotificationContainer />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/tables"
              element={
                <ProtectedRoute>
                  <Layout>
                    <TableManagement />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/menu"
              element={
                <ProtectedRoute>
                  <Layout>
                    <MenuManagement />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders"
              element={
                <ProtectedRoute>
                  <Layout>
                    <OrderManagement />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/reservations"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ReservationManagement />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/staff"
              element={
                <ProtectedRoute>
                  <Layout>
                    <StaffManagement />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/payments"
              element={
                <ProtectedRoute>
                  <Layout>
                    <PaymentProcessing />
                  </Layout>
                </ProtectedRoute>
              }
            />
          </Routes>
          </OrderProvider>
        </NotificationProvider>
      </AuthProvider>
    </Router>
  )
}

export default App