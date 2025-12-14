import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './auth/Login';
import Register from './auth/Register';
import OtpVerification from './auth/OtpVerification';
import ForgotPassword from './auth/ForgotPassword';
import ResetPassword from './auth/ResetPassword';
import Unauthorized from './components/Common/Unauthorized';
import { Permissions } from './utils/permissions';
import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles, requiredPermission }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  if (requiredPermission && (!user.permissions || !user.permissions.includes(requiredPermission))) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

// Dashboard Placeholders
import EmployerLayout from './components/Layout/EmployerLayout';
import EmployerDashboard from './components/Dashboard/EmployerDashboard';
import EmployeeDashboard from './components/Dashboard/EmployeeDashboard';
import JobList from './components/Jobs/JobList';
import JobForm from './components/Jobs/JobForm';
import ApplicantList from './components/Applications/ApplicantList';
import ApplicantDetails from './components/Applications/ApplicantDetails';

// Employee Components
import EmployeeLayout from './components/Layout/EmployeeLayout';
import EmployeeJobBrowse from './components/Employee/EmployeeJobBrowse';
import JobDetails from './components/Employee/JobDetails';
import MyApplications from './components/Employee/MyApplications';

// Shared Components
import Interviews from './components/Interviews/Interviews';
import Notifications from './components/Notifications/Notifications';

// Admin Components
import AdminLayout from './components/Layout/AdminLayout';
import AdminDashboard from './components/Admin/AdminDashboard';
import JobApprovalQueue from './components/Admin/JobApprovalQueue';
import UserManagement from './components/Admin/UserManagement';
import BroadcastNotification from './components/Admin/BroadcastNotification';
import CategoryManagement from './components/Admin/CategoryManagement';
import AuditLogViewer from './components/Admin/AuditLogViewer';

import Profile from './components/Common/Profile';
import AllApplications from './components/Employer/AllApplications';
import Reports from './components/Common/Reports';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/otp-verify" element={<OtpVerification />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Default Redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<ProtectedRoute allowedRoles={['Admin']} requiredPermission={Permissions.Dashboard.ViewAdmin}><AdminLayout /></ProtectedRoute>}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="jobs" element={<JobApprovalQueue />} />
            <Route path="categories" element={<CategoryManagement />} />
            <Route path="broadcast" element={<BroadcastNotification />} />
            <Route path="audit" element={<AuditLogViewer />} />
            <Route path="profile" element={<Profile />} />
            <Route path="reports" element={<Reports />} />
          </Route>

          {/* Employer Routes */}
          <Route path="/employer" element={<ProtectedRoute allowedRoles={['Employer']} requiredPermission={Permissions.Dashboard.ViewEmployer}><EmployerLayout /></ProtectedRoute>}>
            <Route path="dashboard" element={<EmployerDashboard />} />
            <Route path="jobs" element={<JobList />} />
            <Route path="all-jobs" element={<EmployeeJobBrowse />} />
            <Route path="jobs/create" element={<JobForm />} />
            <Route path="jobs/edit/:id" element={<JobForm />} />
            <Route path="view-job/:id" element={<JobDetails />} />
            <Route path="jobs/:jobId/applicants" element={<ApplicantList />} />
            <Route path="applications" element={<AllApplications />} />
            <Route path="applications/:id" element={<ApplicantDetails />} />
            <Route path="interviews" element={<Interviews />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="profile" element={<Profile />} />
            <Route path="reports" element={<Reports />} />
          </Route>

          {/* Employee Routes */}
          <Route path="/employee" element={<ProtectedRoute allowedRoles={['Employee']} requiredPermission={Permissions.Dashboard.ViewEmployee}><EmployeeLayout /></ProtectedRoute>}>
            <Route path="jobs" element={<EmployeeJobBrowse />} />
            <Route path="jobs/:id" element={<JobDetails />} />
            <Route path="applications" element={<MyApplications />} />
            <Route path="interviews" element={<Interviews />} />
            <Route path="dashboard" element={<EmployeeDashboard />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="profile" element={<Profile />} />
            <Route path="reports" element={<Reports />} />
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes >
      </Router >
    </AuthProvider >
  );
}

export default App;
