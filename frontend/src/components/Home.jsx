import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";

/* DUMMY DATA (Temporary) -------------------------------- */
// TODO: Add a more comprehensive list of options (4) and an option to select specific months
const MONTH_OPTIONS = ["This Month", "Last Month", "2 Months Ago"];

// TODO: Replace TRANSACTIONS with API data once spending endpoint is connected.
// Should support pagination instead of slice-based preview.
const TRANSACTIONS = [
  {
    id: 1,
    icon: "☕",
    name: "Tim Hortons",
    when: "Today, 2:34 PM",
    amount: "-$6.45",
    tone: "negative",
    important: false,
  },
  {
    id: 2,
    icon: "📘",
    name: "UofT Bookstore",
    when: "Yesterday, 11:20 AM",
    amount: "-$89.99",
    tone: "negative",
    important: true,
  },
  {
    id: 3,
    icon: "💸",
    name: "OSAP Deposit",
    when: "Feb 15, 2026",
    amount: "+$3,200",
    tone: "positive",
    important: true,
  },
  {
    id: 4,
    icon: "🛒",
    name: "Amazon.ca",
    when: "Feb 14, 2026",
    amount: "-$34.50",
    tone: "negative",
    important: false,
  },
  {
    id: 5,
    icon: "🎵",
    name: "Spotify",
    when: "Feb 12, 2026",
    amount: "-$5.99",
    tone: "negative",
    important: false,
  },
  {
    id: 6,
    icon: "🚇",
    name: "TTC Presto",
    when: "Feb 10, 2026",
    amount: "-$25.00",
    tone: "negative",
    important: false,
  },
  {
    id: 7,
    icon: "🍔",
    name: "Uber Eats",
    when: "Feb 09, 2026",
    amount: "-$18.40",
    tone: "negative",
    important: true,
  },
  {
    id: 8,
    icon: "🧾",
    name: "Phone Plan",
    when: "Feb 07, 2026",
    amount: "-$55.00",
    tone: "negative",
    important: true,
  },
];

const DEADLINES = [
  {
    id: 1,
    day: "28",
    title: "OSAP Application",
    meta: "Due Feb 28 — 6 days left",
    badgeClass: "d-red",
  },
  {
    id: 2,
    day: "01",
    title: "Rogers Phone Bill",
    meta: "Due Mar 1 — $55.00",
    badgeClass: "d-yellow",
  },
  {
    id: 3,
    day: "15",
    title: "Lester B. Pearson Scholarship",
    meta: "Due Mar 15 — $10,000 award",
    badgeClass: "d-blue",
  },
    {
    id: 3,
    day: "18",
    title: "UofT Scholarship",
    meta: "Due Mar 18 — $5,000 award",
    badgeClass: "d-blue",
  },
];

/* CSS CODE -------------------------------- */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Source+Sans+3:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; }

  :root {
    --uoft-blue: #002A5C;
    --uoft-mid: #0047A0;
    --uoft-accent: #E8B53E;

    --off-white: #F4F7FB;
    --white: #FFFFFF;
    --border: #D0DBE8;
    --border-2: #C7D4E6;
    --text-muted: #6B7A90;

    --success: #18A574;
    --danger: #C0392B;

    --shadow: 0 4px 16px rgba(0,42,92,0.08);
  }

  body { font-family: 'Source Sans 3', sans-serif; }

  .db-page {
    min-height: 100vh;
    background: var(--off-white);
    font-family: 'Source Sans 3', sans-serif;;
  }

  .db-body {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
  }

  .db-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    gap: 1rem;
    margin-bottom: 1.25rem;
    flex-wrap: wrap;
  }

  .db-header h1 {
    font-family: 'Source Sans 3', sans-serif;
    font-size: 1.9rem;
    font-weight: 800;
    color: var(--uoft-blue);
    margin: 0 0 0.25rem 0;
  }

  .db-header p {
    margin: 0;
    color: var(--text-muted);
    font-size: 0.95rem;
  }

  .db-header-right {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-wrap: wrap;
  }

  /* Dropdown */
  .pill {
    background: var(--white);
    border: 2px solid var(--border);
    border-radius: 999px;
    padding: 0.55rem 0.9rem;
    display: inline-flex;
    align-items: center;
    gap: 0.55rem;
    color: var(--uoft-blue);
    font-weight: 700;
    cursor: pointer;
    user-select: none;
    position: relative;
  }

  .pill:focus-within,
  .pill:hover {
    border-color: var(--border-2);
  }

  .pill .chev {
    margin-left: 0.15rem;
    opacity: 0.75;
  }

  .menu {
    position: absolute;
    top: calc(100% + 10px);
    left: 0;
    width: 220px;
    background: var(--white);
    border: 2px solid var(--border);
    border-radius: 14px;
    box-shadow: var(--shadow);
    padding: 0.35rem;
    z-index: 50;
  }

  .menuItem {
    padding: 0.6rem 0.7rem;
    border-radius: 10px;
    font-weight: 700;
    color: var(--uoft-blue);
    cursor: pointer;
  }

  .menuItem:hover { background: #EAF0FF; }

  .menuItem.active {
    background: #3B6BE3;
    color: white;
  }

  /* Important toggle */
  .pillToggle {
    gap: 0.65rem;
    padding: 0.55rem 1rem;
  }

  .dot {
    width: 14px;
    height: 14px;
    border-radius: 999px;
    border: 2px solid var(--border);
    background: #fff;
  }

  .dot.on {
    background: #B9C7E6;
    border-color: #B9C7E6;
  }

  /* Layout */
  .db-grid {
    display: grid;
    grid-template-columns: 1fr 320px;
    gap: 1.5rem;
    align-items: start;
  }

  .db-main, .db-side { min-width: 0; }

  /* Cards */
  .card {
    background: var(--white);
    border: 2px solid var(--border);
    border-radius: 18px;
    padding: 1.25rem 1.5rem;
  }

  .card-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    margin-bottom: 0.85rem;
  }

  .card-title h2 {
    margin: 0;
    font-size: 1.02rem;
    font-weight: 900;
    color: var(--uoft-blue);
  }

  .link {
    color: var(--uoft-mid);
    font-weight: 800;
    font-size: 0.92rem;
    cursor: pointer;
    user-select: none;
  }

  /* Hero */
  .hero {
    background: linear-gradient(135deg, var(--uoft-blue), var(--uoft-mid));
    color: white;
    border: none;
    box-shadow: var(--shadow);
  }

  .hero-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1rem;
    margin-bottom: 0.9rem;
  }

  .hero-label {
    font-size: 0.85rem;
    opacity: 0.92;
    margin: 0 0 0.25rem 0;
  }

  .hero-amount {
    font-size: 1.9rem;
    font-weight: 900;
    margin: 0;
    letter-spacing: -0.02em;
  }

  .hero-change {
    background: rgba(255,255,255,0.14);
    border: 1px solid rgba(255,255,255,0.25);
    padding: 0.35rem 0.65rem;
    border-radius: 999px;
    font-weight: 900;
    font-size: 0.85rem;
    white-space: nowrap;
  }

  .hero-meta {
    display: flex;
    justify-content: space-between;
    opacity: 0.92;
    font-size: 0.88rem;
    margin-top: 0.6rem;
  }

  .progress {
    height: 8px;
    background: rgba(255,255,255,0.18);
    border-radius: 999px;
    overflow: hidden;
    margin-top: 0.7rem;
  }

  .progress > span {
    display: block;
    height: 100%;
    width: var(--pct, 60%);
    background: rgba(255,255,255,0.88);
    border-radius: 999px;
  }

  /* Tiles */
  .actions {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 1.25rem;
    margin-top: 1.25rem;
    margin-bottom: 1.25rem;
  }

  .tile {
    background: var(--white);
    border: 2px solid var(--border);
    border-radius: 18px;
    padding: 1.15rem 1.2rem;
    cursor: pointer;
    transition: transform 0.12s, box-shadow 0.12s, border-color 0.12s;
    display: flex;
    align-items: center;
    gap: 0.95rem;
    min-width: 0;
  }

  .tile:hover {
    border-color: var(--border-2);
    box-shadow: 0 6px 18px rgba(0,42,92,0.08);
    transform: translateY(-1px);
  }

  .tile:active { transform: translateY(0); }

  .tileIconWrap {
    width: 54px;
    height: 54px;
    border-radius: 16px;
    border: 2px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    background: #fff;
  }

  .tScholar { background: #FFF6E0; border-color: rgba(232,181,62,0.5); }
  .tBills { background: #EAF0FF; border-color: rgba(0,71,160,0.18); }
  .tCodes { background: #ECFDF5; border-color: rgba(24,165,116,0.18); }
  .tInvest { background: #E6FFFC; border-color: rgba(24,165,116,0.25); }
  .tileTitle {
    font-weight: 900;
    color: var(--uoft-blue);
    font-size: 1.05rem;
    margin: 0 0 0.1rem 0;
  }

  .tileSub {
    margin: 0;
    color: var(--text-muted);
    font-size: 0.95rem;
  }

  /* Insight */
  .insightCardSpacing { margin-bottom: 1.25rem; }

  .insight {
    display: flex;
    gap: 0.85rem;
    align-items: flex-start;
  }

  .insightIcon {
    width: 54px;
    height: 54px;
    border-radius: 16px;
    background: #FFF6E0;
    border: 2px solid rgba(232,181,62,0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    font-size: 1.15rem;
  }

  .insight strong {
    display: block;
    color: var(--uoft-blue);
    font-weight: 900;
    font-size: 1.05rem;
    margin-bottom: 0.2rem;
  }

  .insight p {
    margin: 0;
    color: var(--text-muted);
    font-size: 1rem;
    line-height: 1.45;
  }

  /* Lists */
  .list { display: flex; flex-direction: column; gap: 0.95rem; }

  .row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.9rem;
    padding: 1rem;
    border-radius: 16px;
    background: #F7FAFF;
    border: 2px solid rgba(208,219,232,0.75);
  }

  .row-left {
    display: flex;
    gap: 0.9rem;
    align-items: center;
    min-width: 0;
  }

  .row-icon {
    width: 52px;
    height: 52px;
    border-radius: 16px;
    background: #fff;
    border: 2px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    font-size: 1.2rem;
  }

  .row-title {
    font-weight: 900;
    color: var(--uoft-blue);
    font-size: 1.05rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .row-sub {
    color: var(--text-muted);
    font-size: 0.95rem;
    margin-top: 0.15rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .amt {
    font-weight: 900;
    font-size: 1.05rem;
    white-space: nowrap;
  }

  .amt.negative { color: var(--danger); }
  .amt.positive { color: var(--success); }

  .empty {
    color: var(--text-muted);
    font-size: 0.95rem;
    text-align: center;
    padding: 1.25rem 0;
  }

  /* Deadlines */
  .deadlineBadge {
    width: 52px;
    height: 52px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 900;
    flex-shrink: 0;
    border: 2px solid var(--border);
    background: #fff;
  }

  .d-red { background: #FDECEC; color: var(--danger); border-color: rgba(192,57,43,0.25); }
  .d-yellow { background: #FFF6E0; color: #8A5A00; border-color: rgba(232,181,62,0.45); }
  .d-blue { background: #EAF0FF; color: var(--uoft-mid); border-color: rgba(0,71,160,0.25); }

  /* Responsive */
  @media (max-width: 980px) {
    .db-grid { grid-template-columns: 1fr; }
    .db-side { order: 2; }
  }

  @media (max-width: 720px) {
    .db-body { padding: 1.25rem 1rem; }
    .actions { grid-template-columns: 1fr; }
    .pill { width: 100%; justify-content: space-between; }
    .db-header { align-items: flex-start; }
    .menu { width: 100%; }
  }
`;

/* COMPONENTS --------------------------------*/
function HeroSpendingCard({ monthLabel, total, budget, deltaPct }) {
  const pctUsed = Math.min(100, Math.round((total / budget) * 100));

  return (
    <div className="card hero" style={{ ["--pct"]: `${pctUsed}%` }}>
      <div className="hero-top">
        <div>
          <p className="hero-label">Monthly Spending • {monthLabel}</p>
          <p className="hero-amount">
            $
            {total.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
        </div>

        <div className="hero-change">
          {deltaPct >= 0 ? `↗ +${deltaPct}%` : `↘ ${deltaPct}%`}
        </div>
      </div>

      <div className="hero-meta">
        <span>Budget: ${budget.toLocaleString()}/mo</span>
        <span>{pctUsed}% used</span>
      </div>

      <div className="progress">
        <span />
      </div>
    </div>
  );
}

function QuickTile({ icon, title, subtitle, toneClass, onClick }) {
  return (
    <div className="tile" onClick={onClick} role="button" tabIndex={0}>
      <div className={`tileIconWrap ${toneClass}`}>{icon}</div>
      <div style={{ minWidth: 0 }}>
        <div className="tileTitle">{title}</div>
        <p className="tileSub">{subtitle}</p>
      </div>
    </div>
  );
}

function TransactionList({ items }) {
  if (!items.length) return <div className="empty">No transactions yet.</div>;

  return (
    <div className="list">
      {items.map((t) => (
        <div className="row" key={t.id}>
          <div className="row-left">
            <div className="row-icon">{t.icon}</div>
            <div style={{ minWidth: 0 }}>
              <div className="row-title">{t.name}</div>
              <div className="row-sub">{t.when}</div>
            </div>
          </div>
          <div className={`amt ${t.tone}`}>{t.amount}</div>
        </div>
      ))}
    </div>
  );
}

function InsightCard({ title, message }) {
  return (
    <div className="card">
      <div className="insight">
        <div className="insightIcon">💡</div>
        <div>
          <strong>{title}</strong>
          <p>{message}</p>
        </div>
      </div>
    </div>
  );
}

// TODO: Close dropdown when clicking outside.
// Consider extracting this into a reusable Dropdown component for other pages.
function MonthDropdown({ value, onChange, options }) {
  const [open, setOpen] = useState(false);

  const handleSelect = (opt) => {
    onChange(opt);
    setOpen(false);
  };

  /* HELPERS --------------------------------*/
  const formatMoney = (n) =>
  n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const clampPct = (n) => Math.max(0, Math.min(100, n));

  return (
    <div
      className="pill"
      onClick={() => setOpen((v) => !v)}
      role="button"
      tabIndex={0}
      aria-label="Select month"
    >
      <span>📅</span>
      <span>{value}</span>
      <span className="chev">▾</span>

      {open && (
        <div className="menu" onClick={(e) => e.stopPropagation()}>
          {options.map((opt) => (
            <div
              key={opt}
              className={`menuItem ${opt === value ? "active" : ""}`}
              onClick={() => handleSelect(opt)}
            >
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* DASHBOARD --------------------------------*/
export default function Dashboard() {
  const navigate = useNavigate();

  const [month, setMonth] = useState("This Month");
  const [onlyImportant, setOnlyImportant] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const spendingSummary = useMemo(() => {
    if (month === "Last Month") return { total: 1620.3, budget: 2200, deltaPct: -4 };
    if (month === "2 Months Ago") return { total: 2010.1, budget: 2200, deltaPct: +9 };
    return { total: 1847.5, budget: 2200, deltaPct: -12 };
  }, [month]);

  const visibleTransactions = useMemo(() => {
    const base = onlyImportant ? TRANSACTIONS.filter((t) => t.important) : TRANSACTIONS;
    return showAll ? base : base.slice(0, 4);
  }, [onlyImportant, showAll]);

  return (
    <div className="db-page">
      <style>{styles}</style>
      <Navbar />

      <div className="db-body">
        <div className="db-header">
          <div>
            <h1>Dashboard</h1>
            <p>Overview of spending, activity, and upcoming deadlines.</p>
          </div>

          <div className="db-header-right">
            <MonthDropdown value={month} onChange={setMonth} options={MONTH_OPTIONS} />

            <div
              className="pill pillToggle"
              onClick={() => setOnlyImportant((v) => !v)}
              role="button"
              tabIndex={0}
            >
              <span className={`dot ${onlyImportant ? "on" : ""}`} />
              <span>Only important</span>
            </div>
          </div>
        </div>

        <div className="db-grid">
          <div className="db-main">
            <HeroSpendingCard
              monthLabel={month}
              total={spendingSummary.total}
              budget={spendingSummary.budget}
              deltaPct={spendingSummary.deltaPct}
            />

            <div className="actions">
              <QuickTile
                icon="🎓"
                title="Scholarships"
                subtitle="Explore matched awards"
                toneClass="tScholar"
                onClick={() => navigate("/scholarships")}
              />
              <QuickTile
                icon="💵"
                title="Bills"
                subtitle="View upcoming bills"
                toneClass="tBills"
                onClick={() => navigate("/bills")}
              />
              <QuickTile
                icon="🏷️"
                title="Student Codes"
                subtitle="Apply a discount code"
                toneClass="tCodes"
                onClick={() => navigate("/student-codes")}
              />
                {/* NEW INVESTING TILE */}
              <QuickTile
                icon="💰"
                title="Investments"
                subtitle="Practice portfolio"
                toneClass="tInvest"
                onClick={() => navigate("/investing")}
              />
            </div>

             {/* TODO: Replace static insight message with AI-generated spending insight */}
            {/* once analytics endpoint is available. */}
            <div className="insightCardSpacing">
              <InsightCard
                title="Smart Insight"
                message="You spent $120 at Starbucks this week. That’s 3× your usual. Try making coffee at home"
              />
            </div>

            <div className="card">
              <div className="card-title">
                <h2>Recent Transactions</h2>
                <div className="link" onClick={() => setShowAll((v) => !v)}>
                  {showAll ? "Show less" : "See all"}
                </div>
              </div>

              <TransactionList items={visibleTransactions} />
            </div>
          </div>

          <div className="db-side">
            <div className="card">
              <div className="card-title">
                <h2>Upcoming Deadlines</h2>
              </div>
              {DEADLINES.length === 0 ? (
                <div className="empty">No upcoming deadlines found.</div>
              ) : (
                <div className="list">
                  {DEADLINES.map((d) => (
                    <div className="row" key={d.id}>
                      <div className="row-left">
                        <div className={`deadlineBadge ${d.badgeClass}`}>{d.day}</div>
                        <div style={{ minWidth: 0 }}>
                          <div className="row-title">{d.title}</div>
                          <div className="row-sub">{d.meta}</div>
                        </div>
                      </div>
                      <div style={{ color: "var(--text-muted)", fontWeight: 900 }}>›</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}