import React, { useEffect, useState } from "react";
import { Pie } from "react-chartjs-2";
import "chart.js/auto";

export default function Draft() {
  const [chartData, setChartData] = useState(null);
  const [donors, setDonors] = useState([]);
  const [employers, setEmployers] = useState([]);
  const [occupations, setOccupations] = useState([]);

  const backendUrl = "http://localhost:5000";

  useEffect(() => {
    fetch(`${backendUrl}/api/contributions/Jim_McGreevey`)
      .then((res) => res.json())
      .then((data) => {
        if (!Array.isArray(data)) return;
        const labels = data.map((item) => item.ContributorGroup);
        const values = data.map((item) => item.ContributionAmount);
        const total = values.reduce((a, b) => a + b, 0);
        const backgroundColors = [
          "#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0",
          "#9966FF", "#FF9F40", "#C9CBCF", "#8D99AE",
          "#6A4C93", "#F67280",
        ];
        setChartData({
          labels,
          datasets: [{ data: values, backgroundColor: backgroundColors.slice(0, labels.length) }],
          total,
        });
      });
  }, []);

  useEffect(() => {
    fetch(`${backendUrl}/api/top_donors_csv/Jim_McGreevey`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setDonors(data);
      });
  }, []);

  useEffect(() => {
    fetch(`${backendUrl}/api/top_employers/Jim_McGreevey`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setEmployers(data);
      });
  }, []);

  useEffect(() => {
    fetch(`${backendUrl}/api/top_occupations/Jim_McGreevey`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setOccupations(data);
      });
  }, []);

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Jim McGreevey: Campaign Finance Visuals</h1>

      {/* Candidate Profile */}
      <div style={{ marginBottom: "3rem" }}>
        <h2>Candidate Profile</h2>
        <p><strong>Biography:</strong> Jim McGreevey, born August 6, 1957, is a former Governor of New Jersey who previously served as Mayor of Woodbridge and as a state legislator. He rose through New Jersey’s political ranks before becoming governor in 2002. McGreevey made national headlines in 2004 when he came out as gay during a resignation speech amid scandal. After leaving office, he pursued theological studies and shifted his focus toward rehabilitation and social justice, particularly prison reentry. He earned a Master of Divinity and served as Executive Director of the NJ Reentry Corporation. McGreevey has since worked with marginalized communities to help them reintegrate into society. In 2023, he announced a campaign for Jersey City mayor, seeking a return to public service. His personal and professional journey reflects a message of redemption and civic duty.</p>

        <p><strong>Policy Positions:</strong> McGreevey supports expanding affordable housing and increasing transparency in development. He has emphasized the importance of infrastructure investment, including improvements to public transit and utilities. He promotes workforce development programs, particularly for formerly incarcerated individuals. McGreevey is also committed to enhancing mental health and addiction services citywide. His campaign supports ethical government reforms and community oversight. He also backs education initiatives that target underserved neighborhoods. Environmental sustainability is part of his platform, with a focus on green spaces and flood mitigation. Lastly, he advocates for inclusive economic growth that benefits long-time residents and small businesses.</p>

        <p><strong>Campaign Vision:</strong> McGreevey presents his campaign as a second chance—for both himself and the city. He aims to restore integrity to public office and uplift communities too often ignored by political leadership. His message emphasizes “service over self” and learning from past mistakes. His experience in state-level governance and nonprofit leadership forms the core of his appeal. McGreevey envisions a Jersey City that is more equitable, resilient, and affordable. He supports a bottom-up approach to policymaking—listening to residents through neighborhood forums and regular check-ins. His agenda reflects both policy acumen and emotional resonance, drawing from personal transformation. If elected, he promises bold, compassionate leadership anchored in local needs.</p>
      </div>

      {/* Pie Chart and Legend */}
      {chartData && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "2rem", marginBottom: "3rem" }}>
          <div style={{ flex: "1 1 500px", minWidth: "400px", maxWidth: "600px", height: "450px" }}>
            <Pie
              data={chartData}
              options={{
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
              }}
            />
          </div>
          <div style={{ flex: "1 1 250px", minWidth: "250px", maxWidth: "300px" }}>
            <h3>Legend</h3>
            <ul style={{ listStyle: "none", padding: 0 }}>
              {chartData.labels.map((label, idx) => {
                const value = chartData.datasets[0].data[idx];
                const percent = ((value / chartData.total) * 100).toFixed(2);
                return (
                  <li key={label} style={{ marginBottom: "8px" }}>
                    <span style={{
                      display: "inline-block",
                      width: "12px",
                      height: "12px",
                      backgroundColor: chartData.datasets[0].backgroundColor[idx],
                      marginRight: "8px",
                    }}></span>
                    {label}: ${value.toLocaleString()} ({percent}%)
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}

      {/* Line Chart */}
      <div style={{ marginTop: "3rem" }}>
        <h2>Donations Over Time</h2>
        <img
          src={`${backendUrl}/api/charts/Jim_McGreevey_line_donations_over_time.png`}
          alt="Line chart of donations over time"
          style={{ width: "100%", maxWidth: "700px", border: "1px solid #ccc" }}
        />
      </div>

      {/* Top Donors */}
      <div style={{ marginTop: "3rem" }}>
        <h2>Top 10 Donors</h2>
        <table border="1" cellPadding="10" style={{ borderCollapse: "collapse", width: "100%", maxWidth: "700px" }}>
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

      {/* Top Employers */}
      <div style={{ marginTop: "3rem" }}>
        <h2>Top Employers</h2>
        <table border="1" cellPadding="10" style={{ borderCollapse: "collapse", width: "100%", maxWidth: "700px" }}>
          <thead>
            <tr>
              <th>Employer</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {employers.map((row, idx) => (
              <tr key={idx}>
                <td>{row.Employer}</td>
                <td>${Number(row.ContributionAmount).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Top Occupations */}
      <div style={{ marginTop: "3rem" }}>
        <h2>Top Occupations</h2>
        <table border="1" cellPadding="10" style={{ borderCollapse: "collapse", width: "100%", maxWidth: "700px" }}>
          <thead>
            <tr>
              <th>Occupation</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {occupations.map((row, idx) => (
              <tr key={idx}>
                <td>{row.Occupation}</td>
                <td>${Number(row.ContributionAmount).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
