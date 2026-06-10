import { useState, useEffect } from "react";
import { Rocket, RefreshCw, Play, CheckCircle2, XCircle, Clock, Loader2, GitBranch, ChevronDown } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";

const W = "#009DE0";

const BUILD_STATUS = {
  finished:   { color: "#22C55E", bg: "#DCFCE7", label: "Success",   icon: <CheckCircle2 size={13} /> },
  failed:     { color: "#EF4444", bg: "#FEE2E2", label: "Failed",    icon: <XCircle size={13} /> },
  canceled:   { color: "#9CA3AF", bg: "#F3F4F6", label: "Cancelled", icon: <XCircle size={13} /> },
  building:   { color: "#F59E0B", bg: "#FEF3C7", label: "Building",  icon: <Loader2 size={13} className="animate-spin" /> },
  queued:     { color: "#3B82F6", bg: "#EBF5FF", label: "Queued",    icon: <Clock size={13} /> },
  preparing:  { color: "#3B82F6", bg: "#EBF5FF", label: "Preparing", icon: <Clock size={13} /> },
};

export default function CodemagicPanel() {
  const [apps, setApps] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);
  const [builds, setBuilds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [buildsLoading, setBuildsLoading] = useState(false);
  const [triggering, setTriggering] = useState(null);
  const [branch, setBranch] = useState("main");
  const [error, setError] = useState(null);
  const [showAppDropdown, setShowAppDropdown] = useState(false);

  useEffect(() => {
    loadApps();
  }, []);

  useEffect(() => {
    if (selectedApp) loadBuilds(selectedApp._id);
  }, [selectedApp]);

  const loadApps = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await base44.functions.invoke('listCodemagicApps', {});
      if (res.data.error) { setError(res.data.error); }
      else {
        setApps(res.data.apps || []);
        if (res.data.apps?.length > 0) setSelectedApp(res.data.apps[0]);
      }
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  const loadBuilds = async (appId) => {
    setBuildsLoading(true);
    try {
      const res = await base44.functions.invoke('getCodemagicBuilds', { appId });
      if (!res.data.error) setBuilds(res.data.builds || []);
    } catch (e) {}
    setBuildsLoading(false);
  };

  const triggerBuild = async (workflowId, workflowName) => {
    if (!selectedApp) return;
    setTriggering(workflowId);
    try {
      const res = await base44.functions.invoke('triggerCodemagicBuild', {
        appId: selectedApp._id,
        workflowId,
        branch
      });
      if (res.data.error) { alert(`Error: ${res.data.error}`); }
      else {
        alert(`✅ Build triggered for "${workflowName}" on branch "${branch}"!`);
        setTimeout(() => loadBuilds(selectedApp._id), 2000);
      }
    } catch (e) {
      alert(`Error: ${e.message}`);
    }
    setTriggering(null);
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 size={28} className="animate-spin" style={{ color: W }} />
    </div>
  );

  if (error) return (
    <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
      <XCircle size={24} className="text-red-500 mx-auto mb-2" />
      <p className="text-red-700 font-bold text-sm">{error}</p>
      <button onClick={loadApps} className="mt-3 text-sm font-bold px-4 py-2 rounded-xl text-white" style={{ background: W }}>Retry</button>
    </div>
  );

  const workflows = selectedApp?.workflows ? Object.entries(selectedApp.workflows) : [];

  return (
    <div className="space-y-5">
      {/* App Selector */}
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: W + "15" }}>
              <Rocket size={18} style={{ color: W }} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Codemagic CI/CD</h3>
              <p className="text-gray-400 text-xs">{apps.length} app{apps.length !== 1 ? "s" : ""} connected</p>
            </div>
          </div>
          <button onClick={loadApps} className="w-9 h-9 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center transition-colors">
            <RefreshCw size={15} className="text-gray-600" />
          </button>
        </div>

        {/* App Dropdown */}
        {apps.length > 0 && (
          <div className="relative mb-4">
            <button onClick={() => setShowAppDropdown(!showAppDropdown)}
              className="w-full flex items-center justify-between border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50 hover:bg-gray-100 transition-colors">
              <span className="font-semibold text-gray-900">{selectedApp?.appName || selectedApp?.name || "Select App"}</span>
              <ChevronDown size={16} className="text-gray-400" />
            </button>
            <AnimatePresence>
              {showAppDropdown && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                  className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-10 overflow-hidden">
                  {apps.map(app => (
                    <button key={app._id} onClick={() => { setSelectedApp(app); setShowAppDropdown(false); }}
                      className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 transition-colors flex items-center justify-between">
                      <span className="font-medium text-gray-800">{app.appName || app.name}</span>
                      {selectedApp?._id === app._id && <CheckCircle2 size={14} style={{ color: W }} />}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Branch Input */}
        <div className="flex items-center gap-2 mb-4">
          <GitBranch size={14} className="text-gray-400 flex-shrink-0" />
          <input value={branch} onChange={e => setBranch(e.target.value)} placeholder="Branch name"
            className="flex-1 border border-gray-200 focus:border-blue-400 rounded-xl px-3 py-2 text-sm outline-none transition-colors" />
        </div>

        {/* Workflows */}
        {workflows.length > 0 ? (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Workflows</p>
            {workflows.map(([wfId, wf]) => (
              <div key={wfId} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{wf.name || wfId}</p>
                  <p className="text-xs text-gray-400">{wfId}</p>
                </div>
                <button onClick={() => triggerBuild(wfId, wf.name || wfId)}
                  disabled={triggering === wfId}
                  className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl text-white transition-all disabled:opacity-60"
                  style={{ background: "linear-gradient(135deg,#10b981,#059669)", boxShadow: "0 4px 12px rgba(16,185,129,0.3)" }}>
                  {triggering === wfId ? <Loader2 size={12} className="animate-spin" /> : <Play size={12} />}
                  {triggering === wfId ? "Starting..." : "Build"}
                </button>
              </div>
            ))}
          </div>
        ) : selectedApp && (
          <p className="text-center text-gray-400 text-sm py-4">No workflows configured for this app</p>
        )}
      </div>

      {/* Recent Builds */}
      {selectedApp && (
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-gray-900 flex items-center gap-2">
              <Clock size={16} style={{ color: W }} /> Recent Builds
            </h4>
            <button onClick={() => loadBuilds(selectedApp._id)} className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center">
              <RefreshCw size={13} className="text-gray-600" />
            </button>
          </div>
          {buildsLoading ? (
            <div className="flex justify-center py-8"><Loader2 size={22} className="animate-spin" style={{ color: W }} /></div>
          ) : builds.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-8">No builds yet</p>
          ) : (
            <div className="space-y-2">
              {builds.map((build, i) => {
                const st = BUILD_STATUS[build.status] || BUILD_STATUS.queued;
                return (
                  <motion.div key={build._id || i} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                    className="flex items-center justify-between p-3 rounded-xl border border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: st.bg, color: st.color }}>
                        {st.icon}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{build.workflowName || build.workflowId || "Build"}</p>
                        <p className="text-xs text-gray-400">
                          {build.branch || "main"} · {build.createdAt ? new Date(build.createdAt).toLocaleString() : ""}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1" style={{ background: st.bg, color: st.color }}>
                      {st.icon} {st.label}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}