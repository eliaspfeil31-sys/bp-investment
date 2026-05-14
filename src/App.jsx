import { useState, useEffect, useRef } from "react";

const SECTORS = [
  "Technology", "Healthcare", "Finance", "Energy", "Consumer Discretionary",
  "Consumer Staples", "Industrials", "Materials", "Real Estate", "Utilities", "Cannabis"
];

const INITIAL_STOCKS = [
  { id: 1, ticker: "ACHR", name: "Archer Aviation", sector: "Industrials", logo: "https://logo.clearbit.com/archer.com", entryPrice: 8.20, shares: 10, currency: "USD" },
  { id: 2, ticker: "IONQ", name: "IonQ", sector: "Technology", logo: "https://logo.clearbit.com/ionq.com", entryPrice: 12.50, shares: 5, currency: "USD" },
  { id: 3, ticker: "RKLB", name: "Rocket Lab", sector: "Industrials", logo: "https://logo.clearbit.com/rocketlabusa.com", entryPrice: 9.80, shares: 8, currency: "USD" },
  { id: 4, ticker: "NVDA", name: "Nvidia", sector: "Technology", logo: "https://logo.clearbit.com/nvidia.com", entryPrice: 450.00, shares: 2, currency: "USD" },
  { id: 5, ticker: "ACB.TO", name: "Aurora Cannabis", sector: "Cannabis", logo: null, entryPrice: 5.58, shares: 10, currency: "CAD" },
];

const INITIAL_UPDATES = [
  {
    id: 1, stockId: 1, ticker: "ACHR", name: "Archer Aviation", sector: "Industrials",
    date: "2026-05-10", text: "Breakout über den Widerstand bei $8.50 bestätigt. eVTOL-Sektor läuft stark. Ziel weiterhin $12-15 Bereich. Halteposition.",
    image: null
  },
  {
    id: 2, stockId: 4, ticker: "NVDA", name: "Nvidia", sector: "Technology",
    date: "2026-05-08", text: "Earnings beat erwartet. KI-Infrastruktur Nachfrage bleibt extrem stark. Kurs hält die 50-Tage-Linie. Long-Bias beibehalten.",
    image: null
  },
  {
    id: 3, stockId: 2, ticker: "IONQ", name: "IonQ", sector: "Technology",
    date: "2026-05-05", text: "Quantencomputing-Aktie konsolidiert nach starkem Run. Fundamental solide. Warte auf Rücksetzer zur 200-Tage-Linie als Nachkaufgelegenheit.",
    image: null
  },
];

const MOCK_PRICES = {
  "ACHR": 10.45, "IONQ": 18.20, "RKLB": 14.30, "NVDA": 512.80, "ACB.TO": 4.70
};

const formatCurrency = (val, currency = "USD") =>
  new Intl.NumberFormat("de-DE", { style: "currency", currency, maximumFractionDigits: 2 }).format(val);

const formatPct = (val) => (val >= 0 ? "+" : "") + val.toFixed(2) + "%";

const LOGO_COLORS = ["#E8801A", "#1A6FE8", "#18A06B", "#E81A4A", "#8B18E8", "#18B8E8", "#E8C218"];

function Logo({ stock, size = 36 }) {
  const [err, setErr] = useState(false);
  const initials = stock.ticker.slice(0, 2).toUpperCase();
  const bg = LOGO_COLORS[stock.id % LOGO_COLORS.length];
  if (stock.logo && !err) {
    return (
      <img
        src={stock.logo}
        alt={stock.name}
        onError={() => setErr(true)}
        style={{ width: size, height: size, borderRadius: 8, objectFit: "contain", background: "#fff", border: "1px solid #2a2a2a", flexShrink: 0 }}
      />
    );
  }
  return (
    <div style={{ width: size, height: size, borderRadius: 8, background: bg, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: size * 0.35, color: "#fff", flexShrink: 0 }}>
      {initials}
    </div>
  );
}

function PieChart({ data }) {
  const canvasRef = useRef(null);
  const colors = ["#E8801A","#1A6FE8","#18A06B","#E81A4A","#8B18E8","#18B8E8","#E8C218","#8BE818","#E84E18","#18E8A0","#A018E8"];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !data.length) return;
    const ctx = canvas.getContext("2d");
    const total = data.reduce((s, d) => s + d.value, 0);
    if (total === 0) return;
    let angle = -Math.PI / 2;
    const cx = canvas.width / 2, cy = canvas.height / 2, r = Math.min(cx, cy) - 10;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    data.forEach((d, i) => {
      const slice = (d.value / total) * 2 * Math.PI;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, angle, angle + slice);
      ctx.closePath();
      ctx.fillStyle = colors[i % colors.length];
      ctx.fill();
      ctx.strokeStyle = "#0e0e16";
      ctx.lineWidth = 2;
      ctx.stroke();
      angle += slice;
    });
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.55, 0, 2 * Math.PI);
    ctx.fillStyle = "#0e0e16";
    ctx.fill();
  }, [data]);

  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <div style={{ display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap" }}>
      <canvas ref={canvasRef} width={160} height={160} style={{ flexShrink: 0 }} />
      <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1, minWidth: 0 }}>
        {data.map((d, i) => (
          <div key={d.label} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: colors[i % colors.length], flexShrink: 0 }} />
            <span style={{ color: "#a0a0b0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.label}</span>
            <span style={{ color: "#e0e0f0", fontWeight: 600, marginLeft: "auto", paddingLeft: 8, flexShrink: 0 }}>
              {total > 0 ? ((d.value / total) * 100).toFixed(1) + "%" : "0%"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Modal({ title, onClose, children, onSubmit, submitLabel }) {
  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 16 }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ background: "#0e0e16", border: "1px solid #2a2a3a", borderRadius: 16, padding: 28, width: "min(520px, 100%)", maxHeight: "90vh", overflowY: "auto" }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#fff", fontFamily: "'Space Grotesk', sans-serif" }}>{title}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#606080", fontSize: 22, lineHeight: 1 }}>
            <i className="ti ti-x" />
          </button>
        </div>
        {children}
        <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
          <button onClick={onClose} style={{ flex: 1, padding: 12, borderRadius: 8, border: "1px solid #2a2a3a", background: "transparent", color: "#808090", cursor: "pointer", fontSize: 14 }}>
            Abbrechen
          </button>
          <button onClick={onSubmit} style={{ flex: 1, padding: 12, borderRadius: 8, border: "none", background: "#E8801A", color: "#fff", cursor: "pointer", fontSize: 14, fontWeight: 600 }}>
            {submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: 12, color: "#808090", fontWeight: 500 }}>{label}</label>
      {children}
    </div>
  );
}

const inputStyle = {
  padding: "10px 12px", borderRadius: 8, border: "1px solid #2a2a3a",
  background: "#14141e", color: "#e0e0f0", fontSize: 14, width: "100%",
  outline: "none", fontFamily: "'DM Sans', sans-serif"
};

export default function App() {
  const [view, setView] = useState("portfolio");
  const [stocks, setStocks] = useState(() => {
    try { return JSON.parse(localStorage.getItem("bp_stocks")) || INITIAL_STOCKS; } catch { return INITIAL_STOCKS; }
  });
  const [updates, setUpdates] = useState(() => {
    try { return JSON.parse(localStorage.getItem("bp_updates")) || INITIAL_UPDATES; } catch { return INITIAL_UPDATES; }
  });
  const [prices, setPrices] = useState(MOCK_PRICES);
  const [analysisView, setAnalysisView] = useState("az");
  const [filterSector, setFilterSector] = useState("all");
  const [showAddStock, setShowAddStock] = useState(false);
  const [showAddUpdate, setShowAddUpdate] = useState(false);
  const [loadingPrices, setLoadingPrices] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [newStock, setNewStock] = useState({ ticker: "", name: "", sector: SECTORS[0], entryPrice: "", shares: "", currency: "USD", logo: "" });
  const [newUpdate, setNewUpdate] = useState({ ticker: "", text: "", image: null });

  useEffect(() => {
    localStorage.setItem("bp_stocks", JSON.stringify(stocks));
  }, [stocks]);

  useEffect(() => {
    localStorage.setItem("bp_updates", JSON.stringify(updates));
  }, [updates]);

  const fetchPrices = async () => {
    setLoadingPrices(true);
    // Simulated price update — replace with real Yahoo Finance API if needed
    await new Promise(r => setTimeout(r, 900));
    const updated = { ...prices };
    stocks.forEach(s => {
      const base = MOCK_PRICES[s.ticker] || s.entryPrice;
      updated[s.ticker] = +(base * (1 + (Math.random() * 0.04 - 0.02))).toFixed(2);
    });
    setPrices(updated);
    setLoadingPrices(false);
  };

  const getPrice = (s) => prices[s.ticker] || s.entryPrice;
  const getPnlPct = (s) => ((getPrice(s) - s.entryPrice) / s.entryPrice) * 100;
  const getPositionValue = (s) => getPrice(s) * s.shares;

  const totalCost = stocks.reduce((sum, s) => sum + s.entryPrice * s.shares, 0);
  const totalValue = stocks.reduce((sum, s) => sum + getPositionValue(s), 0);
  const totalPnl = totalValue - totalCost;
  const totalPnlPct = totalCost > 0 ? (totalPnl / totalCost) * 100 : 0;

  const sortedUpdates = [...updates].sort((a, b) => new Date(b.date) - new Date(a.date));

  const filteredUpdates = analysisView === "az"
    ? [...sortedUpdates].sort((a, b) => a.ticker.localeCompare(b.ticker))
    : filterSector === "all" ? sortedUpdates : sortedUpdates.filter(u => u.sector === filterSector);

  const allocationData = stocks.map(s => ({ label: s.ticker, value: getPositionValue(s) }));
  const sectorData = SECTORS
    .map(sec => ({ label: sec, value: stocks.filter(s => s.sector === sec).reduce((sum, s) => sum + getPositionValue(s), 0) }))
    .filter(d => d.value > 0);

  const handleAddStock = () => {
    if (!newStock.ticker || !newStock.name || !newStock.entryPrice) return;
    const s = { ...newStock, id: Date.now(), entryPrice: parseFloat(newStock.entryPrice), shares: parseFloat(newStock.shares) || 1 };
    setStocks(prev => [...prev, s]);
    setPrices(prev => ({ ...prev, [s.ticker]: s.entryPrice }));
    setNewStock({ ticker: "", name: "", sector: SECTORS[0], entryPrice: "", shares: "", currency: "USD", logo: "" });
    setShowAddStock(false);
  };

  const handleAddUpdate = () => {
    if (!newUpdate.ticker || !newUpdate.text) return;
    const stock = stocks.find(s => s.ticker.toUpperCase() === newUpdate.ticker.toUpperCase());
    if (!stock) { alert("Ticker nicht gefunden. Bitte zuerst die Aktie unter 'Aktie hinzufügen' anlegen."); return; }
    const u = {
      id: Date.now(), stockId: stock.id, ticker: stock.ticker, name: stock.name,
      sector: stock.sector, date: new Date().toISOString().split("T")[0],
      text: newUpdate.text, image: newUpdate.image
    };
    setUpdates(prev => [u, ...prev]);
    setNewUpdate({ ticker: "", text: "", image: null });
    setShowAddUpdate(false);
  };

  const handleDeleteStock = (id) => {
    if (!confirm("Aktie wirklich entfernen?")) return;
    setStocks(prev => prev.filter(s => s.id !== id));
  };

  const handleDeleteUpdate = (id) => {
    if (!confirm("Update wirklich löschen?")) return;
    setUpdates(prev => prev.filter(u => u.id !== id));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setNewUpdate(prev => ({ ...prev, image: ev.target.result }));
    reader.readAsDataURL(file);
  };

  const navItems = [
    { key: "portfolio", icon: "ti-layout-dashboard", label: "Portfolio" },
    { key: "analyses", icon: "ti-chart-candle", label: "Alle Analysen" },
    { key: "positions", icon: "ti-list-details", label: "Positionen" },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>

      {/* Sidebar */}
      <aside style={{
        width: sidebarOpen ? 220 : 60, background: "#0e0e16", borderRight: "1px solid #1e1e2e",
        display: "flex", flexDirection: "column", position: "sticky", top: 0, height: "100vh",
        flexShrink: 0, transition: "width 0.2s ease", overflow: "hidden"
      }}>
        <div style={{ padding: "18px 12px 16px", borderBottom: "1px solid #1e1e2e", display: "flex", alignItems: "center", gap: 10, minWidth: 220 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: "#E8801A", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 14, color: "#fff", flexShrink: 0 }}>
            bp
          </div>
          {sidebarOpen && (
            <div>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 12, color: "#fff", lineHeight: 1.2, whiteSpace: "nowrap" }}>BP INVESTMENT</div>
              <div style={{ fontSize: 10, color: "#606080", letterSpacing: "0.1em" }}>GROUP</div>
            </div>
          )}
        </div>

        <nav style={{ padding: "10px 8px", flex: 1 }}>
          {navItems.map(item => (
            <button key={item.key} onClick={() => setView(item.key)} style={{
              width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "10px 10px",
              borderRadius: 8, border: "none", cursor: "pointer", marginBottom: 2,
              background: view === item.key ? "rgba(232,128,26,0.15)" : "transparent",
              color: view === item.key ? "#E8801A" : "#808090", fontSize: 14, fontWeight: 500,
              transition: "all 0.15s", minWidth: 0, whiteSpace: "nowrap"
            }}>
              <i className={`ti ${item.icon}`} style={{ fontSize: 20, flexShrink: 0 }} aria-hidden="true" />
              {sidebarOpen && item.label}
            </button>
          ))}
        </nav>

        <div style={{ padding: "10px 8px", borderTop: "1px solid #1e1e2e", display: "flex", flexDirection: "column", gap: 8, minWidth: 220 }}>
          <button onClick={() => setShowAddUpdate(true)} style={{
            width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #E8801A",
            background: "rgba(232,128,26,0.1)", color: "#E8801A", cursor: "pointer", fontSize: 13, fontWeight: 600,
            display: "flex", alignItems: "center", gap: 8, whiteSpace: "nowrap"
          }}>
            <i className="ti ti-pencil" style={{ fontSize: 16, flexShrink: 0 }} />
            {sidebarOpen && "Neues Update"}
          </button>
          <button onClick={() => setShowAddStock(true)} style={{
            width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #2a2a3a",
            background: "transparent", color: "#a0a0b0", cursor: "pointer", fontSize: 13,
            display: "flex", alignItems: "center", gap: 8, whiteSpace: "nowrap"
          }}>
            <i className="ti ti-plus" style={{ fontSize: 16, flexShrink: 0 }} />
            {sidebarOpen && "Aktie hinzufügen"}
          </button>
        </div>

        <button onClick={() => setSidebarOpen(p => !p)} style={{
          margin: "8px", padding: "8px", borderRadius: 8, border: "1px solid #2a2a3a",
          background: "transparent", color: "#606080", cursor: "pointer", fontSize: 16
        }}>
          <i className={`ti ${sidebarOpen ? "ti-layout-sidebar-left-collapse" : "ti-layout-sidebar-left-expand"}`} />
        </button>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, padding: "28px 32px", overflowY: "auto", minWidth: 0 }}>

        {/* Topbar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28, gap: 16, flexWrap: "wrap" }}>
          <div>
            <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, fontWeight: 700, margin: 0, color: "#fff" }}>
              {view === "portfolio" ? "Portfolio Übersicht" : view === "analyses" ? "Alle Analysen" : "Offene Positionen"}
            </h1>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "#606080" }}>
              {new Date().toLocaleDateString("de-DE", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
          <button onClick={fetchPrices} disabled={loadingPrices} style={{
            display: "flex", alignItems: "center", gap: 8, padding: "9px 18px",
            borderRadius: 8, border: "1px solid #2a2a3a", background: "transparent",
            color: loadingPrices ? "#606080" : "#a0a0b0", cursor: "pointer", fontSize: 13, flexShrink: 0
          }}>
            <i className={`ti ${loadingPrices ? "ti-loader-2" : "ti-refresh"}`} style={{ fontSize: 16 }} />
            {loadingPrices ? "Aktualisiere..." : "Kurse aktualisieren"}
          </button>
        </div>

        {/* ── PORTFOLIO VIEW ── */}
        {view === "portfolio" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

            {/* KPI row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16 }}>
              {[
                { label: "Portfolio Wert", value: formatCurrency(totalValue), icon: "ti-wallet", color: "#E8801A" },
                { label: "Gesamt P&L (€)", value: formatCurrency(totalPnl), sub: formatPct(totalPnlPct), icon: "ti-trending-up", color: totalPnl >= 0 ? "#18A06B" : "#E84E18" },
                { label: "Positionen", value: stocks.length, icon: "ti-building-bank", color: "#1A6FE8" },
                { label: "Updates", value: updates.length, icon: "ti-news", color: "#8B18E8" },
              ].map(card => (
                <div key={card.label} style={{ background: "#0e0e16", border: "1px solid #1e1e2e", borderRadius: 12, padding: "18px 20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <p style={{ margin: "0 0 8px", fontSize: 11, color: "#606080", textTransform: "uppercase", letterSpacing: "0.08em" }}>{card.label}</p>
                      <p style={{ margin: 0, fontSize: 22, fontWeight: 700, color: card.color, fontFamily: "'Space Grotesk', sans-serif" }}>{card.value}</p>
                      {card.sub && <p style={{ margin: "4px 0 0", fontSize: 13, color: totalPnl >= 0 ? "#18A06B" : "#E84E18", fontWeight: 600 }}>{card.sub}</p>}
                    </div>
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: card.color + "20", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <i className={`ti ${card.icon}`} style={{ fontSize: 20, color: card.color }} aria-hidden="true" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Charts */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
              <div style={{ background: "#0e0e16", border: "1px solid #1e1e2e", borderRadius: 12, padding: 20 }}>
                <h3 style={{ margin: "0 0 16px", fontSize: 13, fontWeight: 600, color: "#a0a0b0", textTransform: "uppercase", letterSpacing: "0.06em" }}>Allokation nach Position</h3>
                <PieChart data={allocationData} />
              </div>
              <div style={{ background: "#0e0e16", border: "1px solid #1e1e2e", borderRadius: 12, padding: 20 }}>
                <h3 style={{ margin: "0 0 16px", fontSize: 13, fontWeight: 600, color: "#a0a0b0", textTransform: "uppercase", letterSpacing: "0.06em" }}>Allokation nach Sektor</h3>
                <PieChart data={sectorData} />
              </div>
            </div>

            {/* Recent updates */}
            <div style={{ background: "#0e0e16", border: "1px solid #1e1e2e", borderRadius: 12, padding: 20 }}>
              <h3 style={{ margin: "0 0 16px", fontSize: 13, fontWeight: 600, color: "#a0a0b0", textTransform: "uppercase", letterSpacing: "0.06em" }}>Neueste Updates</h3>
              {sortedUpdates.slice(0, 4).map((u, idx) => {
                const stock = stocks.find(s => s.id === u.stockId);
                const pnl = stock ? getPnlPct(stock) : 0;
                return (
                  <div key={u.id} style={{ display: "flex", gap: 14, padding: "14px 0", borderBottom: idx < 3 ? "1px solid #1a1a28" : "none", alignItems: "center" }}>
                    {stock && <Logo stock={stock} size={40} />}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3, flexWrap: "wrap" }}>
                        <span style={{ fontWeight: 700, fontSize: 14, color: "#fff", fontFamily: "'Space Grotesk', sans-serif" }}>{u.ticker}</span>
                        <span style={{ fontSize: 12, color: "#606080" }}>{u.sector}</span>
                        <span style={{ marginLeft: "auto", fontSize: 11, color: "#404055" }}>{u.date}</span>
                      </div>
                      <p style={{ margin: 0, fontSize: 13, color: "#a0a0b0", lineHeight: 1.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.text}</p>
                    </div>
                    {stock && (
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: pnl >= 0 ? "#18A06B" : "#E84E18" }}>{formatPct(pnl)}</p>
                        <p style={{ margin: "2px 0 0", fontSize: 11, color: "#505060" }}>{formatCurrency(getPrice(stock), stock.currency)}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── ANALYSES VIEW ── */}
        {view === "analyses" && (
          <div>
            <div style={{ display: "flex", gap: 12, marginBottom: 20, alignItems: "center", flexWrap: "wrap" }}>
              <div style={{ display: "flex", background: "#0e0e16", border: "1px solid #1e1e2e", borderRadius: 8, overflow: "hidden" }}>
                {[{ key: "az", label: "A – Z" }, { key: "sector", label: "Sektor" }].map(t => (
                  <button key={t.key} onClick={() => setAnalysisView(t.key)} style={{
                    padding: "9px 22px", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600,
                    background: analysisView === t.key ? "#E8801A" : "transparent",
                    color: analysisView === t.key ? "#fff" : "#808090", transition: "all 0.15s"
                  }}>{t.label}</button>
                ))}
              </div>
              {analysisView === "sector" && (
                <select value={filterSector} onChange={e => setFilterSector(e.target.value)} style={{ ...inputStyle, width: "auto", cursor: "pointer" }}>
                  <option value="all">Alle Sektoren</option>
                  {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              )}
              <span style={{ marginLeft: "auto", fontSize: 13, color: "#606080" }}>{filteredUpdates.length} Updates</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {filteredUpdates.map(u => {
                const stock = stocks.find(s => s.id === u.stockId);
                const pnl = stock ? getPnlPct(stock) : 0;
                const curPrice = stock ? getPrice(stock) : 0;
                return (
                  <div key={u.id} style={{ background: "#0e0e16", border: "1px solid #1e1e2e", borderRadius: 12, padding: 20, display: "flex", gap: 16 }}>
                    <div style={{ flexShrink: 0 }}>
                      {stock ? <Logo stock={stock} size={48} /> : (
                        <div style={{ width: 48, height: 48, borderRadius: 8, background: "#1e1e2e", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#606080" }}>{u.ticker}</div>
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, flexWrap: "wrap" }}>
                        <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 16, color: "#fff" }}>{u.ticker}</span>
                        <span style={{ fontSize: 13, color: "#808090" }}>{u.name}</span>
                        <span style={{ padding: "2px 10px", borderRadius: 20, background: "#1a1a28", border: "1px solid #2a2a3a", fontSize: 11, color: "#a0a0b0" }}>{u.sector}</span>
                        <span style={{ marginLeft: "auto", fontSize: 12, color: "#404055" }}>{u.date}</span>
                        <button onClick={() => handleDeleteUpdate(u.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#404055", fontSize: 16, padding: 0 }} title="Update löschen">
                          <i className="ti ti-trash" />
                        </button>
                      </div>
                      <p style={{ margin: "0 0 12px", fontSize: 14, color: "#c0c0d0", lineHeight: 1.7 }}>{u.text}</p>
                      {u.image && (
                        <img src={u.image} alt="Analyse" style={{ maxWidth: "100%", maxHeight: 340, borderRadius: 8, border: "1px solid #2a2a3a", objectFit: "cover" }} />
                      )}
                    </div>
                    {stock && (
                      <div style={{ flexShrink: 0, textAlign: "right", minWidth: 90 }}>
                        <div style={{ padding: "5px 12px", borderRadius: 8, background: pnl >= 0 ? "rgba(24,160,107,0.15)" : "rgba(232,78,24,0.15)", marginBottom: 6, display: "inline-block" }}>
                          <span style={{ fontSize: 15, fontWeight: 700, color: pnl >= 0 ? "#18A06B" : "#E84E18" }}>{formatPct(pnl)}</span>
                        </div>
                        <p style={{ margin: 0, fontSize: 12, color: "#808090" }}>{formatCurrency(curPrice, stock.currency)}</p>
                        <p style={{ margin: "3px 0 0", fontSize: 11, color: "#404055" }}>Ø {formatCurrency(stock.entryPrice, stock.currency)}</p>
                      </div>
                    )}
                  </div>
                );
              })}
              {filteredUpdates.length === 0 && (
                <div style={{ textAlign: "center", padding: "80px 0", color: "#404055" }}>
                  <i className="ti ti-chart-candle" style={{ fontSize: 52, display: "block", marginBottom: 14 }} aria-hidden="true" />
                  <p style={{ margin: 0, fontSize: 15 }}>Noch keine Updates vorhanden</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── POSITIONS VIEW ── */}
        {view === "positions" && (
          <div style={{ background: "#0e0e16", border: "1px solid #1e1e2e", borderRadius: 12, overflow: "hidden" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 600 }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #1e1e2e" }}>
                    {["Wertpapier", "Volumen", "Einstieg Ø", "Kurs", "Performance", "Sektor", ""].map(h => (
                      <th key={h} style={{ padding: "12px 16px", textAlign: h === "Wertpapier" ? "left" : "right", fontSize: 11, color: "#606080", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600, whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {stocks.map(s => {
                    const pnl = getPnlPct(s);
                    const cur = getPrice(s);
                    return (
                      <tr key={s.id} style={{ borderBottom: "1px solid #14141e" }}>
                        <td style={{ padding: "14px 16px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <Logo stock={s} size={36} />
                            <div>
                              <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: "#e0e0f0", fontFamily: "'Space Grotesk', sans-serif" }}>{s.ticker}</p>
                              <p style={{ margin: 0, fontSize: 12, color: "#606080" }}>{s.name}</p>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: "14px 16px", textAlign: "right", fontSize: 14, color: "#c0c0d0" }}>{s.shares}</td>
                        <td style={{ padding: "14px 16px", textAlign: "right", fontSize: 14, color: "#c0c0d0" }}>{formatCurrency(s.entryPrice, s.currency)}</td>
                        <td style={{ padding: "14px 16px", textAlign: "right", fontSize: 14, color: "#e0e0f0", fontWeight: 600 }}>{formatCurrency(cur, s.currency)}</td>
                        <td style={{ padding: "14px 16px", textAlign: "right" }}>
                          <span style={{ padding: "4px 10px", borderRadius: 6, fontSize: 13, fontWeight: 700, background: pnl >= 0 ? "rgba(24,160,107,0.15)" : "rgba(232,78,24,0.15)", color: pnl >= 0 ? "#18A06B" : "#E84E18" }}>
                            {formatPct(pnl)}
                          </span>
                        </td>
                        <td style={{ padding: "14px 16px", textAlign: "right", fontSize: 12, color: "#606080" }}>{s.sector}</td>
                        <td style={{ padding: "14px 16px", textAlign: "right" }}>
                          <button onClick={() => handleDeleteStock(s.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#404055", fontSize: 16 }} title="Entfernen">
                            <i className="ti ti-trash" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* ── MODAL: Neues Update ── */}
      {showAddUpdate && (
        <Modal title="Neues Update" onClose={() => setShowAddUpdate(false)} onSubmit={handleAddUpdate} submitLabel="Update veröffentlichen">
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Field label="Ticker Symbol *">
              <input value={newUpdate.ticker} onChange={e => setNewUpdate(p => ({ ...p, ticker: e.target.value.toUpperCase() }))}
                placeholder="z.B. NVDA" style={inputStyle} />
            </Field>
            <Field label="Analyse-Text *">
              <textarea value={newUpdate.text} onChange={e => setNewUpdate(p => ({ ...p, text: e.target.value }))}
                rows={5} placeholder="Deine Analyse, Markteinschätzung, Kursziel..."
                style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }} />
            </Field>
            <Field label="Chart / Analyse-Bild (optional)">
              <input type="file" accept="image/*" onChange={handleImageUpload} style={{ ...inputStyle, cursor: "pointer" }} />
              {newUpdate.image && (
                <div style={{ position: "relative" }}>
                  <img src={newUpdate.image} alt="Vorschau" style={{ width: "100%", maxHeight: 200, borderRadius: 8, objectFit: "cover", marginTop: 8 }} />
                  <button onClick={() => setNewUpdate(p => ({ ...p, image: null }))} style={{ position: "absolute", top: 12, right: 8, background: "rgba(0,0,0,0.6)", border: "none", borderRadius: 6, color: "#fff", cursor: "pointer", padding: "4px 8px", fontSize: 12 }}>
                    Entfernen
                  </button>
                </div>
              )}
            </Field>
          </div>
        </Modal>
      )}

      {/* ── MODAL: Aktie hinzufügen ── */}
      {showAddStock && (
        <Modal title="Aktie hinzufügen" onClose={() => setShowAddStock(false)} onSubmit={handleAddStock} submitLabel="Hinzufügen">
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <Field label="Ticker *">
                <input value={newStock.ticker} onChange={e => setNewStock(p => ({ ...p, ticker: e.target.value.toUpperCase() }))} placeholder="AAPL" style={inputStyle} />
              </Field>
              <Field label="Währung">
                <select value={newStock.currency} onChange={e => setNewStock(p => ({ ...p, currency: e.target.value }))} style={{ ...inputStyle, cursor: "pointer" }}>
                  {["USD","EUR","CAD","GBP","CHF"].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
            </div>
            <Field label="Unternehmensname *">
              <input value={newStock.name} onChange={e => setNewStock(p => ({ ...p, name: e.target.value }))} placeholder="Apple Inc." style={inputStyle} />
            </Field>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <Field label="Einstiegspreis Ø *">
                <input type="number" value={newStock.entryPrice} onChange={e => setNewStock(p => ({ ...p, entryPrice: e.target.value }))} placeholder="150.00" style={inputStyle} />
              </Field>
              <Field label="Anzahl Aktien">
                <input type="number" value={newStock.shares} onChange={e => setNewStock(p => ({ ...p, shares: e.target.value }))} placeholder="10" style={inputStyle} />
              </Field>
            </div>
            <Field label="Sektor">
              <select value={newStock.sector} onChange={e => setNewStock(p => ({ ...p, sector: e.target.value }))} style={{ ...inputStyle, cursor: "pointer" }}>
                {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Logo URL (optional — z.B. von clearbit.com)">
              <input value={newStock.logo} onChange={e => setNewStock(p => ({ ...p, logo: e.target.value }))} placeholder="https://logo.clearbit.com/apple.com" style={inputStyle} />
            </Field>
          </div>
        </Modal>
      )}
    </div>
  );
}
