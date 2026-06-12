import { useState, useEffect } from "react";
import {
  Rocket, RefreshCw, Play, CheckCircle2, XCircle, Clock,
  Loader2, GitBranch, ChevronDown, ExternalLink, AlertCircle, Info
} from "lucide-react";
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
  timeout:    { color: "#EF4444", bg: "#FEE2E2", label: "Timeout",   icon: <XCircle size={13} /> },
};

// Known yaml-based workflows in TiliGo codemagic.yaml
const YAML_WORKFLOWS = [
  { id: "ios-app-store", name: "iOS App Store", emoji: "🍎", platform: "iOS" },
  { id: "android-play-store", name: "Android Play Store", emoji: "🤖", platform: "Android" },
  { id: "ios-app-store-testflight", name: "TestFlight (iOS)", emoji: "✈️", platform: "iOS" },
];

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

  useEffect(() => { loadApps(); }, []);
  useEffect(() => { if (selectedApp) loadBuilds(selectedApp._id); }, [selectedApp]);

  const loadApps = async () => {
    setLoading(true); setError(null);
    try {
      const res = await base44.functions.invoke('listCodemagicApps', {});
      if (res.data.error) { setError(res.data.error); }
      else {
        const appList = res.data.apps || [];
        setApps(appList);
        if (appList.length > 0) setSelectedApp(appList[0]);
      }
    } catch (e) { setError(e.message); }
    setLoading(false);
  };

  const loadBuilds = async (appId) => {
    setBuildsLoading(true);
    try {
      const res = await base44.functions.invoke('getCodemagicBuilds', { appId });
      if (!res.data.error) setBuilds(res.data.builds || []);
    } catch {}
    setBuildsLoading(false);
  };

  const triggerBuild = async (fileWorkflowId, workflowName) => {
    if (!selectedApp) return;
    setTriggering(fileWorkflowId);
    try {
      const res = await base44.functions.invoke('triggerCodemagicBuild', {
        appId: selectedApp._id,
        fileWorkflowId,
        branch
      });
      if (res.data.error) {
        alert(`❌ Error: ${res.data.error}`);
      } else {
        alert(`✅ Build triggered!\n\nWorkflow: ${workflowName}\nBranch: ${branch}\n\nCheck the builds list below.`);
        setTimeout(() => loadBuilds(selectedApp._id), 2500);
      }
    } catch (e) { alert(`Error: ${e.message}`); }
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
      <p className="text-red-700 font-bold text-sm mb-3">{error}</p>
      <button onClick={loadApps} className="text-sm font-bold px-4 py-2 rounded-xl text-white" style={{ background: W }}>Retry</button>
    </div>
  );

  return (
    <div className="space-y-5">

      {/* Setup Info Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex gap-3">
        <Info size={18} className="text-blue-500 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800">
          <p className="font-bold mb-1">iOS App Store Publishing Requirements</p>
          <ol className="text-xs space-y-1 list-decimal ml-4 text-blue-700">
            <li>Upload your <strong>.p12 certificate</strong> + <strong>.mobileprovision</strong> to Codemagic → Team Settings → Code Signing Identities</li>
            <li>Add <strong>App Store Connect API Key</strong> to Codemagic → Team Integrations</li>
            <li>Make sure bundle ID is <strong>com.tiligo.app</strong> (not com.yourcompany)</li>
            <li>Create the app in <strong>App Store Connect</strong> with matching bundle ID</li>
          </ol>
        </div>
      </div>

      {/* App Selector + Branch */}
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: W + "15" }}>
              <Rocket size={18} style={{ color: W }} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Codemagic CI/CD</h3>
              <p className="text-gray-400 text-xs">{apps.length} app{apps.length !== 1 ? "s" : ""} · {selectedApp?.repository?.htmlUrl ? <a href={selectedApp.repository.htmlUrl} target="_blank" rel="noopener noreferrer" className="underline">{selectedApp.repository.owner?.name}/{selectedApp.appName}</a> : selectedApp?.appName}</p>
            </div>
          </div>
          <button onClick={loadApps} className="w-9 h-9 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center transition-colors">
            <RefreshCw size={15} className="text-gray-600" />
          </button>
        </div>

        {/* App selector */}
        {apps.length > 1 && (
          <div className="relative mb-4">
            <button onClick={() => setShowAppDropdown(!showAppDropdown)}
              className="w-full flex items-center justify-between border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50 hover:bg-gray-100 transition-colors">
              <span className="font-semibold text-gray-900">{selectedApp?.appName || "Select App"}</span>
              <ChevronDown size={16} className="text-gray-400" />
            </button>
            <AnimatePresence>
              {showAppDropdown && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                  className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-10 overflow-hidden">
                  {apps.map(app => (
                    <button key={app._id} onClick={() => { setSelectedApp(app); setShowAppDropdown(false); }}
                      className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 transition-colors flex items-center justify-between">
                      <span className="font-medium text-gray-800">{app.appName}</span>
                      {selectedApp?._id === app._id && <CheckCircle2 size={14} style={{ color: W }} />}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Branch */}
        <div className="flex items-center gap-2 mb-5">
          <GitBranch size={14} className="text-gray-400 flex-shrink-0" />
          <input value={branch} onChange={e => setBranch(e.target.value)} placeholder="Branch name"
            className="flex-1 border border-gray-200 focus:border-blue-400 rounded-xl px-3 py-2 text-sm outline-none transition-colors" />
          <div className="flex gap-1.5">
            {["main", "develop"].map(b => (
              <button key={b} onClick={() => setBranch(b)}
                className="text-xs px-2.5 py-1 rounded-lg font-semibold transition-all"
                style={branch === b ? { background: W, color: "#fff" } : { background: "#F3F4F6", color: "#6B7280" }}>
                {b}
              </button>
            ))}
          </div>
        </div>

        {/* Yaml Workflows */}
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Workflows (codemagic.yaml)</p>
        <div className="space-y-2">
          {YAML_WORKFLOWS.map(wf => (
            <div key={wf.id} className="flex items-center justify-between p-3.5 rounded-2xl border border-gray-100 bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{wf.emoji}</span>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{wf.name}</p>
                  <p className="text-xs text-gray-400 font-mono">{wf.id}</p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => triggerBuild(wf.id, wf.name)}
                disabled={!!triggering}
                className="flex items-center gap-1.5 text-xs font-black px-4 py-2.5 rounded-xl text-white transition-all disabled:opacity-50"
                style={{ background: triggering === wf.id ? "#6B7280" : "linear-gradient(135deg,#10b981,#059669)", boxShadow: "0 4px 12px rgba(16,185,129,0.3)" }}>
                {triggering === wf.id ? <Loader2 size={12} className="animate-spin" /> : <Play size={12} />}
                {triggering === wf.id ? "Starting..." : "Trigger"}
              </motion.button>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Builds */}
      {selectedApp && (
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-gray-900 flex items-center gap-2">
              <Clock size={16} style={{ color: W }} /> Recent Builds
              {builds.length > 0 && <span className="text-xs text-gray-400 font-normal">({builds.length})</span>}
            </h4>
            <button onClick={() => loadBuilds(selectedApp._id)} className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors">
              <RefreshCw size={13} className="text-gray-600" />
            </button>
          </div>
          {buildsLoading ? (
            <div className="flex justify-center py-8"><Loader2 size={22} className="animate-spin" style={{ color: W }} /></div>
          ) : builds.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-8">No builds yet — trigger one above 🚀</p>
          ) : (
            <div className="space-y-2">
              {builds.map((build, i) => {
                const st = BUILD_STATUS[build.status] || { color: "#9CA3AF", bg: "#F3F4F6", label: build.status, icon: <Clock size={13}/> };
                return (
                  <motion.div key={build._id || i} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                    className="flex items-start gap-3 p-3 rounded-xl border border-gray-100">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: st.bg, color: st.color }}>
                      {st.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-gray-900 text-sm">{build.workflowName}</p>
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1" style={{ background: st.bg, color: st.color }}>
                          {st.label}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        🌿 {build.branch || "main"}
                        {build.commit?.message && <> · {build.commit.message.slice(0, 50)}</>}
                        {build.commit?.hash && <span className="font-mono ml-1 opacity-60"> {build.commit.hash}</span>}
                      </p>
                      {build.message && (
                        <p className="text-xs text-red-500 mt-1 line-clamp-2">⚠️ {build.message}</p>
                      )}
                      {build.createdAt && (
                        <p className="text-[10px] text-gray-300 mt-0.5">{new Date(build.createdAt).toLocaleString()}</p>
                      )}
                      {build.artefacts?.length > 0 && (
                        <div className="flex gap-2 mt-1.5 flex-wrap">
                          {build.artefacts.map((a, j) => (
                            <a key={j} href={a.url} target="_blank" rel="noopener noreferrer"
                              className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg"
                              style={{ background: "#EBF5FF", color: W }}>
                              <ExternalLink size={9} /> {a.name}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 flex-shrink-0">#{build.index}</span>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Codemagic.yaml Guide */}
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5">
        <p className="font-bold text-gray-800 text-sm mb-3 flex items-center gap-2">
          <AlertCircle size={15} className="text-amber-500" />
          Fix the iOS build — required steps
        </p>
        <div className="space-y-2 text-xs text-gray-600">
          <div className="bg-white rounded-xl p-3 border border-gray-100">
            <p className="font-bold text-gray-800 mb-1">1. Fix bundle ID in codemagic.yaml</p>
            <code className="text-red-500 block">bundle_identifier: com.yourcompany.tiligo  ← WRONG</code>
            <code className="text-green-600 block">bundle_identifier: com.tiligo.app  ← Change to this</code>
          </div>
          <div className="bg-white rounded-xl p-3 border border-gray-100">
            <p className="font-bold text-gray-800 mb-1">2. Upload to Codemagic Team Settings</p>
            <p>Go to <strong>codemagic.io → Team → Code Signing Identities</strong> and upload:</p>
            <ul className="list-disc ml-4 mt-1 space-y-0.5">
              <li>Distribution certificate (.p12)</li>
              <li>App Store provisioning profile (.mobileprovision)</li>
            </ul>
          </div>
          <div className="bg-white rounded-xl p-3 border border-gray-100">
            <p className="font-bold text-gray-800 mb-1">3. Add App Store Connect API Key</p>
            <p>Go to <strong>codemagic.io → Team → Integrations → App Store Connect</strong> and add your .p8 key from App Store Connect → Users & Access → API Keys.</p>
          </div>
          <div className="bg-white rounded-xl p-3 border border-gray-100">
            <p className="font-bold text-gray-800 mb-1">4. Create app in App Store Connect</p>
            <p>Go to <a href="https://appstoreconnect.apple.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">appstoreconnect.apple.com</a> → My Apps → + New App with bundle ID <strong>com.tiligo.app</strong></p>
          </div>
        </div>
      </div>
    </div>
  );
}