import { useState, useEffect, useRef, useCallback, useMemo } from "react";

// ── Supabase ──────────────────────────────────────────────────────────────────
let supabase = null;
async function initSupabase() {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_KEY;
  if (!url || !key) return null;
  try {
    const { createClient } = await import("https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm");
    return createClient(url, key);
  } catch { return null; }
}

// ── Storage ───────────────────────────────────────────────────────────────────
const STORAGE_KEY = "lifetracker_v3";

// ── Login Screen ──────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handle = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { error: err } = await supabase.auth.signInWithPassword({ email, password });
      if (err) setError(err.message);
      else onLogin();
    } catch { setError("Connection error. Try again."); }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#050510", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Rajdhani', sans-serif", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 380, position: "relative", background: "linear-gradient(135deg,#0d0d20,#080818)", border: "1px solid #6B21A8", boxShadow: "0 0 8px #A855F788,0 0 2px #A855F7,inset 0 0 8px #A855F722", borderRadius: 4, padding: "40px 32px" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>⚡</div>
          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: "0.15em", color: "#D946EF", textShadow: "0 0 20px #D946EF,0 0 40px #A855F7", textTransform: "uppercase" }}>Level Up!</div>
          <div style={{ fontSize: 11, color: "#94A3B8", letterSpacing: "0.2em", marginTop: 4 }}>SHADOW MONARCH SYSTEM</div>
        </div>
        <form onSubmit={handle} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <div style={{ fontSize: 10, color: "#94A3B8", letterSpacing: "0.15em", marginBottom: 6 }}>EMAIL</div>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)} required
              style={{ width: "100%", padding: "11px 14px", background: "#0a0a1e", border: "1px solid #6B21A8", color: "#E2E8F0", fontFamily: "inherit", fontSize: 14, outline: "none", borderRadius: 2, boxSizing: "border-box", letterSpacing: "0.05em" }}
            />
          </div>
          <div>
            <div style={{ fontSize: 10, color: "#94A3B8", letterSpacing: "0.15em", marginBottom: 6 }}>PASSWORD</div>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)} required
              style={{ width: "100%", padding: "11px 14px", background: "#0a0a1e", border: "1px solid #6B21A8", color: "#E2E8F0", fontFamily: "inherit", fontSize: 14, outline: "none", borderRadius: 2, boxSizing: "border-box", letterSpacing: "0.05em" }}
            />
          </div>
          {error && <div style={{ fontSize: 12, color: "#F87171", background: "#F8717122", border: "1px solid #F8717155", padding: "8px 12px", borderRadius: 2 }}>{error}</div>}
          <button type="submit" disabled={loading} style={{ marginTop: 8, padding: "12px 20px", background: loading ? "#A855F722" : "#A855F733", border: "1px solid #A855F7", color: "#A855F7", fontFamily: "inherit", fontSize: 12, cursor: loading ? "default" : "pointer", letterSpacing: "0.15em", boxShadow: "0 0 8px #A855F788", borderRadius: 2, textTransform: "uppercase", transition: "all 0.15s" }}>
            {loading ? "AUTHENTICATING..." : "ENTER THE SYSTEM"}
          </button>
        </form>
      </div>
    </div>
  );
}

const todayKey = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; };
const monthKey = () => new Date().toISOString().slice(0, 7);
const EXPENSE_CATEGORIES = ["Food", "Transport", "Bills", "Health", "Entertainment", "Shopping", "Savings", "Debt", "Other"];
const DEFAULT_BUDGETS = { Food: 400, Transport: 150, Bills: 200, Health: 100, Entertainment: 100, Shopping: 150, Savings: 500, Debt: 200, Other: 100 };
const DEFAULT_SAVINGS_GOALS = [
  { id: "sg1", label: "Emergency Fund", target: 5000, current: 0 },
  { id: "sg2", label: "Pay Off Credit Card", target: 2000, current: 0 },
];

const defaultTabs = [
  {
    id: "fitness", label: "Fitness", icon: "⚔️", stat: "STR",
    tasks: [
      { id: "f1", text: "Morning workout (30 min)", freq: "daily" },
      { id: "f2", text: "10,000 steps", freq: "daily" },
      { id: "f3", text: "Strength training session", freq: "daily" },
      { id: "f4", text: "Drink 8 glasses of water", freq: "daily" },
    ],
    goals: [
      { id: "fg1", text: "Increase bench press by 20 lbs" },
      { id: "fg2", text: "Hit a new deadlift PR" },
      { id: "fg3", text: "Complete 100 consecutive push-ups" },
    ],
  },
  {
    id: "health", label: "Health", icon: "💚", stat: "VIT",
    tasks: [
      { id: "h1", text: "Eat 5 servings of vegetables", freq: "daily" },
      { id: "h2", text: "No processed sugar", freq: "daily" },
      { id: "h3", text: "Log meals", freq: "daily" },
      { id: "h4", text: "No eating after 8pm", freq: "daily" },
      { id: "h5", text: "Vitamin D3 (5000 IU)", freq: "daily" },
      { id: "h6", text: "Magnesium Glycinate", freq: "daily" },
      { id: "h7", text: "Omega-3 Fish Oil", freq: "daily" },
      { id: "h8", text: "B-Complex", freq: "daily" },
      { id: "h9", text: "Zinc (25mg)", freq: "daily" },
    ],
    goals: [
      { id: "hg1", text: "Lose 10 lbs" },
      { id: "hg2", text: "Get full blood panel done" },
      { id: "hg3", text: "Complete 30-day clean eating challenge" },
    ],
  },
  {
    id: "agility", label: "Agility", icon: "⚡", stat: "AGI",
    tasks: [
      { id: "ag1", text: "15 min stretching / yoga", freq: "daily" },
      { id: "ag2", text: "Jump rope or reaction drills (10 min)", freq: "daily" },
      { id: "ag3", text: "Balance & coordination training", freq: "daily" },
      { id: "ag4", text: "Flexibility progression work", freq: "daily" },
    ],
    goals: [
      { id: "agg1", text: "Achieve full splits" },
      { id: "agg2", text: "Run a sub-8-minute mile" },
      { id: "agg3", text: "Improve vertical jump by 3 inches" },
    ],
  },
  {
    id: "knowledge", label: "Knowledge", icon: "📖", stat: "INT",
    tasks: [
      { id: "k1", text: "Duolingo streak (15 min)", freq: "daily" },
      { id: "k2", text: "Review 20 flashcards", freq: "daily" },
      { id: "k3", text: "Read 20 pages", freq: "daily" },
      { id: "k4", text: "Watch 1 educational video or lecture", freq: "daily" },
    ],
    goals: [
      { id: "kg1", text: "Hold a 5-minute foreign-language conversation" },
      { id: "kg2", text: "Complete B1 language level" },
      { id: "kg3", text: "Read 12 books this year" },
      { id: "kg4", text: "Finish one online course" },
    ],
  },
  {
    id: "finance", label: "Finance", icon: "💎", stat: "PER",
    tasks: [
      { id: "fi1", text: "No impulse purchases today", freq: "daily" },
      { id: "fi2", text: "Logged today's spending in budgeting app", freq: "daily" },
      { id: "fi3", text: "Stayed under daily spending limit", freq: "daily" },
      { id: "fi4", text: "Packed lunch / made coffee at home", freq: "daily" },
      { id: "fi5", text: "No unplanned online shopping", freq: "daily" },
    ],
    goals: [
      { id: "fig1", text: "Save $500 this month" },
      { id: "fig2", text: "Make one extra debt payment this month" },
      { id: "fig3", text: "Review & adjust budget this month" },
      { id: "fig4", text: "Complete a no-spend week this month" },
    ],
  },
  {
    id: "spiritual", label: "Spiritual", icon: "✨", stat: "SEN",
    tasks: [
      { id: "sp1", text: "Morning scripture reading (15 min)", freq: "daily" },
      { id: "sp2", text: "Prayer / meditation", freq: "daily" },
      { id: "sp3", text: "Write reflection / journal", freq: "daily" },
      { id: "sp4", text: "Memorize 1 verse", freq: "weekly" },
    ],
    goals: [
      { id: "spg1", text: "Read the entire New Testament" },
      { id: "spg2", text: "Complete a devotional plan" },
      { id: "spg3", text: "Fast once a week for a month" },
    ],
  },
];

function loadLocal() {
  try { const r = localStorage.getItem(STORAGE_KEY); return r ? JSON.parse(r) : null; } catch { return null; }
}
function saveLocal(s) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch {} }

// ── Design tokens ─────────────────────────────────────────────────────────────
const C = {
  bg: "#050510", panel: "#0a0a1a", panelBorder: "#6B21A8",
  glow: "#A855F7", glowBright: "#D946EF", green: "#4ADE80",
  red: "#F87171", yellow: "#FBBF24", text: "#E2E8F0",
  textDim: "#94A3B8", accent: "#C084FC",
};
const glowBox = (color = C.glow) => `0 0 8px ${color}88,0 0 2px ${color},inset 0 0 8px ${color}22`;
const panelStyle = (extra = {}) => ({ background: "linear-gradient(135deg,#0d0d20 0%,#080818 100%)", border: `1px solid ${C.panelBorder}`, boxShadow: glowBox(C.glow), borderRadius: 4, ...extra });

// ── Shared UI ─────────────────────────────────────────────────────────────────
const Corner = ({ pos }) => {
  const s = { tl: { top: -1, left: -1 }, tr: { top: -1, right: -1, transform: "scaleX(-1)" }, bl: { bottom: -1, left: -1, transform: "scaleY(-1)" }, br: { bottom: -1, right: -1, transform: "scale(-1,-1)" } }[pos];
  return <svg width="18" height="18" viewBox="0 0 18 18" style={{ position: "absolute", ...s }}><path d="M0 10 L0 0 L10 0" stroke={C.glowBright} strokeWidth="2" fill="none" /></svg>;
};
const PanelCorners = () => <><Corner pos="tl" /><Corner pos="tr" /><Corner pos="bl" /><Corner pos="br" /></>;

const StatBar = ({ pct, color = C.green, height = 6 }) => (
  <div style={{ height, background: "#1e1e3a", borderRadius: 2, overflow: "hidden", border: "1px solid #2d2d5a" }}>
    <div style={{ height: "100%", width: `${Math.min(pct, 100)}%`, background: `linear-gradient(90deg,${color}99,${color})`, boxShadow: `0 0 10px ${color},0 0 4px ${color}`, borderRadius: 2, transition: "width 0.5s ease" }} />
  </div>
);

const HexCheck = ({ done, onClick, burst }) => (
  <div onClick={onClick} style={{ width: 24, height: 24, cursor: "pointer", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", border: `1.5px solid ${done ? C.green : C.panelBorder}`, borderRadius: 3, background: done ? `${C.green}22` : "transparent", boxShadow: burst ? `0 0 20px ${C.green},0 0 40px ${C.green}66` : (done ? `0 0 8px ${C.green}88` : "none"), transition: "all 0.2s", animation: burst ? "checkBurst 0.5s ease" : "none" }}>
    {done && <svg width="13" height="13" viewBox="0 0 12 12"><path d="M2 6l3 3 5-5" stroke={C.green} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" /></svg>}
  </div>
);

const Inp = ({ style = {}, ...props }) => (
  <input {...props} style={{ padding: "10px 14px", background: "#0a0a1e", border: `1px solid ${C.panelBorder}`, color: C.text, fontFamily: "inherit", fontSize: 13, outline: "none", letterSpacing: "0.05em", borderRadius: 2, ...style }} />
);

const Btn = ({ children, color = C.glow, style = {}, ...props }) => (
  <button {...props} style={{ padding: "9px 20px", background: `${color}22`, border: `1px solid ${color}`, color, fontFamily: "inherit", fontSize: 11, cursor: "pointer", letterSpacing: "0.12em", boxShadow: glowBox(color), borderRadius: 2, textTransform: "uppercase", transition: "all 0.15s", ...style }}>{children}</button>
);

// ── Hunter Rank system ────────────────────────────────────────────────────────
const RANKS = [
  { letter: "E", min: 1,   max: 9,   color: "#94A3B8", title: "The Awakened" },
  { letter: "D", min: 10,  max: 19,  color: "#4ADE80", title: "Hunter" },
  { letter: "C", min: 20,  max: 34,  color: "#38BDF8", title: "Skilled Hunter" },
  { letter: "B", min: 35,  max: 54,  color: "#A855F7", title: "Elite Hunter" },
  { letter: "A", min: 55,  max: 79,  color: "#D946EF", title: "Master Hunter" },
  { letter: "S", min: 80,  max: 99,  color: "#FBBF24", title: "National Treasure" },
  { letter: "N", min: 100, max: 149, color: "#22D3EE", title: "National Level Hunter" },
  { letter: "M", min: 150, max: Infinity, color: "#E11D48", title: "The Shadow Monarch" },
];
const getRank = (level) => RANKS.find(r => level >= r.min && level <= r.max) || RANKS[0];

// Angular rank badge — pass size="sm" for header, size="lg" for status panel
const RankBadge = ({ rank, size = "sm" }) => {
  const dim = size === "lg" ? 56 : 28;
  const fs  = size === "lg" ? 22 : 11;
  const sw  = size === "lg" ? 2 : 1.5;
  return (
    <div style={{ position: "relative", width: dim, height: dim, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <svg width={dim} height={dim} viewBox="0 0 56 56" style={{ position: "absolute", inset: 0 }}>
        {/* Clipped hexagonal / angular shape */}
        <polygon
          points="28,2 52,14 52,42 28,54 4,42 4,14"
          fill={`${rank.color}18`}
          stroke={rank.color}
          strokeWidth={sw}
          style={{ filter: `drop-shadow(0 0 6px ${rank.color})` }}
        />
      </svg>
      <span style={{ fontSize: fs, fontWeight: 800, color: rank.color, textShadow: `0 0 10px ${rank.color},0 0 20px ${rank.color}88`, letterSpacing: 0, position: "relative", zIndex: 1 }}>
        {rank.letter}
      </span>
    </div>
  );
};

// ── History helpers ───────────────────────────────────────────────────────────
const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DOW_LABELS  = ["Su","Mo","Tu","We","Th","Fr","Sa"];

function dayDateStr(year, month, day) {
  return `${year}-${String(month+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
}
function calColor(pct) {
  if (pct === 100) return { bg: "#4ADE80", border: "#4ADE80", glow: `0 0 14px #4ADE8099` };
  if (pct >= 75)  return { bg: "#A855F7", border: "#A855F7", glow: `0 0 10px #A855F766` };
  if (pct >= 50)  return { bg: "#7e22ce", border: "#7e22ce", glow: `0 0 8px #7e22ce66` };
  if (pct >= 25)  return { bg: "#4c1d95", border: "#4c1d95", glow: "none" };
  if (pct >  0)   return { bg: "#2e1065", border: "#2e1065", glow: "none" };
  return { bg: "transparent", border: "#1e1e3a", glow: "none" };
}

// ── History View ──────────────────────────────────────────────────────────────
function HistoryView({ checks, tabs, history, isMobile, xpLog, goalChecks, toggleCheck, toggleGoal, selDay, setSelDay }) {
  const todayStr = todayKey();
  const nowDate  = new Date(); nowDate.setHours(0,0,0,0);

  const [calView,   setCalView]  = useState(() => ({ year: nowDate.getFullYear(), month: nowDate.getMonth() }));
  const [editingDay, setEditingDay] = useState(false);

  // All dates that have at least one true check
  const activeDates = useMemo(() => {
    const s = new Set();
    for (const [k, v] of Object.entries(checks)) { if (v) s.add(k.split("::")[0]); }
    return s;
  }, [checks]);

  // Streak counters
  const { currentStreak, longestStreak } = useMemo(() => {
    let current = 0;
    const d = new Date(nowDate);
    if (!activeDates.has(d.toISOString().slice(0,10))) d.setDate(d.getDate()-1);
    while (activeDates.has(d.toISOString().slice(0,10))) { current++; d.setDate(d.getDate()-1); }

    const sorted = Array.from(activeDates).sort();
    let longest = current, run = sorted.length ? 1 : 0;
    for (let i = 1; i < sorted.length; i++) {
      const diff = (new Date(sorted[i]) - new Date(sorted[i-1])) / 86400000;
      if (diff === 1) run++; else { longest = Math.max(longest, run); run = 1; }
    }
    longest = Math.max(longest, run);
    return { currentStreak: current, longestStreak: longest };
  }, [activeDates]);

  // Pct for a given date
  const getDayPct = (dateStr) => {
    const snap = history[dateStr]?.snap;
    if (snap) {
      let t = 0, d = 0;
      for (const ts of Object.values(snap)) { t += ts.tasks.length; d += ts.done.length; }
      return t > 0 ? Math.round((d/t)*100) : 0;
    }
    const totalDaily = tabs.reduce((s,tab) => s + tab.tasks.filter(tk=>tk.freq==="daily").length, 0);
    const doneCount  = Object.keys(checks).filter(k => k.startsWith(`${dateStr}::`) && checks[k]).length;
    return totalDaily > 0 ? Math.round((doneCount/totalDaily)*100) : 0;
  };

  // XP earned on a given day (from xpLog keys)
  const getDayXP = (dateStr) => {
    if (history[dateStr]?.xpDay !== undefined) return history[dateStr].xpDay;
    let xp = 0;
    for (const k of Object.keys(xpLog)) {
      if (k.startsWith(`xp::task::${dateStr}::`)) xp += 10;
      if (k.startsWith(`xp::bonus::${dateStr}::`)) xp += 25;
    }
    return xp;
  };

  // Calendar geometry
  const { year, month } = calView;
  const firstDow    = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month+1, 0).getDate();
  const canNext     = year < nowDate.getFullYear() || (year === nowDate.getFullYear() && month < nowDate.getMonth());

  const goNext = () => setCalView(p => canNext ? (p.month===11 ? {year:p.year+1,month:0} : {year:p.year,month:p.month+1}) : p);
  const goPrev = () => setCalView(p => p.month===0 ? {year:p.year-1,month:11} : {year:p.year,month:p.month-1});

  // Detail for selected day
  const selTabData = useMemo(() => {
    if (!selDay) return [];
    const snap = history[selDay]?.snap;
    return tabs.map(tab => {
      const ts = snap?.[tab.id];
      const tasks = ts ? ts.tasks : tab.tasks.filter(t=>t.freq==="daily");
      const done  = ts ? ts.done  : tasks.filter(t=>!!checks[`${selDay}::${tab.id}::${t.id}`]).map(t=>t.id);
      return { tab, tasks, done };
    }).filter(d => d.tasks.length > 0);
  }, [selDay, history, tabs, checks]);

  const selPct = selDay ? getDayPct(selDay) : 0;
  const selXP  = selDay ? getDayXP(selDay)  : 0;

  const statCard = (label, value, color, sub) => (
    <div style={{ ...panelStyle({ padding:"14px 18px", position:"relative", flex:1, minWidth:120 }) }}>
      <PanelCorners />
      <div style={{ fontSize:9, color:C.accent, letterSpacing:"0.15em", textTransform:"uppercase", marginBottom:4 }}>{label}</div>
      <div style={{ fontSize:34, fontWeight:800, color, textShadow:`0 0 20px ${color}88`, lineHeight:1 }}>{value}</div>
      <div style={{ fontSize:10, color:C.textDim, marginTop:3 }}>{sub}</div>
    </div>
  );

  return (
    <div>
      {/* ── Streak banner ── */}
      <div style={{ display:"flex", gap:12, marginBottom:20, flexWrap:"wrap" }}>
        {statCard("Current Streak", `${currentStreak} 🔥`, C.yellow, "days in a row")}
        {statCard("Longest Streak", longestStreak, C.glowBright, "days — all-time best")}
        {statCard("Days Active", activeDates.size, C.green, "total days tracked")}
      </div>

      {/* ── Calendar ── */}
      <div style={{ ...panelStyle({ padding: isMobile?"12px":"20px", position:"relative", marginBottom:16 }) }}>
        <PanelCorners />

        {/* Month nav */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
          <button onClick={goPrev} style={{ background:"none", border:`1px solid ${C.panelBorder}`, color:C.accent, cursor:"pointer", fontSize:18, padding:"4px 14px", fontFamily:"inherit", borderRadius:2 }}>‹</button>
          <div style={{ textAlign:"center" }}>
            <div style={{ fontSize: isMobile?15:18, fontWeight:700, color:C.glowBright, letterSpacing:"0.12em", textTransform:"uppercase" }}>{MONTH_NAMES[month]}</div>
            <div style={{ fontSize:11, color:C.textDim }}>{year}</div>
          </div>
          <button onClick={goNext} style={{ background:"none", border:`1px solid ${canNext?C.panelBorder:"#1e1e3a"}`, color:canNext?C.accent:"#2d2d5a", cursor:canNext?"pointer":"default", fontSize:18, padding:"4px 14px", fontFamily:"inherit", borderRadius:2 }}>›</button>
        </div>

        {/* DOW row */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:3, marginBottom:4 }}>
          {DOW_LABELS.map(d => <div key={d} style={{ textAlign:"center", fontSize:9, color:C.textDim, letterSpacing:"0.08em", paddingBottom:4 }}>{d}</div>)}
        </div>

        {/* Day cells */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:3 }}>
          {Array.from({length:firstDow}).map((_,i) => <div key={`e${i}`} />)}
          {Array.from({length:daysInMonth}).map((_,i) => {
            const dayNum  = i+1;
            const dateStr = dayDateStr(year, month, dayNum);
            const isFuture = dateStr > todayStr;
            const isToday  = dateStr === todayStr;
            const isSel    = selDay === dateStr;
            const pct = isFuture ? 0 : getDayPct(dateStr);
            const { bg, border, glow } = calColor(pct);
            return (
              <div key={dayNum}
                onClick={() => { if (isFuture) return; if (isSel) { setSelDay(null); setEditingDay(false); } else { setSelDay(dateStr); setEditingDay(false); } }}
                style={{
                  aspectRatio:"1", display:"flex", flexDirection:"column",
                  alignItems:"center", justifyContent:"center",
                  background: isSel ? `${C.glowBright}33` : (pct>0 ? `${bg}55` : "#0a0a1e"),
                  border: `1px solid ${isSel ? C.glowBright : isToday ? C.glow : border}`,
                  borderRadius:3, cursor:isFuture?"default":"pointer",
                  boxShadow: isSel ? `0 0 10px ${C.glowBright}88` : glow,
                  opacity: isFuture ? 0.2 : 1, transition:"all 0.15s",
                  minHeight: isMobile?34:42,
                }}>
                <span style={{ fontSize:isMobile?10:12, fontWeight:isToday?700:400, color:isToday?C.glowBright:(pct>0?C.text:C.textDim) }}>{dayNum}</span>
                {!isFuture && pct>0 && <span style={{ fontSize:6, color:pct===100?C.green:C.accent, marginTop:1 }}>{pct}%</span>}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div style={{ display:"flex", gap:10, marginTop:14, flexWrap:"wrap", justifyContent:"center" }}>
          {[["0%","#1e1e3a"],["1–24%","#2e1065"],["25–49%","#4c1d95"],["50–74%","#7e22ce"],["75–99%",C.glow],["100%",C.green]].map(([lbl,col])=>(
            <div key={lbl} style={{ display:"flex", alignItems:"center", gap:4 }}>
              <div style={{ width:10,height:10,background:col,borderRadius:2,boxShadow:col!=="#1e1e3a"?`0 0 5px ${col}88`:"none" }} />
              <span style={{ fontSize:9, color:C.textDim }}>{lbl}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Day detail panel ── */}
      {selDay && (
        <div style={{ ...panelStyle({ padding: isMobile?"14px":"20px", position:"relative" }) }}>
          <PanelCorners />
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
            <div>
              <div style={{ fontSize:9, color:C.accent, letterSpacing:"0.2em", textTransform:"uppercase" }}>Quest Log — {selDay}</div>
              <div style={{ fontSize:22, fontWeight:700, color: selPct===100?C.green:C.glowBright, textShadow:`0 0 15px ${selPct===100?C.green:C.glowBright}88`, marginTop:2 }}>
                {selPct}% Complete
              </div>
              {selXP>0 && <div style={{ fontSize:11, color:C.accent, marginTop:2 }}>+{selXP} XP earned</div>}
            </div>
            <div style={{ display:"flex", gap:8, alignItems:"center" }}>
              {selDay !== todayStr && (
                <button onClick={()=>setEditingDay(e=>!e)} style={{ padding:"5px 12px", background:editingDay?`${C.glow}33`:"transparent", border:`1px solid ${editingDay?C.glow:C.panelBorder}`, color:editingDay?C.glow:C.textDim, fontFamily:"inherit", fontSize:10, cursor:"pointer", letterSpacing:"0.1em", borderRadius:2 }}>
                  {editingDay ? "DONE" : "✎ EDIT"}
                </button>
              )}
              <button onClick={()=>{setSelDay(null);setEditingDay(false);}} style={{ background:"none",border:`1px solid #2d2d5a`,color:C.textDim,cursor:"pointer",width:30,height:30,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"inherit",fontSize:16,flexShrink:0 }}>✕</button>
            </div>
          </div>
          {editingDay && (
            <div style={{ fontSize:10, color:C.yellow, letterSpacing:"0.08em", marginBottom:10, padding:"7px 10px", background:"#1a1400", border:`1px solid ${C.yellow}44`, borderRadius:2 }}>
              ⚠ Editing past day — XP adjusts automatically
            </div>
          )}
          <StatBar pct={selPct} color={selPct===100?C.green:C.glow} height={6} />
          <div style={{ marginTop:16, display:"flex", flexDirection:"column", gap:10 }}>
            {selTabData.map(({ tab, tasks, done }) => {
              const pct = tasks.length ? Math.round((done.length/tasks.length)*100) : 0;
              return (
                <div key={tab.id} style={{ background:"#08081a", border:`1px solid ${pct===100?C.green+"44":"#1e1e3a"}`, borderLeft:`3px solid ${pct===100?C.green:C.panelBorder}`, borderRadius:2, padding:"10px 12px" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                    <span style={{ fontSize:12, fontWeight:600, color:pct===100?C.green:C.text, letterSpacing:"0.08em" }}>{tab.icon} {tab.label}</span>
                    <span style={{ fontSize:10, color:pct===100?C.green:C.textDim }}>{done.length}/{tasks.length}</span>
                  </div>
                  <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                    {tasks.map(task => {
                      const isDone = done.includes(task.id);
                      return editingDay ? (
                        <div key={task.id} onClick={()=>toggleCheck(tab.id, task.id, null, selDay)}
                          style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer", padding:"4px 2px", borderRadius:2, transition:"background 0.15s" }}>
                          <div style={{ width:16,height:16,borderRadius:2,flexShrink:0,border:`1.5px solid ${isDone?C.green:C.panelBorder}`,background:isDone?`${C.green}22`:"transparent",display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.15s" }}>
                            {isDone && <svg width="9" height="9" viewBox="0 0 12 12"><path d="M2 6l3 3 5-5" stroke={C.green} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>}
                          </div>
                          <span style={{ fontSize:12, color:isDone?C.green:C.text, textDecoration:isDone?"line-through":"none" }}>{task.text}</span>
                        </div>
                      ) : (
                        <div key={task.id} style={{ display:"flex", alignItems:"center", gap:8 }}>
                          <div style={{ width:7,height:7,borderRadius:"50%",flexShrink:0,background:isDone?C.green:"#2d2d5a",boxShadow:isDone?`0 0 5px ${C.green}`:"none" }} />
                          <span style={{ fontSize:11, color:isDone?C.green:C.textDim, textDecoration:isDone?"line-through":"none", opacity:isDone?0.8:0.55 }}>{task.text}</span>
                        </div>
                      );
                    })}
                  </div>
                  {/* Goals for this tab (edit mode only) */}
                  {editingDay && tab.goals && tab.goals.length > 0 && (
                    <div style={{ marginTop:8, paddingTop:8, borderTop:"1px solid #1e1e3a" }}>
                      <div style={{ fontSize:9, color:C.accent, letterSpacing:"0.15em", marginBottom:6 }}>OBJECTIVES</div>
                      {tab.goals.map(goal => {
                        const isDone = !!goalChecks[`${tab.id}::${goal.id}`];
                        return (
                          <div key={goal.id} onClick={()=>toggleGoal(tab.id, goal.id, null)}
                            style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer", padding:"4px 2px", borderRadius:2 }}>
                            <div style={{ width:16,height:16,borderRadius:2,flexShrink:0,border:`1.5px solid ${isDone?C.green:C.accent+"55"}`,background:isDone?`${C.green}22`:"transparent",display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.15s" }}>
                              {isDone && <svg width="9" height="9" viewBox="0 0 12 12"><path d="M2 6l3 3 5-5" stroke={C.green} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>}
                            </div>
                            <span style={{ fontSize:12, color:isDone?C.green:C.textDim, textDecoration:isDone?"line-through":"none" }}>{goal.text}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Finance Panel ─────────────────────────────────────────────────────────────
// ── Finance Goals & Net Worth (collapsed sub-panel shown on the Finance tab) ──
function FinanceGoalsPanel({ finData, setFinData, isMobile }) {
  const [open, setOpen] = useState(false);
  const savingsGoals = finData.savingsGoals || DEFAULT_SAVINGS_GOALS;
  const assets = finData.assets || [];
  const debts = finData.debts || [];
  const netWorth = assets.reduce((s, a) => s + Number(a.value), 0) - debts.reduce((s, d) => s + Number(d.value), 0);
  const nwColor = netWorth >= 0 ? C.green : C.red;

  const upd = (key, val) => setFinData(p => ({ ...p, [key]: val }));
  const setSGoal = (id, f, v) => upd("savingsGoals", savingsGoals.map(g => g.id === id ? { ...g, [f]: f === "label" ? v : Number(v) || 0 } : g));
  const addSGoal = () => upd("savingsGoals", [...savingsGoals, { id: `sg_${Date.now()}`, label: "New Goal", target: 1000, current: 0 }]);
  const delSGoal = (id) => upd("savingsGoals", savingsGoals.filter(g => g.id !== id));
  const setAsset = (id, f, v) => upd("assets", assets.map(a => a.id === id ? { ...a, [f]: f === "value" ? Number(v) || 0 : v } : a));
  const addAsset = () => upd("assets", [...assets, { id: `a_${Date.now()}`, label: "Asset", value: 0 }]);
  const delAsset = (id) => upd("assets", assets.filter(a => a.id !== id));
  const setDebt = (id, f, v) => upd("debts", debts.map(d => d.id === id ? { ...d, [f]: f === "value" ? Number(v) || 0 : v } : d));
  const addDebt = () => upd("debts", [...debts, { id: `d_${Date.now()}`, label: "Debt", value: 0 }]);
  const delDebt = (id) => upd("debts", debts.filter(d => d.id !== id));
  const lbl = (t) => <div style={{ fontSize: 9, color: C.accent, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 10 }}>{t}</div>;

  return (
    <div style={{ marginTop: 24 }}>
      <button onClick={() => setOpen(o => !o)} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 16px", background: open ? `${C.glow}14` : "transparent", border: `1px solid ${C.panelBorder}55`, borderRadius: 2, cursor: "pointer", fontFamily: "inherit", letterSpacing: "0.15em", textTransform: "uppercase" }}>
        <span style={{ fontSize: 10, color: C.textDim }}>◈ Goals &amp; Net Worth</span>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: nwColor, textShadow: `0 0 8px ${nwColor}88` }}>{netWorth < 0 ? "-" : ""}${Math.abs(netWorth).toLocaleString()}</span>
          <span style={{ fontSize: 13, color: C.accent }}>{open ? "▴" : "▾"}</span>
        </div>
      </button>

      {open && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 12 }}>
          {/* Savings Goals */}
          <div style={{ ...panelStyle({ padding: "18px", position: "relative" }) }}>
            <PanelCorners />
            {lbl("Savings Goals")}
            <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 12 }}>
              {savingsGoals.map(goal => {
                const pct = goal.target > 0 ? (goal.current / goal.target) * 100 : 0;
                const color = pct >= 100 ? C.green : pct > 50 ? C.accent : C.glow;
                return (
                  <div key={goal.id}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                      <Inp value={goal.label} onChange={e => setSGoal(goal.id, "label", e.target.value)} style={{ flex: 1, background: "transparent", border: "none", borderBottom: `1px solid #2d2d5a`, padding: "4px 0", fontSize: 13, fontWeight: 600 }} />
                      {pct >= 100 && <span style={{ fontSize: 10, color: C.green, textShadow: `0 0 8px ${C.green}` }}>✦ DONE</span>}
                      <button onClick={() => delSGoal(goal.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#4a4a6a", fontSize: 15, fontFamily: "inherit" }}>✕</button>
                    </div>
                    <StatBar pct={pct} color={color} height={8} />
                    <div style={{ display: "flex", gap: 10, marginTop: 8, alignItems: "flex-end" }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 9, color: C.textDim, marginBottom: 3 }}>CURRENT ($)</div>
                        <Inp type="number" value={goal.current} onChange={e => setSGoal(goal.id, "current", e.target.value)} style={{ width: "100%", padding: "6px 8px" }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 9, color: C.textDim, marginBottom: 3 }}>TARGET ($)</div>
                        <Inp type="number" value={goal.target} onChange={e => setSGoal(goal.id, "target", e.target.value)} style={{ width: "100%", padding: "6px 8px" }} />
                      </div>
                      <div style={{ textAlign: "right", paddingBottom: 2 }}>
                        <div style={{ fontSize: 20, fontWeight: 800, color, textShadow: `0 0 10px ${color}88`, lineHeight: 1 }}>{Math.min(100, Math.round(pct))}%</div>
                        <div style={{ fontSize: 9, color: C.textDim }}>${Math.max(0, goal.target - goal.current).toLocaleString()} left</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <Btn onClick={addSGoal} color={C.glow} style={{ fontSize: 10 }}>+ Add Goal</Btn>
          </div>

          {/* Net Worth */}
          <div style={{ ...panelStyle({ padding: "18px", position: "relative" }) }}>
            <PanelCorners />
            {lbl("Net Worth")}
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 12, marginBottom: 14 }}>
              <div>
                <div style={{ fontSize: 9, color: C.green, letterSpacing: "0.1em", marginBottom: 8 }}>ASSETS</div>
                {assets.map(a => (
                  <div key={a.id} style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 6 }}>
                    <Inp value={a.label} onChange={e => setAsset(a.id, "label", e.target.value)} placeholder="Asset" style={{ flex: 1, padding: "6px 8px" }} />
                    <span style={{ color: C.textDim, fontSize: 11 }}>$</span>
                    <Inp type="number" value={a.value} onChange={e => setAsset(a.id, "value", e.target.value)} style={{ width: 80, padding: "6px 8px" }} />
                    <button onClick={() => delAsset(a.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#4a4a6a", fontSize: 14, fontFamily: "inherit" }}>✕</button>
                  </div>
                ))}
                <Btn onClick={addAsset} color={C.green} style={{ fontSize: 9, padding: "6px 12px" }}>+ Asset</Btn>
              </div>
              <div>
                <div style={{ fontSize: 9, color: C.red, letterSpacing: "0.1em", marginBottom: 8 }}>DEBTS</div>
                {debts.map(d => (
                  <div key={d.id} style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 6 }}>
                    <Inp value={d.label} onChange={e => setDebt(d.id, "label", e.target.value)} placeholder="Debt" style={{ flex: 1, padding: "6px 8px" }} />
                    <span style={{ color: C.textDim, fontSize: 11 }}>$</span>
                    <Inp type="number" value={d.value} onChange={e => setDebt(d.id, "value", e.target.value)} style={{ width: 80, padding: "6px 8px" }} />
                    <button onClick={() => delDebt(d.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#4a4a6a", fontSize: 14, fontFamily: "inherit" }}>✕</button>
                  </div>
                ))}
                <Btn onClick={addDebt} color={C.red} style={{ fontSize: 9, padding: "6px 12px" }}>+ Debt</Btn>
              </div>
            </div>
            <div style={{ padding: "12px 16px", background: "#08081a", border: `1px solid ${nwColor}44`, borderRadius: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 10, color: C.textDim, letterSpacing: "0.12em" }}>NET WORTH</span>
              <span style={{ fontSize: 24, fontWeight: 800, color: nwColor, textShadow: `0 0 16px ${nwColor}88` }}>{netWorth < 0 ? "-" : ""}${Math.abs(netWorth).toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [authedUser, setAuthedUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  // Bootstrap Supabase + listen for auth state
  useEffect(() => {
    initSupabase().then(client => {
      if (!client) { setAuthReady(true); return; }
      supabase = client;
      supabase.auth.getSession().then(({ data }) => {
        setAuthedUser(data.session?.user ?? null);
        setAuthReady(true);
      });
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setAuthedUser(session?.user ?? null);
      });
      return () => subscription.unsubscribe();
    });
  }, []);

  if (!authReady) return (
    <div style={{ minHeight: "100vh", background: "#050510", display: "flex", alignItems: "center", justifyContent: "center", color: "#A855F7", fontFamily: "'Rajdhani', sans-serif", letterSpacing: "0.2em" }}>INITIALIZING...</div>
  );
  if (!authedUser && supabase) return <LoginScreen onLogin={() => {}} />;

  const saved = loadLocal();
  const [tabs, setTabs] = useState(() => {
    const saved_tabs = saved?.tabs;
    if (!saved_tabs || !saved_tabs.find(t => t.id === "health")) return defaultTabs;
    return saved_tabs;
  });
  const [activeTab, setActiveTab] = useState("fitness");
  const [checks, setChecks] = useState(saved?.checks || {});
  const [goalChecks, setGoalChecks] = useState(saved?.goalChecks || {});
  const [finData, setFinData] = useState(saved?.finData || { expenses: [], budgets: DEFAULT_BUDGETS, savingsGoals: DEFAULT_SAVINGS_GOALS, assets: [], debts: [] });
  const [calClientId, setCalClientId] = useState(saved?.calClientId || "");
  const [calConnected, setCalConnected] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [editing, setEditing] = useState(false);
  const [newTask, setNewTask] = useState("");
  const [newGoal, setNewGoal] = useState("");
  const [newTabName, setNewTabName] = useState("");
  const [toast, setToast] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState("local"); // local | syncing | synced | error
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [xpState, setXpState] = useState({ totalXP: saved?.totalXP || 0, xpLog: saved?.xpLog || {} });
  const [levelUpNotif, setLevelUpNotif] = useState(null);
  const [rankUpNotif, setRankUpNotif] = useState(null);
  const [history, setHistory] = useState(saved?.history || {});
  const [showHistory, setShowHistory] = useState(false);
  const [historySelDay, setHistorySelDay] = useState(null);
  const [soundMuted, setSoundMuted] = useState(saved?.soundMuted || false);
  const [xpPopups, setXpPopups] = useState([]);
  const [justChecked, setJustChecked] = useState(new Set());
  const [notifSettings, setNotifSettings] = useState(saved?.notifSettings || { enabled: false, morningTime: "08:00", eveningTime: "20:00", morningMsg: "Time to complete your daily quests, Hunter!", eveningMsg: "" });
  const [notifPermission, setNotifPermission] = useState("default");
  const [confirmReset, setConfirmReset] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);
  const [fabMode, setFabMode] = useState(null);
  const [fabExpense, setFabExpense] = useState({ amount: "", category: "", note: "" });
  const [fabTaskSearch, setFabTaskSearch] = useState("");
  const [lastExpenseCat, setLastExpenseCat] = useState(saved?.lastExpenseCat || "Food");
  const sbRef = useRef(null);
  const today = todayKey();

  // ── XP / Level helpers ──
  const xpForLevel = (n) => Math.floor(100 * Math.pow(n, 1.5));
  const computeLevel = (xp) => { let lvl = 1; while (xpForLevel(lvl + 1) <= xp) lvl++; return lvl; };
  const { totalXP, xpLog } = xpState;
  const currentLevel = computeLevel(totalXP);
  const currentLevelXP = xpForLevel(currentLevel);
  const nextLevelXP = xpForLevel(currentLevel + 1);
  const xpIntoLevel = totalXP - currentLevelXP;
  const xpNeeded = nextLevelXP - currentLevelXP;
  const levelPct = Math.round((xpIntoLevel / xpNeeded) * 100);
  const currentRank = getRank(currentLevel);

  // Debug: grant a big chunk of XP to skip levels (button shown in header)
  const debugAddLevels = () => {
    const jumpXP = xpForLevel(currentLevel + 10) - totalXP + 50;
    setXpState(prev => {
      const newXP = prev.totalXP + jumpXP;
      const oldLevel = computeLevel(prev.totalXP);
      const newLevel = computeLevel(newXP);
      const oldRank = getRank(oldLevel);
      const newRank = getRank(newLevel);
      setTimeout(() => {
        setLevelUpNotif({ level: newLevel });
        setTimeout(() => setLevelUpNotif(null), 4000);
        if (newRank.letter !== oldRank.letter) setRankUpNotif(newRank);
      }, 0);
      return { totalXP: newXP, xpLog: prev.xpLog };
    });
  };

  // Debug: backfill 35 days of random history
  const debugBackfill = () => {
    const newChecks = { ...checks };
    const newHistory = { ...history };
    const allTabs = tabs;
    for (let daysAgo = 1; daysAgo <= 35; daysAgo++) {
      const d = new Date(); d.setDate(d.getDate() - daysAgo);
      const dateStr = d.toISOString().slice(0,10);
      // Random day: 0%,20%,40%,60%,80%,100% weighted toward middle
      const roll = Math.random();
      const pct = roll < 0.10 ? 0 : roll < 0.20 ? 0.25 : roll < 0.50 ? 0.60 : roll < 0.80 ? 0.85 : 1.0;
      const snap = {};
      allTabs.forEach(tab => {
        const daily = tab.tasks.filter(t => t.freq === "daily");
        const numDone = Math.round(daily.length * pct);
        const shuffled = [...daily].sort(() => Math.random() - 0.5);
        const done = shuffled.slice(0, numDone).map(t => t.id);
        done.forEach(tid => { newChecks[`${dateStr}::${tab.id}::${tid}`] = true; });
        snap[tab.id] = { label:tab.label, icon:tab.icon, tasks:daily.map(t=>({id:t.id,text:t.text})), done };
      });
      const totalDaily = allTabs.reduce((s,t)=>s+t.tasks.filter(tk=>tk.freq==="daily").length,0);
      const totalDone  = allTabs.reduce((s,t)=>s+Object.keys(newChecks).filter(k=>k.startsWith(`${dateStr}::${t.id}::`)&&newChecks[k]).length,0);
      newHistory[dateStr] = { snap, xpDay: totalDone * 10 };
    }
    setChecks(newChecks);
    setHistory(newHistory);
  };

  const awardXP = (amount, key) => {
    setXpState(prev => {
      if (prev.xpLog[key]) return prev;
      const newXP = prev.totalXP + amount;
      const oldLevel = computeLevel(prev.totalXP);
      const newLevel = computeLevel(newXP);
      if (newLevel > oldLevel) {
        const oldRank = getRank(oldLevel);
        const newRank = getRank(newLevel);
        setTimeout(() => {
          setLevelUpNotif({ level: newLevel });
          setTimeout(() => setLevelUpNotif(null), 4000);
          if (newRank.letter !== oldRank.letter) {
            setRankUpNotif(newRank);
          }
        }, 0);
      }
      return { totalXP: newXP, xpLog: { ...prev.xpLog, [key]: true } };
    });
  };
  const removeXP = (amount, key) => {
    setXpState(prev => {
      if (!prev.xpLog[key]) return prev;
      const newLog = { ...prev.xpLog };
      delete newLog[key];
      return { totalXP: Math.max(0, prev.totalXP - amount), xpLog: newLog };
    });
  };

  const prefersRM = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const playSound = useCallback((type) => {
    if (soundMuted || prefersRM()) return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const gain = ctx.createGain();
      gain.connect(ctx.destination);
      if (type === "task") {
        const o = ctx.createOscillator(); o.type = "sine"; o.connect(gain);
        o.frequency.setValueAtTime(880, ctx.currentTime);
        o.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);
        o.start(); o.stop(ctx.currentTime + 0.22);
      } else if (type === "bonus") {
        [880, 1100, 1320].forEach((freq, i) => {
          const o = ctx.createOscillator(); o.type = "triangle"; o.connect(gain);
          o.frequency.value = freq;
          o.start(ctx.currentTime + i * 0.09); o.stop(ctx.currentTime + i * 0.09 + 0.13);
        });
        gain.gain.setValueAtTime(0.09, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
      } else if (type === "goal") {
        [523, 659, 784, 1047].forEach((freq, i) => {
          const o = ctx.createOscillator(); o.type = "sine"; o.connect(gain);
          o.frequency.value = freq;
          o.start(ctx.currentTime + i * 0.11); o.stop(ctx.currentTime + i * 0.11 + 0.17);
        });
        gain.gain.setValueAtTime(0.09, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
      }
    } catch {}
  }, [soundMuted]);

  const showXpPopup = useCallback((text, e, color = C.green) => {
    if (prefersRM()) return;
    const id = Date.now() + Math.random();
    const x = e?.clientX ?? window.innerWidth / 2;
    const y = e?.clientY ?? window.innerHeight / 3;
    setXpPopups(prev => [...prev, { id, text, x, y, color }]);
    setTimeout(() => setXpPopups(prev => prev.filter(p => p.id !== id)), 1600);
  }, []);

  const requestNotifPermission = useCallback(async () => {
    if (!("Notification" in window)) { setNotifPermission("unsupported"); return; }
    const perm = await Notification.requestPermission();
    setNotifPermission(perm);
  }, []);

  // Responsive
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  // Close sidebar on outside tap (mobile)
  useEffect(() => {
    if (!isMobile || !showSidebar) return;
    const handler = (e) => { if (sbRef.current && !sbRef.current.contains(e.target)) setShowSidebar(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isMobile, showSidebar]);

  // Daily snapshot — write today's completion into history whenever checks or tabs change
  useEffect(() => {
    const dateKey = todayKey();
    const snap = {};
    tabs.forEach(tab => {
      const daily = tab.tasks.filter(t => t.freq === "daily");
      const done  = daily.filter(t => !!checks[`${dateKey}::${tab.id}::${t.id}`]).map(t => t.id);
      snap[tab.id] = { label: tab.label, icon: tab.icon, tasks: daily.map(t=>({id:t.id,text:t.text})), done };
    });
    // Compute today's XP from xpLog
    let xpDay = 0;
    for (const k of Object.keys(xpState.xpLog)) {
      if (k.startsWith(`xp::task::${dateKey}::`)) xpDay += 10;
      if (k.startsWith(`xp::bonus::${dateKey}::`)) xpDay += 25;
    }
    setHistory(prev => ({ ...prev, [dateKey]: { snap, xpDay } }));
  }, [checks, tabs]); // xpState intentionally omitted — xpDay updates on next check toggle

  // Load data from Supabase once authed
  useEffect(() => {
    if (!supabase || !authedUser) return;
    supabase.from("lifetracker").select("data").eq("id", authedUser.id).single().then(({ data }) => {
      if (data?.data) {
        const d = data.data;
        if (d.tabs && d.tabs.find(t => t.id === "health")) setTabs(d.tabs);
        if (d.checks) setChecks(d.checks);
        if (d.goalChecks) setGoalChecks(d.goalChecks);
        if (d.finData) setFinData(d.finData);
        if (d.calClientId) setCalClientId(d.calClientId);
        if (d.totalXP !== undefined || d.xpLog) setXpState({ totalXP: d.totalXP || 0, xpLog: d.xpLog || {} });
        if (d.history) setHistory(d.history);
        if (d.soundMuted !== undefined) setSoundMuted(d.soundMuted);
        if (d.notifSettings) setNotifSettings(d.notifSettings);
        if (d.lastExpenseCat) setLastExpenseCat(d.lastExpenseCat);
        setSyncStatus("synced");
      }
    });
  }, [authedUser]);

  // Recompute history snapshot when editing a past day
  useEffect(() => {
    if (!historySelDay || historySelDay === today) return;
    const snap = {};
    tabs.forEach(tab => {
      const daily = tab.tasks.filter(t => t.freq === "daily");
      const done = daily.filter(t => !!checks[`${historySelDay}::${tab.id}::${t.id}`]).map(t => t.id);
      snap[tab.id] = { label: tab.label, icon: tab.icon, tasks: daily.map(t=>({id:t.id,text:t.text})), done };
    });
    let xpDay = 0;
    for (const k of Object.keys(xpState.xpLog)) {
      if (k.startsWith(`xp::task::${historySelDay}::`)) xpDay += 10;
      if (k.startsWith(`xp::bonus::${historySelDay}::`)) xpDay += 25;
    }
    setHistory(prev => ({ ...prev, [historySelDay]: { snap, xpDay } }));
  }, [checks, xpState, historySelDay]);

  // Notification permission probe (SW registered by vite-plugin-pwa)
  useEffect(() => {
    if (!("Notification" in window)) setNotifPermission("unsupported");
    else setNotifPermission(Notification.permission);
  }, []);

  // Notification scheduling
  useEffect(() => {
    if (!notifSettings.enabled || notifPermission !== "granted") return;
    const schedule = (timeStr, getMsg) => {
      const [h, m] = timeStr.split(":").map(Number);
      const now = new Date(), target = new Date();
      target.setHours(h, m, 0, 0);
      if (target <= now) target.setDate(target.getDate() + 1);
      return setTimeout(async () => {
        try {
          const body = getMsg();
          if ("serviceWorker" in navigator) {
            const reg = await navigator.serviceWorker.ready;
            reg.showNotification("Level Up!", { body, icon: "/favicon.svg", tag: "lt-reminder", renotify: true });
          } else { new Notification("Level Up!", { body }); }
        } catch {}
      }, target - now);
    };
    const activeDates = new Set();
    for (const [k, v] of Object.entries(checks)) { if (v) activeDates.add(k.split("::")[0]); }
    let streak = 0; const d = new Date(); d.setHours(0,0,0,0);
    if (!activeDates.has(d.toISOString().slice(0,10))) d.setDate(d.getDate()-1);
    while (activeDates.has(d.toISOString().slice(0,10))) { streak++; d.setDate(d.getDate()-1); }
    const incomplete = tabs.filter(t=>t.id!=="finance").reduce((s,t)=>s+t.tasks.filter(tk=>tk.freq==="daily"&&!checks[`${todayKey()}::${t.id}::${tk.id}`]).length, 0);
    const t1 = schedule(notifSettings.morningTime, () => notifSettings.morningMsg || "Time to complete your daily quests, Hunter!");
    const t2 = schedule(notifSettings.eveningTime, () => {
      if (notifSettings.eveningMsg) return notifSettings.eveningMsg;
      if (incomplete > 0 && streak > 0) return `${incomplete} task${incomplete>1?"s":""} left to keep your ${streak}-day streak alive!`;
      if (incomplete > 0) return `${incomplete} daily task${incomplete>1?"s":""} still incomplete!`;
      return "All quests complete today! The Shadow Monarch grows stronger.";
    });
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [notifSettings, notifPermission, checks, tabs]);

  // Debounced save
  const saveTimer = useRef(null);
  const saveAll = useCallback((state) => {
    saveLocal(state);
    if (!supabase || !authedUser) return;
    clearTimeout(saveTimer.current);
    setSyncStatus("syncing");
    saveTimer.current = setTimeout(() => {
      supabase.from("lifetracker").upsert({ id: authedUser.id, data: state, updated_at: new Date().toISOString() })
        .then(({ error }) => setSyncStatus(error ? "error" : "synced"))
        .catch(() => setSyncStatus("error"));
    }, 1500);
  }, [authedUser]);

  useEffect(() => {
    const state = { tabs, checks, goalChecks, finData, calClientId, totalXP: xpState.totalXP, xpLog: xpState.xpLog, history, soundMuted, notifSettings, lastExpenseCat };
    saveAll(state);
  }, [tabs, checks, goalChecks, finData, calClientId, xpState, history, soundMuted, notifSettings, lastExpenseCat, saveAll]);

  const toast$ = (msg, type = "ok") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  const checked = (tid, taskId) => !!checks[`${today}::${tid}::${taskId}`];
  const goalDone = (tid, gid) => !!goalChecks[`${tid}::${gid}`];

  const toggleCheck = (tid, taskId, e, date = today) => {
    const k = `${date}::${tid}::${taskId}`;
    const wasChecked = !!checks[k];
    const isToday = date === today;
    setChecks(p => ({ ...p, [k]: !p[k] }));
    if (!wasChecked) {
      awardXP(10, `xp::task::${k}`);
      if (isToday) {
        playSound("task");
        showXpPopup("+10 XP", e);
        const burstKey = `${tid}::${taskId}`;
        setJustChecked(prev => new Set([...prev, burstKey]));
        setTimeout(() => setJustChecked(prev => { const n = new Set(prev); n.delete(burstKey); return n; }), 550);
      }
      const tab = tabs.find(t => t.id === tid);
      if (tab) {
        const daily = tab.tasks.filter(t => t.freq === "daily");
        const allDone = daily.length > 0 && daily.every(t =>
          t.id === taskId || !!checks[`${date}::${tid}::${t.id}`]
        );
        if (allDone) {
          awardXP(25, `xp::bonus::${date}::${tid}`);
          if (isToday) setTimeout(() => { playSound("bonus"); showXpPopup("+25 XP · CATEGORY BONUS!", e, C.glow); }, 250);
        }
      }
    } else {
      removeXP(10, `xp::task::${k}`);
      removeXP(25, `xp::bonus::${date}::${tid}`);
    }
  };

  const toggleGoal = (tid, gid, e) => {
    const wasChecked = !!goalChecks[`${tid}::${gid}`];
    setGoalChecks(p => ({ ...p, [`${tid}::${gid}`]: !p[`${tid}::${gid}`] }));
    if (!wasChecked) {
      awardXP(100, `xp::goal::${tid}::${gid}`);
      playSound("goal");
      showXpPopup("+100 XP · QUEST COMPLETE!", e, C.yellow);
    } else removeXP(100, `xp::goal::${tid}::${gid}`);
  };

  const tabPct = (tab) => {
    const daily = tab.tasks.filter(t => t.freq === "daily");
    if (!daily.length) return 0;
    return Math.round(daily.filter(t => checked(tab.id, t.id)).length / daily.length * 100);
  };

  const addTask = (tid) => { if (!newTask.trim()) return; setTabs(p => p.map(t => t.id !== tid ? t : { ...t, tasks: [...t.tasks, { id: `tk_${Date.now()}`, text: newTask.trim(), freq: "daily" }] })); setNewTask(""); };
  const remTask = (tid, taskId) => setTabs(p => p.map(t => t.id !== tid ? t : { ...t, tasks: t.tasks.filter(x => x.id !== taskId) }));
  const addGoalItem = (tid) => { if (!newGoal.trim()) return; setTabs(p => p.map(t => t.id !== tid ? t : { ...t, goals: [...t.goals, { id: `g_${Date.now()}`, text: newGoal.trim() }] })); setNewGoal(""); };
  const remGoal = (tid, gid) => setTabs(p => p.map(t => t.id !== tid ? t : { ...t, goals: t.goals.filter(g => g.id !== gid) }));

  const addTab = () => {
    if (!newTabName.trim()) return;
    const stats = ["STR", "VIT", "INT", "AGI", "PER", "SEN", "WIS", "LUK"];
    const icons = ["⚔️", "🌿", "📜", "💠", "💎", "✨", "🔥", "🧬"];
    const id = `tab_${Date.now()}`;
    setTabs(p => [...p, { id, label: newTabName.trim(), icon: icons[p.length % icons.length], stat: stats[p.length % stats.length], tasks: [], goals: [] }]);
    setActiveTab(id); setNewTabName(""); setShowSettings(false);
    toast$(`"${newTabName.trim()}" quest log created`);
  };

  const connectCalendar = () => {
    if (!calClientId.trim()) { toast$("Enter your Google Client ID in Settings", "err"); return; }
    setSyncing(true);
    const load = () => {
      window.gapi.load("client:auth2", async () => {
        try {
          await window.gapi.client.init({ clientId: calClientId.trim(), scope: "https://www.googleapis.com/auth/calendar.events", discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"] });
          if (!window.gapi.auth2.getAuthInstance().isSignedIn.get()) await window.gapi.auth2.getAuthInstance().signIn();
          setCalConnected(true); setSyncing(false); toast$("Calendar linked!");
        } catch { setSyncing(false); toast$("Connection failed", "err"); }
      });
    };
    if (!window.gapi) { const s = document.createElement("script"); s.src = "https://apis.google.com/js/api.js"; s.onload = load; document.head.appendChild(s); } else load();
  };

  const syncCal = async () => {
    if (!calConnected) { connectCalendar(); return; }
    setSyncing(true);
    try {
      const tab = tabs.find(t => t.id === activeTab);
      const start = new Date(); start.setHours(8, 0, 0, 0); const end = new Date(); end.setHours(9, 0, 0, 0);
      await window.gapi.client.calendar.events.insert({ calendarId: "primary", resource: { summary: `[LifeTracker] ${tab.label}`, start: { dateTime: start.toISOString() }, end: { dateTime: end.toISOString() }, description: tab.tasks.map(t => `• ${t.text}`).join("\n") } });
      setSyncing(false); toast$(`${tab.label} synced to Calendar`);
    } catch { setSyncing(false); toast$("Sync failed", "err"); }
  };

  const cur = tabs.find(t => t.id === activeTab) || tabs[0];
  const pct = cur ? tabPct(cur) : 0;
  const overallPct = Math.round(tabs.reduce((s, t) => s + tabPct(t), 0) / (tabs.length || 1));
  const isFinance = false; // Finance tab now uses normal task/goal UI

  const syncLabel = { local: "LOCAL", syncing: "SAVING…", synced: "SYNCED ●", error: "SYNC ERR" }[syncStatus];
  const syncColor = { local: C.textDim, syncing: C.yellow, synced: C.green, error: C.red }[syncStatus];

  // ── Sidebar content ──
  const SidebarContent = () => (
    <div style={{ padding: "20px 10px", display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ fontSize: 10, color: C.accent, letterSpacing: "0.2em", textTransform: "uppercase", margin: "0 8px 12px", opacity: 0.7 }}>Quest Logs</div>
      <div style={{ flex: 1, overflowY: "auto" }}>
        {tabs.map(tab => {
          const p = tabPct(tab); const active = tab.id === activeTab;
          return (
            <button key={tab.id} onClick={() => { setActiveTab(tab.id); setEditing(false); setShowSidebar(false); }} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "12px 12px", borderRadius: 2, border: "none", background: active ? `${C.glow}18` : "transparent", borderLeft: `2px solid ${active ? C.glowBright : "transparent"}`, cursor: "pointer", marginBottom: 2, transition: "all 0.15s" }}>
              <span style={{ fontSize: 18, filter: active ? `drop-shadow(0 0 6px ${C.glowBright})` : "none" }}>{tab.icon}</span>
              <div style={{ flex: 1, textAlign: "left" }}>
                <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: active ? C.glowBright : C.textDim, textShadow: active ? `0 0 10px ${C.glowBright}` : "none" }}>{tab.label}</div>
                {p > 0 && <div style={{ marginTop: 5 }}><StatBar pct={p} /></div>}
              </div>
              <span style={{ fontSize: 10, color: p === 100 ? C.green : C.textDim }}>{p}%</span>
            </button>
          );
        })}
      </div>
      <button onClick={() => setShowSettings(true)} style={{ margin: "12px 0 0", padding: "10px 12px", border: `1px dashed ${C.panelBorder}44`, background: "transparent", color: C.textDim, fontFamily: "inherit", fontSize: 11, cursor: "pointer", letterSpacing: "0.12em", textTransform: "uppercase" }}>+ New Log</button>

      {/* Player Status Panel */}
      <div style={{ ...panelStyle({ padding: "16px", marginTop: 16, position: "relative", border: `1px solid ${currentRank.color}66`, boxShadow: `0 0 12px ${currentRank.color}44,0 0 2px ${currentRank.color}` }) }}>
        <PanelCorners />
        <div style={{ fontSize: 9, color: currentRank.color, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 10, textAlign: "center", textShadow: `0 0 8px ${currentRank.color}` }}>◈ Player Status ◈</div>
        {/* Rank badge + Level side by side */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 8 }}>
          <RankBadge rank={currentRank} size="lg" />
          <div style={{ textAlign: "left" }}>
            <div style={{ fontSize: 9, color: C.textDim, letterSpacing: "0.15em", textTransform: "uppercase" }}>Level</div>
            <div style={{ fontSize: 44, fontWeight: 800, lineHeight: 1, color: currentRank.color, textShadow: `0 0 20px ${currentRank.color},0 0 40px ${currentRank.color}88` }}>{currentLevel}</div>
          </div>
        </div>
        {/* Rank title */}
        <div style={{ textAlign: "center", marginBottom: 12 }}>
          <span style={{ fontSize: 10, color: currentRank.color, letterSpacing: "0.18em", textTransform: "uppercase", textShadow: `0 0 10px ${currentRank.color}88` }}>{currentRank.letter}-RANK · {currentRank.title}</span>
        </div>
        {/* XP Bar */}
        <div style={{ marginBottom: 6 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ fontSize: 9, color: C.textDim, letterSpacing: "0.1em" }}>EXP</span>
            <span style={{ fontSize: 9, color: currentRank.color }}>{xpIntoLevel} / {xpNeeded}</span>
          </div>
          <StatBar pct={levelPct} color={currentRank.color} height={8} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
          <span style={{ fontSize: 9, color: C.textDim, letterSpacing: "0.08em" }}>TOTAL XP</span>
          <span style={{ fontSize: 9, color: currentRank.color, fontWeight: 700 }}>{totalXP.toLocaleString()}</span>
        </div>
        <div style={{ padding: "8px 10px", background: "#08081a", border: `1px solid ${currentRank.color}33`, borderRadius: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 9, color: C.textDim, letterSpacing: "0.08em" }}>TO NEXT LEVEL</span>
          <span style={{ fontSize: 11, color: currentRank.color, fontWeight: 700 }}>{(xpNeeded - xpIntoLevel).toLocaleString()} XP</span>
        </div>
        {/* Today's score + sync */}
        <div style={{ marginTop: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 9, color: C.textDim, letterSpacing: "0.08em" }}>TODAY</span>
          <span style={{ fontSize: 9, color: overallPct === 100 ? C.green : C.textDim }}>{overallPct}% complete</span>
        </div>
        <div style={{ marginTop: 6 }}><StatBar pct={overallPct} color={overallPct === 100 ? C.green : currentRank.color} /></div>
        <div style={{ marginTop: 8, fontSize: 9, color: syncColor, letterSpacing: "0.1em", textAlign: "center" }}>{syncLabel}</div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Rajdhani','Share Tech Mono',monospace", color: C.text }}>
      {/* Ambient glow */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, background: `radial-gradient(ellipse 60% 40% at 50% 0%,#3b0764 0%,transparent 60%),radial-gradient(ellipse 40% 30% at 0% 100%,#1e1b4b 0%,transparent 50%),radial-gradient(ellipse 40% 30% at 100% 100%,#3b0764 0%,transparent 50%)` }} />
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, background: "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(168,85,247,0.015) 2px,rgba(168,85,247,0.015) 4px)" }} />

      {/* Rank-up full-screen overlay */}
      {rankUpNotif && (
        <div onClick={() => setRankUpNotif(null)} style={{ position: "fixed", inset: 0, zIndex: 11000, background: "rgba(0,0,5,0.92)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", animation: "fadeIn 0.3s ease" }}>
          {/* Radial glow behind */}
          <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse 60% 50% at 50% 50%,${rankUpNotif.color}22 0%,transparent 70%)`, pointerEvents: "none" }} />
          <div style={{ textAlign: "center", position: "relative", animation: "rankUpAnim 0.5s cubic-bezier(0.175,0.885,0.32,1.275)" }}>
            {/* Giant rank letter */}
            <div style={{ fontSize: 160, fontWeight: 800, lineHeight: 1, color: rankUpNotif.color, textShadow: `0 0 40px ${rankUpNotif.color},0 0 80px ${rankUpNotif.color},0 0 160px ${rankUpNotif.color}88`, letterSpacing: "-0.02em", fontFamily: "'Rajdhani','Share Tech Mono',monospace" }}>
              {rankUpNotif.letter}
            </div>
            <div style={{ fontSize: 11, color: C.textDim, letterSpacing: "0.35em", textTransform: "uppercase", marginTop: -8, marginBottom: 20 }}>— RANK —</div>
            <div style={{ fontSize: 32, fontWeight: 700, color: rankUpNotif.color, letterSpacing: "0.25em", textTransform: "uppercase", textShadow: `0 0 20px ${rankUpNotif.color}`, marginBottom: 10 }}>RANK UP</div>
            <div style={{ fontSize: 14, color: C.text, letterSpacing: "0.12em", marginBottom: 6 }}>
              You have risen to <span style={{ color: rankUpNotif.color, fontWeight: 700 }}>{rankUpNotif.letter}-RANK</span>
            </div>
            <div style={{ fontSize: 18, color: rankUpNotif.color, letterSpacing: "0.15em", textShadow: `0 0 12px ${rankUpNotif.color}88`, marginBottom: 32 }}>
              {rankUpNotif.title}
            </div>
            {/* Horizontal separator with glow */}
            <div style={{ width: 200, height: 1, background: `linear-gradient(90deg,transparent,${rankUpNotif.color},transparent)`, margin: "0 auto 24px", boxShadow: `0 0 8px ${rankUpNotif.color}` }} />
            <div style={{ fontSize: 10, color: C.textDim, letterSpacing: "0.2em" }}>TAP TO CONTINUE</div>
          </div>
        </div>
      )}

      {/* Level-up notification */}
      {levelUpNotif && (
        <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", zIndex: 10000, textAlign: "center", pointerEvents: "none", animation: "levelUpAnim 0.4s ease" }}>
          <div style={{ padding: "28px 48px", background: "linear-gradient(135deg,#1a0030,#0a0018)", border: `2px solid ${C.glowBright}`, boxShadow: `0 0 40px ${C.glowBright},0 0 80px ${C.glow},0 0 120px ${C.glow}44,inset 0 0 40px ${C.glow}22`, borderRadius: 4, position: "relative" }}>
            <PanelCorners />
            <div style={{ fontSize: 10, color: C.accent, letterSpacing: "0.3em", textTransform: "uppercase", marginBottom: 6 }}>◈ Arise ◈</div>
            <div style={{ fontSize: 42, fontWeight: 800, color: C.glowBright, textShadow: `0 0 30px ${C.glowBright},0 0 60px ${C.glow}`, letterSpacing: "0.1em" }}>LEVEL UP!</div>
            <div style={{ fontSize: 16, color: C.accent, marginTop: 6, letterSpacing: "0.2em" }}>LEVEL {levelUpNotif.level}</div>
            <div style={{ fontSize: 11, color: C.textDim, marginTop: 4, letterSpacing: "0.1em" }}>Shadow Monarch grows stronger</div>
          </div>
        </div>
      )}

      {/* XP float popups */}
      {xpPopups.map(p => (
        <div key={p.id} style={{ position: "fixed", left: p.x, top: p.y, transform: "translateX(-50%)", zIndex: 20000, pointerEvents: "none", animation: "xpFloat 1.6s ease forwards", fontSize: 13, fontWeight: 700, color: p.color, textShadow: `0 0 12px ${p.color}`, letterSpacing: "0.08em", whiteSpace: "nowrap" }}>{p.text}</div>
      ))}

      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)", zIndex: 9999, padding: "10px 24px", background: toast.type === "err" ? "#3b0000" : "#0a1a10", border: `1px solid ${toast.type === "err" ? C.red : C.green}`, boxShadow: `0 0 20px ${toast.type === "err" ? C.red : C.green}66`, color: toast.type === "err" ? "#FCA5A5" : C.green, borderRadius: 3, fontSize: 14, fontFamily: "inherit", letterSpacing: "0.05em", animation: "fadeIn 0.2s ease", whiteSpace: "nowrap" }}>
          ▸ {toast.msg}
        </div>
      )}

      {/* Mobile sidebar overlay */}
      {isMobile && showSidebar && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,5,0.7)", zIndex: 200 }}>
          <div ref={sbRef} style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 240, background: "#060612", borderRight: `1px solid ${C.panelBorder}`, display: "flex", flexDirection: "column" }}>
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Settings modal */}
      {showSettings && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,5,0.85)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={() => { setShowSettings(false); setConfirmReset(false); }}>
          <div style={{ ...panelStyle({ padding: 28, width: "100%", maxWidth: 460, maxHeight: "85vh", overflowY: "auto", position: "relative" }) }} onClick={e => e.stopPropagation()}>
            <PanelCorners />
            <div style={{ fontSize: 10, color: C.accent, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 4 }}>System Config</div>
            <h2 style={{ margin: "0 0 22px", fontSize: 22, color: C.glowBright, textShadow: `0 0 20px ${C.glowBright}` }}>SETTINGS</h2>

            <div style={{ marginBottom: 22 }}>
              <div style={{ fontSize: 10, color: C.accent, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 8 }}>Cloud Sync (Supabase)</div>
              <p style={{ fontSize: 12, color: C.textDim, marginBottom: 8 }}>
                Add <strong style={{ color: C.accent }}>VITE_SUPABASE_URL</strong> and <strong style={{ color: C.accent }}>VITE_SUPABASE_KEY</strong> as environment variables in Vercel to enable cross-device sync.
              </p>
              <div style={{ padding: "10px 14px", background: "#0a0a1e", border: `1px solid ${syncColor}44`, borderRadius: 2, fontSize: 12, color: syncColor }}>
                Status: {syncLabel}
              </div>
            </div>

            <div style={{ marginBottom: 22 }}>
              <div style={{ fontSize: 10, color: C.accent, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 8 }}>Google Calendar — Client ID</div>
              <Inp value={calClientId} onChange={e => setCalClientId(e.target.value)} placeholder="123456789-abc.apps.googleusercontent.com" style={{ width: "100%", marginBottom: 10 }} />
              <Btn onClick={() => { setShowSettings(false); connectCalendar(); }} color={C.glow}>{calConnected ? "RECONNECT" : "LINK CALENDAR"}</Btn>
            </div>

            <div style={{ marginBottom: 22 }}>
              <div style={{ fontSize: 10, color: C.accent, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 8 }}>Add New Quest Log</div>
              <div style={{ display: "flex", gap: 8 }}>
                <Inp value={newTabName} onChange={e => setNewTabName(e.target.value)} onKeyDown={e => e.key === "Enter" && addTab()} placeholder="e.g. Sleep, Mindfulness…" style={{ flex: 1 }} />
                <Btn onClick={addTab} color={C.glow}>ADD</Btn>
              </div>
            </div>

            <div style={{ marginBottom: 22 }}>
              <div style={{ fontSize: 10, color: C.accent, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 10 }}>Sound Effects</div>
              <button onClick={() => setSoundMuted(m => !m)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: soundMuted ? "#1a0a0a" : "#0a1a10", border: `1px solid ${soundMuted ? C.red+"66" : C.green+"66"}`, borderRadius: 2, cursor: "pointer", color: soundMuted ? C.red : C.green, fontFamily: "inherit", fontSize: 12, letterSpacing: "0.1em" }}>
                <span style={{ fontSize: 16 }}>{soundMuted ? "🔇" : "🔊"}</span>
                {soundMuted ? "SOUND MUTED — click to unmute" : "SOUND ON — click to mute"}
              </button>
            </div>

            <div style={{ marginBottom: 22 }}>
              <div style={{ fontSize: 10, color: C.accent, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 10 }}>Push Notification Reminders</div>
              {notifPermission === "unsupported" ? (
                <div style={{ fontSize: 12, color: C.textDim, padding: "10px", background: "#0a0a1e", border: "1px solid #2d2d5a", borderRadius: 2 }}>Notifications not supported in this browser.</div>
              ) : notifPermission === "denied" ? (
                <div style={{ fontSize: 12, color: C.red, padding: "10px", background: "#1a0a0a", border: `1px solid ${C.red}44`, borderRadius: 2 }}>Permission denied. Enable notifications in your browser settings, then reload.</div>
              ) : notifPermission !== "granted" ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <p style={{ fontSize: 12, color: C.textDim, margin: 0 }}>Grant permission to receive daily reminders even when the app is in the background.</p>
                  <Btn onClick={requestNotifPermission} color={C.accent}>Enable Notifications</Btn>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <button onClick={() => setNotifSettings(p => ({ ...p, enabled: !p.enabled }))} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: notifSettings.enabled ? "#0a1a10" : "transparent", border: `1px solid ${notifSettings.enabled ? C.green+"66" : "#2d2d5a"}`, borderRadius: 2, cursor: "pointer", color: notifSettings.enabled ? C.green : C.textDim, fontFamily: "inherit", fontSize: 12, letterSpacing: "0.1em" }}>
                    <span style={{ fontSize: 16 }}>{notifSettings.enabled ? "🔔" : "🔕"}</span>
                    {notifSettings.enabled ? "REMINDERS ON" : "REMINDERS OFF"}
                  </button>
                  {notifSettings.enabled && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {[["morningTime","morningMsg","Morning reminder time","Morning message"],["eveningTime","eveningMsg","Evening reminder time","Evening message (leave blank for auto streak message)"]].map(([tk,mk,tl,ml]) => (
                        <div key={tk} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                          <div style={{ display: "flex", gap: 8 }}>
                            <div style={{ flex: "0 0 auto" }}>
                              <div style={{ fontSize: 9, color: C.textDim, letterSpacing: "0.1em", marginBottom: 4 }}>{tl.toUpperCase()}</div>
                              <Inp type="time" value={notifSettings[tk]} onChange={e => setNotifSettings(p => ({ ...p, [tk]: e.target.value }))} style={{ width: 110 }} />
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: 9, color: C.textDim, letterSpacing: "0.1em", marginBottom: 4 }}>{ml.toUpperCase()}</div>
                              <Inp value={notifSettings[mk]} onChange={e => setNotifSettings(p => ({ ...p, [mk]: e.target.value }))} placeholder={mk === "eveningMsg" ? "Auto (streak-based)" : "Enter message…"} style={{ width: "100%" }} />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div style={{ marginBottom: 22, padding: "14px", background: "#0a0a1e", border: `1px solid #2d2d5a`, borderRadius: 2 }}>
              <div style={{ fontSize: 10, color: C.accent, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 8 }}>Install as App (PWA)</div>
              <p style={{ fontSize: 12, color: C.textDim, lineHeight: 1.6 }}>
                <strong style={{ color: C.text }}>iPhone:</strong> Safari → Share → "Add to Home Screen"<br />
                <strong style={{ color: C.text }}>Android:</strong> Chrome → Menu → "Add to Home Screen"<br />
                <strong style={{ color: C.text }}>Desktop:</strong> Click the install icon in your browser's address bar
              </p>
            </div>

            <div style={{ marginBottom: 22, padding: "16px", background: "#1a0505", border: `1px solid ${C.red}55`, borderRadius: 2 }}>
              <div style={{ fontSize: 10, color: C.red, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 6 }}>⚠ Danger Zone</div>
              <p style={{ fontSize: 12, color: C.textDim, marginBottom: 12, lineHeight: 1.6 }}>
                This permanently deletes all check-offs, XP, level, history, and goal completions. Your tab layout and settings are kept. <strong style={{ color: C.red }}>This cannot be undone.</strong>
              </p>
              {!confirmReset ? (
                <Btn onClick={() => setConfirmReset(true)} color={C.red} style={{ fontSize: 11 }}>Reset All Progress</Btn>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <div style={{ fontSize: 12, color: C.red, fontWeight: 700, letterSpacing: "0.08em" }}>Are you sure? All progress will be lost.</div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <Btn onClick={() => {
                      setChecks({});
                      setGoalChecks({});
                      setHistory({});
                      setXpState({ totalXP: 0, xpLog: {} });
                      setConfirmReset(false);
                      setShowSettings(false);
                      toast$("Progress reset", "err");
                    }} color={C.red} style={{ flex: 1, fontSize: 11 }}>Yes, Reset Everything</Btn>
                    <Btn onClick={() => setConfirmReset(false)} color={C.textDim} style={{ flex: 1, fontSize: 11 }}>Cancel</Btn>
                  </div>
                </div>
              )}
            </div>

            <button onClick={() => { setShowSettings(false); setConfirmReset(false); }} style={{ width: "100%", padding: "11px", background: "transparent", border: `1px solid #2d2d5a`, color: C.textDim, fontFamily: "inherit", fontSize: 13, cursor: "pointer", letterSpacing: "0.1em" }}>CLOSE</button>
          </div>
        </div>
      )}

      <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", minHeight: "100vh" }}>

        {/* Header */}
        <header style={{ ...panelStyle({ borderRadius: 0, borderLeft: "none", borderRight: "none", borderTop: "none" }), padding: isMobile ? "0 14px" : "0 28px", height: 54, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0, position: "sticky", top: 0, zIndex: 100 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {isMobile && (
              <button onClick={() => setShowSidebar(true)} style={{ background: "none", border: "none", cursor: "pointer", color: C.accent, fontSize: 20, padding: 0, lineHeight: 1 }}>☰</button>
            )}
            <div style={{ fontSize: isMobile ? 16 : 18, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: C.glowBright, textShadow: `0 0 20px ${C.glowBright},0 0 40px ${C.glow}` }}>Level Up!</div>
            <RankBadge rank={currentRank} size="sm" />
            {!isMobile && <span style={{ fontSize: 10, color: currentRank.color, letterSpacing: "0.1em", border: `1px solid ${currentRank.color}44`, padding: "2px 8px", borderRadius: 2, textShadow: `0 0 8px ${currentRank.color}66` }}>Lv.{currentLevel} {currentRank.letter}-Rank</span>}
            {!isMobile && <span style={{ fontSize: 10, color: C.textDim, letterSpacing: "0.12em", border: `1px solid #2d2d5a`, padding: "2px 8px", borderRadius: 2 }}>{today}</span>}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {!isMobile && <span style={{ fontSize: 10, color: syncColor, letterSpacing: "0.1em" }}>{syncLabel}</span>}
            {!isMobile && calConnected && <span style={{ fontSize: 10, color: C.green }}>● CAL</span>}
            {!isMobile && (
              <button onClick={syncCal} style={{ padding: "5px 12px", background: "transparent", border: `1px solid ${calConnected ? C.green : C.panelBorder}`, color: calConnected ? C.green : C.textDim, fontFamily: "inherit", fontSize: 10, cursor: "pointer", letterSpacing: "0.1em" }}>
                {syncing ? "…" : calConnected ? "SYNC" : "CAL"}
              </button>
            )}
            <button onClick={() => { setShowHistory(h => !h); setEditing(false); }} style={{ padding: "5px 12px", background: showHistory ? `${C.accent}22` : "transparent", border: `1px solid ${showHistory ? C.accent : C.panelBorder}`, color: showHistory ? C.accent : C.textDim, fontFamily: "inherit", fontSize: 10, cursor: "pointer", letterSpacing: "0.1em", boxShadow: showHistory ? glowBox(C.accent) : "none" }}>📅 HISTORY</button>
<button onClick={() => setShowSettings(true)} style={{ padding: "5px 12px", background: "transparent", border: `1px solid ${C.panelBorder}`, color: C.accent, fontFamily: "inherit", fontSize: 10, cursor: "pointer", letterSpacing: "0.1em" }}>⚙</button>
            {authedUser && <button onClick={() => supabase.auth.signOut()} style={{ padding: "5px 12px", background: "transparent", border: `1px solid ${C.red}66`, color: C.red, fontFamily: "inherit", fontSize: 10, cursor: "pointer", letterSpacing: "0.1em" }}>EXIT</button>}
          </div>
        </header>

        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

          {/* Desktop sidebar */}
          {!isMobile && (
            <aside style={{ width: 220, flexShrink: 0, borderRight: `1px solid ${C.panelBorder}`, background: "rgba(5,5,20,0.9)", overflowY: "auto", display: "flex", flexDirection: "column" }}>
              <SidebarContent />
            </aside>
          )}

          {/* Main content */}
          <main style={{ flex: 1, padding: isMobile ? "16px 14px 100px" : "24px 28px", overflowY: "auto" }}>
            {/* History view */}
            {showHistory && (
              <HistoryView checks={checks} tabs={tabs} history={history} isMobile={isMobile} xpLog={xpLog} goalChecks={goalChecks} toggleCheck={toggleCheck} toggleGoal={toggleGoal} selDay={historySelDay} setSelDay={setHistorySelDay} />
            )}

            {/* Mobile XP status strip */}
            {!showHistory && isMobile && (
              <div style={{ ...panelStyle({ padding: "12px 16px", marginBottom: 16, position: "relative", border: `1px solid ${currentRank.color}55`, boxShadow: `0 0 10px ${currentRank.color}33` }) }}>
                <PanelCorners />
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <RankBadge rank={currentRank} size="lg" />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: 9, color: currentRank.color, letterSpacing: "0.1em", textShadow: `0 0 6px ${currentRank.color}88` }}>{currentRank.letter}-RANK · {currentRank.title}</span>
                      <span style={{ fontSize: 9, color: currentRank.color }}>Lv.{currentLevel}</span>
                    </div>
                    <StatBar pct={levelPct} color={currentRank.color} height={6} />
                    <div style={{ fontSize: 9, color: C.textDim, marginTop: 3 }}>{(xpNeeded - xpIntoLevel).toLocaleString()} XP to Lv.{currentLevel + 1} · Total: {totalXP.toLocaleString()}</div>
                  </div>
                </div>
              </div>
            )}
            {!showHistory && cur && (
              <>
                {/* Tab header */}
                <div style={{ ...panelStyle({ padding: isMobile ? "14px" : "18px 22px", marginBottom: 20, position: "relative" }) }}>
                  <PanelCorners />
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ fontSize: isMobile ? 26 : 30, filter: `drop-shadow(0 0 10px ${C.glowBright})` }}>{cur.icon}</span>
                      <div>
                        <h1 style={{ margin: 0, fontSize: isMobile ? 18 : 22, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: C.glowBright, textShadow: `0 0 20px ${C.glowBright}` }}>{cur.label}</h1>
                        <div style={{ fontSize: 11, color: C.textDim, marginTop: 2 }}>
                          {pct === 100
                            ? <span style={{ color: C.green, textShadow: `0 0 10px ${C.green}` }}>✦ ALL TASKS COMPLETE</span>
                            : `${pct}% · ${cur.tasks.filter(t => checked(cur.id, t.id)).length}/${cur.tasks.length} done`}
                        </div>
                      </div>
                    </div>
                    {!isFinance && (
                      <button onClick={() => setEditing(!editing)} style={{ padding: "7px 14px", background: editing ? `${C.glow}33` : "transparent", border: `1px solid ${editing ? C.glow : C.panelBorder}`, color: editing ? C.glow : C.textDim, fontFamily: "inherit", fontSize: 10, cursor: "pointer", letterSpacing: "0.1em", borderRadius: 2 }}>
                        {editing ? "DONE" : "✎ EDIT"}
                      </button>
                    )}
                  </div>
                  <div style={{ marginTop: 14 }}><StatBar pct={pct} /></div>
                </div>

                  <>
                    {/* Tasks */}
                    <div style={{ marginBottom: 24 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                        <div style={{ fontSize: 9, color: C.accent, letterSpacing: "0.2em", textTransform: "uppercase" }}>▸ Daily Habits</div>
                        <div style={{ fontSize: 10, color: C.textDim }}>{cur.tasks.filter(t => checked(cur.id, t.id)).length}/{cur.tasks.length}</div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {cur.tasks.map(task => {
                          const done = checked(cur.id, task.id);
                          const burst = justChecked.has(`${cur.id}::${task.id}`);
                          return (
                            <div key={task.id} onClick={(e) => !editing && toggleCheck(cur.id, task.id, e)} style={{ display: "flex", alignItems: "center", gap: 12, background: done ? `${C.green}08` : "rgba(10,10,26,0.8)", border: `1px solid ${done ? C.green + "44" : "#1e1e3a"}`, borderLeft: `3px solid ${done ? C.green : C.panelBorder}`, boxShadow: done ? `0 0 10px ${C.green}22` : "none", padding: isMobile ? "14px 12px" : "12px 14px", cursor: editing ? "default" : "pointer", transition: "all 0.2s", borderRadius: 2 }}>
                              <HexCheck done={done} burst={burst} onClick={e => { e.stopPropagation(); toggleCheck(cur.id, task.id, e); }} />
                              <span style={{ flex: 1, fontSize: isMobile ? 15 : 14, color: done ? C.green : C.text, textDecoration: done ? "line-through" : "none", textShadow: done ? `0 0 8px ${C.green}88` : "none", opacity: done ? 0.8 : 1 }}>{task.text}</span>
                              {task.freq === "weekly" && <span style={{ fontSize: 9, color: C.accent, border: `1px solid ${C.panelBorder}`, padding: "2px 6px", letterSpacing: "0.1em", flexShrink: 0 }}>WEEKLY</span>}
                              {editing && <button onClick={() => remTask(cur.id, task.id)} style={{ background: "none", border: "none", cursor: "pointer", color: C.red, fontSize: 18, padding: "0 4px", fontFamily: "inherit", flexShrink: 0 }}>✕</button>}
                            </div>
                          );
                        })}
                      </div>
                      {editing && (
                        <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                          <Inp value={newTask} onChange={e => setNewTask(e.target.value)} onKeyDown={e => e.key === "Enter" && addTask(cur.id)} placeholder="Enter new habit…" style={{ flex: 1 }} />
                          <Btn onClick={() => addTask(cur.id)} color={C.glow}>ADD</Btn>
                        </div>
                      )}
                    </div>

                    {/* Goals */}
                    <div>
                      <div style={{ fontSize: 9, color: C.accent, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 10 }}>
                        {cur.id === "finance" ? "▸ Monthly Objectives" : "▸ Active Quests"}
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {cur.goals.map(goal => {
                          const done = goalDone(cur.id, goal.id);
                          return (
                            <div key={goal.id} onClick={(e) => !editing && toggleGoal(cur.id, goal.id, e)} style={{ display: "flex", alignItems: "center", gap: 12, background: done ? `${C.green}08` : "rgba(10,10,26,0.8)", border: `1px solid ${done ? C.green + "44" : "#1e1e3a"}`, borderLeft: `3px solid ${done ? C.green : C.accent + "55"}`, padding: isMobile ? "14px 12px" : "12px 14px", cursor: editing ? "default" : "pointer", transition: "all 0.2s", borderRadius: 2 }}>
                              <HexCheck done={done} onClick={e => { e.stopPropagation(); toggleGoal(cur.id, goal.id, e); }} />
                              <span style={{ flex: 1, fontSize: isMobile ? 15 : 14, color: done ? C.green : C.textDim, textDecoration: done ? "line-through" : "none" }}>{goal.text}</span>
                              {editing && <button onClick={() => remGoal(cur.id, goal.id)} style={{ background: "none", border: "none", cursor: "pointer", color: C.red, fontSize: 18, padding: "0 4px", fontFamily: "inherit" }}>✕</button>}
                            </div>
                          );
                        })}
                      </div>
                      {editing && (
                        <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                          <Inp value={newGoal} onChange={e => setNewGoal(e.target.value)} onKeyDown={e => e.key === "Enter" && addGoalItem(cur.id)} placeholder="Enter new objective…" style={{ flex: 1 }} />
                          <Btn onClick={() => addGoalItem(cur.id)} color={C.glow}>ADD</Btn>
                        </div>
                      )}
                    </div>

                    {/* Finance-only: collapsible Savings Goals + Net Worth */}
                    {activeTab === "finance" && (
                      <FinanceGoalsPanel finData={finData} setFinData={(updater) => setFinData(prev => typeof updater === "function" ? updater(prev) : updater)} isMobile={isMobile} />
                    )}
                  </>
              </>
            )}
          </main>
        </div>

        {/* ── Floating Action Button ── */}
        {(() => {
          const fabBottom = isMobile ? 82 : 28;
          const allDailyTasks = tabs.flatMap(tab =>
            tab.tasks.filter(t => t.freq === "daily").map(t => ({ tab, task: t }))
          );
          const filteredTasks = fabTaskSearch.trim()
            ? allDailyTasks.filter(({ tab, task }) =>
                task.text.toLowerCase().includes(fabTaskSearch.toLowerCase()) ||
                tab.label.toLowerCase().includes(fabTaskSearch.toLowerCase()))
            : allDailyTasks;
          const fabAddExpense = () => {
            if (!fabExpense.amount || isNaN(Number(fabExpense.amount))) return;
            const cat = fabExpense.category || lastExpenseCat;
            setFinData(p => ({ ...p, expenses: [{ id: `e_${Date.now()}`, amount: Number(fabExpense.amount), category: cat, note: fabExpense.note, date: todayKey() }, ...(p.expenses||[])] }));
            setLastExpenseCat(cat);
            toast$(`$${Number(fabExpense.amount).toFixed(2)} logged to ${cat}`);
            setFabExpense({ amount: "", category: cat, note: "" });
            setFabOpen(false); setFabMode(null);
          };
          return (
            <div style={{ position: "fixed", bottom: fabBottom, right: 20, zIndex: 500 }}>
              {fabOpen && (
                <div style={{ position: "absolute", bottom: 68, right: 0, width: isMobile ? "calc(100vw - 40px)" : 340, maxWidth: 340, animation: "fabSlideUp 0.2s ease" }}>
                  <div style={{ ...panelStyle({ padding: 0, overflow: "hidden" }), position: "relative" }}>
                    <PanelCorners />
                    {fabMode === null && (
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <div style={{ padding: "12px 16px", fontSize: 9, color: C.accent, letterSpacing: "0.2em", textTransform: "uppercase", borderBottom: "1px solid #1e1e3a" }}>Quick Action</div>
                        {[["expense","💸","Log Expense","Add a transaction instantly"],["task","✅","Check Off Task","Search & complete a task"]].map(([mode,icon,label,sub]) => (
                          <button key={mode} onClick={() => { setFabMode(mode); if (mode==="expense") setFabExpense(p=>({...p,category:lastExpenseCat})); setFabTaskSearch(""); }} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", background: "transparent", border: "none", borderBottom: "1px solid #1e1e3a", cursor: "pointer", textAlign: "left" }}>
                            <span style={{ fontSize: 22 }}>{icon}</span>
                            <div><div style={{ fontSize: 13, fontWeight: 600, color: C.text, letterSpacing: "0.06em" }}>{label}</div><div style={{ fontSize: 10, color: C.textDim }}>{sub}</div></div>
                          </button>
                        ))}
                      </div>
                    )}
                    {fabMode === "expense" && (
                      <div style={{ padding: 16 }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                          <span style={{ fontSize: 12, color: C.accent, letterSpacing: "0.1em", textTransform: "uppercase" }}>💸 Quick Expense</span>
                          <button onClick={() => setFabMode(null)} style={{ background: "none", border: "none", color: C.textDim, cursor: "pointer", fontSize: 16 }}>‹ Back</button>
                        </div>
                        <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 9, color: C.textDim, letterSpacing: "0.1em", marginBottom: 4 }}>AMOUNT ($)</div>
                            <Inp autoFocus value={fabExpense.amount} onChange={e => setFabExpense(p => ({...p, amount: e.target.value}))} onKeyDown={e => e.key === "Enter" && fabAddExpense()} placeholder="0.00" style={{ width: "100%" }} />
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 9, color: C.textDim, letterSpacing: "0.1em", marginBottom: 4 }}>CATEGORY</div>
                            <select value={fabExpense.category || lastExpenseCat} onChange={e => setFabExpense(p => ({...p, category: e.target.value}))} style={{ padding: "10px 8px", background: "#0a0a1e", border: `1px solid ${C.panelBorder}`, color: C.text, fontFamily: "inherit", fontSize: 12, outline: "none", width: "100%", borderRadius: 2 }}>
                              {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                          </div>
                        </div>
                        <div style={{ marginBottom: 10 }}>
                          <div style={{ fontSize: 9, color: C.textDim, letterSpacing: "0.1em", marginBottom: 4 }}>NOTE (OPTIONAL)</div>
                          <Inp value={fabExpense.note} onChange={e => setFabExpense(p => ({...p, note: e.target.value}))} onKeyDown={e => e.key === "Enter" && fabAddExpense()} placeholder="What was it for?" style={{ width: "100%" }} />
                        </div>
                        <Btn onClick={fabAddExpense} color={C.green} style={{ width: "100%", justifyContent: "center" }}>+ LOG EXPENSE</Btn>
                      </div>
                    )}
                    {fabMode === "task" && (
                      <div style={{ padding: 16 }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                          <span style={{ fontSize: 12, color: C.accent, letterSpacing: "0.1em", textTransform: "uppercase" }}>✅ Quick Task</span>
                          <button onClick={() => setFabMode(null)} style={{ background: "none", border: "none", color: C.textDim, cursor: "pointer", fontSize: 16 }}>‹ Back</button>
                        </div>
                        <Inp autoFocus value={fabTaskSearch} onChange={e => setFabTaskSearch(e.target.value)} placeholder="Search tasks…" style={{ width: "100%", marginBottom: 8 }} />
                        <div style={{ maxHeight: 240, overflowY: "auto", display: "flex", flexDirection: "column", gap: 4 }}>
                          {filteredTasks.length === 0 && <div style={{ color: C.textDim, fontSize: 12, textAlign: "center", padding: "16px 0" }}>No tasks found</div>}
                          {filteredTasks.map(({ tab, task }) => {
                            const done = checked(tab.id, task.id);
                            return (
                              <button key={`${tab.id}::${task.id}`} onClick={(e) => toggleCheck(tab.id, task.id, e)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: done ? `${C.green}0e` : "#0a0a1e", border: `1px solid ${done ? C.green+"44" : "#1e1e3a"}`, borderLeft: `3px solid ${done ? C.green : C.panelBorder}`, cursor: "pointer", borderRadius: 2, textAlign: "left" }}>
                                <div style={{ width: 14, height: 14, borderRadius: 2, border: `1.5px solid ${done ? C.green : C.panelBorder}`, background: done ? `${C.green}22` : "transparent", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                  {done && <svg width="9" height="9" viewBox="0 0 12 12"><path d="M2 6l3 3 5-5" stroke={C.green} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>}
                                </div>
                                <div style={{ flex: 1 }}>
                                  <div style={{ fontSize: 12, color: done ? C.green : C.text, textDecoration: done ? "line-through" : "none" }}>{task.text}</div>
                                  <div style={{ fontSize: 9, color: C.textDim, marginTop: 1 }}>{tab.icon} {tab.label}</div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
              <button
                onClick={() => { setFabOpen(o => !o); setFabMode(null); setFabTaskSearch(""); }}
                aria-label={fabOpen ? "Close quick actions" : "Quick actions"}
                style={{ width: 56, height: 56, borderRadius: "50%", background: fabOpen ? `${C.red}cc` : `linear-gradient(135deg,${C.glow},${C.glowBright})`, border: "none", cursor: "pointer", fontSize: fabOpen ? 22 : 28, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 20px ${fabOpen ? C.red : C.glow}88,0 0 40px ${fabOpen ? C.red : C.glow}33`, color: "#fff", transition: "all 0.2s", fontWeight: 700 }}>
                {fabOpen ? "✕" : "+"}
              </button>
            </div>
          );
        })()}

        {/* Mobile bottom tab bar */}
        {isMobile && (
          <nav style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#060612", borderTop: `1px solid ${C.panelBorder}`, display: "flex", overflowX: "auto", zIndex: 100, boxShadow: `0 -4px 20px ${C.glow}33` }}>
            {/* History tab */}
            <button onClick={() => { setShowHistory(h => !h); setEditing(false); setFabOpen(false); }} style={{ flex:"0 0 auto", minWidth:64, padding:"10px 8px 12px", display:"flex", flexDirection:"column", alignItems:"center", gap:3, background: showHistory ? `${C.accent}18` : "transparent", border:"none", borderTop:`2px solid ${showHistory ? C.accent : "transparent"}`, cursor:"pointer" }}>
              <span style={{ fontSize:20 }}>📅</span>
              <span style={{ fontSize:9, color: showHistory ? C.accent : C.textDim, letterSpacing:"0.06em", textTransform:"uppercase" }}>History</span>
            </button>
            {tabs.map(tab => {
              const active = tab.id === activeTab;
              const p = tabPct(tab);
              return (
                <button key={tab.id} onClick={() => { setActiveTab(tab.id); setEditing(false); setShowHistory(false); setFabOpen(false); }} style={{ flex: "0 0 auto", minWidth: 64, padding: "10px 8px 12px", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, background: active ? `${C.glow}18` : "transparent", border: "none", borderTop: `2px solid ${active ? C.glowBright : "transparent"}`, cursor: "pointer", transition: "all 0.15s" }}>
                  <span style={{ fontSize: 20, filter: active ? `drop-shadow(0 0 6px ${C.glowBright})` : "none" }}>{tab.icon}</span>
                  <span style={{ fontSize: 9, color: active ? C.glowBright : C.textDim, letterSpacing: "0.06em", textTransform: "uppercase", textShadow: active ? `0 0 8px ${C.glowBright}` : "none" }}>{tab.label}</span>
                  {p > 0 && p < 100 && <div style={{ width: 24, height: 2, background: "#1e1e3a", borderRadius: 1 }}><div style={{ height: "100%", width: `${p}%`, background: C.glow, borderRadius: 1 }} /></div>}
                  {p === 100 && <span style={{ fontSize: 8, color: C.green }}>✓</span>}
                </button>
              );
            })}
          </nav>
        )}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #050510; overflow-x: hidden; }
        ::-webkit-scrollbar { width: 3px; background: #0a0a1e; }
        ::-webkit-scrollbar-thumb { background: #3b0764; border-radius: 2px; }
        button { transition: all 0.15s; }
        button:hover { filter: brightness(1.15); }
        input::placeholder { color: #4a4a6a; }
        input[type=date]::-webkit-calendar-picker-indicator { filter: invert(0.4) sepia(1) saturate(5) hue-rotate(200deg); }
        select option { background: #0a0a1e; }
        @keyframes fadeIn { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:none; } }
        @keyframes levelUpAnim { 0% { opacity:0; transform:translate(-50%,-50%) scale(0.7); } 20% { opacity:1; transform:translate(-50%,-50%) scale(1.05); } 100% { opacity:1; transform:translate(-50%,-50%) scale(1); } }
        @keyframes rankUpAnim { 0% { opacity:0; transform:scale(0.5) translateY(40px); } 60% { opacity:1; transform:scale(1.04) translateY(-6px); } 100% { opacity:1; transform:scale(1) translateY(0); } }
        @keyframes xpFloat { 0% { opacity:0; transform:translateX(-50%) translateY(0); } 15% { opacity:1; } 85% { opacity:1; } 100% { opacity:0; transform:translateX(-50%) translateY(-64px); } }
        @keyframes checkBurst { 0% { box-shadow:0 0 0 0 #4ADE8088; } 50% { box-shadow:0 0 0 12px #4ADE8033; } 100% { box-shadow:0 0 8px #4ADE8088; } }
        @keyframes fabSlideUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:none; } }
      `}</style>
    </div>
  );
}
