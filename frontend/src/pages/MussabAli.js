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
    fetch(`${backendUrl}/api/contributions/Mussab_Ali`)
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
    fetch(`${backendUrl}/api/top_donors_bar/Mussab_Ali`)
      .then((res) => res.json())
      .then((data) => {
        if (!data || !Array.isArray(data.labels) || !Array.isArray(data.datasets)) return;
        setTopDonorsBarData(data);
      })
      .catch(console.error);
  }, []);

  // Repeated donors bar
  useEffect(() => {
    fetch(`${backendUrl}/api/repeated_donors/Mussab_Ali`)
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
    fetch(`${backendUrl}/api/donations_over_time/Mussab_Ali`)
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

    fetch(`${backendUrl}/api/search_donor/Mussab_Ali?q=${encodeURIComponent(searchTerm.trim())}`)
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
    fetch(`${backendUrl}/api/search_donor/Mussab_Ali?q=${encodeURIComponent(name)}`)
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
      `Mussab Ali made history as the youngest elected official in Jersey City when he joined the Board of Education at age 20. A graduate of Harvard Law School and a first-generation American, Ali has consistently focused on expanding educational opportunities, equity, and youth engagement in politics. Known for his ability to bridge generational and cultural divides, Ali has positioned himself as a candidate who represents the city's future while honoring its diverse history. His candidacy reflects a commitment to grassroots leadership and policy innovation.`,
    policies:
      `Ali advocates for affordable housing reform, improved public transportation, and educational equity. He supports participatory budgeting to give residents more direct control over local spending and is vocal about environmental sustainability initiatives like green infrastructure and climate resilience planning. On public safety, Ali promotes a community-centered approach that includes mental health resources and youth intervention programs. He has also pushed for digital equity, aiming to expand internet access and tech opportunities in underserved neighborhoods.`,
    background:
      `Born and raised in Jersey City, Mussab Ali is the son of Pakistani immigrants and a product of the city’s public school system. He overcame a rare cancer diagnosis as a teenager, an experience that shaped his commitment to public service. As a BOE member and later as a policy advocate, he’s worked on education equity and civil rights issues at local and national levels. His academic and lived experiences make him a unique voice in the race—a young leader aiming to modernize governance while staying rooted in community values.`,
  };

  return (
    <div style={{ padding: "2rem", maxWidth: 900, margin: "0 auto" }}>
      <h1>Mussab Ali: Campaign Finance Visuals</h1>

      {/* Candidate Profile Section */}
      <section style={{ marginBottom: "2rem" }}>
        <h2>Biography</h2>
        <p>{candidateProfile.biography}</p>

        <h2>Policies</h2>
        <p>{candidateProfile.policies}</p>

        <h2>Background</h2>
        <p>{candidateProfile.background}</p>
      </section>

<div className="legend-description">
  <h3>Legend Description</h3>
  <ul>
    <li><strong>Individual - Small</strong>: Contributions from individuals totaling <em>less than $4,000</em></li>
    <li><strong>Individual - Large</strong>: Contributions from individuals totaling <em>$4,000 or more</em></li>
    <li><strong>P2P Corporate</strong>: Contributions from businesses or firms—includes LLCs, INCs, CORPs, and similar corporate entities</li>
    <li><strong>P2P Individual</strong>: Pay-to-play contributions from individuals, not associated with business entities</li>
    <li><strong>Corporate</strong>: Non-P2P business or corporate contributions</li>
    <li><strong>Union</strong>: Labor union contributions</li>
    <li><strong>Political Committee</strong>: Political parties, PACs, and affiliated groups</li>
    <li><strong>Interest Group</strong>: Ideological or trade associations</li>
    <li><strong>Candidate</strong>: Self-funding from the candidate’s own committee</li>
    <li><strong>Other / Unknown</strong>: Contributions not fitting any known category</li>
  </ul>
</div>

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
                  <th>Category</th>
                </tr>
              </thead>
              <tbody>
                {donorHistory.map((item, idx) => (
                <tr key={idx}>
                  <td>{item.ContributorName || item.First_Name + " " + item.Last_Name || item.Business_Name || "N/A"}</td>
                  <td>${Number(item.ContributionAmount).toLocaleString()}</td>
                  <td>{item.ContributionDate || "N/A"}</td>
                  <td>{item.Donor_City || item.City || "N/A"}</td>
                  <td>{item.ContributorGroup || "Unknown"}</td>
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
          href={`${backendUrl}/download/Mussab_Ali_combined_contributions.csv`}
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

