import React from "react";
import { Search as SearchIcon, FileText, Clock, Tag, Zap } from "lucide-react";
import api from "../api";

function timeAgo(iso) {
  if (!iso) return "";
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function SearchPage() {
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState([]);
  const [searched, setSearched] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  async function handleSearch(e) {
    e?.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await api.get("/api/search", { params: { q: query } });
      setResults(res.data);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-2xl text-ink-900">Search</h1>
        <p className="text-sm text-ink-400 mt-1">Full-text search across all documents</p>
      </div>

      {/* Search bar */}
      <form onSubmit={handleSearch} className="relative mb-8">
        <div className="relative">
          <SearchIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search documents by title or content…"
            className="input-field pl-11 pr-24"
            autoFocus
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 btn-primary py-2 px-4 text-sm"
            disabled={loading}
          >
            {loading ? "Searching…" : "Search"}
          </button>
        </div>
      </form>

      {/* Results */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card p-5 animate-pulse">
              <div className="h-4 bg-ink-200 rounded w-2/3 mb-3" />
              <div className="h-3 bg-ink-100 rounded w-1/3" />
            </div>
          ))}
        </div>
      )}

      {!loading && searched && results.length === 0 && (
        <div className="text-center py-16 animate-slide-up">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-ink-100 mb-4">
            <SearchIcon size={24} className="text-ink-400" />
          </div>
          <h3 className="font-display text-lg text-ink-600">No results found</h3>
          <p className="text-sm text-ink-400 mt-2">Try different keywords or a broader search</p>
        </div>
      )}

      {!loading && results.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4 text-sm text-ink-500">
            <Zap size={14} className="text-amber-500" />
            {results.length} result{results.length !== 1 ? "s" : ""} found
          </div>
          <div className="space-y-3">
            {results.map((doc, i) => (
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
        </div>
      )}

      {/* Idle state */}
      {!searched && !loading && (
        <div className="text-center py-16 animate-slide-up">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-accent-50 mb-4">
            <Zap size={24} className="text-accent-500" />
          </div>
          <h3 className="font-display text-lg text-ink-600">Powered by MySQL FULLTEXT</h3>
          <p className="text-sm text-ink-400 mt-2">Search titles and body content across all documents</p>
        </div>
      )}
    </div>
  );
}
