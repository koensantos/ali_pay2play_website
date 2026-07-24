import React, { useState} from "react";
import { Link } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import "./DonationComparison.css";



// Example hardcoded data (replace with your real numbers)
const candidateData = [
  { name: "James Solomon", total: 1646008.78, redFlag: 169520 },
  { name: "Mussab Ali", total: 458408.92, redFlag: 0 },
  { name: "Jim McGreevey", total: 3614480.39, redFlag: 1131083 },
  { name: "Bill ODea", total: 1042602.5, redFlag: 188525 },
  { name: "Joyce Watterman", total: 286641, redFlag: 46140}
];

  const otherCandidates = [
    { name: "Mussab Ali", path: "/MussabAli" },
    { name: "Bill O'Dea", path: "/BillODea" },
    { name: "Jim McGreevey", path: "/JimMcGreevey" },
    { name: "James Solomon", path: "/JamesSolomon" },
    { name: "Joyce Watterman", path: "/JoyceWatterman" },
    { name: "Transparency Dashboard", path: "/comparison" }
  ];



// Red for red flags, teal for the rest
const COLORS = ["#E63946", "#2A9D8F"];

// Helper: format large numbers with K/M
const formatNumberShort = (num) => {
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (num >= 1_000) return (num / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  return num.toString();
};

export default function Comparison() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div className="comparison-page">



       <div className="mobile-header">
              <button
                className="hamburger"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Toggle menu"
              >
                ☰ <span className="menu-label">Menu</span>
              </button>
              {menuOpen && (
                <nav className="mobile-menu">
                  {otherCandidates.map((candidate) => (
                    <Link
                      to={candidate.path}
                      key={candidate.name}
                      onClick={() => setMenuOpen(false)}
                    >
                      {candidate.name}
                    </Link>
                  ))}
                </nav>
              )}
        </div>
      <h1>Donation Comparison</h1>
      <p className="description">
        This page compares <strong>total donations</strong> with <strong>red-flag donations</strong> for each
        candidate. Red-flag donations are contributions that may suggest potential conflicts of interest or
        pay-to-play patterns. The bar chart shows totals side-by-side per candidate. The pies show each
        candidate’s red-flag share as a percentage of their own total.

        (To see detailed breakdowns for each candidate, click their names in the graphs.)
      </p>
      {/* One pie per candidate with legend-based percentages */}
      <h2>Red-Flag Share by Candidate</h2>
      <div className="pie-chart-grid">
        {candidateData.map((c) => {
          const other = Math.max(0, c.total - c.redFlag);
          const redPct = c.total > 0 ? (c.redFlag / c.total) * 100 : 0;
          const otherPct = 100 - redPct;

          const chartData = [
            { name: "Red Flag Donations", value: c.redFlag },
            { name: "Other Donations", value: other },
          ];

          return (
          <div key={c.name} className="pie-chart-item">
            {/* Candidate name as a clickable link */}
            <h3>
              <Link to={`/${c.name.replace(/\s+/g, "")}`}>
                {c.name}
              </Link>
            </h3>

            <PieChart width={220} height={220} role="img" aria-label={`${c.name} donation breakdown`}>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                labelLine={false}
                label={false}
                isAnimationActive={false}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, name) => [
                  `$${Number(value).toLocaleString()}`,
                  name,
                ]}
              />
            </PieChart>

              {/* Custom legend with percentages */}
              <ul className="mini-legend" aria-label={`${c.name} donation legend`}>
                <li>
                  <span className="legend-swatch" style={{ backgroundColor: COLORS[0] }} />
                  Red Flag Donations — {redPct.toFixed(1)}% (${c.redFlag.toLocaleString()})
                </li>
                <li>
                  <span className="legend-swatch" style={{ backgroundColor: COLORS[1] }} />
                  Other Donations — {otherPct.toFixed(1)}% (${other.toLocaleString()})
                </li>
              </ul>
            </div>
          );
        })}
      </div>

      <div className="bar-chart-container">
      <h2>Red-Flag Bar Chart Comparison</h2>

        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={candidateData.map((c) => ({
              name: c.name,
              redFlag: c.redFlag,
              other: c.total - c.redFlag,
            }))}
            margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
          >
            <XAxis
              dataKey="name"
              tick={{ fontSize: window.innerWidth < 600 ? 8 : 8 }} // smaller labels on mobile
            />
            <YAxis tickFormatter={formatNumberShort} />
            <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
            <Legend />

            {/* Bottom part: other donations */}
            <Bar dataKey="other" fill="#1D3557" name="Other Donations" stackId="stack1" />

            {/* Top part: red flag donations */}
            <Bar dataKey="redFlag" fill="#E63946" name="Red Flag Donations" stackId="stack1" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="back-link">
        <Link to="/">← Back to Homepage</Link>
      </div>

    </div>
  );
}
