import React from "react";
import {
  Plus,
  FileText,
  Clock,
  Tag,
  X,
  Sparkles,
  FolderOpen,
} from "lucide-react";
import api from "../api";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../components/Toast";

function timeAgo(iso) {
  if (!iso) return "";
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function Documents() {
  const { user } = useAuth();
  const toast = useToast();
  const [docs, setDocs] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [showCreate, setShowCreate] = React.useState(false);
  const [title, setTitle] = React.useState("");
  const [body, setBody] = React.useState("");
  const [role, setRole] = React.useState("user");
  const [creating, setCreating] = React.useState(false);

  async function loadDocs() {
    try {
      const res = await api.get("/api/docs");
      setDocs(res.data);
    } catch {
      toast("Failed to load documents", "error");
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    loadDocs();
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    if (!title.trim()) return;
    setCreating(true);
    try {
      await api.post("/api/docs", { title, body, role });
      setTitle("");
      setBody("");
      setRole("user");
      setShowCreate(false);
      await loadDocs();
      toast("Document created successfully");
    } catch (err) {
      toast(err.response?.data?.error || "Failed to create", "error");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl text-ink-900">Documents</h1>
          <p className="text-sm text-ink-400 mt-1">
            {docs.length} document{docs.length !== 1 ? "s" : ""} in your portal
          </p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary">
          <Plus size={18} />
          <span className="hidden sm:inline">New Document</span>
        </button>
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="grid gap-4 sm:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="glass-card p-5 animate-pulse">
              <div className="h-4 bg-ink-200 rounded w-3/4 mb-3" />
              <div className="h-3 bg-ink-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && docs.length === 0 && (
        <div className="text-center py-20 animate-slide-up">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-ink-100 mb-4">
            <FolderOpen size={28} className="text-ink-400" />
          </div>
          <h3 className="font-display text-lg text-ink-700">No documents yet</h3>
          <p className="text-sm text-ink-400 mt-2 mb-6">Create your first document to get started</p>
          <button onClick={() => setShowCreate(true)} className="btn-primary">
            <Sparkles size={16} />
            Create Document
          </button>
        </div>
      )}

      {/* Document cards */}
      {!loading && docs.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          {docs.map((doc, i) => (
            <div
              key={doc.id}
              className="glass-card-hover p-5 animate-slide-up"
              style={{ animationDelay: `${i * 0.05}s`, animationFillMode: "both" }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-accent-50 flex items-center justify-center flex-shrink-0">
                    <FileText size={16} className="text-accent-500" />
                  </div>
                  <h3 className="font-semibold text-ink-800 truncate">{doc.title}</h3>
                </div>
                <span className={doc.role === "admin" ? "badge-admin" : "badge-user"}>
                  {doc.role}
                </span>
              </div>
              <div className="flex items-center gap-4 mt-3 ml-12 text-xs text-ink-400">
                <span className="flex items-center gap-1">
                  <Clock size={12} />
                  {timeAgo(doc.created_at)}
                </span>
                <span className="flex items-center gap-1">
                  <Tag size={12} />
                  ID #{doc.id}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-ink-950/30 backdrop-blur-sm"
            onClick={() => setShowCreate(false)}
          />
          <div className="relative glass-card w-full max-w-lg p-6 animate-scale-in shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl text-ink-900">New Document</h2>
              <button
                onClick={() => setShowCreate(false)}
                className="p-1.5 rounded-lg hover:bg-ink-100 text-ink-400 transition"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-ink-500 uppercase tracking-wider mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Document title"
                  className="input-field"
                  autoFocus
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-500 uppercase tracking-wider mb-2">
                  Body
                </label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Write your content here…"
                  rows={5}
                  className="input-field resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-500 uppercase tracking-wider mb-2">
                  Role Tag
                </label>
                <div className="flex gap-3">
                  {["user", "admin"].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 border ${
                        role === r
                          ? "bg-accent-600 text-white border-accent-600 shadow-sm"
                          : "bg-white text-ink-500 border-ink-200 hover:border-ink-300"
                      }`}
                    >
                      {r.charAt(0).toUpperCase() + r.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={creating}>
                  {creating ? "Creating…" : "Create Document"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
