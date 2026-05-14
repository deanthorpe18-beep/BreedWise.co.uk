"use client";

import { useState } from "react";
import { Download, Upload, RefreshCw, Database, Trash2, Settings } from "lucide-react";

export default function AdminTools() {
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);

  const exportData = () => {
    setExporting(true);
    const data = {
      claims: JSON.parse(localStorage.getItem("breedwise-claims") || "[]"),
      saved: JSON.parse(localStorage.getItem("breedwise-saved") || "[]"),
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `breedwise-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setExporting(false);
  };

  const importData = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setImporting(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (data.claims) localStorage.setItem("breedwise-claims", JSON.stringify(data.claims));
        if (data.saved) localStorage.setItem("breedwise-saved", JSON.stringify(data.saved));
        alert("Data imported successfully!");
        window.location.reload();
      } catch (error) {
        alert("Error importing data: " + error.message);
      }
      setImporting(false);
    };
    reader.readAsText(file);
  };

  const clearAllData = () => {
    if (confirm("Are you sure you want to clear all local data? This cannot be undone.")) {
      localStorage.removeItem("breedwise-claims");
      localStorage.removeItem("breedwise-saved");
      localStorage.removeItem("admin-authenticated");
      alert("All data cleared!");
      window.location.reload();
    }
  };

  const resetClaims = () => {
    if (confirm("Reset all claims to pending status?")) {
      const claims = JSON.parse(localStorage.getItem("breedwise-claims") || "[]");
      const resetClaims = claims.map(claim => ({ ...claim, status: "pending" }));
      localStorage.setItem("breedwise-claims", JSON.stringify(resetClaims));
      alert("Claims reset!");
      window.location.reload();
    }
  };

  const tools = [
    {
      title: "Export Data",
      description: "Download all claims and saved breeders data",
      icon: Download,
      action: exportData,
      loading: exporting,
      color: "text-blue-500"
    },
    {
      title: "Import Data",
      description: "Upload and restore data from backup file",
      icon: Upload,
      action: () => document.getElementById("import-file").click(),
      loading: importing,
      color: "text-green-500"
    },
    {
      title: "Reset Claims",
      description: "Set all claims back to pending status",
      icon: RefreshCw,
      action: resetClaims,
      color: "text-orange-500"
    },
    {
      title: "Clear All Data",
      description: "Remove all local storage data (destructive)",
      icon: Trash2,
      action: clearAllData,
      color: "text-red-500",
      danger: true
    }
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-slate-900">Management Tools</h2>

      <div className="grid gap-4 sm:grid-cols-2">
        {tools.map((tool, index) => (
          <div key={index} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className={`rounded-2xl bg-slate-100 p-3 ${tool.color}`}>
                <tool.icon className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900">{tool.title}</h3>
                <p className="text-sm text-slate-500 mt-1">{tool.description}</p>
                <button
                  onClick={tool.action}
                  disabled={tool.loading}
                  className={`mt-3 rounded-3xl px-4 py-2 text-sm font-semibold transition ${
                    tool.danger
                      ? "bg-red-500 text-white hover:bg-red-600"
                      : "bg-[#00BFA5] text-white hover:bg-[#00a98e]"
                  } ${tool.loading ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {tool.loading ? "Processing..." : "Execute"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <input
        id="import-file"
        type="file"
        accept=".json"
        onChange={importData}
        className="hidden"
      />

      <div className="rounded-3xl border border-slate-200 bg-[#F1F4F6] p-6">
        <h3 className="font-semibold text-slate-900 mb-2">System Information</h3>
        <div className="space-y-2 text-sm text-slate-600">
          <p><strong>Local Storage Used:</strong> {JSON.stringify(localStorage).length} characters</p>
          <p><strong>Claims Stored:</strong> {JSON.parse(localStorage.getItem("breedwise-claims") || "[]").length}</p>
          <p><strong>Saved Breeders:</strong> {JSON.parse(localStorage.getItem("breedwise-saved") || "[]").length}</p>
          <p><strong>Last Backup:</strong> Never (create one above)</p>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="font-semibold text-slate-900 mb-4">Quick Actions</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <button
            onClick={() => window.open("/", "_blank")}
            className="rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            View Public Site
          </button>
          <button
            onClick={() => window.location.reload()}
            className="rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Refresh Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}