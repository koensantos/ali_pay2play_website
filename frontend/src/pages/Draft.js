import React, { useEffect, useState } from "react";
import { Pie } from "react-chartjs-2";
import "chart.js/auto";

export default function Draft() {
  const [chartData, setChartData] = useState(null);
  const [donors, setDonors] = useState([]);

  const backendUrl = "http://localhost:5000"; // Adjust if needed

  // Fetch pie chart data
  useEffect(() => {
    fetch(`${backendUrl}/api/contributions/Jim_McGreevey`)
      .then((res) => res.json())
      .then((data) => {
        if (!Array.isArray(data)) {
          console.error("Invalid data format:", data);
          return;
        }

        const labels = data.map((item) => item.ContributorGroup);
        const values = data.map((item) => item.ContributionAmount);
        const total = values.reduce((sum, val) => sum + val, 0);

        const backgroundColors = [
          "#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0",
          "#9966FF", "#FF9F40", "#C9CBCF", "#8D99AE",
          "#6A4C93", "#F67280"
        ];

        setChartData({
          labels,
          datasets: [
            {
              data: values,
              backgroundColor: backgroundColors.slice(0, labels.length)
            }
          ],
          total
        });
      })
      .catch((err) => console.error("Pie chart fetch error:", err));
  }, []);

  // Fetch top 10 donors
  useEffect(() => {
    fetch(`${backendUrl}/api/top_donors/Jim_McGreevey`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setDonors(data);
        else console.error("Invalid donors data:", data);
      })
      .catch((err) => console.error("Donors fetch error:", err));
  }, []);

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Jim McGreevey: Campaign Finance Visuals</h1>

      {/* Pie Chart with Legend */}
      {chartData && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "flex-start",
            gap: "2rem",
            marginBottom: "3rem"
          }}
        >
          <div style={{ flex: "1 1 500px", minWidth: "400px", height: "450px" }}>
            <Pie
              data={chartData}
              options={{
                maintainAspectRatio: false,
                plugins: { legend: { display: false } }
              }}
            />
          </div>
          <div style={{ flex: "1 1 250px", minWidth: "250px" }}>
            <h3>Legend</h3>
            <ul style={{ listStyle: "none", padding: 0 }}>
              {chartData.labels.map((label, i) => {
                const value = chartData.datasets[0].data[i];
                const percent = ((value / chartData.total) * 100).toFixed(2);
                return (
                  <li key={label} style={{ marginBottom: "8px" }}>
                    <span
                      style={{
                        display: "inline-block",
                        width: "12px",
                        height: "12px",
                        backgroundColor: chartData.datasets[0].backgroundColor[i],
                        marginRight: "8px"
                      }}
                    ></span>
                    {label}: ${value.toLocaleString()} ({percent}%)
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}

      {/* Line Chart Image */}
      <div style={{ marginTop: "3rem" }}>
        <h2>Donations Over Time</h2>
        <img
          src={`${backendUrl}/api/charts/Jim_McGreevey_line_donations_over_time.png`}
          alt="Donations Over Time"
          style={{
            width: "100%",
            maxWidth: "700px",
            border: "1px solid #ccc",
            borderRadius: "6px"
          }}
        />
      </div>

      {/* Top 10 Donors Table */}
      <div style={{ marginTop: "3rem" }}>
        <h2>Top 10 Donors</h2>
        <div style={{ overflowX: "auto" }}>
          <table
            border="1"
            cellPadding="10"
            style={{
              borderCollapse: "collapse",
              width: "100%",
              maxWidth: "700px"
            }}
          >
            <thead>
              <tr>
                <th>Donor</th>
                <th>Amount</th>
                <th>Employer</th>
                <th>City</th>
              </tr>
            </thead>
            <tbody>
              {donors.map((entry, idx) => (
                <tr key={idx}>
                  <td>{entry.ContributorName || "N/A"}</td>
                  <td>${Number(entry.ContributionAmount).toLocaleString()}</td>
                  <td>{entry.Employer || "N/A"}</td>
                  <td>{entry.City || "N/A"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
