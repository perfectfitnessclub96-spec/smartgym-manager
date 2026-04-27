// src/App.tsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import LandingPage from './components/LandingPage';
import AdminLogin from './components/AdminLogin';
import MemberLogin from './components/MemberLogin';
import MemberDashboard from './components/member/MemberDashboard';
import AdminDashboard from './components/admin/AdminDashboard';
import MembersList from './components/admin/MembersList';
import AddMember from './components/admin/AddMember';
import MemberDetail from './components/admin/MemberDetail';
import AdminRenewalRequests from './components/admin/AdminRenewalRequests';
import BookWellness from './components/member/BookWellness';
import MySpaBookings from './components/member/MySpaBookings';
import ManageEquipment from './components/admin/ManageEquipment';
import ViewEquipment from './components/member/ViewEquipment';
import ManageBookings from './components/admin/ManageBookings';
import RenewMembership from './components/member/RenewMembership';
import Profile from './components/member/Profile';
import ManageAdmins from './components/admin/ManageAdmins';
import Notifications from './components/admin/Notifications';
import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { ToastContainer } from './components/common/Toast';

function ProtectedRoute({ children, allowedRole }: { children: JSX.Element; allowedRole: 'ADMIN' | 'MEMBER' }) {
  const { isAuthenticated, user, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log('Not authenticated, redirecting to home');
    return <Navigate to="/" replace />;
  }

  const userRole = user?.role;
  const isAdminAllowed = allowedRole === 'ADMIN' && (userRole === 'ADMIN' || userRole === 'SUPER_ADMIN');
  const isMemberAllowed = allowedRole === 'MEMBER' && userRole === 'MEMBER';
  
  if (!isAdminAllowed && !isMemberAllowed) {
    console.log(`Wrong role. Expected ${allowedRole}, got ${userRole}. Redirecting to home`);
    return <Navigate to="/" replace />;
  }

  return children;
}

function App() {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
    document.title = "Perfect Fitness Club";
  }, []);

  return (
    <ErrorBoundary>
      <Toaster position="top-right" />
      <ToastContainer />
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/member-login" element={<MemberLogin />} />
          
          {/* Member Protected Routes */}
          <Route path="/member/dashboard" element={
            <ProtectedRoute allowedRole="MEMBER">
              <MemberDashboard />
            </ProtectedRoute>
          } />
          <Route path="/member/renew" element={
            <ProtectedRoute allowedRole="MEMBER">
              <RenewMembership />
            </ProtectedRoute>
          } />
          <Route path="/member/profile" element={
            <ProtectedRoute allowedRole="MEMBER">
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="/member/book-wellness" element={
            <ProtectedRoute allowedRole="MEMBER">
              <BookWellness />
            </ProtectedRoute>
          } />
          <Route path="/member/my-spa-bookings" element={
            <ProtectedRoute allowedRole="MEMBER">
              <MySpaBookings />
            </ProtectedRoute>
          } />
          <Route path="/member/equipment" element={
            <ProtectedRoute allowedRole="MEMBER">
              <ViewEquipment />
            </ProtectedRoute>
          } />
          
          {/* Admin Protected Routes */}
          <Route path="/admin/dashboard" element={
            <ProtectedRoute allowedRole="ADMIN">
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/members" element={
            <ProtectedRoute allowedRole="ADMIN">
              <MembersList />
            </ProtectedRoute>
          } />
          <Route path="/admin/members/add" element={
            <ProtectedRoute allowedRole="ADMIN">
              <AddMember />
            </ProtectedRoute>
          } />
          <Route path="/admin/members/:id" element={
            <ProtectedRoute allowedRole="ADMIN">
              <MemberDetail />
            </ProtectedRoute>
          } />
          <Route path="/admin/renewal-requests" element={
            <ProtectedRoute allowedRole="ADMIN">
              <AdminRenewalRequests />
            </ProtectedRoute>
          } />
          <Route path="/admin/manage-bookings" element={
            <ProtectedRoute allowedRole="ADMIN">
              <ManageBookings />
            </ProtectedRoute>
          } />
          <Route path="/admin/equipment" element={
            <ProtectedRoute allowedRole="ADMIN">
              <ManageEquipment />
            </ProtectedRoute>
          } />
          <Route path="/admin/notifications" element={
            <ProtectedRoute allowedRole="ADMIN">
              <Notifications />
            </ProtectedRoute>
          } />
          <Route path="/admin/admins" element={
            <ProtectedRoute allowedRole="ADMIN">
              <ManageAdmins />
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}

export default App;