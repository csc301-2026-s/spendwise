import React, { useState, useEffect } from "react";
import Navbar from "./Navbar";

export default function Transactions() {

  const API_BASE = "http://0.0.0.0:8000/api";
  const ACCESS_TOKEN_KEY = "userAccessToken";
  const REFRESH_TOKEN_KEY = "userRefreshToken";

  const [transactions, setTransactions] = useState([]);
  const [monthlySavingAmount, setMonthlySavingAmount] = useState(null);
  const [totalExpensesAmount, setTotalExpensesAmount] = useState(null);
  const [monthlySavingDesc, setMonthlySavingDesc] = useState([]);
  const [error, setError] = useState("");

  const [category, setCategory] = useState("All");
  const [type, setType] = useState("All");
  const [sortBy, setSortBy] = useState("Newest");

  const categories = ["All","Food","Transport","Shopping","Other"];

  const today = new Date();

  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year, setYear] = useState(today.getFullYear());

  const [loading, setLoading] = useState(false);

  const [accountId, setAccountId] = useState("");
  const [accounts, setAccounts] = useState([]);

  // -----------------------------
  // Fetch Transactions
  // -----------------------------
  const fetchTransactions = async () => {

    try {

      setError("");

      if (!getAccessToken()) {
        setTransactions([]);
        setAccounts([]);
        setError("You’re not logged in. Please sign in again.");
        return;
      }

      let url = `${API_BASE}/spending/monthly_transactions/?month=${month}&year=${year}`;

      if (accountId) {
        url += `&account_id=${accountId}`;
      }

      const response = await fetchWithAuth(url);

      if (!response.ok) {
        const text = await response.text();
        setTransactions([]);
        setAccounts([]);
        setError(`Failed to load transactions (${response.status}). ${text}`);
        return;
      }

      const result = await response.json();
      if (!Array.isArray(result)) {
        setTransactions([]);
        setAccounts([]);
        setError("Unexpected response format from server.");
        return;
      }

      setTransactions(result);

      // Build account list from transaction account_id
      const uniqueAccounts = [...new Set(result.map(t => t.account_id))];

      const accountObjects = uniqueAccounts.map(id => ({
        id: id,
        name: `Account ${id}`
      }));

      setAccounts(accountObjects);

    } catch (error) {
      console.error(error);
      setTransactions([]);
      setAccounts([]);
      setError("Network error while loading transactions.");
    }
  };

  // -----------------------------
  // Monthly Saving Amount
  // -----------------------------
  const fetchMonthlySavingAmount = async () => {
    try {

      if (!getAccessToken()) {
        setMonthlySavingAmount(null);
        return;
      }

      const response = await fetchWithAuth(
        `${API_BASE}/spending/monthly_saving_amount/?month=${month}&year=${year}`
      );

      if (!response.ok) {
        setMonthlySavingAmount(null);
        return;
      }

      const result = await response.json();

      setMonthlySavingAmount(result.total_saving);

    } catch (error) {
      console.error(error);
      setMonthlySavingAmount(null);
    }
  };

  // -----------------------------
  // Total Expenses
  // -----------------------------
  const fetchTotalExpensesAmount = async () => {
    try {

      if (!getAccessToken()) {
        setTotalExpensesAmount(null);
        return;
      }

      const response = await fetchWithAuth(
        `${API_BASE}/spending/total_expenses_amount/?month=${month}&year=${year}`
      );

      if (!response.ok) {
        setTotalExpensesAmount(null);
        return;
      }

      const result = await response.json();

      setTotalExpensesAmount(result.total_expenses);

    } catch (error) {
      console.error(error);
      setTotalExpensesAmount(null);
    }
  };

  // -----------------------------
  // Monthly Saving Tips
  // -----------------------------
  const fetchMonthlySavingDesc = async () => {

    try {

      if (!getAccessToken()) {
        setMonthlySavingDesc([]);
        return;
      }

      const response = await fetchWithAuth(
        `${API_BASE}/spending/monthly_saving/?month=${month}&year=${year}`
      );

      if (!response.ok) {
        setMonthlySavingDesc([]);
        return;
      }

      const result = await response.json();

      setMonthlySavingDesc(result);

    } catch (error) {
      console.error(error);
      setMonthlySavingDesc([]);
    }
  };

  // -----------------------------
  // Fetch All
  // -----------------------------
  const fetchAllData = async () => {

    if (!month || !year) {
      alert("Please enter month and year");
      return;
    }

    setLoading(true);

    await Promise.all([
      fetchTransactions(),
      fetchMonthlySavingAmount(),
      fetchTotalExpensesAmount(),
      fetchMonthlySavingDesc()
    ]);

    setLoading(false);
  };

  useEffect(() => {
    fetchAllData();
  }, [month, year, accountId]);

  // -----------------------------
  // Helpers
  // -----------------------------
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString();
  };

  const formatMoney = (num) => {
    if (!num) return "0";
    return Number(num).toLocaleString();
  };

  const getAccessToken = () => (
    sessionStorage.getItem(ACCESS_TOKEN_KEY) ||
    sessionStorage.getItem("userToken") // backwards compat
  );

  const refreshAccessToken = async () => {
    const refresh = sessionStorage.getItem(REFRESH_TOKEN_KEY);
    if (!refresh) return null;

    const res = await fetch(`${API_BASE}/token/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    });

    if (!res.ok) return null;

    const data = await res.json();
    const newAccess = data.access;
    if (!newAccess) return null;

    sessionStorage.setItem("userToken", newAccess);
    sessionStorage.setItem(ACCESS_TOKEN_KEY, newAccess);
    return newAccess;
  };

  const fetchWithAuth = async (url, options = {}) => {
    const token = getAccessToken();
    if (!token) return { ok: false, status: 401, bodyText: "Missing auth token." };

    const doFetch = async (accessToken) => {
      const res = await fetch(url, {
        ...options,
        headers: {
          ...(options.headers || {}),
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return res;
    };

    let res = await doFetch(token);
    if (res.status !== 401) return res;

    // Try refresh once on 401
    const newToken = await refreshAccessToken();
    if (!newToken) return res;

    res = await doFetch(newToken);
    return res;
  };

  // -----------------------------
  // UI
  // -----------------------------
  return (
    <div className="tx-page">

      <Navbar />

      <main className="tx-body">

        <header className="tx-header">
          <h1 className="tx-title">Transactions</h1>
          <p className="tx-subtitle">
            Track every payment, transfer, and deposit in one place.
          </p>
        </header>

        {/* SUMMARY */}
        <section className="tx-summary">

          <div className="tx-summary-item">
            <p>Total Monthly Expenses</p>
            <h3>${formatMoney(totalExpensesAmount)}</h3>
          </div>

          <div className="tx-summary-item">
            <p>Potential Saving</p>
            <h3>${formatMoney(monthlySavingAmount)}</h3>
          </div>

        </section>

        {/* MONTHLY TIPS */}
        <section className="tx-spending">

          <div className="left-box">

            <p><strong>Monthly Tips</strong></p>

            {monthlySavingDesc && monthlySavingDesc.map((t) => (

              <div key={t.name}>

                <p>
                  You spent ${t.total} on {t.name}.
                </p>

                <p>
                  You could save about ${t.per_saving} this month by reducing this expense.
                </p>

              </div>

            ))}

          </div>

        </section>

        {/* FILTERS */}
        <section className="tx-controls">

          <input
            className="tx-input"
            type="number"
            placeholder="Month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          />

          <input
            className="tx-input"
            type="number"
            placeholder="Year"
            value={year}
            onChange={(e) => setYear(e.target.value)}
          />

          {/* ACCOUNT FILTER */}
          <select
            className="tx-select"
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
          >

            <option value="">All Accounts</option>

            {accounts.map(a => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}

          </select>

          <select
            className="tx-select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select
            className="tx-select"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="All">All Types</option>
            <option value="Income">Income</option>
            <option value="Expense">Expense</option>
          </select>

          <select
            className="tx-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="Newest">Newest first</option>
            <option value="Oldest">Oldest first</option>
            <option value="Highest">Highest amount</option>
            <option value="Lowest">Lowest amount</option>
          </select>

        </section>

        {/* TABLE */}
        <section className="tx-card">

          {error && (
            <div className="tx-empty">{error}</div>
          )}

          {loading ? (
            <div className="tx-empty">Loading transactions...</div>
          ) : transactions.length === 0 ? (
            <div className="tx-empty">No transactions found.</div>
          ) : (

            <table className="tx-table">

              <thead>
                <tr>
                  <th>Date</th>
                  <th>Merchant</th>
                  <th>Category</th>
                  <th>Amount</th>
                </tr>
              </thead>

              <tbody>

                {transactions.map((t) => (

                  <tr key={`${t.date}-${t.merchant_name}-${t.amount}`}>

                    <td>{formatDate(t.date)}</td>

                    <td>{t.merchant_name}</td>

                    <td>{t.category}</td>

                    <td className={`tx-amount ${t.amount >= 0 ? "in" : "out"}`}>
                      {t.amount >= 0 ? "+" : "-"}${formatMoney(Math.abs(t.amount))}
                    </td>

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
