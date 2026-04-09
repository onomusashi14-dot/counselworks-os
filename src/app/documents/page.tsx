"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/layout/app-shell";
import { mockDocuments } from "@/lib/mock-data";
import { Document } from "@/types";
import { Search, Upload, FileText, Download } from "lucide-react";

const categories = ["All", "Pleading", "Discovery", "Medical", "Correspondence", "Court Order", "Evidence"];

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    setDocuments(mockDocuments);
  }, []);

  const filtered = documents.filter((d) => {
    const matchesSearch =
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.category.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "All" || d.category.toLowerCase() === filter.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  const categoryStyle = (cat: string): string => {
    const styles: Record<string, string> = {
      pleading: "text-blue-400",
      discovery: "text-amber-400",
      medical: "text-emerald-400",
      correspondence: "text-purple-400",
      "court order": "text-red-400",
      evidence: "text-teal-400",
    };
    return styles[cat.toLowerCase()] || "text-slate-400";
  };

  return (
    <AppShell>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Documents</h1>
          <p className="text-sm text-slate-400 mt-1">{filtered.length} documents</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-gold hover:bg-gold-400 text-navy-900 text-sm font-semibold transition-colors">
          <Upload size={16} strokeWidth={2} />
          Upload
        </button>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search documents..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-navy-800 border border-navy-500 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-gold/50 transition-colors"
          />
        </div>
        <div className="flex gap-1">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                filter === c
                  ? "bg-gold/15 text-gold border border-gold/30"
                  : "text-slate-400 hover:text-white border border-transparent hover:border-navy-400"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-navy-800 border border-navy-500 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-navy-500">
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Document</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Category</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Case</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Uploaded By</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Date</th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-navy-600/50">
            {filtered.map((doc) => (
              <tr key={doc.id} className="hover:bg-navy-700/30 transition-colors">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <FileText size={16} className="text-slate-500 flex-shrink-0" />
                    <span className="text-sm font-medium text-white">{doc.name}</span>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <span className={`text-sm font-medium ${categoryStyle(doc.category)}`}>{doc.category}</span>
                </td>
                <td className="px-5 py-4 text-sm text-slate-400">{doc.caseName || "—"}</td>
                <td className="px-5 py-4 text-sm text-slate-300">{doc.uploadedBy}</td>
                <td className="px-5 py-4 text-sm text-slate-400">{new Date(doc.uploadedAt).toLocaleDateString()}</td>
                <td className="px-5 py-4 text-right">
                  <button className="p-1.5 text-slate-500 hover:text-gold transition-colors" title="Download">
                    <Download size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="px-5 py-12 text-center text-slate-500 text-sm">No documents found.</div>
        )}
      </div>
    </AppShell>
  );
}
