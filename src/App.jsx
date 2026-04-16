import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import FileComplaint from './pages/FileComplaint';
import ComplaintsList from './pages/ComplaintsList';
import ManageUsers from './pages/ManageUsers';
import Profile from './pages/Profile';
import StaffPerformanceReport from './pages/StaffPerformanceReport';
import { useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import ChatBot from './components/ChatBot';

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route path="/dashboard" element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } />

          <Route path="/complaints/new" element={
            <PrivateRoute>
              <FileComplaint />
            </PrivateRoute>
          } />

          <Route path="/complaints" element={
            <PrivateRoute>
              <ComplaintsList />
            </PrivateRoute>
          } />

          <Route path="/users" element={
            <PrivateRoute>
              <ManageUsers />
            </PrivateRoute>
          } />

          <Route path="/admin/reports" element={
            <PrivateRoute>
              <StaffPerformanceReport />
            </PrivateRoute>
          } />

          <Route path="/profile" element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          } />

          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
        <ChatBot />
      </NotificationProvider>
    </ThemeProvider>
  );
}

export default App;
