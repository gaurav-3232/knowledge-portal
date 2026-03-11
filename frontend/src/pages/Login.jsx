import React from "react";
import { BookOpen, ArrowRight, AlertCircle } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

export default function Login() {
  const { login } = useAuth();
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [err, setErr] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  async function submit(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      await login(username, password);
    } catch (e) {
      setErr(e.response?.data?.error || e.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 bg-gradient-to-br from-ink-50 via-accent-50/30 to-ink-50" />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent-200/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent-300/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />

      {/* Decorative grid */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
          backgroundSize: '32px 32px',
        }}
      />

      <div className="relative w-full max-w-md animate-fade-in">
        {/* Logo section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent-600 shadow-xl shadow-accent-600/30 mb-5">
            <BookOpen size={28} className="text-white" />
          </div>
          <h1 className="font-display text-3xl text-ink-900">Knowledge Portal</h1>
          <p className="mt-2 text-ink-400 text-sm">Sign in to access your documents</p>
        </div>

        {/* Login card */}
        <div className="glass-card p-8 animate-slide-up">
          <form onSubmit={submit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-ink-500 uppercase tracking-wider mb-2">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="input-field"
                autoFocus
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink-500 uppercase tracking-wider mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="input-field"
                required
              />
            </div>

            {err && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 text-rose-600 text-sm border border-rose-200/50 animate-scale-in">
                <AlertCircle size={16} />
                {err}
              </div>
            )}

            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in…
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Sign In
                  <ArrowRight size={16} />
                </span>
              )}
            </button>
          </form>
        </div>

        {/* Footer hint */}
        <p className="text-center mt-6 text-xs text-ink-400">
          Default credentials:&nbsp;
          <code className="font-mono text-accent-600 bg-accent-50 px-1.5 py-0.5 rounded">admin</code>
          &nbsp;/&nbsp;
          <code className="font-mono text-accent-600 bg-accent-50 px-1.5 py-0.5 rounded">admin123</code>
        </p>
      </div>
    </div>
  );
}
