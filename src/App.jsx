import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Layouts
import Layout from './components/Layout';
import AdminLayout from './components/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Public & Player Pages
import Home from './pages/Home';
import Tournaments from './pages/Tournaments';
import TournamentDetail from './pages/TournamentDetail';
import MyMatches from './pages/MyMatches';
import Wallet from './pages/Wallet';
import Leaderboard from './pages/Leaderboard';
import Profile from './pages/Profile';
import Notifications from './pages/Notifications';
import Login from './pages/Login';
import Signup from './pages/Signup';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import CreateTournament from './pages/admin/CreateTournament';
import ManageTournaments from './pages/admin/ManageTournaments';
import ManageUsers from './pages/admin/ManageUsers';
import ManagePayments from './pages/admin/ManagePayments';

function App() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#121212',
            color: '#ffffff',
            border: '1px solid rgba(255, 45, 45, 0.4)',
            boxShadow: '0 0 15px rgba(255, 45, 45, 0.25)',
            fontFamily: 'Rajdhani, sans-serif',
            fontSize: '14px',
            fontWeight: 600,
          },
          success: {
            iconTheme: {
              primary: '#ff2d2d',
              secondary: '#ffffff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#ffffff',
            },
          },
        }}
      />

      <Routes>
        {/* Main App with TopBar and BottomNav */}
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/tournaments" element={<Tournaments />} />
          <Route path="/tournaments/:id" element={<TournamentDetail />} />
          <Route path="/leaderboard" element={<Leaderboard />} />

          {/* Protected Player Routes */}
          <Route
            path="/my-matches"
            element={
              <ProtectedRoute>
                <MyMatches />
              </ProtectedRoute>
            }
          />
          <Route
            path="/wallet"
            element={
              <ProtectedRoute>
                <Wallet />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <Notifications />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Authentication Routes (Standalone) */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Admin Management Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requireAdmin={true}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="create-tournament" element={<CreateTournament />} />
          <Route path="tournaments" element={<ManageTournaments />} />
          <Route path="users" element={<ManageUsers />} />
          <Route path="payments" element={<ManagePayments />} />
        </Route>

        {/* Catch-all redirect to Home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
