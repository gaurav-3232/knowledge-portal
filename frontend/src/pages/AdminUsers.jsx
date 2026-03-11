import React from "react";
import {
  Users,
  Plus,
  Shield,
  User,
  Trash2,
  Pencil,
  X,
  Clock,
  AlertTriangle,
} from "lucide-react";
import api from "../api";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../components/Toast";

function timeAgo(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function AdminUsers() {
  const { user: me } = useAuth();
  const toast = useToast();
  const [users, setUsers] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [showCreate, setShowCreate] = React.useState(false);
  const [showDelete, setShowDelete] = React.useState(null);
  const [editingRole, setEditingRole] = React.useState(null);

  // Create form
  const [newUser, setNewUser] = React.useState("");
  const [newPass, setNewPass] = React.useState("");
  const [newRole, setNewRole] = React.useState("user");
  const [creating, setCreating] = React.useState(false);

  async function loadUsers() {
    try {
      const res = await api.get("/api/users");
      setUsers(res.data);
    } catch {
      toast("Failed to load users", "error");
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    loadUsers();
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    if (!newUser.trim() || !newPass.trim()) return;
    setCreating(true);
    try {
      await api.post("/api/users", { username: newUser, password: newPass, role: newRole });
      setNewUser("");
      setNewPass("");
      setNewRole("user");
      setShowCreate(false);
      await loadUsers();
      toast("User created successfully");
    } catch (err) {
      toast(err.response?.data?.error || "Failed to create user", "error");
    } finally {
      setCreating(false);
    }
  }

  async function handleRoleChange(userId, role) {
    try {
      await api.patch(`/api/users/${userId}`, { role });
      setEditingRole(null);
      await loadUsers();
      toast(`Role updated to ${role}`);
    } catch (err) {
      toast(err.response?.data?.error || "Failed to update role", "error");
    }
  }

  async function handleDelete(userId) {
    try {
      await api.delete(`/api/users/${userId}`);
      setShowDelete(null);
      await loadUsers();
      toast("User deleted");
    } catch (err) {
      toast(err.response?.data?.error || "Failed to delete user", "error");
    }
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl text-ink-900">User Management</h1>
          <p className="text-sm text-ink-400 mt-1">
            {users.length} user{users.length !== 1 ? "s" : ""} registered
          </p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary">
          <Plus size={18} />
          <span className="hidden sm:inline">Add User</span>
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card p-5 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-ink-200 rounded-full" />
                <div className="flex-1">
                  <div className="h-4 bg-ink-200 rounded w-1/3 mb-2" />
                  <div className="h-3 bg-ink-100 rounded w-1/4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* User list */}
      {!loading && (
        <div className="space-y-3">
          {users.map((u, i) => {
            const isMe = u.id === me?.id;
            const isAdmin = u.role === "admin";
            return (
              <div
                key={u.id}
                className="glass-card p-5 animate-slide-up"
                style={{ animationDelay: `${i * 0.05}s`, animationFillMode: "both" }}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm ${
                        isAdmin
                          ? "bg-gradient-to-br from-amber-400 to-amber-500"
                          : "bg-gradient-to-br from-accent-400 to-accent-600"
                      }`}
                    >
                      {u.username.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-ink-800 truncate">{u.username}</span>
                        {isMe && (
                          <span className="text-[10px] font-semibold text-accent-600 bg-accent-50 px-1.5 py-0.5 rounded-full">
                            YOU
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-ink-400">
                        <span className={isAdmin ? "badge-admin" : "badge-user"}>
                          {isAdmin && <Shield size={10} className="mr-1" />}
                          {u.role}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={11} />
                          {timeAgo(u.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  {!isMe && (
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {/* Role toggle */}
                      {editingRole === u.id ? (
                        <div className="flex items-center gap-1 animate-scale-in">
                          <button
                            onClick={() => handleRoleChange(u.id, "user")}
                            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                              u.role === "user"
                                ? "bg-accent-600 text-white border-accent-600"
                                : "bg-white text-ink-500 border-ink-200 hover:border-ink-300"
                            }`}
                          >
                            User
                          </button>
                          <button
                            onClick={() => handleRoleChange(u.id, "admin")}
                            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                              u.role === "admin"
                                ? "bg-amber-500 text-white border-amber-500"
                                : "bg-white text-ink-500 border-ink-200 hover:border-ink-300"
                            }`}
                          >
                            Admin
                          </button>
                          <button
                            onClick={() => setEditingRole(null)}
                            className="p-1 rounded-lg hover:bg-ink-100 text-ink-400"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={() => setEditingRole(u.id)}
                            className="btn-ghost py-1.5 px-2.5 text-xs"
                            title="Change role"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => setShowDelete(u)}
                            className="btn-ghost py-1.5 px-2.5 text-xs text-rose-400 hover:text-rose-600 hover:bg-rose-50"
                            title="Delete user"
                          >
                            <Trash2 size={14} />
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-ink-950/30 backdrop-blur-sm" onClick={() => setShowCreate(false)} />
          <div className="relative glass-card w-full max-w-md p-6 animate-scale-in shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl text-ink-900">Add User</h2>
              <button onClick={() => setShowCreate(false)} className="p-1.5 rounded-lg hover:bg-ink-100 text-ink-400 transition">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-ink-500 uppercase tracking-wider mb-2">Username</label>
                <input
                  type="text"
                  value={newUser}
                  onChange={(e) => setNewUser(e.target.value)}
                  placeholder="Enter username"
                  className="input-field"
                  autoFocus
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-ink-500 uppercase tracking-wider mb-2">Password</label>
                <input
                  type="password"
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  placeholder="Enter password"
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-ink-500 uppercase tracking-wider mb-2">Role</label>
                <div className="flex gap-3">
                  {["user", "admin"].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setNewRole(r)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
                        newRole === r
                          ? r === "admin"
                            ? "bg-amber-500 text-white border-amber-500"
                            : "bg-accent-600 text-white border-accent-600"
                          : "bg-white text-ink-500 border-ink-200 hover:border-ink-300"
                      }`}
                    >
                      {r === "admin" ? <Shield size={14} /> : <User size={14} />}
                      {r.charAt(0).toUpperCase() + r.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary" disabled={creating}>
                  {creating ? "Creating…" : "Add User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {showDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-ink-950/30 backdrop-blur-sm" onClick={() => setShowDelete(null)} />
          <div className="relative glass-card w-full max-w-sm p-6 animate-scale-in shadow-xl">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-rose-50 mb-4">
                <AlertTriangle size={24} className="text-rose-500" />
              </div>
              <h3 className="font-display text-lg text-ink-900">Delete User</h3>
              <p className="text-sm text-ink-400 mt-2">
                Are you sure you want to delete <strong className="text-ink-700">{showDelete.username}</strong>?
                This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowDelete(null)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={() => handleDelete(showDelete.id)} className="btn-danger flex-1">
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
