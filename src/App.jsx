import { useState, useEffect, useRef, useCallback } from "react";

const AGENTS = [
  { id: "chief", name: "Chief of Staff", icon: "◈", color: "#2563eb", status: "active", lastRun: "Today", nextRun: "07:00 daily", summary: "Morning Briefing live · 3 agents coordinated", whatsapp: true },
  { id: "career", name: "Career Agent", icon: "▣", color: "#059669", status: "active", lastRun: "08:00 today", nextRun: "07:00 tomorrow", summary: "Reed live · 104 roles scanned · Jobs in Morning Briefing", whatsapp: true },
  { id: "health", name: "Health Agent", icon: "◉", color: "#d97706", status: "amber", lastRun: "Manual export", nextRun: "When Health Auto Export connected", summary: "Sleep 4.1hrs ⚠ · HRV 61ms · Awaiting auto-sync", whatsapp: false },
  { id: "deen", name: "Deen Agent", icon: "☽", color: "#7c3aed", status: "active", lastRun: "07:00 today", nextRun: "07:00 tomorrow", summary: "Prayer times live · London · In Morning Briefing", whatsapp: true },
  { id: "venture", name: "Venture Agent", icon: "▲", color: "#ea580c", status: "idle", lastRun: "Never", nextRun: "Not scheduled", summary: "No active venture — next session priority", whatsapp: false },
  { id: "wealth", name: "Wealth Agent", icon: "◇", color: "#b45309", status: "idle", lastRun: "Never", nextRun: "Not scheduled", summary: "Not connected — awaiting Monzo API", whatsapp: false },
  { id: "work", name: "Work Agent", icon: "⬡", color: "#1d4ed8", status: "active", lastRun: "07:00 today", nextRun: "07:00 tomorrow", summary: "Google Calendar connected · Events in Morning Briefing", whatsapp: true },
  { id: "build", name: "Build Agent", icon: "⬟", color: "#be185d", status: "active", lastRun: "Today", nextRun: "Continuous", summary: "Mizan OS dashboard v0.1 live · Make pipeline built", whatsapp: false },
  { id: "knowledge", name: "Knowledge Agent", icon: "◎", color: "#475569", status: "idle", lastRun: "Never", nextRun: "Not scheduled", summary: "Obsidian vault structured · Agent notes written", whatsapp: false },
];

const FEED_ITEMS = [
  { id: 1, agent: "Morning Briefing", color: "#2563eb", icon: "◈", time: "21:46", message: "Morning Briefing live · Prayer times · Google Calendar · Reed job match · Bismillah. Make today count.", type: "SUCCESS" },
  { id: 2, agent: "Career Agent", color: "#059669", icon: "▣", time: "21:37", message: "Reed API connected · 104 roles scanned · Senior Account Manager AI & Data · Vermillion Analytics · £55,000–£85,000", type: "MATCH" },
  { id: 3, agent: "Deen Agent", color: "#7c3aed", icon: "☽", time: "21:22", message: "Prayer times live · Fajr 02:53 · Dhuhr 13:03 · Asr 17:25 · Maghrib 21:22 · Isha 23:12 · London", type: "INFO" },
  { id: 4, agent: "Work Agent", color: "#1d4ed8", icon: "⬡", time: "21:13", message: "Google Calendar connected · sahilosman0399@gmail.com · Test Meeting for Mizan OS · 22:00 today", type: "INFO" },
  { id: 5, agent: "Build Agent", color: "#be185d", icon: "⬟", time: "20:55", message: "Mizan OS dashboard v0.1 built · 6 tabs live · Chat with Mizan · Second Brain · Agent Status · Notifications", type: "BUILD" },
  { id: 6, agent: "Career Agent", color: "#059669", icon: "▣", time: "20:30", message: "WhatsApp pipeline confirmed · Make → HTTP → Twilio → WhatsApp · Status 201", type: "SUCCESS" },
  { id: 7, agent: "Health Agent", color: "#d97706", icon: "◉", time: "Earlier", message: "Apple Watch data imported · Sleep avg 4.28hrs ⚠ · HRV avg 49.6ms · VO2 Max 37.5 · 3 workouts in 3 months", type: "FLAG" },
];

const SECOND_BRAIN = [
  { path: "CV / Current CV", preview: "Data and AI professional with MSc in AI (Distinction). 3+ years enterprise client delivery. American Express, Pepsi, O2, Hiscox...", updated: "Today", color: "#059669" },
  { path: "CV / Job Criteria", preview: "Sweet spot: Tech/AI companies with enterprise clients. Digital transformation. Client-facing. £35k floor, £50–65k target. Hybrid London.", updated: "Today", color: "#059669" },
  { path: "Agents / Career Agent", preview: "Reed API live. Score against CV. 7/10+ to WhatsApp. Run at 8am. Claude scoring next when API credit added.", updated: "Today", color: "#2563eb" },
  { path: "Agents / Chief of Staff", preview: "Coordinate all agents. Morning Briefing 7am. Push Sahil toward vision. Watch for shiny object syndrome.", updated: "Today", color: "#2563eb" },
  { path: "Agents / Deen Agent", preview: "Aladhan API free. London prayer times. In Morning Briefing. Prayer nudges next.", updated: "Today", color: "#7c3aed" },
  { path: "Agents / Health Agent", preview: "Apple Watch via Health Auto Export. Manual for now. Auto-sync when £24.99 premium unlocked.", updated: "Today", color: "#d97706" },
  { path: "Ventures / Ideas", preview: "No active venture yet. Venture Agent next priority. Need to find first thing to build and sell.", updated: "Today", color: "#ea580c" },
  { path: "Goals / Current Goals", preview: "Build Mizan OS ✓ in progress · Career move £50–65k · First venture · Health consistency · Deen first", updated: "Today", color: "#b45309" },
];

const INIT_MESSAGES = [
  { role: "assistant", content: "Mizan OS is live, Sahil.\n\nHere's what you built today:\n\n✅ Career Agent — Reed scanning 104 jobs daily at 8am\n✅ Deen Agent — London prayer times every morning\n✅ Morning Briefing — all agents combined, 7am daily\n✅ Obsidian vault — CV, Job Criteria, all agent notes\n✅ Dashboard — you're looking at it\n\nHealth flag — sleep averaging 4.1hrs. Fix this before anything else.\n\nVenture Agent has nothing to work with yet. That's next session.\n\nRotate your Twilio token tonight. What do you need?" },
];

const StatusDot = ({ status }) => {
  const c = { active: "#059669", amber: "#d97706", idle: "#94a3b8", error: "#dc2626" }[status];
  return (
    <span style={{ position: "relative", display: "inline-flex", width: 10, height: 10, flexShrink: 0 }}>
      {(status === "active" || status === "amber") && (
        <span style={{ position: "absolute", inset: 0, borderRadius: "50%", background: c, opacity: 0.3, animation: "ping 2s infinite" }} />
      )}
      <span style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />
    </span>
  );
};

export default function App() {
  const [tab, setTab] = useState("overview");
  const [agents, setAgents] = useState(AGENTS);
  const [messages, setMessages] = useState(INIT_MESSAGES);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState(null);
  const [time, setTime] = useState(new Date());
  const convRef = useRef(INIT_MESSAGES);
  const bottomRef = useRef(null);

  useEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t); }, []);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const toggleWA = (id) => setAgents(p => p.map(a => a.id === id ? { ...a, whatsapp: !a.whatsapp } : a));

  const send = useCallback(async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: "user", content: input.trim() };
    const next = [...convRef.current, userMsg];
    convRef.current = next;
    setMessages([...next]);
    setInput("");
    setLoading(true);
    const ctx = agents.map(a => `${a.name}: ${a.status} — ${a.summary}`).join("\n");
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6", max_tokens: 1000,
          system: `You are Mizan — Sahil's personal AI Chief of Staff. Sahil is a Digital delivery professional in London. MSc in AI. Works at PromoVeritas. Job searching for Digital Transformation roles, £50–65k. Muslim. Wants to build ventures. Built Mizan OS today — Career Agent, Deen Agent, Morning Briefing all live. Agent status:\n${ctx}\nBe direct. No padding. Plain text only.`,
          messages: next.map(m => ({ role: m.role, content: m.content })),
        }),
      });
      const d = await res.json();
      const reply = { role: "assistant", content: d.content?.[0]?.text || "Error." };
      convRef.current = [...next, reply];
      setMessages([...convRef.current]);
    } catch {
      const err = { role: "assistant", content: "Connection error. Try again." };
      convRef.current = [...next, err];
      setMessages([...convRef.current]);
    }
    setLoading(false);
  }, [input, loading, agents]);

  const active = agents.filter(a => a.status === "active").length;
  const amber = agents.filter(a => a.status === "amber").length;
  const idle = agents.filter(a => a.status === "idle").length;
  const filtered = SECOND_BRAIN.filter(n =>
    n.path.toLowerCase().includes(search.toLowerCase()) ||
    n.preview.toLowerCase().includes(search.toLowerCase())
  );

  const S = {
    page: { fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif", background: "#f1f5f9", minHeight: "100vh", color: "#0f172a" },
    topbar: { background: "#fff", borderBottom: "1px solid #e2e8f0", padding: "0 20px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 56, position: "sticky", top: 0, zIndex: 100, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" },
    badge: (col, bg) => ({ fontSize: 11, fontWeight: 600, background: bg, color: col, border: `1px solid ${col}30`, borderRadius: 20, padding: "3px 10px" }),
    navBtn: (a) => ({ fontSize: 12, fontWeight: a ? 600 : 400, padding: "12px 14px", background: "none", border: "none", cursor: "pointer", borderBottom: a ? "2px solid #2563eb" : "2px solid transparent", color: a ? "#2563eb" : "#64748b", marginBottom: -1, whiteSpace: "nowrap" }),
    label: { fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "#94a3b8", textTransform: "uppercase", marginBottom: 12 },
    card: { background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", padding: "18px 20px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" },
  };

  return (
    <div style={S.page}>
      <style>{`
        @keyframes ping{75%,100%{transform:scale(2);opacity:0}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
        *{box-sizing:border-box}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-thumb{background:#e2e8f0;border-radius:2px}
        textarea:focus,input:focus{outline:none}
        @media(max-width:768px){
          .grid-4{grid-template-columns:repeat(2,1fr)!important}
          .grid-3{grid-template-columns:repeat(2,1fr)!important}
          .grid-2{grid-template-columns:1fr!important}
          .hide-mobile{display:none!important}
        }
      `}</style>

      {/* TOPBAR */}
      <div style={S.topbar}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 30, height: 30, background: "linear-gradient(135deg,#2563eb,#7c3aed)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: "#fff", flexShrink: 0 }}>M</div>
          <span style={{ fontSize: 15, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.02em" }}>Mizan OS</span>
          <span style={{ fontSize: 10, color: "#94a3b8" }} className="hide-mobile">v0.1</span>
          <div style={{ width: 1, height: 20, background: "#e2e8f0" }} className="hide-mobile" />
          <div style={{ display: "flex", gap: 6 }} className="hide-mobile">
            <span style={S.badge("#059669", "#f0fdf4")}>{active} Active</span>
            {amber > 0 && <span style={S.badge("#d97706", "#fffbeb")}>{amber} Flagged</span>}
            {idle > 0 && <span style={S.badge("#94a3b8", "#f8fafc")}>{idle} Idle</span>}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 12, color: "#64748b", fontVariantNumeric: "tabular-nums" }} className="hide-mobile">
            {time.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 5, background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 20, padding: "3px 8px" }}>
            <StatusDot status="active" />
            <span style={{ fontSize: 11, fontWeight: 600, color: "#059669" }}>Live</span>
          </div>
        </div>
      </div>

      {/* NAV */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e2e8f0", padding: "0 20px", display: "flex", gap: 0, overflowX: "auto" }}>
        {[["overview","Overview"],["agents","Agents"],["feed","Feed"],["chat","Chat"],["brain","Brain"],["notifications","Alerts"]].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} style={S.navBtn(tab === id)}>{label}</button>
        ))}
      </div>

      <div style={{ padding: "20px", maxWidth: 1200, margin: "0 auto" }}>

        {/* OVERVIEW */}
        {tab === "overview" && (
          <div>
            <div style={{ background: "linear-gradient(135deg,#1e3a5f,#2d1b69)", borderRadius: 12, padding: "14px 20px", marginBottom: 18, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#93c5fd", letterSpacing: "0.06em", marginBottom: 3 }}>MORNING BRIEFING · 07:00 DAILY</div>
                <div style={{ fontSize: 13, color: "#e2e8f0" }}>Prayer times · Calendar · Reed job match — firing autonomously every morning</div>
              </div>
              <div style={{ fontSize: 24, flexShrink: 0 }}>🟢</div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 20 }} className="grid-4">
              {[
                { label: "Agents Running", value: active, sub: `of ${agents.length} total`, color: "#2563eb" },
                { label: "Jobs Scanned", value: "104", sub: "Reed · 1 match today", color: "#059669" },
                { label: "Sleep Last Night", value: "4.1h", sub: "⚠ Below 7hr target", color: "#d97706" },
                { label: "Next Prayer", value: "Isha", sub: "23:12 · London", color: "#7c3aed" },
              ].map(s => (
                <div key={s.label} style={{ ...S.card, borderTop: `3px solid ${s.color}` }}>
                  <div style={S.label}>{s.label}</div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</div>
                  <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>{s.sub}</div>
                </div>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 16 }} className="grid-2">
              <div>
                <div style={S.label}>Agent Status</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 14 }} className="grid-3">
                  {agents.map(a => (
                    <div key={a.id} onClick={() => setTab("agents")} style={{ background: "#fff", border: `1px solid ${a.status === "idle" ? "#e2e8f0" : a.color + "25"}`, borderLeft: `3px solid ${a.status === "idle" ? "#e2e8f0" : a.color}`, borderRadius: 10, padding: "12px 14px", cursor: "pointer", boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                        <span style={{ fontSize: 14, color: a.status === "idle" ? "#cbd5e1" : a.color }}>{a.icon}</span>
                        <StatusDot status={a.status} />
                      </div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: a.status === "idle" ? "#94a3b8" : "#0f172a", marginBottom: 4 }}>{a.name.replace(" Agent","")}</div>
                      <div style={{ fontSize: 10, color: a.status === "idle" ? "#cbd5e1" : "#64748b", lineHeight: 1.4 }}>{a.summary}</div>
                    </div>
                  ))}
                </div>

                <div style={S.card}>
                  <div style={S.label}>Next Session Priorities</div>
                  {[
                    { icon: "▲", color: "#ea580c", text: "Venture Agent — find first thing to build and sell", priority: "HIGH" },
                    { icon: "◉", color: "#d97706", text: "Health Auto Export £24.99 — complete health layer", priority: "WHEN PAID" },
                    { icon: "◈", color: "#2563eb", text: "Claude API £5 — intelligent job scoring", priority: "WHEN PAID" },
                    { icon: "⬡", color: "#1d4ed8", text: "iCloud calendars — Work and Personal Apple calendars", priority: "SOON" },
                  ].map((item, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderBottom: i < 3 ? "1px solid #f1f5f9" : "none" }}>
                      <span style={{ fontSize: 13, color: item.color, flexShrink: 0 }}>{item.icon}</span>
                      <span style={{ fontSize: 12, color: "#475569", flex: 1 }}>{item.text}</span>
                      <span style={{ fontSize: 9, fontWeight: 700, color: item.color, background: item.color + "15", padding: "2px 7px", borderRadius: 4, flexShrink: 0 }}>{item.priority}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div style={S.label}>Live Feed</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 520, overflowY: "auto" }}>
                  {FEED_ITEMS.map(f => (
                    <div key={f.id} style={{ background: "#fff", border: "1px solid #e2e8f0", borderLeft: `3px solid ${f.color}`, borderRadius: 10, padding: "11px 14px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                          <span style={{ fontSize: 11, color: f.color }}>{f.icon}</span>
                          <span style={{ fontSize: 11, fontWeight: 700, color: "#0f172a" }}>{f.agent}</span>
                          <span style={{ fontSize: 9, fontWeight: 700, background: f.color + "15", color: f.color, padding: "1px 5px", borderRadius: 3 }}>{f.type}</span>
                        </div>
                        <span style={{ fontSize: 10, color: "#94a3b8", flexShrink: 0 }}>{f.time}</span>
                      </div>
                      <div style={{ fontSize: 11, color: "#475569", lineHeight: 1.5 }}>{f.message}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* AGENTS */}
        {tab === "agents" && (
          <div>
            <div style={S.label}>All Agents · {active} active · {amber} flagged · {idle} idle</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {agents.map(a => (
                <div key={a.id} style={{ background: "#fff", border: `1px solid ${a.status === "idle" ? "#e2e8f0" : a.color + "25"}`, borderRadius: 12, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                  <div onClick={() => setExpanded(expanded === a.id ? null : a.id)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", cursor: "pointer", borderLeft: `4px solid ${a.status === "idle" ? "#e2e8f0" : a.color}` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ fontSize: 18, color: a.status === "idle" ? "#cbd5e1" : a.color }}>{a.icon}</span>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: a.status === "idle" ? "#94a3b8" : "#0f172a" }}>{a.name}</div>
                        <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{a.summary}</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
                      <StatusDot status={a.status} />
                      <span style={{ fontSize: 11, color: "#94a3b8" }}>{expanded === a.id ? "▲" : "▼"}</span>
                    </div>
                  </div>
                  {expanded === a.id && (
                    <div style={{ borderTop: `1px solid ${a.color}20`, padding: "16px 20px", background: "#fafafa" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 14 }}>
                        {[["Status", a.status.toUpperCase()], ["Last Run", a.lastRun], ["Next Run", a.nextRun]].map(([l, v]) => (
                          <div key={l} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, padding: "10px 14px" }}>
                            <div style={{ fontSize: 10, fontWeight: 600, color: "#94a3b8", marginBottom: 4 }}>{l}</div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: a.color }}>{v}</div>
                          </div>
                        ))}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ fontSize: 13, color: "#64748b" }}>WhatsApp: <span style={{ fontWeight: 600, color: a.whatsapp ? "#059669" : "#94a3b8" }}>{a.whatsapp ? "On" : "Off"}</span></div>
                        <button onClick={() => toggleWA(a.id)} style={{ fontSize: 12, fontWeight: 600, padding: "6px 14px", borderRadius: 8, cursor: "pointer", background: a.whatsapp ? "#f0fdf4" : "#f8fafc", border: `1px solid ${a.whatsapp ? "#86efac" : "#e2e8f0"}`, color: a.whatsapp ? "#059669" : "#94a3b8" }}>
                          {a.whatsapp ? "Disable WhatsApp" : "Enable WhatsApp"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FEED */}
        {tab === "feed" && (
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <div style={S.label}>Live Agent Feed · Today</div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 20, padding: "4px 10px" }}>
                <StatusDot status="active" />
                <span style={{ fontSize: 11, fontWeight: 600, color: "#059669" }}>Live</span>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {FEED_ITEMS.map(f => (
                <div key={f.id} style={{ background: "#fff", border: "1px solid #e2e8f0", borderLeft: `4px solid ${f.color}`, borderRadius: 10, padding: "14px 18px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 7 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                      <span style={{ fontSize: 14, color: f.color }}>{f.icon}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{f.agent}</span>
                      <span style={{ fontSize: 10, fontWeight: 700, background: f.color + "15", color: f.color, padding: "2px 7px", borderRadius: 4 }}>{f.type}</span>
                    </div>
                    <span style={{ fontSize: 11, color: "#94a3b8" }}>{f.time}</span>
                  </div>
                  <div style={{ fontSize: 13, color: "#475569", lineHeight: 1.6 }}>{f.message}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CHAT */}
        {tab === "chat" && (
          <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 160px)" }}>
            <div style={{ fontSize: 13, color: "#64748b", marginBottom: 14 }}>Talk directly to Mizan — your Chief of Staff with full context of everything.</div>
            <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 14, paddingBottom: 14 }}>
              {messages.map((m, i) => (
                <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", gap: 8 }}>
                  {m.role === "assistant" && (
                    <div style={{ width: 32, height: 32, background: "linear-gradient(135deg,#2563eb,#7c3aed)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: "#fff", flexShrink: 0, marginTop: 2 }}>M</div>
                  )}
                  <div style={{ maxWidth: "75%", padding: "12px 16px", borderRadius: 12, fontSize: 13, lineHeight: 1.7, background: m.role === "user" ? "#2563eb" : "#fff", color: m.role === "user" ? "#fff" : "#0f172a", border: m.role === "user" ? "none" : "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", whiteSpace: "pre-wrap" }}>{m.content}</div>
                </div>
              ))}
              {loading && (
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <div style={{ width: 32, height: 32, background: "linear-gradient(135deg,#2563eb,#7c3aed)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: "#fff" }}>M</div>
                  <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "12px 16px", display: "flex", gap: 4, alignItems: "center" }}>
                    {[0,1,2].map(i => <span key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: "#2563eb", animation: `pulse 1.2s ease ${i*0.2}s infinite`, display: "block" }} />)}
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
            <div style={{ display: "flex", gap: 10, paddingTop: 14, borderTop: "1px solid #e2e8f0" }}>
              <textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                placeholder="Ask Mizan anything..." rows={2}
                style={{ flex: 1, background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, color: "#0f172a", fontSize: 13, padding: "10px 14px", resize: "none", fontFamily: "inherit", lineHeight: 1.5 }} />
              <button onClick={send} disabled={loading || !input.trim()} style={{ padding: "10px 20px", background: input.trim() ? "#2563eb" : "#e2e8f0", border: "none", borderRadius: 10, color: input.trim() ? "#fff" : "#94a3b8", fontSize: 13, fontWeight: 600, cursor: input.trim() ? "pointer" : "default", alignSelf: "flex-end" }}>Send</button>
            </div>
          </div>
        )}

        {/* BRAIN */}
        {tab === "brain" && (
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <div style={S.label}>Obsidian Second Brain · Mizan OS Vault</div>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search notes..." style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, color: "#0f172a", fontSize: 12, padding: "7px 12px", fontFamily: "inherit", width: 220 }} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12 }} className="grid-2">
              {filtered.map((n, i) => (
                <div key={i} style={{ background: "#fff", border: "1px solid #e2e8f0", borderLeft: `4px solid ${n.color}`, borderRadius: 10, padding: "14px 18px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: n.color }}>{n.path}</span>
                    <span style={{ fontSize: 10, color: "#94a3b8" }}>{n.updated}</span>
                  </div>
                  <div style={{ fontSize: 12, color: "#475569", lineHeight: 1.6 }}>{n.preview}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* NOTIFICATIONS */}
        {tab === "notifications" && (
          <div>
            <div style={S.label}>Notification Control</div>
            <div style={{ fontSize: 13, color: "#64748b", marginBottom: 16 }}>Everything appears in your dashboard feed. Toggle which agents also send to WhatsApp.</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
              {agents.map(a => (
                <div key={a.id} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 16, color: a.status === "idle" ? "#cbd5e1" : a.color }}>{a.icon}</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: a.status === "idle" ? "#94a3b8" : "#0f172a" }}>{a.name}</div>
                      <div style={{ fontSize: 11, color: "#64748b", marginTop: 1 }}>{a.summary}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 24, alignItems: "center", flexShrink: 0 }}>
                    <div style={{ textAlign: "center" }} className="hide-mobile">
                      <div style={{ fontSize: 10, fontWeight: 600, color: "#94a3b8", marginBottom: 4 }}>DASHBOARD</div>
                      <span style={{ fontSize: 11, fontWeight: 600, color: "#059669" }}>Always on</span>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 10, fontWeight: 600, color: "#94a3b8", marginBottom: 4 }}>WHATSAPP</div>
                      <button onClick={() => toggleWA(a.id)} style={{ fontSize: 11, fontWeight: 600, padding: "4px 12px", borderRadius: 7, cursor: a.status !== "idle" ? "pointer" : "default", background: a.whatsapp ? "#f0fdf4" : "#f8fafc", border: `1px solid ${a.whatsapp ? "#86efac" : "#e2e8f0"}`, color: a.whatsapp ? "#059669" : "#94a3b8", opacity: a.status === "idle" ? 0.5 : 1 }}>
                        {a.whatsapp ? "On" : "Off"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div style={S.card}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", marginBottom: 12 }}>Future Channels</div>
              {["Email digest", "Slack", "iOS push notification", "SMS"].map(c => (
                <div key={c} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: "1px solid #f1f5f9" }}>
                  <span style={{ fontSize: 13, color: "#475569" }}>{c}</span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: "#cbd5e1", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 6, padding: "3px 10px" }}>Not connected</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
