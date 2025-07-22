import React, { useEffect, useState } from "react";
import { Pie, Bar, Line } from "react-chartjs-2";
import "chart.js/auto";
import "./Draft.css";


function RedFlagsSection() {
  return (
    <div
      style={{
        marginTop: "3rem",
        padding: "1rem",
        border: "1px solid #e63946",
        borderRadius: "8px",
        backgroundColor: "#fff0f0",
        maxWidth: 700,
      }}
    >
      <h2 style={{ color: "#e63946" }}>Red Flag Donations</h2>
      <p>
        The following donations have been flagged due to their potential to
        indicate conflicts of interest, pay-to-play risks, or unusual patterns:
      </p>
      <ul>
        <li style={{ marginBottom: "1rem" }}>
          <strong>Clb Partners LLC</strong> - $1,000 (P2P Corporate). Corporate
          pay-to-play donation raising potential conflict of interest.
        </li>
        <li style={{ marginBottom: "1rem" }}>
          <strong>Mckenna, Dupont, Stone & Washburne, P.C.</strong> - $1,500 (Two
          donations: $500 and $1,000, P2P Corporate). Law firm donations often
          flagged for lobbying influence.
        </li>
        <li style={{ marginBottom: "1rem" }}>
          <strong>RD Parisi Associates</strong> – $20,400 total (P2P Corporate). This firm became controversial
          when the Jersey City Council unanimously voted to drop Acrisure in favor of RD Parisi Associates on October 17, 2024, with James Solomon voting yes to resolution. This raises
          concerns about potential favoritism and pay-to-play influence. (See{" "}
          <a
            href="https://hudsoncountyview.com/jersey-city-council-unanimously-votes-to-drop-acrisure-for-rd-parisi-associates/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#e63946", textDecoration: "underline" }}
          >
            this article
          </a>{" "}
          for details.)
          <ul style={{ marginTop: "0.5rem", marginBottom: 0, paddingLeft: "1.5rem" }}>
            <li>$5,200 – 08/26/2024</li>
            <li>$5,200 – 09/30/2024</li>
            <li>$10,000 – 12/30/2024</li>
          </ul>
          <ul style={{ marginTop: "0.5rem", marginBottom: 0, paddingLeft: "1.5rem" }}>
            <li><strong>Rob Parisi</strong> – $5,200 (President of RD Parisi Associates)</li>
            <li><strong>Sheila Parisi</strong> – $5,200 (Retired)</li>
          </ul>
          <a href="https://cityofjerseycity.civicweb.net/Portal/MeetingInformation.aspx?Org=Cal&Id=308"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#e63946", textDecoration: "underline" }}
          >
            Source: Jersey City Council Meeting Minutes
          </a>
        </li>
        <li style={{ marginBottom: "1rem" }}>
          <strong>James Solomon</strong> - Multiple large individual donations
          from the candidate and family members, including several $5,000+
          contributions, which may raise questions about personal funding
          limits or influence.
        </li>
        <li style={{ marginBottom: "1rem" }}>
          <strong>Jersey City Officers Association</strong> - $1,000 Corporate.
          Police union donations sometimes raise concerns about influence on
          public safety policies.
        </li>
        <li style={{ marginBottom: "1rem" }}>
          <strong>Adams Rehmann & Heggan Associates Inc</strong> - $5,000 Corporate.
          Engineering/consulting firms making large donations can raise
          pay-to-play questions.
        </li>
        <li style={{ marginBottom: "1rem" }}>
          <strong>Siddiqi & Shtrenk Isbelahdanian P.C.</strong> - $1,000 Corporate.
          Corporate donations from law firms flagged for lobbying influence.
        </li>
        <li style={{ marginBottom: "1rem" }}>
          <strong>Michael Oriani</strong> - $5,500 Individual.<br />
          Michael Oriani is affiliated with Guarini Plumbing, which was awarded a $424,000 contract on January 23, 2025, for “Plumbing Service for Various Hudson County Departments.”
          This may raise concerns of potential pay-to-play influence in the Jersey City mayoral race, especially since the donation was made in March 2025, shortly after the contract was awarded.
          <br />
          <a
            href="http://www.hudsoncountynjprocure.org/index.php?section=view_all&search_results=awards&rfp_awarded=Yes"
            target="_blank"
            rel="noopener noreferrer"
          >
            Source: Hudson County Procurement Awards
          </a>
        </li>
        <li style={{ marginBottom: "1rem" }}>
          <strong>Christopher Warren</strong> – $5,000 Individual.<br />
          Christopher Warren, an attorney at Scarinci Hollenbeck, contributed a total of $5,000 to James Solomon’s campaign between February and March 2025. This occurred shortly after Scarinci Hollenbeck was awarded a $325,000 Hudson County contract on December 23, 2024, for “Labor and Employment Issues Hudson County Employees.” 
          The volume and timing of the donations — along with the large contribution made just days after multiple refunds — may raise concerns of coordinated giving or pay-to-play dynamics, especially given the firm's ongoing county business.
          <br />
          <a
            href="http://www.hudsoncountynjprocure.org/index.php?section=view_all&search_results=awards&rfp_awarded=Yes"
            target="_blank"
            rel="noopener noreferrer"
          >
            Source: Hudson County Procurement Awards
          </a>
        </li>
        <li style={{ marginBottom: "1rem" }}>
          <strong>Wilentz Attorneys at Law</strong> – $5,200 Corporate.<br />
          Wilentz, Goldman & Spitzer contributed $5,200 to James Solomon’s campaign on January 15, 2025. This came just one year after the firm was awarded a Hudson County contract for **Bond Counsel** services on January 23, 2024. While the contract amount is listed as $0, bond counsel positions often involve ongoing legal billing tied to financing projects, making the actual value difficult to trace. The combination of a donation from a politically connected law firm with county-level contracts may suggest potential **pay-to-play** dynamics or an effort to maintain influence.
          <br />
          <a
            href="http://www.hudsoncountynjprocure.org/index.php?section=view_all&search_results=awards&rfp_awarded=Yes"
            target="_blank"
            rel="noopener noreferrer"
          >
            Source: Hudson County Procurement Awards
          </a>
        </li>
        <li style={{ marginBottom: "1rem" }}>
          <strong>Trenk Isabel Siddiqi & Shahdanian P.C.</strong> – $1,000 Corporate.<br />
          This law firm made a corporate-level donation on 09/30/2024. The firm is known for its government representation and municipal/county public contracting work across New Jersey, which can create conflicts of interest or pay-to-play concerns.
          <ul style={{ marginLeft: "1.5rem", marginTop: "0.5rem" }}>
            <li style={{ marginBottom: "0.75rem" }}>
              <strong>Satish Poondi</strong> – $1,500 Individual.<br />
              Satish Poondi, an attorney at Trenk Isabel Siddiqi & Shahdanian P.C., donated $1,500 on 09/30/2024. Donations from firm attorneys may reflect broader firm-level influence, especially given their public-sector focus.
            </li>
            <li style={{ marginBottom: "0.75rem" }}>
              <strong>Satish Poondi</strong> – $500 Individual.<br />
              A separate $500 donation by the same attorney on the same date amplifies concerns regarding coordinated or repeated giving from the firm’s attorneys.
            </li>
            <li style={{ marginBottom: "0.75rem" }}>
              <strong>Richard Trenk</strong> – $500 Individual.<br />
              Richard Trenk, another attorney at the firm, contributed $500 on 12/16/2024, signaling continued involvement from senior legal staff in the campaign.
            </li>
            <li style={{ marginBottom: "0.75rem" }}>
              <strong>Richard Trenk</strong> – $250 Individual.<br />
              A previous $250 contribution on 09/20/2024 further illustrates a pattern of donations from firm personnel, raising flags about possible influence-seeking activity by a firm deeply involved in public government work.
            </li>
          </ul>
        </li>
      </ul>
    </div>
  );
}

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
    fetch(`${backendUrl}/api/contributions/James_Solomon`)
      .then((res) => res.json())
      .then((data) => {
        if (!Array.isArray(data)) return;
        const labels = data.map((item) => item.ContributorGroup);
        const values = data.map((item) => item.ContributionAmount);
        const total = values.reduce((acc, val) => acc + val, 0);
        const backgroundColors = [
          "#E63946",
          "#1D3557",
          "#457B9D",
          "#A8DADC",
          "#FFBE0B",
          "#FB8500",
          "#6A994E",
          "#9D4EDD",
          "#D62828",
          "#2A9D8F",
        ];
        setChartData({
          labels,
          datasets: [
            { data: values, backgroundColor: backgroundColors.slice(0, labels.length) },
          ],
          total,
        });
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    fetch(`${backendUrl}/api/top_donors_bar/James_Solomon`)
      .then((res) => res.json())
      .then(setTopDonorsBarData)
      .catch(console.error);
  }, []);

  useEffect(() => {
    fetch(`${backendUrl}/api/repeated_donors/James_Solomon`)
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
            { label: "Total Donations", data: values, backgroundColor: backgroundColors },
          ],
        });
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    fetch(`${backendUrl}/api/donations_over_time/James_Solomon`)
      .then((res) => res.json())
      .then(setDonationsOverTimeData)
      .catch(console.error);
  }, []);

  useEffect(() => {
    fetch(`${backendUrl}/api/total_donations/James_Solomon`)
      .then((res) => res.json())
      .then((data) => {
        if (data.total_donations !== undefined) setTotalDonations(data.total_donations);
      })
      .catch(console.error);
  }, []);

  // Vendor Matches
  useEffect(() => {
    fetch(`${backendUrl}/api/vendors/James_Solomon`)
      .then((res) => res.json())
      .then((data) => {
        setVendorMatches(data.vendor_matches || []);
      })
      .catch(console.error);
  }, []);

  // Contract Matches
  useEffect(() => {
    fetch(`${backendUrl}/api/contracts/James_Solomon`)
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
    fetch(
      `${backendUrl}/api/search_donor/James_Solomon?q=${encodeURIComponent(
        searchTerm.trim()
      )}`
    )
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
    fetch(
      `${backendUrl}/api/search_donor/James_Solomon?q=${encodeURIComponent(name)}`
    )
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
      <h1>James Solomon: Campaign Finance Visuals</h1>

      {/* Biography, Policies, Background */}
      <section style={{ marginBottom: "2rem" }}>
        <h2>Biography</h2>
        <p>
          Jim McGreevey served as the 52nd Governor of New Jersey ...
        </p>
        <h2>Policies</h2>
        <p>During his tenure, McGreevey emphasized ethics reform ...</p>
        <h2>Background</h2>
        <p>Born in Jersey City in 1957, Jim McGreevey attended ...</p>
      </section>

      {/* Legend Description */}
      <div className="legend-description">
        <h3>Legend Description</h3>
        <ul>
          <li>
            <strong>Individual - Small</strong>: $0 – $499
          </li>
          <li>
            <strong>Individual - Medium</strong>: $500 – $1,999
          </li>
          <li>
            <strong>Individual - Large</strong>: $2,000 – $5,500
          </li>
          <li>
            <strong>P2P Corporate</strong>: Pay-to-play donations from
            businesses listed{" "}
            <a href="https://www.elec.nj.gov/pay2play/quickdownload.html">
              in NJ Elec.
            </a>
          </li>
          <li>
            <strong>Corporate</strong>: Donors from corporations.
          </li>
          <li>
            <strong>Union</strong>: Labor unions
          </li>
          <li>
            <strong>Political Committee</strong>: PACs, party committees
          </li>
          <li>
            <strong>Interest Group</strong>: Trade or ideological orgs
          </li>
          <li>
            <strong>Candidate</strong>: Self or campaign committee
          </li>
          <li>
            <strong>Other / Unknown</strong>: Uncategorized donations
          </li>
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
        <div
          style={{
            display: "flex",
            gap: "2rem",
            flexWrap: "wrap",
            marginBottom: "3rem",
          }}
        >
          <div
            style={{ flex: "1 1 500px", minWidth: "400px", height: "450px" }}
          >
            <Pie
              data={chartData}
              options={{
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
              }}
            />
          </div>
          <div style={{ flex: "1 1 250px", minWidth: "250px" }}>
            <h3>Legend</h3>
            <ul>
              {chartData.labels.map((label, idx) => {
                const value = chartData.datasets[0].data[idx];
                const percent = ((value / chartData.total) * 100).toFixed(2);
                return (
                  <li key={label}>
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

      {/* Line Chart */}
      <div style={{ marginBottom: "3rem", height: 350 }}>
        <h2>Donations Over Time</h2>
        {donationsOverTimeData ? (
          <Line
            data={donationsOverTimeData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: { callback: (v) => "$" + v.toLocaleString() },
                },
              },
            }}
          />
        ) : (
          <p>Loading donations over time...</p>
        )}
      </div>

      {/* Top Donors */}
      <div style={{ marginBottom: "3rem", height: 400 }}>
        <h2>Top 10 Donors</h2>
        {topDonorsBarData ? (
          <Bar data={topDonorsBarData} options={{ indexAxis: "y", responsive: true }} />
        ) : (
          <p>Loading top donors...</p>
        )}
      </div>

      {/* Repeated Donors */}
      <div style={{ marginBottom: "3rem", height: 300 }}>
        <h2>Repeated Donors</h2>
        {repeatDonorsData ? (
          <Bar data={repeatDonorsData} options={{ responsive: true }} />
        ) : (
          <p>Loading repeated donors data...</p>
        )}
      </div>

      {/* Vendor Matches */}
      <div style={{ marginTop: "3rem", maxWidth: 700 }}>
        <h2>Vendor and Contract Matches</h2>
        <h3>Vendor Directory Matches</h3>
        {vendorMatches.length > 0 ? (
          <table border="1" cellPadding="10">
            <thead>
              <tr>
                <th>Business Name</th>
                <th>Total Contributions</th>
              </tr>
            </thead>
            <tbody>
              {vendorMatches.map((item, idx) => (
                <tr key={idx}>
                  <td>{item.Business_Name}</td>
                  <td>${item.ContributionAmount.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No vendor matches found.</p>
        )}

        {/* Contract Matches */}
        <h3>Contract Results Matches</h3>
        {contractMatches.length > 0 ? (
          <table border="1" cellPadding="10">
            <thead>
              <tr>
                <th>Donor Business</th>
                <th>Donated</th>
                <th>Contract Value</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {contractMatches.map((item, idx) => (
                <tr key={idx}>
                  <td>{item["Donor Business"] || "N/A"}</td>
                  <td>
                    {item["Donated"] !== undefined
                      ? `$${Number(item["Donated"]).toLocaleString()}`
                      : "N/A"}
                  </td>
                  <td>
                    {item["Contract Value"] && item["Contract Value"] !== "Unknown"
                      ? item["Contract Value"]
                      : "N/A"}
                  </td>
                  <td>{item["Status"] || "N/A"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No contract matches found.</p>
        )}
      </div>

      {/* Donor Search */}
      <div
        style={{
          marginTop: "3rem",
          padding: "1rem",
          border: "1px solid #ddd",
          borderRadius: "8px",
          maxWidth: 700,
        }}
      >
        <h2>Donor Search Tool</h2>
        <form onSubmit={handleSearch} style={{ marginBottom: "1rem" }}>
          <input
            type="text"
            placeholder="Search donor by name or business"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: "80%", padding: "0.5rem", fontSize: "1rem" }}
          />
          <button type="submit" style={{ padding: "0.5rem 1rem", marginLeft: "0.5rem" }}>
            Search
          </button>
        </form>
        {searchStatus && <p>{searchStatus}</p>}

        {/* Suggestions if donor not found */}
        {donorSearchResults.length > 0 && (
          <>
            <p>Did you mean:</p>
            <ul>
              {donorSearchResults.map((name, idx) => (
                <li key={idx}>
                  <button
                    style={{ cursor: "pointer", color: "blue", textDecoration: "underline", background: "none", border: "none", padding: 0 }}
                    onClick={() => showDonorHistory(name)}
                  >
                    {name}
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}

        {/* Donor history results */}
        {donorHistory && (
          <>
            <h3>Donation History for {searchTerm}</h3>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Employer</th>
                  <th>Occupation</th>
                </tr>
              </thead>
              <tbody>
                {donorHistory.map((record, idx) => (
                  <tr key={idx} style={{ borderBottom: "1px solid #ddd" }}>
                    <td>{record.Date}</td>
                    <td>${Number(record.ContributionAmount).toLocaleString()}</td>
                    <td>{record.Employer || "N/A"}</td>
                    <td>{record.Occupation || "N/A"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>

      {/* Add Red Flags Section here */}
      <RedFlagsSection />

      {/* Download and Return Links */}
      <div
        style={{
          marginTop: "2rem",
          display: "flex",
          justifyContent: "space-between",
          flexWrap: "wrap",
        }}
      >
        <a
          href={`${backendUrl}/download/James_Solomon_combined_contributions.csv`}
          download
          className="btn-download"
        >
          Download Full Contributions CSV
        </a>
        <a href="/" className="btn-return">
          Return to Home Page
        </a>
      </div>
    </div>
  );
}
