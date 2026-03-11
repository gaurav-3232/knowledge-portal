import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import { ToastProvider } from "./components/Toast";
import Sidebar from "./components/Sidebar";
import Login from "./pages/Login";
import Documents from "./pages/Documents";
import SearchPage from "./pages/SearchPage";
import AdminUsers from "./pages/AdminUsers";

function ProtectedLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ink-50">
        <div className="flex flex-col items-center gap-3 animate-fade-in">
          <svg className="animate-spin h-8 w-8 text-accent-500" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-sm text-ink-400 font-medium">Loading…</span>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen flex bg-ink-50">
      <Sidebar />
      <main className="flex-1 p-6 lg:p-10 overflow-auto">
        <div className="max-w-5xl mx-auto">
          <Routes>
            <Route path="/" element={<Documents />} />
            <Route path="/search" element={<SearchPage />} />
            <Route
              path="/admin/users"
              element={user.role === "admin" ? <AdminUsers /> : <Navigate to="/" replace />}
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

function LoginGuard() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/" replace />;
  return <Login />;
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Routes>
          <Route path="/login" element={<LoginGuard />} />
          <Route path="/*" element={<ProtectedLayout />} />
        </Routes>
      </ToastProvider>
    </AuthProvider>
  );
}
