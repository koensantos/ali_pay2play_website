import React, {useEffect, useState} from "react";
import { Pie, Bar } from "react-chartjs-2";
import { Link } from "react-router-dom";
import "chart.js/auto";
import "./Draft.css";
import WattermanPhoto from "./img/watterman.jpg";
import { HashLink } from "react-router-hash-link";



export default function Draft() {
  const [chartData, setChartData] = useState(null);
  const [topDonorsBarData, setTopDonorsBarData] = useState(null);
  const [topEmployersBarData, setTopEmployersBarData] = useState(null);
  const [donorSearchResults, setDonorSearchResults] = useState([]);
  const [donorHistory, setDonorHistory] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchStatus, setSearchStatus] = useState(null);
  const [totalDonations, setTotalDonations] = useState(null);

  const [openIndex, setOpenIndex] = useState(null);

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const backendUrl = "https://ali-pay2play-backend.onrender.com";

  const otherCandidates = [
    { name: "Mussab Ali", path: "/MussabAli" },
    { name: "Bill O'Dea", path: "/BillODea" },
    { name: "Jim McGreevey", path: "/JimMcGreevey" },
    { name: "James Solomon", path: "/JamesSolomon" },
  ];

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }, []);

  // ✅ Single useEffect for all API calls
  useEffect(() => {
    // contributions
    fetch(`${backendUrl}/api/contributions/Joyce_Watterman`)
      .then((res) => res.json())
      .then((data) => {
        if (!Array.isArray(data)) return;
        const labels = data.map((item) => item.ContributorGroup);
        const values = data.map((item) => item.ContributionAmount);
        const total = values.reduce((acc, val) => acc + val, 0);
        const backgroundColors = [
          "#E63946", "#1D3557", "#457B9D", "#000000", "#FFBE0B",
          "#FB8500", "#6A994E", "#9D4EDD", "#D62828", "#2A9D8F",
          "#B5838D", "#FF006E", "#8338EC", "#3A86FF"
        ];
        setChartData({
          labels,
          datasets: [{ data: values, backgroundColor: backgroundColors.slice(0, labels.length) }],
          total,
        });
      })
      .catch(console.error);

    // top donors
    fetch(`${backendUrl}/api/top_donors_bar/Joyce_Watterman`)
      .then((res) => res.json())
      .then(setTopDonorsBarData)
      .catch(console.error);

    // top employers
    fetch(`${backendUrl}/api/top_employers_bar/Joyce_Watterman`)
      .then((res) => res.json())
      .then(setTopEmployersBarData)
      .catch(console.error);

    // total donations
    fetch(`${backendUrl}/api/total_donations/Joyce_Watterman`)
      .then(res => res.json())
      .then(data => {
        if (data.total_donations !== undefined) {
          setTotalDonations(data.total_donations);
        }
      })
      .catch(console.error);
  }, [backendUrl]);

  // donor search
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
    fetch(`${backendUrl}/api/search_donor/Joyce_Watterman?q=${encodeURIComponent(name)}`)
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

  // Y-axis label wrapping function for charts
  function truncateLabel(label, maxLength = 15) {
    if (label.length <= maxLength) return label;
    return label.slice(0, maxLength - 1) + "…";
  }

  const donorChartOptions = {
    indexAxis: "y",
    responsive: true,
    maintainAspectRatio: true,
    plugins: { legend: { display: true } },
    scales: {
      x: {
        ticks: {
          callback: (value) => "$" + value.toLocaleString(),
        },
        beginAtZero: true,
      },
      y: {
        ticks: {
          callback: function (value) {
            const label = this.getLabelForValue(value);
            return truncateLabel(label);
          },
          font: { size: 12 },
          padding: 10,
        },
        grid: { display: true },
      },
    },
  };


  return (
    <div style={{ padding: "2rem", maxWidth: 900, margin: "0 auto" }}>
      <h1>Joyce Watterman: Campaign Finance Visuals</h1>

      {totalDonations !== null && (
        <div className="total-donations-panel">
          <h2>Total Donations</h2>
          <p>${totalDonations.toLocaleString()}</p>
        </div>
      )}

      <div className="red-flag-warning">
        <p>
          This candidate has been flagged for having suspicious donations.{" "}
          <HashLink smooth to="#red-flags">Click here to view them.</HashLink>
        </p>
      </div>

      <div className="bio-container">
        <section className="bio-text">
          <h2>Biography</h2>
          <p>Joyce Watterman currently serves as the Council President of Jersey City, the first woman to ever hold the position. Elected to the council in 2013 as an at-large member, Watterman has been a central figure in city government for over a decade. She has built her career on advocacy for equity, economic opportunity, and community empowerment, often drawing from her own experiences as a lifelong Jersey City resident and minister. Watterman is running for mayor with a focus on uniting the city’s diverse communities, expanding access to resources, and ensuring that growth benefits all residents, not just a few.</p>
          
          <h2>Policies</h2>
          <ul>
            <li>Economic empowerment: Advocating for workforce development, small business support, and stronger job pipelines for Jersey City residents.</li>
            <li>Affordable housing: Expanding housing access through inclusionary zoning, affordable housing mandates, and stronger tenant protections.</li>
            <li>Community services: Strengthening city partnerships with nonprofits, faith-based groups, and community organizations to better deliver services.</li>
            <li>Public safety: Promoting community-based policing, youth outreach programs, and violence prevention initiatives.</li>
            <li>Education and youth: Supporting expanded afterschool programs, vocational training, and youth mentorship opportunities.</li>
          </ul>
          
          <h2>Background</h2>
          <p>Joyce Watterman was born and raised in Jersey City, where she has spent her life serving the community through both public office and her role as co-pastor of the Continuous Flow Christian Center alongside her husband. Before entering politics, she worked extensively with faith-based and nonprofit organizations to provide housing, food, and job support for struggling families. Since joining the City Council, Watterman has become a bridge-builder in city government, often highlighting the voices of underrepresented groups. Her mayoral campaign emphasizes inclusive leadership, equity in city development, and policies that reflect the needs of all Jersey City residents.</p>
        </section>
        <div className="bio-image">
          <img src={WattermanPhoto} alt="Joyce Watterman" />
        </div>
      </div>

      {chartData && (
        <div className="chart-legend-container">
          <h1>Campaign Contributions Breakdown</h1>
          <div className="chart-wrapper">
            <Pie
              data={chartData}
              options={{
                maintainAspectRatio: false,
                plugins: { legend: { display: false } }
              }}
            />
          </div>
          <div className="legend-container">
            <div className="legend-description">
              <h3>Legend Description</h3>
              <ul>
                <li><strong>Individual - Small</strong>: $0 – $499</li>
                <li><strong>Individual - Medium</strong>: $500 – $1,999</li>
                <li><strong>Individual - Large</strong>: $2,000 – $5,500</li>
                <li><strong>P2P Corporate</strong>: Pay-to-play donations from businesses listed <a href="https://www.elec.nj.gov/pay2play/quickdownload.html">in NJ Elec.</a></li>
                <li><strong>Corporate</strong>: Donors from corporations.</li>
                <li><strong>Union</strong>: Labor unions</li>
                <li><strong>Political Committee</strong>: PACs, party committees</li>
                <li><strong>Interest Group</strong>: Trade or ideological orgs</li>
                <li><strong>Candidate</strong>: Self or campaign committee</li>
                <li><strong>Other / Unknown</strong>: Uncategorized donations</li>
              </ul>
            </div>
            <div className="legend-wrapper">
              <h3>Legend</h3>
              <ul>
                {chartData.labels.map((label, idx) => {
                  const value = chartData.datasets[0].data[idx];
                  const percent = ((value / chartData.total) * 100).toFixed(2);
                  return (
                    <li key={label}>
                      <span className="legend-color-box" style={{ backgroundColor: chartData.datasets[0].backgroundColor[idx] }}></span>
                      {label}: ${value.toLocaleString()} ({percent}%)
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="donor-bar-container">
        <div className="bar-chart">
          <h2>Top 10 Donors</h2>
          <div className="chart-inner-wrapper">
            {topDonorsBarData ? (
              <Bar data={topDonorsBarData} options={donorChartOptions} height={topDonorsBarData?.labels.length * 30}/>
            ) : <p>Loading top donors...</p>}
          </div>
        </div>

        <div className="bar-chart">
          <h2>Top 10 Employer Donors</h2>
          <div className="chart-inner-wrapper">
            {topEmployersBarData ? (
              <Bar data={topEmployersBarData} options={donorChartOptions} height={topDonorsBarData?.labels.length * 30}/>
            ) : <p>Loading top employer donors...</p>}
          </div>
        </div>
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

      
    <section id="red-flags" className="accordion-container">
      <h2>Red Flags</h2>
      <p className="intro">
        Joyce Watterman has been flagged for suspicious donations listed below.
      </p>
    </section>

    <div className="other-candidates-section">
      <h2>Other Candidates</h2>
      <ul className="other-candidates-list">
        {otherCandidates
          .filter(c => c.name !== "Joyce Watterman") // exclude current candidate
          .map(c => (
            <li key={c.name}>
              <Link to={c.path}>{c.name}</Link>
            </li>
        ))}
      </ul>
    </div>

      

      <div style={{ marginTop: "2rem", display: "flex", justifyContent: "space-between", flexWrap: "wrap" }}>
        <a href={`${backendUrl}/download/Joyce_Watterman_combined_contributions.csv`} download className="btn-download">Download Full Contributions CSV</a>
        <a href="/" className="btn-return">Return to Home Page</a>
        <a href="https://www.njelecefilesearch.com/SearchContributionInteractive?eid=454445">View Full ELEC Records</a>
      </div>
    </div>
  );
}
