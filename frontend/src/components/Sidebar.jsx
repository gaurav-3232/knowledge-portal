import React from "react";
import { NavLink } from "react-router-dom";
import {
  FileText,
  Search,
  Users,
  LogOut,
  BookOpen,
  Shield,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";

const navItems = [
  { to: "/", icon: FileText, label: "Documents", roles: ["user", "admin"] },
  { to: "/search", icon: Search, label: "Search", roles: ["user", "admin"] },
  { to: "/admin/users", icon: Users, label: "Users", roles: ["admin"] },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const filteredNav = navItems.filter((n) => n.roles.includes(user?.role));

  const initials = (user?.username || "U").slice(0, 2).toUpperCase();

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 pt-8 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent-600 flex items-center justify-center shadow-md shadow-accent-600/30">
            <BookOpen size={20} className="text-white" />
          </div>
          <div>
            <h1 className="font-display text-lg text-ink-900 leading-tight">Knowledge</h1>
            <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-ink-400">Portal</p>
          </div>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 space-y-1">
        {filteredNav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                isActive
                  ? "bg-accent-600 text-white shadow-sm shadow-accent-600/20"
                  : "text-ink-500 hover:bg-ink-100 hover:text-ink-800"
              }`
            }
          >
            <item.icon size={18} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* User footer */}
      <div className="px-3 pb-6 mt-auto">
        <div className="glass-card p-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent-400 to-accent-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-ink-800 truncate">{user?.username}</p>
              <div className="flex items-center gap-1 mt-0.5">
                {user?.role === "admin" && <Shield size={10} className="text-amber-500" />}
                <span className="text-[11px] text-ink-400 uppercase tracking-wide">{user?.role}</span>
              </div>
            </div>
            <button
              onClick={logout}
              className="p-2 rounded-lg text-ink-400 hover:bg-rose-50 hover:text-rose-500 transition-all duration-200"
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-xl bg-white shadow-md border border-ink-200"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-30"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-40
          w-64 bg-white/70 backdrop-blur-xl border-r border-ink-200/60
          transform transition-transform duration-300 ease-out
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
