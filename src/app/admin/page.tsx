"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { User } from "@supabase/supabase-js";
import { mockDb, Category, Tool } from "@/data/mockDb";
import { 
  ShieldAlert, ShieldCheck, Terminal, UploadCloud, CheckCircle2, 
  Play, AlertCircle, Trash2, ArrowLeft, LogOut, Loader2 
} from "lucide-react";
import Link from "next/link";

interface ImportLog {
  type: "success" | "warning" | "error" | "info";
  message: string;
}

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [pendingTools, setPendingTools] = useState<Tool[]>([]);
  const [loadingPending, setLoadingPending] = useState(false);
  
  // CSV Import State
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importLogs, setImportLogs] = useState<ImportLog[]>([]);
  const [successCount, setSuccessCount] = useState(0);
  const [skippedCount, setSkippedCount] = useState(0);
  const [errorCount, setErrorCount] = useState(0);

  const [dbStats, setDbStats] = useState({
    totalTools: 0,
    totalModels: 0,
    totalApis: 0,
  });
  const [loadingStats, setLoadingStats] = useState(false);

  const router = useRouter();
  const ADMIN_EMAIL = "subhamkr11012004@gmail.com";

  // Auth setup
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoadingSession(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoadingSession(false);
    });

    // Fetch categories for mapping
    mockDb.getCategories().then(setCategories);

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Fetch pending review tools and stats when authenticated
  useEffect(() => {
    if (user && user.email === ADMIN_EMAIL) {
      loadPendingTools();
      loadStats();
    }
  }, [user]);

  const loadPendingTools = async () => {
    if (!user || user.email !== ADMIN_EMAIL) {
      console.error("Unauthorized access to pending tools");
      return;
    }
    setLoadingPending(true);
    const pending = await mockDb.getPendingTools();
    setPendingTools(pending);
    setLoadingPending(false);
  };

  const loadStats = async () => {
    if (!user || user.email !== ADMIN_EMAIL) {
      console.error("Unauthorized access to database statistics");
      return;
    }
    try {
      setLoadingStats(true);
      const tools = await mockDb.getTools();
      
      const totalTools = tools.length;
      
      const totalModels = tools.filter(tool => {
        const catSlug = tool.categories?.slug || "";
        const tagsLower = tool.tags.map(t => t.toLowerCase());
        return catSlug === "models" || tagsLower.includes("model") || tagsLower.includes("llm") || tagsLower.includes("nim");
      }).length;
      
      const totalApis = tools.filter(tool => {
        const catSlug = tool.categories?.slug || "";
        const tagsLower = tool.tags.map(t => t.toLowerCase());
        return catSlug === "api-tools" || tagsLower.includes("api") || tagsLower.includes("inference") || tagsLower.includes("sdk");
      }).length;

      setDbStats({
        totalTools,
        totalModels,
        totalApis
      });
    } catch (err) {
      console.error("Error loading stats:", err);
    } finally {
      setLoadingStats(false);
    }
  };

  const handleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: typeof window !== "undefined" ? window.location.origin + "/admin" : undefined,
        },
      });
      if (error) throw error;
    } catch (err) {
      console.error("Auth error:", (err as Error).message);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  // CSV parsing function
  const parseCSVLine = (text: string): string[][] => {
    const lines: string[][] = [];
    let row: string[] = [""];
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      const next = text[i + 1];

      if (inQuotes) {
        if (c === '"') {
          if (next === '"') {
            row[row.length - 1] += '"';
            i++; // skip the double quote escape
          } else {
            inQuotes = false;
          }
        } else {
          row[row.length - 1] += c;
        }
      } else {
        if (c === '"') {
          inQuotes = true;
        } else if (c === ",") {
          row.push("");
        } else if (c === "\r" || c === "\n") {
          if (c === "\r" && next === "\n") {
            i++;
          }
          lines.push(row);
          row = [""];
        } else {
          row[row.length - 1] += c;
        }
      }
    }
    if (row.length > 1 || row[0] !== "") {
      lines.push(row);
    }
    return lines;
  };

  const handleImportCSV = async () => {
    if (!user || user.email !== ADMIN_EMAIL) {
      alert("Unauthorized access");
      return;
    }
    if (!csvFile) return;

    setImporting(true);
    setImportProgress(0);
    setImportLogs([{ type: "info", message: "Starting CSV parser engine..." }]);
    setSuccessCount(0);
    setSkippedCount(0);
    setErrorCount(0);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      if (!text) {
        setImportLogs(prev => [...prev, { type: "error", message: "File is empty or corrupted" }]);
        setImporting(false);
        return;
      }

      const rows = parseCSVLine(text);
      if (rows.length < 2) {
        setImportLogs(prev => [...prev, { type: "error", message: "CSV must contain a header row and at least one data row" }]);
        setImporting(false);
        return;
      }

      const headers = rows[0].map(h => h.trim().toLowerCase());
      const nameIdx = headers.indexOf("name");
      const urlIdx = headers.indexOf("url");
      const descIdx = headers.indexOf("description") !== -1 ? headers.indexOf("description") : headers.indexOf("short_description");
      const catIdx = headers.indexOf("category");
      const priceIdx = headers.indexOf("pricing_model") !== -1 ? headers.indexOf("pricing_model") : headers.indexOf("pricing");
      const tagsIdx = headers.indexOf("tags");

      if (nameIdx === -1 || urlIdx === -1 || descIdx === -1) {
        setImportLogs(prev => [
          ...prev, 
          { type: "error", message: "Missing required headers. Ensure 'name', 'url', and 'description' columns exist." }
        ]);
        setImporting(false);
        return;
      }

      setImportLogs(prev => [...prev, { type: "info", message: `Parsed headers. Found ${rows.length - 1} tools to process.` }]);

      let success = 0;
      let skipped = 0;
      let error = 0;

      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (row.length < 3 || !row[nameIdx]?.trim()) {
          continue; // Skip empty rows
        }

        const name = row[nameIdx].trim();
        const url = row[urlIdx].trim();
        const description = row[descIdx].trim();
        const categoryVal = catIdx !== -1 ? row[catIdx]?.trim() : "";
        const pricingVal = priceIdx !== -1 ? row[priceIdx]?.trim() : "Free";
        const tagsVal = tagsIdx !== -1 ? row[tagsIdx]?.trim() : "";

        // Verify duplicate
        const isDuplicate = await mockDb.checkDuplicate(name, url);
        if (isDuplicate) {
          skipped++;
          setSkippedCount(skipped);
          setImportLogs(prev => [
            ...prev,
            { type: "warning", message: `[skip] Duplicate found: "${name}" (${url})` }
          ]);
          setImportProgress(Math.round((i / (rows.length - 1)) * 100));
          continue;
        }

        // Map category
        let categoryId = categories[0]?.id || "550e8400-e29b-41d4-a716-446655440000";
        if (categoryVal) {
          const matchedCat = categories.find(
            c => c.slug.toLowerCase() === categoryVal.toLowerCase() || 
                 c.name.toLowerCase() === categoryVal.toLowerCase()
          );
          if (matchedCat) {
            categoryId = matchedCat.id;
          }
        }

        // Parse tags
        const tags = tagsVal
          ? tagsVal.split(",").map(t => t.trim().toLowerCase()).filter(t => t.length > 0)
          : [];

        // Map pricing model to strict enum
        let pricingModel: 'free' | 'freemium' | 'paid' | 'unknown' = 'unknown';
        const cleanPrice = pricingVal.toLowerCase().trim();
        if (cleanPrice === 'free') {
          pricingModel = 'free';
        } else if (cleanPrice === 'freemium') {
          pricingModel = 'freemium';
        } else if (cleanPrice === 'paid') {
          pricingModel = 'paid';
        }

        // Insert
        try {
          const result = await mockDb.adminInsertTool({
            name,
            url,
            short_description: description,
            category_id: categoryId,
            pricing_model: pricingModel,
            tags
          });

          if (result) {
            success++;
            setSuccessCount(success);
            setImportLogs(prev => [
              ...prev,
              { type: "success", message: `[add] Imported "${name}" -> Category ID: ${categoryId}` }
            ]);
          } else {
            error++;
            setErrorCount(error);
            setImportLogs(prev => [
              ...prev,
              { type: "error", message: `[error] Database write failed for "${name}"` }
            ]);
          }
        } catch (err) {
          error++;
          setErrorCount(error);
          setImportLogs(prev => [
            ...prev,
            { type: "error", message: `[error] Processing failed for "${name}": ${(err as Error).message}` }
          ]);
        }

        setImportProgress(Math.round((i / (rows.length - 1)) * 100));
        // Small brief delay for terminal visualization pacing
        await new Promise(r => setTimeout(r, 80));
      }

      setImportLogs(prev => [
        ...prev, 
        { type: "info", message: `[complete] Process complete. Imported: ${success}, Skipped: ${skipped}, Failed: ${error}` }
      ]);
      setImporting(false);
      loadStats();
    };

    reader.readAsText(csvFile);
  };

  const handleApprove = async (id: string, name: string) => {
    if (!user || user.email !== ADMIN_EMAIL) {
      alert("Unauthorized action");
      return;
    }
    const ok = await mockDb.approveTool(id);
    if (ok) {
      setPendingTools(prev => prev.filter(t => t.id !== id));
      alert(`Approved "${name}" successfully!`);
      loadStats();
    } else {
      alert(`Failed to approve "${name}".`);
    }
  };

  const handleReject = async (id: string, name: string) => {
    if (!user || user.email !== ADMIN_EMAIL) {
      alert("Unauthorized action");
      return;
    }
    if (confirm(`Are you sure you want to reject and delete "${name}"?`)) {
      const ok = await mockDb.rejectTool(id);
      if (ok) {
        setPendingTools(prev => prev.filter(t => t.id !== id));
        alert(`Rejected "${name}" successfully.`);
        loadStats();
      } else {
        alert(`Failed to reject "${name}".`);
      }
    }
  };

  // Render Loader screen
  if (loadingSession) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-[#00ff66] font-mono p-4">
        <Loader2 className="w-8 h-8 animate-spin mb-3 text-[#00ff66]" />
        <span>[connecting_secure_terminal]...</span>
      </div>
    );
  }

  // Render Login screen if not admin
  if (!user || user.email !== ADMIN_EMAIL) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center font-mono text-[#00ff66] p-4 relative overflow-hidden select-none">
        {/* Background matrix noise effect */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_4px,3px_100%] pointer-events-none opacity-40"></div>
        
        <div className="max-w-md w-full border-2 border-red-500 bg-[#0d0707] p-8 rounded-lg shadow-[0_0_20px_rgba(239,68,68,0.2)] text-center relative z-10">
          <div className="flex justify-center mb-4">
            <ShieldAlert className="w-16 h-16 text-red-500 animate-pulse" />
          </div>
          <h1 className="text-2xl font-bold uppercase tracking-wider text-red-400 mb-2">ACCESS RESTRICTED</h1>
          <p className="text-xs text-red-300/80 mb-6 leading-relaxed">
            SYSTEM ROOT GATEWAY IS CONFIGURED FOR EXCLUSIVE DEVELOPER PRIVILEGES ONLY. UNAUTHORIZED CONNECTIONS WILL BE LOGGED.
          </p>

          <div className="border border-red-900 bg-red-950/20 p-4 rounded text-left mb-6 text-xs text-red-400">
            <div className="flex items-center gap-2 mb-2 font-bold uppercase">
              <AlertCircle className="w-4 h-4" /> Gateway Info:
            </div>
            Access Level: <span className="text-red-400 font-bold">SYSTEM_ROOT_ADMIN</span>
            {user && (
              <div className="mt-2 text-gray-400">
                Current Identity: <span className="text-red-400 font-bold">{user.email}</span>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3">
            {!user ? (
              <button
                onClick={handleSignIn}
                className="w-full py-3 bg-red-950/50 hover:bg-red-900/50 text-red-200 border border-red-500 rounded font-bold cursor-pointer transition duration-300 hover:shadow-[0_0_10px_rgba(239,68,68,0.4)] flex items-center justify-center gap-2 text-sm"
              >
                <Terminal className="w-4 h-4" /> Sign In via Google Auth
              </button>
            ) : (
              <button
                onClick={handleSignOut}
                className="w-full py-3 bg-red-950/50 hover:bg-red-900/50 text-red-200 border border-red-500 rounded font-bold cursor-pointer transition duration-300 flex items-center justify-center gap-2 text-sm"
              >
                <LogOut className="w-4 h-4" /> Disconnect & Sign Out
              </button>
            )}
            
            <Link 
              href="/"
              className="py-2 text-xs text-gray-500 hover:text-red-400 transition flex items-center justify-center gap-1 mt-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Return to Crawlers homepage
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Render Admin Dashboard Control Panel
  return (
    <div className="min-h-screen bg-black font-mono text-[#00ff66] p-4 sm:p-8 relative overflow-hidden">
      {/* Visual terminal filter lines */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(0,255,0,0.02),rgba(0,0,0,0.1),rgba(0,255,0,0.02))] bg-[size:100%_4px,3px_100%] pointer-events-none opacity-20"></div>

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-[#00ff66]/30 pb-6 mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-[#00ff66]/60 uppercase tracking-widest mb-1">
              <ShieldCheck className="w-4 h-4 text-[#00ff66]" /> Root Developer Privilege Verified
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2 text-white">
              &gt; crawlers // <span className="text-[#00ff66]">admin_dashboard</span>
            </h1>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Link 
              href="/"
              className="px-4 py-2 border border-[#00ff66]/30 hover:border-[#00ff66]/70 hover:bg-[#00ff66]/10 text-xs rounded transition flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Site Home
            </Link>

            <button
              onClick={handleSignOut}
              className="px-4 py-2 border border-red-500/30 text-red-400 hover:border-red-500 hover:bg-red-950/20 text-xs rounded transition flex items-center gap-1.5 cursor-pointer ml-auto sm:ml-0"
            >
              <LogOut className="w-3.5 h-3.5" /> Disconnect
            </button>
          </div>
        </div>

        {/* Real-time Statistics Panel */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8 font-mono">
          <div className="border border-[#00ff66]/30 bg-black/60 rounded-lg p-5 flex flex-col relative overflow-hidden backdrop-blur shadow-[0_0_15px_rgba(0,255,102,0.02)]">
            <span className="text-[10px] text-[#00ff66]/60 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5" /> Total Index Count
            </span>
            <div className="text-3xl font-extrabold text-white">
              {loadingStats ? (
                <span className="text-slate-500 animate-pulse">...</span>
              ) : (
                dbStats.totalTools
              )}
            </div>
            <span className="text-[9px] text-slate-500 mt-1">Total active directory tools</span>
          </div>

          <div className="border border-[#00ff66]/30 bg-black/60 rounded-lg p-5 flex flex-col relative overflow-hidden backdrop-blur shadow-[0_0_15px_rgba(0,255,102,0.02)]">
            <span className="text-[10px] text-[#00ff66]/60 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Play className="w-3.5 h-3.5 rotate-90" /> AI Models Listed
            </span>
            <div className="text-3xl font-extrabold text-[#00ff66]">
              {loadingStats ? (
                <span className="text-slate-500 animate-pulse">...</span>
              ) : (
                dbStats.totalModels
              )}
            </div>
            <span className="text-[9px] text-slate-500 mt-1">Models category & tagged records</span>
          </div>

          <div className="border border-[#00ff66]/30 bg-black/60 rounded-lg p-5 flex flex-col relative overflow-hidden backdrop-blur shadow-[0_0_15px_rgba(0,255,102,0.02)]">
            <span className="text-[10px] text-[#00ff66]/60 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> API Keys Listed
            </span>
            <div className="text-3xl font-extrabold text-[#00ff66]">
              {loadingStats ? (
                <span className="text-slate-500 animate-pulse">...</span>
              ) : (
                dbStats.totalApis
              )}
            </div>
            <span className="text-[9px] text-slate-500 mt-1">API Tools category & tagged records</span>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: CSV Import Console */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="border border-[#00ff66]/30 bg-black/60 rounded-lg p-6 backdrop-blur shadow-[0_0_15px_rgba(0,255,102,0.05)]">
              <h2 className="text-lg font-bold uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-[#00ff66]/20 pb-2 text-white">
                <UploadCloud className="w-5 h-5 text-[#00ff66]" /> CSV Bulk AI-Bot Importer
              </h2>

              <p className="text-xs text-[#00ff66]/75 mb-6 leading-relaxed">
                Upload a structured comma-separated values (.csv) file to batch import new bots immediately as <span className="text-white font-semibold">Active</span>.
                The importer will verify details against existing items and automatically skip duplicates.
              </p>

              {/* Upload Input */}
              <div className="border-2 border-dashed border-[#00ff66]/20 rounded-lg p-8 text-center hover:border-[#00ff66]/50 transition duration-300 bg-[#070d08] mb-6 flex flex-col items-center">
                <UploadCloud className="w-12 h-12 text-[#00ff66]/40 mb-3" />
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                  disabled={importing}
                  className="hidden"
                  id="csv-file-input"
                />
                <label
                  htmlFor="csv-file-input"
                  className={`px-4 py-2 bg-transparent text-[#00ff66] border border-[#00ff66]/60 rounded text-xs hover:bg-[#00ff66]/10 cursor-pointer font-bold transition duration-300 uppercase ${importing ? "pointer-events-none opacity-50" : ""}`}
                >
                  {csvFile ? `File Selected: ${csvFile.name}` : "Select CSV File"}
                </label>
                <span className="text-[10px] text-[#00ff66]/40 mt-2 block">
                  Required headers: name, url, description (optional: category, pricing_model, tags)
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-4">
                <button
                  onClick={handleImportCSV}
                  disabled={!csvFile || importing}
                  className="flex-1 py-3 bg-[#00ff66]/20 hover:bg-[#00ff66]/35 text-[#00ff66] border border-[#00ff66] rounded font-bold transition duration-300 flex items-center justify-center gap-2 text-xs uppercase disabled:opacity-30 cursor-pointer"
                >
                  {importing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Processing CSV...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" /> Start Bulk Import
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Terminal Logger Console */}
            <div className="border border-[#00ff66]/30 bg-[#020503] rounded-lg p-4 font-mono shadow-inner h-[380px] flex flex-col">
              <div className="flex items-center justify-between border-b border-[#00ff66]/20 pb-2 mb-3">
                <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-white">
                  <Terminal className="w-4 h-4" /> Terminal Console Log
                </div>
                {/* Stats badge */}
                <div className="flex gap-3 text-[10px]">
                  <span className="text-[#00ff66]">Imported: {successCount}</span>
                  <span className="text-yellow-500">Skipped: {skippedCount}</span>
                  <span className="text-red-500">Errors: {errorCount}</span>
                </div>
              </div>

              {/* Console logs output */}
              <div className="flex-1 overflow-y-auto text-xs space-y-1.5 pr-2 scrollbar-thin select-text">
                {importLogs.length === 0 ? (
                  <span className="text-[#00ff66]/30 italic">{"// Terminal is idle. Select a CSV file to deploy."}</span>
                ) : (
                  importLogs.map((log, idx) => (
                    <div 
                      key={idx} 
                      className={`leading-relaxed ${
                        log.type === "success" ? "text-[#00ff66]" :
                        log.type === "warning" ? "text-yellow-500" :
                        log.type === "error" ? "text-red-500 font-bold" :
                        "text-[#00ff66]/60"
                      }`}
                    >
                      {log.message}
                    </div>
                  ))
                )}
              </div>

              {/* Progress bar */}
              {importing && (
                <div className="mt-4 pt-3 border-t border-[#00ff66]/20">
                  <div className="flex justify-between text-[10px] mb-1">
                    <span>PROGRESS_BAR:</span>
                    <span>{importProgress}%</span>
                  </div>
                  <div className="w-full bg-[#041006] h-2 rounded border border-[#00ff66]/20 overflow-hidden">
                    <div 
                      className="bg-[#00ff66] h-full transition-all duration-200" 
                      style={{ width: `${importProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Pending Review Dashboard */}
          <div className="lg:col-span-5">
            <div className="border border-[#00ff66]/30 bg-black/60 rounded-lg p-6 backdrop-blur shadow-[0_0_15px_rgba(0,255,102,0.05)] h-full flex flex-col">
              <h2 className="text-lg font-bold uppercase tracking-wider mb-4 flex items-center justify-between border-b border-[#00ff66]/20 pb-2 text-white">
                <span className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-500" /> Moderation Requests
                </span>
                <span className="text-xs bg-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded border border-yellow-500/30">
                  {pendingTools.length} Pending
                </span>
              </h2>

              <div className="flex-1 overflow-y-auto space-y-4 max-h-[660px] pr-2 scrollbar-thin">
                {loadingPending ? (
                  <div className="text-center py-12 text-[#00ff66]/40 text-xs">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Fetching pending submissions...
                  </div>
                ) : pendingTools.length === 0 ? (
                  <div className="text-center py-12 border border-[#00ff66]/10 rounded bg-[#030704] text-[#00ff66]/40 text-xs flex flex-col items-center justify-center p-4">
                    <CheckCircle2 className="w-8 h-8 text-[#00ff66]/30 mb-2" />
                    <span>All clear! No tools pending review.</span>
                  </div>
                ) : (
                  pendingTools.map((tool) => (
                    <div 
                      key={tool.id} 
                      className="border border-[#00ff66]/20 bg-[#030704] hover:border-[#00ff66]/45 p-4 rounded transition duration-200 flex flex-col gap-2 relative overflow-hidden"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-sm font-bold text-white leading-tight">{tool.name}</h3>
                          <a 
                            href={tool.url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-[10px] text-[#00ff66] hover:underline"
                          >
                            {tool.url}
                          </a>
                        </div>
                        <span className="text-[9px] bg-yellow-950 text-yellow-400 px-1.5 py-0.5 rounded border border-yellow-800/40">
                          {tool.pricing_model}
                        </span>
                      </div>

                      <p className="text-xs text-[#00ff66]/75 leading-relaxed bg-black/40 p-2 border border-[#00ff66]/10 rounded">
                        {tool.short_description}
                      </p>

                      <div className="flex flex-wrap items-center gap-1.5 mt-1">
                        <span className="text-[10px] text-[#00ff66]/40 uppercase">Category:</span>
                        <span className="text-[10px] bg-[#00ff66]/10 text-white px-2 py-0.5 rounded border border-[#00ff66]/20">
                          {tool.categories?.name || "General Reasoning"}
                        </span>
                      </div>

                      {tool.tags && tool.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {tool.tags.map((tag) => (
                            <span key={tag} className="text-[9px] text-[#00ff66]/50 border border-[#00ff66]/10 bg-black/60 px-1.5 py-0.25 rounded">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Moderation Controls */}
                      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#00ff66]/10">
                        <button
                          onClick={() => handleApprove(tool.id, tool.name)}
                          className="flex-1 py-1.5 bg-[#00ff66]/20 hover:bg-[#00ff66]/35 text-[#00ff66] border border-[#00ff66] rounded font-bold transition text-[10px] uppercase cursor-pointer"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(tool.id, tool.name)}
                          className="px-3 py-1.5 bg-red-950/40 hover:bg-red-900/40 text-red-400 border border-red-500/40 hover:border-red-500 rounded transition text-[10px] cursor-pointer flex items-center justify-center"
                          title="Reject and delete submission"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
