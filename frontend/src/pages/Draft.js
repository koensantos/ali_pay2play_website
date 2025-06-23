import React, { useEffect, useState } from "react";
import { Pie } from "react-chartjs-2";
import "chart.js/auto";

export default function Draft() {
  const [chartData, setChartData] = useState(null);
  const [donors, setDonors] = useState([]);

  const backendUrl = "http://localhost:5000"; // Update if hosted differently

  // Pie chart data
  useEffect(() => {
    fetch(`${backendUrl}/api/contributions/Jim_McGreevey`)
      .then((res) => res.json())
      .then((data) => {
        if (!Array.isArray(data)) return;

        const labels = data.map((item) => item.ContributorGroup);
        const values = data.map((item) => item.ContributionAmount);
        const total = values.reduce((a, b) => a + b, 0);

        const backgroundColors = [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4BC0C0",
          "#9966FF",
          "#FF9F40",
          "#C9CBCF",
          "#8D99AE",
          "#6A4C93",
          "#F67280",
        ];

        setChartData({
          labels,
          datasets: [
            {
              data: values,
              backgroundColor: backgroundColors.slice(0, labels.length),
            },
          ],
          total,
        });
      })
      .catch((err) => console.error("Error fetching pie chart:", err));
  }, []);

  // Top donors
  useEffect(() => {
    fetch(`${backendUrl}/api/top_donors_csv/Jim_McGreevey`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setDonors(data);
        else console.error("Invalid donor data:", data);
      })
      .catch((err) => console.error("Error fetching donors:", err));
  }, []);

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Jim McGreevey: Campaign Finance Visuals</h1>

      {/* Pie Chart & Legend */}
      {chartData && (
        <div
          style={{
            display: "flex",
            gap: "2rem",
            flexWrap: "wrap",
            alignItems: "flex-start",
            marginBottom: "3rem",
          }}
        >
          <div
            style={{
              flex: "1 1 500px",
              minWidth: "400px",
              maxWidth: "600px",
              height: "450px",
            }}
          >
            <Pie
              data={chartData}
              options={{
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
              }}
            />
          </div>
          <div style={{ maxWidth: "300px" }}>
            <h3>Legend</h3>
            <ul style={{ listStyle: "none", padding: 0 }}>
              {chartData.labels.map((label, idx) => {
                const value = chartData.datasets[0].data[idx];
                const percent = ((value / chartData.total) * 100).toFixed(2);
                return (
                  <li key={label} style={{ marginBottom: "8px" }}>
                    <span
                      style={{
                        display: "inline-block",
                        width: "12px",
                        height: "12px",
                        backgroundColor:
                          chartData.datasets[0].backgroundColor[idx],
                        marginRight: "8px",
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

      {/* Line chart */}
      <div style={{ marginTop: "3rem" }}>
        <h2>Donations Over Time</h2>
        <img
          src={`${backendUrl}/api/charts/Jim_McGreevey_line_donations_over_time.png`}
          alt="Line chart of donations over time"
          style={{
            width: "100%",
            maxWidth: "700px",
            border: "1px solid #ccc",
          }}
        />
      </div>

      {/* Top Donors */}
      {donors.length > 0 && (
        <div style={{ marginTop: "3rem" }}>
          <h2>Top 10 Donors</h2>
          <table
            border="1"
            cellPadding="10"
            style={{
              borderCollapse: "collapse",
              width: "100%",
              maxWidth: "700px",
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
              {donors.map((donor, idx) => (
                <tr key={idx}>
                  <td>{donor.ContributorName}</td>
                  <td>${Number(donor.ContributionAmount).toLocaleString()}</td>
                  <td>{donor.Employer || "N/A"}</td>
                  <td>{donor.Donor_City || "N/A"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
