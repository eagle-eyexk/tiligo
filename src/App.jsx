import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from '@/components/ProtectedRoute';
import { CartProvider } from '@/lib/cartStore.jsx';

import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';

import Home from '@/pages/Home';
import BusinessPage from '@/pages/BusinessPage';
import Cart from '@/pages/Cart';
import Orders from '@/pages/Orders';

import Profile from '@/pages/Profile.jsx';
import BusinessDashboard from '@/pages/BusinessDashboard.jsx';
import CourierDashboard from '@/pages/CourierDashboard';
import Invoice from '@/pages/Invoice.jsx';
import Admin from '@/pages/Admin.jsx';
import About from '@/pages/About';
import GitPanel from '@/pages/GitPanel';
import OrderTracking from '@/pages/OrderTracking.jsx';
import RoleGuard from '@/components/tiligo/RoleGuard';
import BusinessLogin from '@/pages/BusinessLogin';
import BusinessRegister from '@/pages/BusinessRegister';
import CourierLogin from '@/pages/CourierLogin';
import CourierRegister from '@/pages/CourierRegister';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
            <img src="https://media.base44.com/images/public/user_69e68678ce0d9fdef245009b/8f0358955_IMG_0105.jpeg" alt="TiliGo" className="absolute inset-1 rounded-2xl object-cover w-18 h-18" style={{width:'72px',height:'72px'}} />
          </div>
          <p className="text-sm text-muted-foreground font-medium animate-pulse">Duke ngarkuar...</p>
        </div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <CartProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        {/* Public routes — accessible without login (guests can browse & order) */}
        <Route path="/" element={<Home />} />
        <Route path="/business/:id" element={<BusinessPage />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/invoice/:id" element={<Invoice />} />
        <Route path="/business/login" element={<BusinessLogin />} />
        <Route path="/business/register" element={<BusinessRegister />} />
        <Route path="/courier/login" element={<CourierLogin />} />
        <Route path="/courier/register" element={<CourierRegister />} />

        {/* Customer-protected routes */}
        <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
          <Route path="/orders" element={<Orders />} />
          <Route path="/order/:id" element={<OrderTracking />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
        {/* Business-protected routes — only business/admin or business owner */}
        <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/business/login" replace />} />}>
          <Route path="/business-dashboard" element={<RoleGuard kind="business" loginPath="/business/login"><BusinessDashboard /></RoleGuard>} />
        </Route>
        {/* Courier-protected routes — only courier/admin or courier profile owner */}
        <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/courier/login" replace />} />}>
          <Route path="/courier-dashboard" element={<RoleGuard kind="courier" loginPath="/courier/login"><CourierDashboard /></RoleGuard>} />
        </Route>
        <Route path="/x-9f3a-c0ntr0l-console" element={<Admin />} />
        <Route path="/about" element={<About />} />
        <Route path="/git" element={<GitPanel />} />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </CartProvider>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App