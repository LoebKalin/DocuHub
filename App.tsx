
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Layout from './components/Layout';
import AdminDashboard from './components/AdminDashboard';
import UserDashboard from './components/UserDashboard';
import PdfUpload from './components/PdfUpload';
import UserUpload from './components/UserUpload';
import { User, UserRole } from './types';
import { getAuthUser, logout } from './services/authService';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(getAuthUser());

  const handleLogin = (user: User) => {
    setUser(user);
  };

  const handleLogout = () => {
    logout();
    setUser(null);
  };

  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={
          user ? <Navigate to={user.role === UserRole.ADMIN ? "/admin" : "/user"} /> : <Login onLogin={handleLogin} />
        } />

        <Route element={<Layout user={user} onLogout={handleLogout} />}>
          {/* Admin Routes */}
          <Route path="/admin" element={
            user?.role === UserRole.ADMIN ? <AdminDashboard /> : <Navigate to="/login" />
          } />
          <Route path="/admin/upload-pdf" element={
            user?.role === UserRole.ADMIN ? <PdfUpload /> : <Navigate to="/login" />
          } />
          <Route path="/admin/upload-users" element={
            user?.role === UserRole.ADMIN ? <UserUpload /> : <Navigate to="/login" />
          } />

          {/* User Routes */}
          <Route path="/user" element={
            user?.role === UserRole.USER ? <UserDashboard user={user} /> : <Navigate to="/login" />
          } />
        </Route>

        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </HashRouter>
  );
};

export default App;
