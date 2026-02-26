import { useMemo, useState } from "react";
import Navbar from "./Navbar";

// TEMP UNTIL WE LINK BANK ACCOUNT
const TRANSACTIONS = [
  { id: 1, date: "2026-02-25", merchant: "Metro", category: "Groceries", account: "Debit", amount: -74.21, note: "Weekly groceries" },
  { id: 2, date: "2026-02-24", merchant: "Tim Hortons", category: "Food", account: "Credit", amount: -8.45, note: "Coffee + bagel" },
  { id: 3, date: "2026-02-23", merchant: "OSAP Deposit", category: "Income", account: "Bank", amount: 3200.0, note: "Winter term funding" },
  { id: 4, date: "2026-02-22", merchant: "Rogers", category: "Utilities", account: "Credit", amount: -55.0, note: "Phone bill" },
  { id: 5, date: "2026-02-20", merchant: "Presto", category: "Transport", account: "Credit", amount: -25.0, note: "Transit top-up" },
  { id: 6, date: "2026-02-18", merchant: "Amazon.ca", category: "Shopping", account: "Credit", amount: -39.99, note: "Desk organizer" },
  { id: 7, date: "2026-02-16", merchant: "Part-time Payroll", category: "Income", account: "Bank", amount: 540.75, note: "Weekly shift payout" },
  { id: 8, date: "2026-02-15", merchant: "Spotify", category: "Subscriptions", account: "Credit", amount: -5.99, note: "Student plan" },
  { id: 9, date: "2026-02-12", merchant: "Shoppers Drug Mart", category: "Health", account: "Debit", amount: -22.13, note: "Pharmacy" },
  { id: 10, date: "2026-02-10", merchant: "UofT Bookstore", category: "Education", account: "Credit", amount: -124.8, note: "Lab manual" },
];

const CANADIAN_BANKS = [
  "RBC Royal Bank",
  "TD Canada Trust",
  "Scotiabank",
  "CIBC",
  "BMO",
  "Tangerine",
  "Simplii Financial",
  "EQ Bank",
];

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Source+Sans+3:wght@300;400;500;600;700;800&display=swap');

  :root {
    --uoft-blue: #002A5C;
    --uoft-mid: #0047A0;
    --uoft-accent: #E8B53E;
    --off-white: #F4F7FB;
    --text-muted: #6B7A90;
    --border: #D0DBE8;
    --white: #FFFFFF;
    --danger: #C0392B;
    --success: #18A574;
  }

  *, *::before, *::after { box-sizing: border-box; }
  body { font-family: 'Source Sans 3', sans-serif; }

  .tx-page {
    min-height: 100vh;
    background: var(--off-white);
  }

  .tx-body {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
  }

  .tx-header {
    margin-bottom: 1rem;
  }

  .tx-title {
    font-size: 1.9rem;
    font-weight: 800;
    color: var(--uoft-blue);
    margin: 0 0 0.25rem;
  }

  .tx-subtitle {
    color: var(--text-muted);
    margin: 0;
    font-size: 0.95rem;
  }

  .tx-summary {
    background: linear-gradient(130deg, var(--uoft-blue), var(--uoft-mid));
    color: white;
    border-radius: 16px;
    padding: 1rem 1.25rem;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0.75rem;
    margin: 1rem 0 1rem;
  }

  .tx-summary-item p {
    margin: 0;
    opacity: 0.9;
    font-size: 0.82rem;
  }

  .tx-summary-item h3 {
    margin: 0.2rem 0 0;
    font-size: 1.15rem;
    font-weight: 800;
    letter-spacing: -0.01em;
  }

  .tx-link-card {
    background: var(--white);
    border: 1.5px solid var(--border);
    border-radius: 14px;
    padding: 0.95rem;
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.9rem;
    flex-wrap: wrap;
  }

  .tx-link-left h4 {
    margin: 0;
    color: var(--uoft-blue);
    font-size: 1rem;
    font-weight: 800;
  }

  .tx-link-left p {
    margin: 0.22rem 0 0;
    color: var(--text-muted);
    font-size: 0.88rem;
  }

  .tx-link-actions {
    display: flex;
    align-items: center;
    gap: 0.55rem;
    flex-wrap: wrap;
  }

  .tx-link-btn {
    border: 1.5px solid var(--border);
    background: #fff;
    color: var(--uoft-blue);
    height: 38px;
    border-radius: 10px;
    padding: 0 0.75rem;
    font-family: 'Source Sans 3', sans-serif;
    font-size: 0.85rem;
    font-weight: 700;
    cursor: pointer;
  }

  .tx-link-btn.primary {
    background: var(--uoft-blue);
    border-color: var(--uoft-blue);
    color: #fff;
  }

  .tx-bank-list {
    width: 100%;
    border: 1.5px solid var(--border);
    border-radius: 12px;
    background: #F8FAFE;
    padding: 0.65rem;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.5rem;
    margin-top: 0.2rem;
  }

  .tx-bank-item {
    border: 1.5px solid var(--border);
    border-radius: 10px;
    background: #fff;
    color: var(--uoft-blue);
    height: 38px;
    font-family: 'Source Sans 3', sans-serif;
    font-size: 0.84rem;
    font-weight: 700;
    cursor: pointer;
    padding: 0 0.65rem;
    text-align: left;
  }

  .tx-linked-list {
    width: 100%;
    display: flex;
    gap: 0.45rem;
    flex-wrap: wrap;
    margin-top: 0.25rem;
  }

  .tx-linked-pill {
    border-radius: 999px;
    border: 1.5px solid var(--border);
    background: #F7FAFF;
    color: var(--uoft-blue);
    font-size: 0.8rem;
    font-weight: 700;
    padding: 0.28rem 0.6rem;
  }

  .tx-controls {
    background: var(--white);
    border: 1.5px solid var(--border);
    border-radius: 14px;
    padding: 0.9rem;
    display: grid;
    grid-template-columns: 1.2fr repeat(3, minmax(0, 1fr));
    gap: 0.7rem;
    margin-bottom: 1rem;
  }

  .tx-input,
  .tx-select {
    height: 40px;
    border-radius: 10px;
    border: 1.5px solid var(--border);
    padding: 0 0.75rem;
    font-family: 'Source Sans 3', sans-serif;
    font-size: 0.9rem;
    color: var(--uoft-blue);
    background: white;
    outline: none;
  }

  .tx-input:focus,
  .tx-select:focus {
    border-color: var(--uoft-mid);
  }

  .tx-card {
    background: var(--white);
    border: 1.5px solid var(--border);
    border-radius: 16px;
    overflow: hidden;
  }

  .tx-table {
    width: 100%;
    border-collapse: collapse;
  }

  .tx-table th,
  .tx-table td {
    text-align: left;
    padding: 0.82rem 1rem;
    border-bottom: 1px solid #E8EEF6;
    font-size: 0.92rem;
  }

  .tx-table th {
    color: var(--text-muted);
    font-weight: 600;
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    background: #F8FAFE;
  }

  .tx-table td {
    color: var(--uoft-blue);
    font-weight: 600;
  }

  .tx-amount {
    font-weight: 800;
    white-space: nowrap;
  }

  .tx-amount.out { color: var(--danger); }
  .tx-amount.in { color: var(--success); }

  .tx-empty {
    padding: 1.4rem;
    color: var(--text-muted);
    text-align: center;
    font-size: 0.94rem;
  }

  @media (max-width: 900px) {
    .tx-controls {
      grid-template-columns: 1fr 1fr;
    }
    .tx-summary {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 620px) {
    .tx-body { padding: 1rem; }
    .tx-controls {
      grid-template-columns: 1fr;
    }
    .tx-bank-list {
      grid-template-columns: 1fr;
    }
    .tx-table th:nth-child(4),
    .tx-table td:nth-child(4),
    .tx-table th:nth-child(6),
    .tx-table td:nth-child(6) {
      display: none;
    }
  }
`;

const formatMoney = (n) =>
  n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const formatDate = (isoDate) =>
  new Date(isoDate).toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" });

export default function Transactions() {
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("All");
  const [type, setType] = useState("All");
  const [sortBy, setSortBy] = useState("Newest");
  const [linkedAccounts, setLinkedAccounts] = useState([]);
  const [showBankPicker, setShowBankPicker] = useState(false);

  const categories = useMemo(
    () => ["All", ...new Set(TRANSACTIONS.map((t) => t.category))],
    []
  );

  const handleLinkBank = (bankName) => {
    setLinkedAccounts((prev) => {
      const label = `TODO: Bank Account Linking (${bankName})`;
      if (prev.includes(label)) return prev;
      return [...prev, label];
    });
    setShowBankPicker(false);
  };

  const handleLinkCreditCard = () => {
    setLinkedAccounts((prev) => {
      const label = "Credit Card";
      if (prev.includes(label)) return prev;
      return [...prev, label];
    });
  };

  const visible = useMemo(() => {
    let list = [...TRANSACTIONS];

    if (q.trim()) {
      const query = q.toLowerCase();
      list = list.filter(
        (t) =>
          t.merchant.toLowerCase().includes(query) ||
          t.note.toLowerCase().includes(query)
      );
    }

    if (category !== "All") {
      list = list.filter((t) => t.category === category);
    }

    if (type !== "All") {
      list = list.filter((t) => (type === "Income" ? t.amount > 0 : t.amount < 0));
    }

    if (sortBy === "Newest") list.sort((a, b) => new Date(b.date) - new Date(a.date));
    if (sortBy === "Oldest") list.sort((a, b) => new Date(a.date) - new Date(b.date));
    if (sortBy === "Highest") list.sort((a, b) => b.amount - a.amount);
    if (sortBy === "Lowest") list.sort((a, b) => a.amount - b.amount);

    return list;
  }, [q, category, type, sortBy]);

  const summary = useMemo(() => {
    const income = visible.filter((t) => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
    const expenses = visible.filter((t) => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0);
    return { income, expenses, net: income - expenses };
  }, [visible]);

  return (
    <div className="tx-page">
      <style>{styles}</style>
      <Navbar />

      <main className="tx-body">
        <header className="tx-header">
          <h1 className="tx-title">Transactions</h1>
          <p className="tx-subtitle">Track every payment, transfer, and deposit in one place.</p>
        </header>

        <section className="tx-summary">
          <div className="tx-summary-item">
            <p>Total Income</p>
            <h3>${formatMoney(summary.income)}</h3>
          </div>
          <div className="tx-summary-item">
            <p>Total Expenses</p>
            <h3>${formatMoney(summary.expenses)}</h3>
          </div>
          <div className="tx-summary-item">
            <p>Net Flow</p>
            <h3>${formatMoney(summary.net)}</h3>
          </div>
        </section>

        <section className="tx-link-card">
          <div className="tx-link-left">
            <h4>Linked Accounts</h4>
            <p>Connect your bank account or credit card to auto-import transactions.</p>
          </div>

          <div className="tx-link-actions">
            <button className="tx-link-btn" onClick={() => setShowBankPicker((v) => !v)}>
              + Link Bank Account
            </button>
            <button className="tx-link-btn primary" onClick={handleLinkCreditCard}>
              + Link Credit Card
            </button>
          </div>

          {showBankPicker && (
            <div className="tx-bank-list">
              {CANADIAN_BANKS.map((bank) => (
                <button key={bank} className="tx-bank-item" onClick={() => handleLinkBank(bank)}>
                  {bank}
                </button>
              ))}
            </div>
          )}

          <div className="tx-linked-list">
            {linkedAccounts.length === 0 ? (
              <span className="tx-linked-pill">No accounts linked yet</span>
            ) : (
              linkedAccounts.map((acc) => (
                <span key={acc} className="tx-linked-pill">{acc}</span>
              ))
            )}
          </div>
        </section>

        <section className="tx-controls">
          <input
            className="tx-input"
            placeholder="Search merchant or note..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <select className="tx-select" value={category} onChange={(e) => setCategory(e.target.value)}>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <select className="tx-select" value={type} onChange={(e) => setType(e.target.value)}>
            <option value="All">All Types</option>
            <option value="Income">Income</option>
            <option value="Expense">Expense</option>
          </select>
          <select className="tx-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="Newest">Newest first</option>
            <option value="Oldest">Oldest first</option>
            <option value="Highest">Highest amount</option>
            <option value="Lowest">Lowest amount</option>
          </select>
        </section>

        <section className="tx-card">
          {visible.length === 0 ? (
            <div className="tx-empty">No transactions match your filters.</div>
          ) : (
            <table className="tx-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Merchant</th>
                  <th>Category</th>
                  <th>Account</th>
                  <th>Amount</th>
                  <th>Note</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((t) => (
                  <tr key={t.id}>
                    <td>{formatDate(t.date)}</td>
                    <td>{t.merchant}</td>
                    <td>{t.category}</td>
                    <td>{t.account}</td>
                    <td className={`tx-amount ${t.amount >= 0 ? "in" : "out"}`}>
                      {t.amount >= 0 ? "+" : "-"}${formatMoney(Math.abs(t.amount))}
                    </td>
                    <td>{t.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </main>
    </div>
  );
}