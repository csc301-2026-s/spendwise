import { useMemo, useState } from "react";
import Navbar from "./Navbar";

const SAMPLE_PORTFOLIOS = [
  {
    id: "conservative",
    portfolio_name: "Conservative ETF Mix",
    portfolio_type: "system",
    expected_annual_return: 4.0,
    risk_label: "Conservative",
    holdings: [
      { symbol: "CASH", asset_name: "High Interest Savings ETF", allocation_percent: 40, asset_type: "cash" },
      { symbol: "BND", asset_name: "Bond ETF", allocation_percent: 40, asset_type: "bond" },
      { symbol: "VTI", asset_name: "US Total Market ETF", allocation_percent: 20, asset_type: "etf" },
    ],
  },
  {
    id: "balanced",
    portfolio_name: "Balanced ETF Mix",
    portfolio_type: "system",
    expected_annual_return: 6.5,
    risk_label: "Balanced",
    holdings: [
      { symbol: "XEQT", asset_name: "Global Equity ETF", allocation_percent: 45, asset_type: "etf" },
      { symbol: "VFV", asset_name: "S&P 500 ETF", allocation_percent: 30, asset_type: "etf" },
      { symbol: "ZAG", asset_name: "Canadian Bond ETF", allocation_percent: 25, asset_type: "bond" },
    ],
  },
  {
    id: "growth",
    portfolio_name: "Growth Mix",
    portfolio_type: "system",
    expected_annual_return: 8.5,
    risk_label: "Growth",
    holdings: [
      { symbol: "QQQ", asset_name: "NASDAQ 100 ETF", allocation_percent: 35, asset_type: "etf" },
      { symbol: "VTI", asset_name: "US Total Market ETF", allocation_percent: 35, asset_type: "etf" },
      { symbol: "SHOP.TO", asset_name: "Shopify", allocation_percent: 15, asset_type: "stock" },
      { symbol: "TSLA", asset_name: "Tesla", allocation_percent: 15, asset_type: "stock" },
    ],
  },
  {
    id: "custom",
    portfolio_name: "My Custom Portfolio",
    portfolio_type: "custom",
    expected_annual_return: 7.2,
    risk_label: "Custom",
    holdings: [
      { symbol: "XEQT", asset_name: "Global Equity ETF", allocation_percent: 50, asset_type: "etf" },
      { symbol: "VFV", asset_name: "S&P 500 ETF", allocation_percent: 25, asset_type: "etf" },
      { symbol: "CASH", asset_name: "High Interest Savings ETF", allocation_percent: 25, asset_type: "cash" },
    ],
  },
];

const GOAL_TYPE_OPTIONS = [
  { value: "laptop", label: "Laptop" },
  { value: "tuition", label: "Tuition" },
  { value: "travel", label: "Travel" },
  { value: "emergency_fund", label: "Emergency Fund" },
  { value: "other", label: "Other" },
];

const RISK_OPTIONS = [
  { value: "conservative", label: "Conservative" },
  { value: "balanced", label: "Balanced" },
  { value: "growth", label: "Growth" },
];

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@300;400;500;600;700;800;900&display=swap');

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

  body {
    font-family: 'Source Sans 3', sans-serif;
  }

  .invest-page {
    min-height: 100vh;
    background: var(--off-white);
    font-family: 'Source Sans 3', sans-serif;
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

  .db-grid {
    display: grid;
    grid-template-columns: 1fr 320px;
    gap: 1.5rem;
    align-items: start;
  }

  .db-main, .db-side { min-width: 0; }

  .card {
    background: var(--white);
    border: 2px solid var(--border);
    border-radius: 18px;
    padding: 1.25rem 1.5rem;
  }

  .card + .card {
    margin-top: 1.25rem;
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

  .card-title p {
    margin: 0.3rem 0 0 0;
    color: var(--text-muted);
    font-size: 0.92rem;
  }

  .hero {
    background: linear-gradient(135deg, var(--uoft-blue), var(--uoft-mid));
    color: white;
    border: none;
    box-shadow: var(--shadow);
    margin-bottom: 1.25rem;
  }

  .hero-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 1rem;
    margin-bottom: 0.9rem;
    flex-wrap: wrap;
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

  .hero-subtext {
    margin: 0.35rem 0 0 0;
    opacity: 0.9;
    font-size: 0.95rem;
    max-width: 720px;
  }

  .hero-meta {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    opacity: 0.92;
    font-size: 0.88rem;
    margin-top: 0.75rem;
    flex-wrap: wrap;
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
    width: var(--pct, 50%);
    background: rgba(255,255,255,0.88);
    border-radius: 999px;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 1.25rem;
    margin-bottom: 1.25rem;
  }

  .stat-card {
    background: var(--white);
    border: 2px solid var(--border);
    border-radius: 18px;
    padding: 1.15rem 1.2rem;
  }

  .stat-value {
    font-size: 1.6rem;
    font-weight: 900;
    color: var(--uoft-blue);
    margin: 0;
  }

  .stat-value.positive { color: var(--success); }
  .stat-value.negative { color: var(--danger); }

  .stat-label {
    margin-top: 0.25rem;
    color: var(--text-muted);
    font-size: 0.95rem;
    font-weight: 600;
  }

  .step-badge {
    width: 34px;
    height: 34px;
    border-radius: 999px;
    background: #EAF0FF;
    color: var(--uoft-mid);
    border: 2px solid rgba(0,71,160,0.2);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-weight: 900;
    flex-shrink: 0;
  }

  .title-wrap {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .form-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1rem;
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: 0.45rem;
  }

  .field.full {
    grid-column: 1 / -1;
  }

  .label {
    font-size: 0.9rem;
    font-weight: 800;
    color: var(--uoft-blue);
  }

  .input, .select {
    width: 100%;
    border: 2px solid var(--border);
    border-radius: 14px;
    padding: 0.85rem 0.95rem;
    font-size: 0.96rem;
    color: var(--uoft-blue);
    background: #fff;
    outline: none;
  }

  .input:focus, .select:focus {
    border-color: var(--border-2);
  }

  .hint {
    color: var(--text-muted);
    font-size: 0.84rem;
  }

  .list {
    display: flex;
    flex-direction: column;
    gap: 0.95rem;
  }

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
    flex: 1;
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
  }

  .row-right {
    display: flex;
    align-items: center;
    gap: 0.85rem;
    flex-shrink: 0;
  }

  .amt {
    font-weight: 900;
    font-size: 1.05rem;
    white-space: nowrap;
    color: var(--uoft-blue);
  }

  .pillBtn {
    background: var(--white);
    border: 2px solid var(--border);
    border-radius: 999px;
    padding: 0.55rem 0.95rem;
    color: var(--uoft-blue);
    font-weight: 800;
    cursor: pointer;
    transition: 0.12s ease;
  }

  .pillBtn:hover {
    border-color: var(--border-2);
    background: #F7FAFF;
  }

  .pillBtn.active {
    background: #EAF0FF;
    border-color: rgba(0,71,160,0.25);
  }

  .pillBtn.primary {
    background: linear-gradient(135deg, var(--uoft-blue), var(--uoft-mid));
    color: white;
    border-color: transparent;
  }

  .portfolioGrid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1rem;
  }

  .portfolioCard {
    border: 2px solid var(--border);
    border-radius: 18px;
    background: #fff;
    padding: 1.15rem;
    cursor: pointer;
    transition: 0.12s ease;
  }

  .portfolioCard:hover {
    border-color: var(--border-2);
    box-shadow: var(--shadow);
    transform: translateY(-1px);
  }

  .portfolioCard.active {
    border-color: rgba(0,71,160,0.35);
    background: #F7FAFF;
  }

  .portfolioTop {
    display: flex;
    justify-content: space-between;
    gap: 0.8rem;
    align-items: flex-start;
    margin-bottom: 0.65rem;
  }

  .riskTag {
    background: #EAF0FF;
    color: var(--uoft-mid);
    border-radius: 999px;
    padding: 0.3rem 0.6rem;
    font-size: 0.8rem;
    font-weight: 800;
    white-space: nowrap;
  }

  .holdingsMini {
    display: flex;
    flex-direction: column;
    gap: 0.45rem;
    margin-top: 0.9rem;
  }

  .holdingMiniRow {
    display: flex;
    justify-content: space-between;
    gap: 0.75rem;
    font-size: 0.9rem;
    color: var(--text-muted);
  }

  .holdingMiniRow strong {
    color: var(--uoft-blue);
  }

  .comparison {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  .compareBox {
    padding: 1rem;
    border-radius: 16px;
    background: #F7FAFF;
    border: 2px solid rgba(208,219,232,0.75);
  }

  .compareLabel {
    color: var(--text-muted);
    font-size: 0.9rem;
    font-weight: 700;
    margin-bottom: 0.2rem;
  }

  .compareValue {
    color: var(--uoft-blue);
    font-size: 1.35rem;
    font-weight: 900;
  }

  .compareValue.positive { color: var(--success); }
  .compareValue.negative { color: var(--danger); }

  .chartCard {
    margin-top: 1.25rem;
  }

  .chartWrap {
    display: flex;
    gap: 1rem;
    align-items: flex-end;
    min-height: 250px;
    padding: 1rem 0 0.25rem 0;
  }

  .chartGroup {
    flex: 1;
    min-width: 0;
    text-align: center;
  }

  .chartColumns {
    display: flex;
    align-items: flex-end;
    justify-content: center;
    gap: 0.6rem;
    height: 180px;
    margin-bottom: 0.65rem;
  }

  .bar {
    width: 52px;
    border-radius: 14px 14px 6px 6px;
    border: 2px solid var(--border);
    background: #EAF0FF;
    position: relative;
  }

  .bar.savings {
    background: #EEF3FB;
  }

  .bar.investing {
    background: #E8F8F2;
    border-color: rgba(24,165,116,0.2);
  }

  .bar.goal {
    background: #FFF6E0;
    border-color: rgba(232,181,62,0.4);
  }

  .barValue {
    position: absolute;
    top: -28px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 0.8rem;
    font-weight: 800;
    color: var(--uoft-blue);
    white-space: nowrap;
  }

  .chartLegend {
    display: flex;
    justify-content: center;
    gap: 1rem;
    flex-wrap: wrap;
    margin-top: 0.6rem;
    color: var(--text-muted);
    font-size: 0.88rem;
    font-weight: 700;
  }

  .legendDot {
    width: 12px;
    height: 12px;
    border-radius: 999px;
    display: inline-block;
    margin-right: 0.4rem;
    vertical-align: middle;
  }

  .insight {
    display: flex;
    gap: 0.85rem;
    align-items: flex-start;
  }

  .insightIcon {
    width: 54px;
    height: 54px;
    border-radius: 16px;
    background: #ECFDF5;
    border: 2px solid rgba(24,165,116,0.18);
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

  .watchlistCard { margin-top: 1.25rem; }

  .miniStat {
    padding: 1rem;
    border-radius: 16px;
    background: #F7FAFF;
    border: 2px solid rgba(208,219,232,0.75);
    margin-bottom: 0.9rem;
  }

  .miniStat:last-child { margin-bottom: 0; }

  .miniStatLabel {
    color: var(--text-muted);
    font-size: 0.9rem;
    font-weight: 700;
    margin-bottom: 0.25rem;
  }

  .miniStatValue {
    color: var(--uoft-blue);
    font-size: 1.2rem;
    font-weight: 900;
  }

  .disclaimer { margin-top: 1.25rem; }

  .empty {
    color: var(--text-muted);
    font-size: 0.95rem;
    text-align: center;
    padding: 1.25rem 0;
  }

  @media (max-width: 980px) {
    .db-grid { grid-template-columns: 1fr; }
    .db-side { order: 2; }
    .portfolioGrid { grid-template-columns: 1fr; }
  }

  @media (max-width: 720px) {
    .db-body { padding: 1.25rem 1rem; }
    .stats-grid, .form-grid, .comparison { grid-template-columns: 1fr; }
    .hero-top { align-items: flex-start; }
    .row {
      flex-direction: column;
      align-items: stretch;
    }
    .row-right {
      justify-content: space-between;
      width: 100%;
    }
    .chartColumns {
      gap: 0.4rem;
    }
    .bar {
      width: 42px;
    }
  }
`;

function formatMoney(value) {
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function monthsBetweenTodayAnd(targetDate) {
  if (!targetDate) return 12;
  const now = new Date();
  const target = new Date(targetDate);
  const months =
    (target.getFullYear() - now.getFullYear()) * 12 +
    (target.getMonth() - now.getMonth());
  return Math.max(1, months);
}

function futureValueSavingsOnly(initialAmount, monthlyContribution, months) {
  return initialAmount + monthlyContribution * months;
}

function futureValueInvesting(initialAmount, monthlyContribution, annualReturn, months) {
  const monthlyRate = annualReturn / 100 / 12;
  if (monthlyRate === 0) {
    return futureValueSavingsOnly(initialAmount, monthlyContribution, months);
  }

  const lumpSumGrowth = initialAmount * Math.pow(1 + monthlyRate, months);
  const contributionGrowth =
    monthlyContribution * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);

  return lumpSumGrowth + contributionGrowth;
}

function projectionSeries({
  initialAmount,
  monthlyContribution,
  annualReturn,
  months,
}) {
  const points = [];
  for (let m = 1; m <= months; m += 1) {
    points.push({
      month: m,
      savingsOnly: futureValueSavingsOnly(initialAmount, monthlyContribution, m),
      investing: futureValueInvesting(initialAmount, monthlyContribution, annualReturn, m),
    });
  }
  return points;
}

function HeroPortfolioCard({ selectedPortfolio, targetAmount, monthsLeft, projectedValue }) {
  const progressPct = Math.min(100, Math.round((projectedValue / Math.max(targetAmount, 1)) * 100));

  return (
    <div className="card hero" style={{ ["--pct"]: `${progressPct}%` }}>
      <div className="hero-top">
        <div>
          <p className="hero-label">Investing 101 Simulator</p>
          <p className="hero-amount">${formatMoney(projectedValue)}</p>
          <p className="hero-subtext">
            See how monthly savings, a target goal, and a practice portfolio could work together over time.
          </p>
        </div>

        <div className="hero-change">
          {selectedPortfolio.expected_annual_return >= 0
            ? `↗ +${selectedPortfolio.expected_annual_return}% expected`
            : `↘ ${selectedPortfolio.expected_annual_return}% expected`}
        </div>
      </div>

      <div className="hero-meta">
        <span>Selected portfolio: {selectedPortfolio.portfolio_name}</span>
        <span>{monthsLeft} month{monthsLeft === 1 ? "" : "s"} to goal</span>
      </div>

      <div className="progress">
        <span />
      </div>
    </div>
  );
}

function StepCardTitle({ step, title, subtitle }) {
  return (
    <div className="card-title">
      <div>
        <div className="title-wrap">
          <div className="step-badge">{step}</div>
          <h2>{title}</h2>
        </div>
        {subtitle ? <p>{subtitle}</p> : null}
      </div>
    </div>
  );
}

function PortfolioSelector({ portfolios, selectedId, onSelect }) {
  return (
    <div className="portfolioGrid">
      {portfolios.map((portfolio) => (
        <div
          key={portfolio.id}
          className={`portfolioCard ${selectedId === portfolio.id ? "active" : ""}`}
          onClick={() => onSelect(portfolio.id)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") onSelect(portfolio.id);
          }}
        >
          <div className="portfolioTop">
            <div>
              <div className="row-title">{portfolio.portfolio_name}</div>
              <div className="row-sub">{portfolio.portfolio_type === "custom" ? "Custom portfolio" : "System-generated sample"}</div>
            </div>
            <div className="riskTag">{portfolio.risk_label}</div>
          </div>

          <div className="comparison" style={{ marginTop: "0.75rem" }}>
            <div className="compareBox">
              <div className="compareLabel">Expected return</div>
              <div className="compareValue positive">+{portfolio.expected_annual_return}%</div>
            </div>
            <div className="compareBox">
              <div className="compareLabel">Holdings</div>
              <div className="compareValue">{portfolio.holdings.length}</div>
            </div>
          </div>

          <div className="holdingsMini">
            {portfolio.holdings.map((holding) => (
              <div className="holdingMiniRow" key={`${portfolio.id}-${holding.symbol}`}>
                <span>
                  <strong>{holding.symbol}</strong> · {holding.asset_name}
                </span>
                <span>{holding.allocation_percent}%</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function ProjectionChart({ savingsOnlyValue, investingValue, goalValue }) {
  const maxValue = Math.max(savingsOnlyValue, investingValue, goalValue, 1);

  const savingsHeight = Math.max(12, (savingsOnlyValue / maxValue) * 180);
  const investingHeight = Math.max(12, (investingValue / maxValue) * 180);
  const goalHeight = Math.max(12, (goalValue / maxValue) * 180);

  return (
    <div className="card chartCard">
      <div className="card-title">
        <h2>Projection Comparison</h2>
      </div>

      <div className="chartWrap">
        <div className="chartGroup">
          <div className="chartColumns">
            <div className="bar savings" style={{ height: `${savingsHeight}px` }}>
              <div className="barValue">${Math.round(savingsOnlyValue).toLocaleString()}</div>
            </div>
          </div>
          <div className="row-sub">Savings Only</div>
        </div>

        <div className="chartGroup">
          <div className="chartColumns">
            <div className="bar investing" style={{ height: `${investingHeight}px` }}>
              <div className="barValue">${Math.round(investingValue).toLocaleString()}</div>
            </div>
          </div>
          <div className="row-sub">Selected Portfolio</div>
        </div>

        <div className="chartGroup">
          <div className="chartColumns">
            <div className="bar goal" style={{ height: `${goalHeight}px` }}>
              <div className="barValue">${Math.round(goalValue).toLocaleString()}</div>
            </div>
          </div>
          <div className="row-sub">Goal Target</div>
        </div>
      </div>

      <div className="chartLegend">
        <span><span className="legendDot" style={{ background: "#EEF3FB" }} />Savings Only</span>
        <span><span className="legendDot" style={{ background: "#E8F8F2" }} />Investing Projection</span>
        <span><span className="legendDot" style={{ background: "#FFF6E0" }} />Goal Target</span>
      </div>
    </div>
  );
}

function InsightCard({ title, message }) {
  return (
    <div className="card disclaimer">
      <div className="insight">
        <div className="insightIcon">✨</div>
        <div>
          <strong>{title}</strong>
          <p>{message}</p>
        </div>
      </div>
    </div>
  );
}

export default function Investing() {
  const [monthlyContribution, setMonthlyContribution] = useState(300);
  const [initialAmount, setInitialAmount] = useState(500);
  const [goalName, setGoalName] = useState("New Laptop Fund");
  const [goalType, setGoalType] = useState("laptop");
  const [targetAmount, setTargetAmount] = useState(2000);
  const [targetDate, setTargetDate] = useState("2026-12-01");
  const [riskLevel, setRiskLevel] = useState("balanced");
  const [selectedPortfolioId, setSelectedPortfolioId] = useState("balanced");

  const monthsLeft = useMemo(() => monthsBetweenTodayAnd(targetDate), [targetDate]);

  const filteredPortfolios = useMemo(() => {
    if (riskLevel === "conservative") {
      return SAMPLE_PORTFOLIOS.filter((p) => ["conservative", "custom"].includes(p.id));
    }
    if (riskLevel === "growth") {
      return SAMPLE_PORTFOLIOS.filter((p) => ["growth", "custom"].includes(p.id));
    }
    return SAMPLE_PORTFOLIOS;
  }, [riskLevel]);

  const selectedPortfolio = useMemo(() => {
    return (
      filteredPortfolios.find((p) => p.id === selectedPortfolioId) ||
      filteredPortfolios[0] ||
      SAMPLE_PORTFOLIOS[0]
    );
  }, [filteredPortfolios, selectedPortfolioId]);

  const savingsOnlyValue = useMemo(() => {
    return futureValueSavingsOnly(initialAmount, monthlyContribution, monthsLeft);
  }, [initialAmount, monthlyContribution, monthsLeft]);

  const investingValue = useMemo(() => {
    return futureValueInvesting(
      initialAmount,
      monthlyContribution,
      selectedPortfolio.expected_annual_return,
      monthsLeft
    );
  }, [initialAmount, monthlyContribution, selectedPortfolio, monthsLeft]);

  const gainFromInvesting = useMemo(() => investingValue - savingsOnlyValue, [investingValue, savingsOnlyValue]);

  const feasibilityText = useMemo(() => {
    if (investingValue >= targetAmount) {
      return `At this pace, the selected portfolio could help you reach your goal of $${Math.round(targetAmount).toLocaleString()} within your current timeline.`;
    }
    if (savingsOnlyValue >= targetAmount) {
      return `Even without investing, your current monthly savings may already be enough to reach your goal. Investing mainly improves your cushion.`;
    }
    return `At your current pace, you may still fall short of the goal by ${Math.round(targetAmount - investingValue).toLocaleString()} unless you extend the timeline or increase monthly savings.`;
  }, [investingValue, savingsOnlyValue, targetAmount]);

  const projection = useMemo(() => {
    return projectionSeries({
      initialAmount,
      monthlyContribution,
      annualReturn: selectedPortfolio.expected_annual_return,
      months: monthsLeft,
    });
  }, [initialAmount, monthlyContribution, selectedPortfolio, monthsLeft]);

  const lastProjectionPoint = projection[projection.length - 1];

  return (
    <div className="invest-page">
      <style>{styles}</style>
      <Navbar />

      <div className="db-body">
        <div className="db-header">
          <div>
            <h1>Investing 101</h1>
            <p>Build a practice portfolio from your savings, compare outcomes, and plan toward a financial goal.</p>
          </div>
        </div>

        <div className="db-grid">
          <div className="db-main">
            <HeroPortfolioCard
              selectedPortfolio={selectedPortfolio}
              targetAmount={targetAmount}
              monthsLeft={monthsLeft}
              projectedValue={investingValue}
            />

            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-value">
                  ${formatMoney(monthlyContribution)}
                </div>
                <div className="stat-label">Monthly Savings</div>
              </div>

              <div className="stat-card">
                <div className="stat-value">
                  ${formatMoney(targetAmount)}
                </div>
                <div className="stat-label">Goal Target</div>
              </div>

              <div className="stat-card">
                <div className={`stat-value ${gainFromInvesting >= 0 ? "positive" : "negative"}`}>
                  {gainFromInvesting >= 0 ? "+" : "-"}${formatMoney(Math.abs(gainFromInvesting))}
                </div>
                <div className="stat-label">Projected Edge vs Saving Only</div>
              </div>
            </div>

            <div className="card">
              <StepCardTitle
                step="1"
                title="Savings Snapshot"
                subtitle="Start with what your budget suggests you can set aside each month."
              />

              <div className="form-grid">
                <div className="field">
                  <label className="label">Monthly Contribution</label>
                  <input
                    className="input"
                    type="number"
                    min="0"
                    value={monthlyContribution}
                    onChange={(e) => setMonthlyContribution(Number(e.target.value) || 0)}
                  />
                  <div className="hint">Pre-filled from your savings estimate. You can adjust it manually.</div>
                </div>

                <div className="field">
                  <label className="label">Initial Amount</label>
                  <input
                    className="input"
                    type="number"
                    min="0"
                    value={initialAmount}
                    onChange={(e) => setInitialAmount(Number(e.target.value) || 0)}
                  />
                  <div className="hint">Any amount you already have saved toward this goal.</div>
                </div>
              </div>
            </div>

            <div className="card">
              <StepCardTitle
                step="2"
                title="Set Your Goal"
                subtitle="Tell SpendWise what you are working toward so we can compare saving versus investing."
              />

              <div className="form-grid">
                <div className="field full">
                  <label className="label">Goal Name</label>
                  <input
                    className="input"
                    type="text"
                    value={goalName}
                    onChange={(e) => setGoalName(e.target.value)}
                    placeholder="e.g. New Laptop Fund"
                  />
                </div>

                <div className="field">
                  <label className="label">Goal Type</label>
                  <select
                    className="select"
                    value={goalType}
                    onChange={(e) => setGoalType(e.target.value)}
                  >
                    {GOAL_TYPE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div className="field">
                  <label className="label">Risk Preference</label>
                  <select
                    className="select"
                    value={riskLevel}
                    onChange={(e) => {
                      setRiskLevel(e.target.value);
                      if (e.target.value === "conservative") setSelectedPortfolioId("conservative");
                      if (e.target.value === "growth") setSelectedPortfolioId("growth");
                      if (e.target.value === "balanced") setSelectedPortfolioId("balanced");
                    }}
                  >
                    {RISK_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div className="field">
                  <label className="label">Target Amount</label>
                  <input
                    className="input"
                    type="number"
                    min="0"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(Number(e.target.value) || 0)}
                  />
                </div>

                <div className="field">
                  <label className="label">Target Date</label>
                  <input
                    className="input"
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="card">
              <StepCardTitle
                step="3"
                title="Choose a Practice Portfolio"
                subtitle="Compare generated sample portfolios or use a custom one as a starting point."
              />

              <PortfolioSelector
                portfolios={filteredPortfolios}
                selectedId={selectedPortfolio.id}
                onSelect={setSelectedPortfolioId}
              />
            </div>

            <div className="card">
              <div className="card-title">
                <h2>Goal Comparison</h2>
              </div>

              <div className="comparison">
                <div className="compareBox">
                  <div className="compareLabel">Savings Only by Target Date</div>
                  <div className="compareValue">${formatMoney(savingsOnlyValue)}</div>
                </div>

                <div className="compareBox">
                  <div className="compareLabel">Selected Portfolio Projection</div>
                  <div className="compareValue positive">${formatMoney(investingValue)}</div>
                </div>
              </div>
            </div>

            <ProjectionChart
              savingsOnlyValue={savingsOnlyValue}
              investingValue={investingValue}
              goalValue={targetAmount}
            />

            <InsightCard
              title="Educational Only"
              message={`${feasibilityText} This simulator uses hypothetical returns and is not investment advice.`}
            />
          </div>

          <div className="db-side">
            <div className="card">
              <div className="card-title">
                <h2>Goal Snapshot</h2>
              </div>

              <div className="miniStat">
                <div className="miniStatLabel">Current Goal</div>
                <div className="miniStatValue">{goalName || "Untitled Goal"}</div>
              </div>

              <div className="miniStat">
                <div className="miniStatLabel">Timeline</div>
                <div className="miniStatValue">{monthsLeft} month{monthsLeft === 1 ? "" : "s"}</div>
              </div>

              <div className="miniStat">
                <div className="miniStatLabel">Selected Portfolio</div>
                <div className="miniStatValue">{selectedPortfolio.portfolio_name}</div>
              </div>
            </div>

            <div className="card watchlistCard">
              <div className="card-title">
                <h2>Selected Holdings</h2>
              </div>

              <div className="list">
                {selectedPortfolio.holdings.map((holding) => (
                  <div className="row" key={`${selectedPortfolio.id}-${holding.symbol}`}>
                    <div className="row-left">
                      <div className="row-icon">
                        {holding.asset_type === "stock" ? "📈" : holding.asset_type === "bond" ? "🏦" : holding.asset_type === "cash" ? "💵" : "📊"}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div className="row-title">{holding.symbol}</div>
                        <div className="row-sub">{holding.asset_name}</div>
                      </div>
                    </div>
                    <div className="amt">{holding.allocation_percent}%</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card watchlistCard">
              <div className="card-title">
                <h2>Learning Focus</h2>
              </div>

              <div className="list">
                <div className="row">
                  <div className="row-left">
                    <div className="row-icon">📚</div>
                    <div style={{ minWidth: 0 }}>
                      <div className="row-title">Saving vs Investing</div>
                      <div className="row-sub">Saving is predictable; investing adds uncertainty and upside.</div>
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="row-left">
                    <div className="row-icon">🧠</div>
                    <div style={{ minWidth: 0 }}>
                      <div className="row-title">Risk Level</div>
                      <div className="row-sub">Higher expected return usually comes with higher volatility.</div>
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="row-left">
                    <div className="row-icon">⏳</div>
                    <div style={{ minWidth: 0 }}>
                      <div className="row-title">Time Horizon</div>
                      <div className="row-sub">Longer timelines give compounding more time to work.</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="card watchlistCard">
              <div className="card-title">
                <h2>Projection Note</h2>
              </div>
              <div className="row-sub">
                Final month estimate:{" "}
                <strong style={{ color: "var(--uoft-blue)" }}>
                  ${formatMoney(lastProjectionPoint?.investing || 0)}
                </strong>
              </div>
              <div className="row-sub" style={{ marginTop: "0.6rem" }}>
                This page is a practice simulator and does not use live market data yet.
              </div>
              <div style={{ marginTop: "1rem" }}>
                <button className="pillBtn primary">Generate Portfolio</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}