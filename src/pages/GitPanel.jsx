import React, { useState } from "react";
import { Github, Loader2, CheckCircle2, AlertCircle, FileCode, Upload } from "lucide-react";
import { LOGO_URL } from "@/lib/constants";

// Dynamically collect all source files at build time via Vite's import.meta.glob
const srcFiles = import.meta.glob("/src/**/*.{js,jsx,json,css}", { as: "raw", eager: true });

const extraFiles = {
  "README.md": `# TiliGo — Delivery Platform

TiliGo is a multi-sided delivery platform (Customer / Business / Courier) built with React, Tailwind CSS, and Base44 BaaS.

## Features
- Customer ordering with real-time tracking
- Business dashboard with menu management
- Courier dashboard with live GPS
- Admin panel
- Light/dark mode by device
- OpenStreetMap integration
- Browser notifications

## Tech Stack
- React 18 + Vite
- Tailwind CSS
- Base44 SDK
- react-leaflet (OpenStreetMap)
- framer-motion

## Getting Started
\`\`\`bash
npm install
npm run dev
\`\`\`
`,
  ".gitignore": `node_modules
dist
.env
.env.local
*.log
.DS_Store
`,
};

export default function GitPanel() {
  const [token, setToken] = useState("");
  const [repoName, setRepoName] = useState("tiligo");
  const [isPrivate, setIsPrivate] = useState(true);
  const [status, setStatus] = useState("idle");
  const [progress, setProgress] = useState({ done: 0, total: 0, current: "" });
  const [log, setLog] = useState([]);
  const [error, setError] = useState("");

  const addLog = (msg) => setLog(prev => [...prev, msg]);

  const getAllFiles = () => {
    const files = [];
    for (const [path, content] of Object.entries(srcFiles)) {
      files.push({ path: path.replace(/^\//, ""), content });
    }
    for (const [path, content] of Object.entries(extraFiles)) {
      files.push({ path, content });
    }
    return files;
  };

  const handlePush = async () => {
    if (!token.trim() || !repoName.trim()) {
      setError("Plotëso token-in dhe emrin e repo-s");
      return;
    }
    setError("");
    setStatus("creating");
    setLog([]);
    setProgress({ done: 0, total: 0, current: "" });

    try {
      // 1. Get user info
      addLog("🔑 Duke verifikuar token-in...");
      const userRes = await fetch("https://api.github.com/user", {
        headers: { Authorization: `Bearer ${token.trim()}`, Accept: "application/vnd.github+json" },
      });
      if (!userRes.ok) throw new Error("Token i pavlefshëm");
      const user = await userRes.json();
      addLog(`✅ Lidhur si: ${user.login}`);

      // 2. Create repo
      addLog(`📦 Duke krijuar repo: ${repoName}...`);
      const createRes = await fetch("https://api.github.com/user/repos", {
        method: "POST",
        headers: { Authorization: `Bearer ${token.trim()}`, Accept: "application/vnd.github+json" },
        body: JSON.stringify({ name: repoName.trim(), private: isPrivate, auto_init: true }),
      });
      if (createRes.status === 422) {
        addLog("ℹ️ Repo ekziston tashmë, vazhdojmë...");
      } else if (!createRes.ok) {
        throw new Error("Ndryshimi i repo-s dështoi");
      } else {
        addLog("✅ Repo u krijua!");
      }

      // 3. Push files
      const files = getAllFiles();
      setProgress({ done: 0, total: files.length, current: "" });
      addLog(`📂 ${files.length} skedarë për ngarkim...`);
      setStatus("pushing");

      let success = 0;
      let failed = 0;
      for (let i = 0; i < files.length; i++) {
        const f = files[i];
        setProgress({ done: i, total: files.length, current: f.path });
        try {
          const res = await fetch(`https://api.github.com/repos/${user.login}/${repoName.trim()}/contents/${f.path}`, {
            method: "PUT",
            headers: { Authorization: `Bearer ${token.trim()}`, Accept: "application/vnd.github+json" },
            body: JSON.stringify({
              message: `Add ${f.path}`,
              content: btoa(unescape(encodeURIComponent(f.content))),
            }),
          });
          if (res.ok || res.status === 422) {
            success++;
          } else {
            failed++;
          }
        } catch {
          failed++;
        }
      }

      setProgress({ done: files.length, total: files.length, current: "" });
      addLog(`✅ ${success} skedarë u ngarkuan!`);
      if (failed > 0) addLog(`⚠️ ${failed} skedarë dështuan`);
      addLog(`🔗 https://github.com/${user.login}/${repoName.trim()}`);
      setStatus("done");
    } catch (e) {
      setError(e.message || "Gabim i panjohur");
      setStatus("error");
    }
  };

  const fileCount = Object.keys(srcFiles).length + Object.keys(extraFiles).length;
  const pct = progress.total > 0 ? Math.round((progress.done / progress.total) * 100) : 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Github size={28} className="text-primary" />
          <div>
            <h1 className="font-heading font-bold text-xl text-foreground">Git Export Panel</h1>
            <p className="text-xs text-muted-foreground">Eksporto të gjithë kodin në GitHub</p>
          </div>
        </div>

        {status === "idle" || status === "error" ? (
          <div className="glass rounded-2xl p-6 space-y-4">
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">GitHub Personal Access Token</label>
              <input type="password" value={token} onChange={e => setToken(e.target.value)}
                placeholder="ghp_..." className="w-full bg-muted/50 rounded-xl px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground font-mono" />
              <p className="text-xs text-muted-foreground mt-1">Krijo në: Settings → Developer settings → Personal access tokens → Tokens (classic)</p>
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Emri i Repo-s</label>
              <input value={repoName} onChange={e => setRepoName(e.target.value)}
                placeholder="tiligo" className="w-full bg-muted/50 rounded-xl px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground" />
            </div>
            <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
              <input type="checkbox" checked={isPrivate} onChange={e => setIsPrivate(e.target.checked)} className="accent-primary" />
              Repo private
            </label>
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 rounded-xl p-3">
              <FileCode size={16} className="text-primary shrink-0" />
              <span>{fileCount} skedarë do të ngarkohen (frontend, komponentë, entitete, lib)</span>
            </div>
            {error && <p className="text-sm text-destructive flex items-center gap-2"><AlertCircle size={16} /> {error}</p>}
            <button onClick={handlePush} className="gradient-btn w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2">
              <Upload size={18} /> Gjenero & Ngarko në GitHub
            </button>
          </div>
        ) : (
          <div className="glass rounded-2xl p-6 space-y-4">
            {status === "pushing" && (
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Duke ngarkuar... {pct}%</span>
                  <span className="font-mono text-primary">{progress.done}/{progress.total}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full gradient-btn transition-all duration-300" style={{ width: `${pct}%` }} />
                </div>
                <p className="text-xs text-muted-foreground mt-2 font-mono truncate">{progress.current}</p>
              </div>
            )}
            {status === "done" && (
              <div className="text-center py-4">
                <CheckCircle2 size={48} className="text-primary mx-auto mb-3" />
                <p className="font-semibold text-foreground">Eksporti përfundoi!</p>
              </div>
            )}
            <div className="bg-muted/30 rounded-xl p-4 max-h-64 overflow-y-auto space-y-1">
              {log.map((l, i) => <p key={i} className="text-xs font-mono text-muted-foreground">{l}</p>)}
            </div>
            {status === "done" && (
              <button onClick={() => setStatus("idle")} className="w-full py-3 rounded-xl bg-muted text-muted-foreground text-sm font-semibold">
                Kthehu
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}