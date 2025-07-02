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
  const [totalDonations, setTotalDonations] = useState(null);
  const [vendorMatches, setVendorMatches] = useState([]);
  const [contractMatches, setContractMatches] = useState([]);

  const backendUrl = "http://localhost:5000";

  useEffect(() => {
    fetch(`${backendUrl}/api/contributions/Bill_O'Dea`)
      .then((res) => res.json())
      .then((data) => {
        if (!Array.isArray(data)) return;
        const labels = data.map((item) => item.ContributorGroup);
        const values = data.map((item) => item.ContributionAmount);
        const total = values.reduce((acc, val) => acc + val, 0);
        const backgroundColors = [
          "#E63946", "#1D3557", "#457B9D", "#A8DADC", "#FFBE0B",
          "#FB8500", "#6A994E", "#9D4EDD", "#D62828", "#2A9D8F"
        ];
        setChartData({
          labels,
          datasets: [{ data: values, backgroundColor: backgroundColors.slice(0, labels.length) }],
          total,
        });
      }).catch(console.error);
  }, []);

  useEffect(() => {
    fetch(`${backendUrl}/api/top_donors_bar/Bill_O'Dea`)
      .then((res) => res.json())
      .then(setTopDonorsBarData)
      .catch(console.error);
  }, []);

  useEffect(() => {
    fetch(`${backendUrl}/api/repeated_donors/Bill_O'Dea`)
      .then((res) => res.json())
      .then((data) => {
        if (!Array.isArray(data)) return;
        const labels = data.map((item) => item.ContributorName);
        const values = data.map((item) => item.TotalAmount);
        const backgroundColors = labels.map(() =>
          `hsl(${Math.floor(Math.random() * 360)}, 70%, 60%)`
        );
        setRepeatDonorsData({
          labels,
          datasets: [{ label: "Total Donations", data: values, backgroundColor: backgroundColors }],
        });
      }).catch(console.error);
  }, []);

  useEffect(() => {
    fetch(`${backendUrl}/api/donations_over_time/Bill_O'Dea`)
      .then((res) => res.json())
      .then(setDonationsOverTimeData)
      .catch(console.error);
  }, []);

  useEffect(() => {
    fetch(`${backendUrl}/api/total_donations/Bill_O'Dea`)
      .then(res => res.json())
      .then(data => {
        if (data.total_donations !== undefined) setTotalDonations(data.total_donations);
      })
      .catch(console.error);
  }, []);

  // Vendor Matches
  useEffect(() => {
    fetch(`${backendUrl}/api/vendors/Bill_O'Dea`)
      .then((res) => res.json())
      .then((data) => {
        setVendorMatches(data.vendor_matches || []);
      })
      .catch(console.error);
  }, []);

  // Contract Matches
  useEffect(() => {
    fetch(`${backendUrl}/api/contracts/Bill_O'Dea`)
      .then((res) => res.json())
      .then((data) => {
        setContractMatches(data.contract_matches || []);
      })
      .catch(console.error);
  }, []);

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
    fetch(`${backendUrl}/api/search_donor/Bill_O'Dea?q=${encodeURIComponent(searchTerm.trim())}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setSearchStatus(data.error);
        } else if (data.status === "found") {
          setSearchStatus(null);
          setDonorHistory(data.records);
        } else if (data.status === "not_found" && data.suggestions?.length) {
          setSearchStatus(null);
          setDonorSearchResults(data.suggestions);
        } else {
          setSearchStatus("This person or business cannot be found.");
        }
      })
      .catch(() => setSearchStatus("Search failed, please try again."));
  }

  function showDonorHistory(name) {
    setSearchTerm(name);
    setSearchStatus("Loading donor history...");
    fetch(`${backendUrl}/api/search_donor/Bill_O'Dea?q=${encodeURIComponent(name)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "found") {
          setDonorHistory(data.records);
          setSearchStatus(null);
        } else {
          setSearchStatus("No donation history found for this donor.");
        }
      })
      .catch(() => setSearchStatus("Failed to load donor history."));
  }

  return (
    <div style={{ padding: "2rem", maxWidth: 900, margin: "0 auto" }}>
      <h1>Bill O'Dea: Campaign Finance Visuals</h1>

      {/* Biography, Policies, Background */}
      <section style={{ marginBottom: "2rem" }}>
        <h2>Biography</h2>
        <p>Jim McGreevey served as the 52nd Governor of New Jersey ...</p>
        <h2>Policies</h2>
        <p>During his tenure, McGreevey emphasized ethics reform ...</p>
        <h2>Background</h2>
        <p>Born in Jersey City in 1957, Jim McGreevey attended ...</p>
      </section>

      {/* Legend Description */}
      <div className="legend-description">
        <h3>Legend Description</h3>
        <ul>
          <li><strong>Individual - Small</strong>: $0 – $499</li>
          <li><strong>Individual - Medium</strong>: $500 – $1,999</li>
          <li><strong>Individual - Large</strong>: $2,000 – $5,500</li>
          <li><strong>P2P Corporate</strong>: Pay-to-play donations from businesses</li>
          <li><strong>Corporate</strong>: Non-pay-to-play corporate donors</li>
          <li><strong>Union</strong>: Labor unions</li>
          <li><strong>Political Committee</strong>: PACs, party committees</li>
          <li><strong>Interest Group</strong>: Trade or ideological orgs</li>
          <li><strong>Candidate</strong>: Self or campaign committee</li>
          <li><strong>Other / Unknown</strong>: Uncategorized donations</li>
        </ul>
      </div>

      {/* Total Donations Panel */}
      {totalDonations !== null && (
        <div className="total-donations-panel">
          <h3>Total Donations</h3>
          <p>${totalDonations.toLocaleString()}</p>
        </div>
      )}

      {/* Pie Chart */}
      {chartData && (
        <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap", marginBottom: "3rem" }}>
          <div style={{ flex: "1 1 500px", minWidth: "400px", height: "450px" }}>
            <Pie data={chartData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
          </div>
          <div style={{ flex: "1 1 250px", minWidth: "250px" }}>
            <h3>Legend</h3>
            <ul>
              {chartData.labels.map((label, idx) => {
                const value = chartData.datasets[0].data[idx];
                const percent = ((value / chartData.total) * 100).toFixed(2);
                return (
                  <li key={label}>
                    <span style={{
                      display: "inline-block", width: "12px", height: "12px",
                      backgroundColor: chartData.datasets[0].backgroundColor[idx], marginRight: "8px"
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
      <div style={{ marginBottom: "3rem", height: 350 }}>
        <h2>Donations Over Time</h2>
        {donationsOverTimeData ? (
          <Line data={donationsOverTimeData} options={{
            responsive: true, maintainAspectRatio: false,
            scales: { y: { beginAtZero: true, ticks: { callback: v => "$" + v.toLocaleString() } } }
          }} />
        ) : <p>Loading donations over time...</p>}
      </div>

      {/* Top Donors */}
      <div style={{ marginBottom: "3rem", height: 400 }}>
        <h2>Top 10 Donors</h2>
        {topDonorsBarData ? (
          <Bar data={topDonorsBarData} options={{ indexAxis: "y", responsive: true }} />
        ) : <p>Loading top donors...</p>}
      </div>

      {/* Repeated Donors */}
      <div style={{ marginBottom: "3rem", height: 300 }}>
        <h2>Repeated Donors</h2>
        {repeatDonorsData ? (
          <Bar data={repeatDonorsData} options={{ responsive: true }} />
        ) : <p>Loading repeated donors data...</p>}
      </div>

      {/* Vendor Matches */}
      <div style={{ marginTop: "3rem", maxWidth: 700 }}>
        <h2>Vendor and Contract Matches</h2>
        <h3>Vendor Directory Matches</h3>
        {vendorMatches.length > 0 ? (
          <table border="1" cellPadding="10">
            <thead>
              <tr><th>Business Name</th><th>Total Contributions</th></tr>
            </thead>
            <tbody>
              {vendorMatches.map((item, idx) => (
                <tr key={idx}><td>{item.Business_Name}</td><td>${item.ContributionAmount.toLocaleString()}</td></tr>
              ))}
            </tbody>
          </table>
        ) : <p>No vendor matches found.</p>}

        {/* Contract Matches */}
        <h3>Contract Results Matches</h3>
        {contractMatches.length > 0 ? (
          <table border="1" cellPadding="10">
            <thead>
              <tr><th>Business Name</th><th>Total Contributions</th><th>Contract Amount</th><th>Contract Status</th></tr>
            </thead>
            <tbody>
              {contractMatches.map((item, idx) => (
                <tr key={idx}>
                  <td>{item["Business_Name"]}</td>
                  <td>
                  {item["TotalAmount"]
                    ? `$${Number(item["TotalAmount"]).toLocaleString()}`
                    : "N/A"}
                  </td>
                  <td>
                    {item["Contract Amount"] && item["Contract Amount"] !== "N/A"
                      ? (() => {
                          const parsed = parseFloat(
                            item["Contract Amount"].toString().replace(/[\$,]/g, "")
                          );
                          return isNaN(parsed) ? "N/A" : `$${parsed.toLocaleString()}`;
                        })()
                      : "N/A"}
                  </td>
                  <td>{item["Contract Status"]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : <p>No contract matches found.</p>}
      </div>

      {/* Donor Search */}
      <div style={{ marginBottom: "3rem" }}>
        <h2>Donor Search</h2>
        <form onSubmit={handleSearch}>
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
          <ul>{donorSearchResults.map((donor) => (
            <li key={donor}>
              <button onClick={() => showDonorHistory(donor)} style={{ color: "blue", background: "none", border: "none" }}>
                {donor}
              </button>
            </li>
          ))}</ul>
        )}
        {donorHistory && (
          <div>
            <h3>Donation History for {searchTerm}</h3>
            <table border="1" cellPadding="10">
              <thead>
                <tr><th>Contributor Name</th><th>Amount</th><th>Date</th><th>City</th><th>Category</th></tr>
              </thead>
              <tbody>
                {donorHistory.map((item, idx) => (
                  <tr key={idx}>
                    <td>{item.ContributorName}</td>
                    <td>${Number(item.ContributionAmount).toLocaleString()}</td>
                    <td>{item.ContributionDate}</td>
                    <td>{item.Donor_City}</td>
                    <td>{item.ContributorGroup}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Download / Navigation */}
      <div style={{ marginTop: "2rem", display: "flex", justifyContent: "space-between", flexWrap: "wrap" }}>
        <a href={`${backendUrl}/download/Bill_O'Dea_combined_contributions.csv`} download className="btn-download">
          Download Full Contributions CSV
        </a>
        <a href="/" className="btn-return">Return to Home Page</a>
      </div>
    </div>
  );
}
