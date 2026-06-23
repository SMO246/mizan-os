import { useState } from "react";

const CORRECT = "0399";

export default function Lock({ onUnlock }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  const press = (val) => {
    if (pin.length >= 4) return;
    const next = pin + val;
    setPin(next);
    setError(false);
    if (next.length === 4) {
      if (next === CORRECT) {
        setTimeout(onUnlock, 200);
      } else {
        setShake(true);
        setError(true);
        setTimeout(() => { setPin(""); setShake(false); }, 600);
      }
    }
  };

  const del = () => { setPin(p => p.slice(0, -1)); setError(false); };

  return (
    <div style={{ fontFamily: "Inter,-apple-system,sans-serif", background: "#f1f5f9", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <style>{`@keyframes shake{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-8px)}40%,80%{transform:translateX(8px)}}`}</style>

      <div style={{ marginBottom: 32, textAlign: "center" }}>
        <div style={{ width: 56, height: 56, background: "linear-gradient(135deg,#2563eb,#7c3aed)", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 800, color: "#fff", margin: "0 auto 16px" }}>M</div>
        <div style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.02em" }}>Mizan OS</div>
        <div style={{ fontSize: 13, color: "#94a3b8", marginTop: 4 }}>Enter your PIN to continue</div>
      </div>

      {/* PIN dots */}
      <div style={{ display: "flex", gap: 16, marginBottom: 40, animation: shake ? "shake 0.5s ease" : "none" }}>
        {[0,1,2,3].map(i => (
          <div key={i} style={{ width: 16, height: 16, borderRadius: "50%", background: pin.length > i ? (error ? "#ef4444" : "#2563eb") : "#e2e8f0", transition: "background 0.15s" }} />
        ))}
      </div>

      {/* Keypad */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, width: 240 }}>
        {[1,2,3,4,5,6,7,8,9,"",0,"⌫"].map((k, i) => (
          <button key={i} onClick={() => k === "⌫" ? del() : k !== "" ? press(String(k)) : null}
            disabled={k === ""}
            style={{ height: 64, borderRadius: 12, border: "1px solid #e2e8f0", background: k === "" ? "transparent" : "#fff", fontSize: k === "⌫" ? 20 : 22, fontWeight: 600, color: k === "⌫" ? "#94a3b8" : "#0f172a", cursor: k === "" ? "default" : "pointer", boxShadow: k === "" ? "none" : "0 1px 3px rgba(0,0,0,0.06)", transition: "all 0.1s" }}>
            {k}
          </button>
        ))}
      </div>
    </div>
  );
}
