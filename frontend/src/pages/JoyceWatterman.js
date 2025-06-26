import React, { useEffect, useState } from "react";
import { Pie, Bar, Line } from "react-chartjs-2";
import "chart.js/auto";
import "./Draft.css";

export default function Draft() {
  const [chartData, setChartData] = useState(null);
  const [topDonorsBarData, setTopDonorsBarData] = useState(null);
  const [repeatDonorsData, setRepeatDonorsData] = useState(null);
  const [donationsOverTimeData, setDonationsOverTimeData] = useState(null);
  const [donorSearchResults, setDonorSearchResults] = useState([]);
  const [donorHistory, setDonorHistory] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchStatus, setSearchStatus] = useState(null);

  const backendUrl = "http://localhost:5000";

  // Contribution groups (pie chart)
  useEffect(() => {
    fetch(`${backendUrl}/api/contributions/Joyce_Watterman`)
      .then((res) => res.json())
      .then((data) => {
        if (!Array.isArray(data)) return;

        const labels = data.map((item) => item.ContributorGroup);
        const values = data.map((item) => item.ContributionAmount);
        const total = values.reduce((acc, val) => acc + val, 0);

        const backgroundColors = [
          "#E63946", // strong red
          "#1D3557", // dark navy blue
          "#457B9D", // medium blue
          "#A8DADC", // light teal (not too pale)
          "#FFBE0B", // bright yellow
          "#FB8500", // bright orange
          "#6A994E", // medium green
          "#9D4EDD", // bright purple
          "#D62828", // vivid red (different tone)
          "#2A9D8F", // tealish green
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
      .catch(console.error);
  }, []);

  // Top donors bar
  useEffect(() => {
    fetch(`${backendUrl}/api/top_donors_bar/Joyce_Watterman`)
      .then((res) => res.json())
      .then((data) => {
        if (!data || !Array.isArray(data.labels) || !Array.isArray(data.datasets)) return;
        setTopDonorsBarData(data);
      })
      .catch(console.error);
  }, []);

  // Repeated donors bar
  useEffect(() => {
    fetch(`${backendUrl}/api/repeated_donors/Joyce_Watterman`)
      .then((res) => res.json())
      .then((data) => {
        if (!Array.isArray(data)) return;

        const labels = data.map((item) => item.ContributorName);
        const values = data.map((item) => item.TotalAmount);

        const backgroundColors = labels.map(
          () => `hsl(${Math.floor(Math.random() * 360)}, 70%, 60%)`
        );

        setRepeatDonorsData({
          labels,
          datasets: [
            {
              label: "Total Donations",
              data: values,
              backgroundColor: backgroundColors,
            },
          ],
        });
      })
      .catch(console.error);
  }, []);

  // Donations over time line chart
  useEffect(() => {
    fetch(`${backendUrl}/api/donations_over_time/Joyce_Watterman`)
      .then((res) => res.json())
      .then((data) => {
        if (!data || !Array.isArray(data.labels) || !Array.isArray(data.datasets)) return;
        setDonationsOverTimeData(data);
      })
      .catch(console.error);
  }, []);

  // Donor search handlers
  function handleSearch(e) {
    e.preventDefault();
    if (!searchTerm.trim()) {
      setDonorSearchResults([]);
      setDonorHistory(null);
      setSearchStatus(null);
      return;
    }
    setSearchStatus("Searching...");
    setDonorHistory(null);
    setDonorSearchResults([]);

    fetch(`${backendUrl}/api/search_donor/Joyce_Watterman?q=${encodeURIComponent(searchTerm.trim())}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setSearchStatus(data.error);
          setDonorSearchResults([]);
          setDonorHistory(null);
          return;
        }
        if (data.status === "found") {
          setSearchStatus(null);
          setDonorHistory(data.records);
          setDonorSearchResults([]);
        } else if (data.status === "not_found" && data.suggestions && data.suggestions.length > 0) {
          setSearchStatus(null);
          setDonorSearchResults(data.suggestions);
          setDonorHistory(null);
        } else {
          setSearchStatus("This person or business cannot be found.");
          setDonorSearchResults([]);
          setDonorHistory(null);
        }
      })
      .catch(() => {
        setSearchStatus("Search failed, please try again.");
        setDonorSearchResults([]);
        setDonorHistory(null);
      });
  }

  function showDonorHistory(name) {
    setSearchTerm(name);
    setSearchStatus("Loading donor history...");
    fetch(`${backendUrl}/api/search_donor/Joyce_Watterman?q=${encodeURIComponent(name)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "found") {
          setDonorHistory(data.records);
          setDonorSearchResults([]);
          setSearchStatus(null);
        } else {
          setSearchStatus("No donation history found for this donor.");
          setDonorHistory(null);
        }
      })
      .catch(() => {
        setSearchStatus("Failed to load donor history.");
        setDonorHistory(null);
      });
  }

  // Candidate Profile (hardcoded)
  const candidateProfile = {
    biography:
      `Joyce Watterman is Jersey City’s first African American woman to serve as City Council President. A pastor and community leader, she has been at the forefront of addressing poverty, housing instability, and racial disparities in the city. Watterman brings a faith-driven perspective to governance, focusing on compassion, service, and structural change. Her leadership style blends moral conviction with legislative action, making her a powerful advocate for the underserved.`,
    policies:
      `Watterman prioritizes affordable housing expansion, tenant protections, and homelessness prevention. She supports initiatives to close racial wealth gaps, including small business grants for minority entrepreneurs and financial literacy programs. On education, she backs school funding equity and wraparound services for students. Watterman also champions re-entry programs for formerly incarcerated individuals and supports public health investments in underserved communities. Her platform centers around dignity, opportunity, and inclusion.`,
    background:
      `Joyce Watterman’s journey from grassroots organizer to Council President is rooted in decades of service to Jersey City residents. Through her work in churches, nonprofits, and city hall, she has led efforts to combat poverty and uplift marginalized voices. A strong advocate for women and families, she has received numerous awards for civic leadership. Watterman’s deep ties to the community and emphasis on justice reflect a candidacy grounded in lived experience and long-standing public trust.`,
  };

  return (
    <div style={{ padding: "2rem", maxWidth: 900, margin: "0 auto" }}>
      <h1>Joyce Watterman: Campaign Finance Visuals</h1>

      {/* Candidate Profile Section */}
      <section style={{ marginBottom: "2rem" }}>
        <h2>Biography</h2>
        <p>{candidateProfile.biography}</p>

        <h2>Policies</h2>
        <p>{candidateProfile.policies}</p>

        <h2>Background</h2>
        <p>{candidateProfile.background}</p>
      </section>

      {/* Pie Chart and Legend */}
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
                hover: { mode: "nearest", intersect: true },
              }}
            />
          </div>

          <div
            style={{
              flex: "1 1 250px",
              minWidth: "250px",
              maxWidth: "300px",
            }}
          >
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

      {/* Donations Over Time Line Chart */}
      <div style={{ marginTop: "3rem", marginBottom: "3rem", height: 350, maxWidth: 700 }}>
        <h2>Donations Over Time</h2>
        {donationsOverTimeData ? (
          <Line
            data={donationsOverTimeData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                x: {
                  type: "category",
                  title: {
                    display: true,
                    text: "Month",
                  },
                },
                y: {
                  beginAtZero: true,
                  title: {
                    display: true,
                    text: "Amount ($)",
                  },
                  ticks: {
                    callback: (value) => "$" + value.toLocaleString(),
                  },
                },
              },
              plugins: {
                legend: { display: false },
                tooltip: {
                  callbacks: {
                    label: (ctx) => `$${ctx.parsed.y.toLocaleString()}`,
                  },
                },
              },
            }}
          />
        ) : (
          <p>Loading donations over time data...</p>
        )}
      </div>

      {/* Top 10 Donors Bar Chart */}
      <div style={{ marginBottom: "3rem", height: 400, maxWidth: 700 }}>
        <h2>Top 10 Donors</h2>
        {topDonorsBarData ? (
          <Bar
            data={topDonorsBarData}
            options={{
              indexAxis: "y",
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                x: {
                  beginAtZero: true,
                  ticks: {
                    callback: (value) => "$" + value.toLocaleString(),
                  },
                },
                y: {
                  ticks: {
                    autoSkip: false,
                    maxRotation: 0,
                    minRotation: 0,
                  },
                },
              },
              plugins: {
                legend: { display: false },
                tooltip: {
                  callbacks: {
                    label: (context) => `$${context.parsed.x.toLocaleString()}`,
                  },
                },
              },
            }}
            height={400}
          />
        ) : (
          <p>Loading top donors...</p>
        )}
      </div>

      {/* Repeated Donors Bar Chart */}
      <div style={{ marginBottom: "3rem", height: 300, maxWidth: 700 }}>
        <h2>Repeated Donors</h2>
        {repeatDonorsData ? (
          <Bar
            data={repeatDonorsData}
            options={{
              indexAxis: "x",
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    precision: 0,
                  },
                },
              },
              plugins: {
                legend: { display: false },
              },
            }}
            height={300}
          />
        ) : (
          <p>Loading repeated donors data...</p>
        )}
      </div>

      {/* Donor Search Section */}
      <div style={{ marginBottom: "3rem" }}>
        <h2>Donor Search</h2>
        <form onSubmit={handleSearch} style={{ marginBottom: "1rem" }}>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Enter donor name or business"
            style={{ width: "70%", padding: "0.5rem", marginRight: "1rem" }}
          />
          <button type="submit">Search</button>
        </form>
        {searchStatus && <p>{searchStatus}</p>}
        {donorSearchResults.length > 0 && (
          <div>
            <p>Did you mean:</p>
            <ul>
              {donorSearchResults.map((donor) => (
                <li key={donor}>
                  <button
                    onClick={() => showDonorHistory(donor)}
                    style={{
                      cursor: "pointer",
                      background: "none",
                      border: "none",
                      color: "blue",
                      textDecoration: "underline",
                      padding: 0,
                    }}
                  >
                    {donor}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
        {donorHistory && (
          <div>
            <h3>Donation History for {searchTerm}</h3>
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
                  <th>Contributor Name</th>
                  <th>Donation Amount</th>
                  <th>Date</th>
                  <th>City</th>
                </tr>
              </thead>
              <tbody>
                {donorHistory.map((item, idx) => (
                  <tr key={idx}>
                    <td>{item.ContributorName || "N/A"}</td>
                    <td>${Number(item.ContributionAmount).toLocaleString()}</td>
                    <td>{item.ContributionDate || "null"}</td>
                    <td>{item.Donor_City || item.City || "null"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Download and Navigation Links */}
      <div style={{ marginTop: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap" }}>
        <a
          href={`${backendUrl}/download/Joyce_Watterman_combined_contributions.csv`}
          download
          style={{
            backgroundColor: "#1D3557",
            color: "white",
            padding: "0.5rem 1rem",
            borderRadius: "4px",
            textDecoration: "none",
            marginBottom: "1rem"
          }}
        >
          Download Full Contributions CSV
        </a>
        <a
          href="/"
          style={{
            color: "#1D3557",
            textDecoration: "underline",
            fontWeight: "bold",
            marginBottom: "1rem"
          }}
        >
          Return to Home Page
        </a>
      </div>
    </div>
  );
}

