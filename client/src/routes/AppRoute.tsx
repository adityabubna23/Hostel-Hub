import { Routes, Route, Navigate } from 'react-router-dom';
import { ROLES, ROLE_REDIRECTS } from '../config/permission';
import { useAuth } from '../hooks/AuthContext';

// Pages
import Login from '../pages/auth/Login';
import AdminDashboard from '@/pages/dashboard/AdminDashboard';
import WardenDashboard from '@/pages/dashboard/WardenDashboard';
import StaffDashboard from '@/pages/dashboard/StaffDashboard';
import StudentDashboard from '@/pages/dashboard/StudentDashboard';
import AddFloorAndRoomPage from '@/pages/admin/addFloor';
import Sidebar from '@/ui/Sidebar';
import AssignStudentPage from '@/pages/admin/assignStudent';
import SendNoticePage from '@/pages/admin/sendNotice';
import ReceiveNoticesPage from '@/pages/notice/recieveNotices';
import HomePage from '@/pages/HomePage';
import CreateUser from '@/pages/admin/createUser';
import UploadDocuments from '@/pages/student/UploadDocument';
import VerifyDocuments from '@/pages/admin/VerifyDocument';
import ViewComplaints from '@/pages/admin/ViewComplain';
import SubmitComplaint from '@/pages/student/SubmitComplain';

// Protected Route Component
interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles 
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
    </div>;
  }

  if (!isAuthenticated || !user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Route Layouts
const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex min-h-screen bg-gray-100">
    <Sidebar />
    <div className="flex-1 p-6">
      {children}
    </div>
  </div>
);

const StudentLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex min-h-screen bg-gray-100">
    <Sidebar />
    <div className="flex-1 p-6">
      {children}
    </div>
  </div>
);

const WardenLayout = () => (
  <div className="min-h-screen bg-gray-100">
    <WardenDashboard />
  </div>
);

const StaffLayout = () => (
  <div className="min-h-screen bg-gray-100">
    <StaffDashboard />
  </div>
);

// Main Routes Component
const AppRoutes = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route 
        path="/login" 
        element={
          // Only redirect if authenticated AND user has a role
          (isAuthenticated && user && user.role) 
            ? <Navigate to={ROLE_REDIRECTS[user.role as keyof typeof ROLE_REDIRECTS] || "/"} replace /> 
            : <Login />
        } 
      />

      {/* Protected Admin Routes */}
      <Route 
        path="/admin/*" 
        element={
          <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
            <AdminLayout>
              <Routes>
                <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="users" element={<div>Users Management</div>} />
                <Route path="settings" element={<div>Admin Settings</div>} />
                <Route path="add-floor-room" element={<AddFloorAndRoomPage />} />
                <Route path="assign-student" element={<AssignStudentPage/>} />
                <Route path="send-notice" element={<SendNoticePage/>} />
                <Route path="create-user" element={<CreateUser />} />
                <Route path='verify-documents' element={<VerifyDocuments/>} />
                <Route path="complaints" element={<ViewComplaints/>} />
              </Routes>
            </AdminLayout>
          </ProtectedRoute>
        } 
      />

      {/* Protected Student Routes */}
      <Route 
        path="/student/*" 
        element={
          <ProtectedRoute allowedRoles={[ROLES.STUDENT]}>
            <StudentLayout>
              <Routes>
                <Route path="/" element={<Navigate to="/student/dashboard" replace />} />
                <Route path="dashboard" element={<StudentDashboard />} />
                <Route path="notices" element={<ReceiveNoticesPage initialRole="Student" />} />
                <Route path="profile" element={<div>Student Profile</div>} />
                <Route path="upload-documents" element={<UploadDocuments/>} />
                <Route path="complaints" element={<SubmitComplaint/>} />
              </Routes>
            </StudentLayout>
          </ProtectedRoute>
        } 
      />

      {/* Protected Warden Routes */}
      <Route 
        path="/warden/*" 
        element={
          <ProtectedRoute allowedRoles={[ROLES.WARDEN]}>
            <Routes>
              <Route path="/" element={<Navigate to="/warden/dashboard" replace />} />
              <Route path="dashboard" element={<WardenLayout />} />
              <Route path="hostel" element={<div>Hostel Management</div>} />
              <Route path="complaints" element={<div>Complaints</div>} />
            </Routes>
          </ProtectedRoute>
        } 
      />

      {/* Protected Staff Routes */}
      <Route 
        path="/staff/*" 
        element={
          <ProtectedRoute allowedRoles={[ROLES.STAFF]}>
            <Routes>
              <Route path="/" element={<Navigate to="/staff/dashboard" replace />} />
              <Route path="dashboard" element={<StaffLayout />} />
              <Route path="attendance" element={<div>Attendance Management</div>} />
              <Route path="reports" element={<div>Staff Reports</div>} />
            </Routes>
          </ProtectedRoute>
        } 
      />

      {/* Root Route - Redirect based on role */}
      <Route 
        path="/redirect" 
        element={
          <RequireAuth>
            <RoleBasedRedirect />
          </RequireAuth>
        } 
      />

      {/* Homepage - Don't redirect if user is just accessing the homepage */}
      <Route 
        path="/" 
        element={<HomePage />} 
      />

      {/* 404 Route */}
      <Route path="*" element={<div>404 - Page Not Found</div>} />
    </Routes>
  );
};

// Helper Components
const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const RoleBasedRedirect = () => {
  const { user } = useAuth();

  if (!user || !user.role) {
    return <Navigate to="/login" replace />;
  }

  const redirectPath = ROLE_REDIRECTS[user.role as keyof typeof ROLE_REDIRECTS];
  return <Navigate to={redirectPath} replace />;
};

export default AppRoutes;