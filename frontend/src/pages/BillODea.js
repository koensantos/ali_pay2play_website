import React, {useEffect, useState} from "react";
import { Pie, Bar } from "react-chartjs-2";
import { Link } from "react-router-dom";
import "chart.js/auto";
import "./Draft.css";
import ODeaPhoto from "./img/odea.jpg";
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
  const [menuOpen, setMenuOpen] = useState(false);

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
    { name: "Joyce Watterman", path: "/JoyceWatterman" },
    { name: "Transparency Dashboard", path: "/comparison" }
  ];

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }, []);

  // ✅ Single useEffect for all API calls
  useEffect(() => {
    // contributions
    fetch(`${backendUrl}/api/contributions/Bill_O'Dea`)
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
    fetch(`${backendUrl}/api/top_donors_bar/Bill_O'Dea`)
      .then((res) => res.json())
      .then(setTopDonorsBarData)
      .catch(console.error);

    // top employers
    fetch(`${backendUrl}/api/top_employers_bar/Bill_O'Dea`)
      .then((res) => res.json())
      .then(setTopEmployersBarData)
      .catch(console.error);

    // total donations
    fetch(`${backendUrl}/api/total_donations/Bill_O'Dea`)
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
          callback: (value) => "$" + Number(value).toLocaleString(),
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
    <div style={{ padding: "2rem", paddingTop: "4rem", maxWidth: 900, margin: "0 auto" }}>
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

      <h1>Bill O'Dea: Campaign Finance Visuals</h1>

      {totalDonations !== null && (
        <div className="total-donations-panel">
          <h2>Total Donations</h2>
          <p>${totalDonations.toLocaleString()}</p>
        </div>
      )}

      <div className="red-flag-warning">
        <p>
          This candidate has been flagged for having suspicious donations, totaling to $307,475.{" "}
          <HashLink smooth to="#red-flags">Click here to view them.</HashLink>
        </p>
      </div>

      <div className="bio-container">
        <section className="bio-text">
          <h2>Biography</h2>
          <p>Bill O’Dea is a longtime public servant and Hudson County Commissioner representing District 2, which includes parts of Jersey City. He has held that position since the late 1990s and is known for his deep knowledge of municipal government and budget oversight. With a political career spanning over three decades, O’Dea has developed a reputation for constituent services, neighborhood advocacy, and a pragmatic approach to development. Before his time as a commissioner, he also served as a Jersey City Councilmember. Now running for mayor, O'Dea brings extensive experience navigating the city's political and administrative systems, making a case for steady, experienced leadership in a time of rapid change.</p>
          <h2>Policies</h2>
          <ul>
            <li>Affordable housing: Calling for better enforcement of inclusionary zoning, more deeply affordable units, and protections for renters against displacement.</li>
            <li>Infrastructure investment: Supporting long-term capital planning to improve roads, public buildings, and stormwater systems, especially in underserved neighborhoods.</li>
            <li>Job creation and union support: Advocating for labor-backed job programs and prioritizing union labor in city contracts and developments.</li>
            <li>Public health and wellness: Proposing expanded access to health clinics, addiction services, and mental health resources in all city wards.</li>
            <li>Senior services and youth programs: Promoting investment in senior centers and youth enrichment, including job readiness and sports facilities.</li>
          </ul>
          <h2>Background</h2>
          <p>Bill O'Dea was born and raised in Jersey City and has lived in the city his entire life. He attended St. Peter’s University and began his career in public service working with local youth programs and job initiatives. Over the years, he has been closely involved in the Hudson County Improvement Authority, where he has worked on development projects and capital improvements. Known for his connections in labor and community organizations, O'Dea has positioned himself as a candidate who blends old-school political relationships with neighborhood-level responsiveness. His campaign appeals to longtime residents who want balanced development and stronger city services rooted in institutional knowledge.</p>
        </section>
        <div className="bio-image">
          <img src={ODeaPhoto} alt="Bill O'Dea" />
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
              <Bar data={topDonorsBarData} options={donorChartOptions} height={topDonorsBarData?.labels.length * 30} />
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
      <p>Bill O'Dea's mayoral campaign in Jersey City has raised significant funds, with over $220,000 reported in the second quarter of 2025 and nearly $1.25 million in cash on hand heading into the fall election season. He has emphasized that his campaign is focused on "putting Jersey City first," expressing gratitude for support from residents who resist the influence of outside political bosses. Despite this stance, his campaign has accepted donations from entities that could be perceived as having potential conflicts of interest, totaling $228,475, including IBEW Local Union No. 164 PAC and Florio Kenny Reval LLC. This raises questions about the consistency of his commitment to integrity and whether his fundraising practices fully align with his stated values.</p>

      {/* Sal's Electric CO. */}
      <div className="accordion-item">
        <button
          className={`accordion-header ${openIndex === 1 ? "active" : ""}`}
          onClick={() => toggleAccordion(1)}
          aria-expanded={openIndex === 1}
        >
          Sal's Electric CO. - $1,000
          <span className="accordion-arrow" />
        </button>
        {openIndex === 1 && (
          <div className="accordion-content">
            <p>O'Dea has received several donations totaling $1,000. These donations have been flagged as a red flag because the company has been awarded two different contracts from Jersey City and has also received several expenditure payments from the city. Such contributions create the appearance of a potential conflict of interest, as they may be perceived as an attempt to influence city officials or secure favorable treatment in future contracting decisions. While no direct wrongdoing is proven, the overlap between campaign donations and city business highlights the need for transparency and careful ethical scrutiny.</p>
            <p>
              <strong>Res 24-628:</strong> The City of Jersey City approved Resolution 24-628 on August 14, 2024, awarding a contract worth $198,718.00 to Sal Electric Co., Inc.. This contract is for the purchase and installation of an overhead lighting system at Pershing Field Pool for the Department of Recreation and Youth Development. The contract was awarded through the New Jersey Cooperative Purchasing Alliance (NJCPA), Bergen County Coop, and is a one-time purchase, meaning it will be completed upon the delivery of the goods and services.{" "}
              <a href="https://cityofjerseycity.civicweb.net/document/408768/For%20the%20purchase%20and%20installation%20of%20overhead%20l.pdf?handle=8FB0E9F68E884AEF808E9FF82DAD570F">Resolution PDF</a>
            </p>
            <p>
              <strong>Res 21-745:</strong> On October 27, 2021, Jersey City approved Resolution 21-745, awarding a $244,678 contract to Sal Electric Co., Inc. for the installation of EV chargers for five electric garbage trucks. The contract was issued under the New Jersey Cooperative Purchasing Alliance (NJCPA) with Bergen County as the lead agency, which allows municipalities to jointly procure goods and services. Funding is sourced from two capital accounts, with purchase orders totaling the full amount. The contract is considered fair and reasonable by the City Purchasing Agent and will be completed upon delivery and proper certification of service. Payment will be issued in accordance with Local Fiscal Affairs Law, once the contractor meets all obligations.{" "}
              <a href="https://cityofjerseycity.civicweb.net/document/58165/For%20the%20installation%20of%20EV%20Chargers%20for%20five%20el.pdf?handle=9F498EC97B8947708056BB4A8A252A79">Resolution PDF</a>
            </p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/429486">5/2/25 - $200,218.00</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/70762">6/27/22 - $57,978</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/66966">4/13/22 - $60,500.00</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/64284">2/17/22 - $66,850.00</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/62536">1/20/22 - $61,500.00</a></p>
          </div>

        )}
      </div>

      <div className="accordion-item">
        <button
          className={`accordion-header ${openIndex === 2 ? "active" : ""}`}
          onClick={() => toggleAccordion(2)}
          aria-expanded={openIndex === 2}
        >
          IBEW Local Union 164 - $50,400
          <span className="accordion-arrow" />
        </button>
        {openIndex === 2 && (
          <div className="accordion-content">
            <p>The donations from IBEW Local Union 164 to Bill O’Dea, totaling $50,400, raise a strong red flag given the union’s extensive financial ties with Jersey City. Public records show that IBEW Local 164 has received significant city payments over multiple years, including large expenditures in 2021, 2022, 2024, and 2025. The sequence of receiving municipal funds and then contributing heavily to O’Dea’s campaign creates the appearance of a pay-to-play cycle, where taxpayer money flows to the union and then back into local politics. This dynamic heightens concerns about whether the union is seeking to preserve or expand its influence over future contracts and city decisions. While no direct illegality is proven, the overlap between city expenditures and campaign donations underscores the risk of undue influence and the need for greater transparency.</p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/434284">6/25/25 - $8,672.67</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/405701">6/12/24 - $10,086.83</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/66966">4/13/22 - $65,573.14</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/53126">8/17/21 - $44,465.12</a></p>
          </div>
        )}
      </div>

      {/* William J Guarini Plumbing */}
      <div className="accordion-item">
        <button
          className={`accordion-header ${openIndex === 3 ? "active" : ""}`}
          onClick={() => toggleAccordion(3)}
          aria-expanded={openIndex === 3}
        >
          Kyrsta Gomes, - $2,500
          Matthew LeFurge, Project Manager - $5,100
          William J Guarini Plumbing - $4,475
          <span className="accordion-arrow" />
        </button>
        {openIndex === 3 && (
          <div className="accordion-content">
            <p>O'Dea has received a total of $12,075 in campaign contributions, including $4,475 from William J. Guarini, INC, $2,500 from Krysta Gomes, and $5,100 from Matthew LeFurge. These donations are considered potentially problematic because William J. Guarini, INC holds an active contract with the city, creating a possible conflict of interest and raising pay-to-play concerns. They have also received several expenditure payments from the city. These donations are to be scruntized because it represents possible pay-to-play or conflict of interest concerns. The total amount makes it seem like the company and its employees are looking to be favorable to O'Dea if he was elected mayor. The related resolution is listed below for reference.</p>
            <p>
              <strong>Res 24-335:</strong> The City of Jersey City approved Resolution 24-335 on May 8, 2024, authorizing a contract award of $120,000.00 to William J. Guarini, Inc. for citywide plumbing services. This contract was awarded through the New Jersey Cooperative Purchasing Alliance (NJCPA), Bergen County Coop, for the Department of Public Works, Division of Buildings and Street Maintenance. The contract term is effective from May 9, 2024, through December 31, 2024. Initial funding of $20,000.00 is available in the operating account, with the continuation of the contract subject to the availability of funds in the 2024 fiscal year permanent budget.
            </p>
            <p>
              <a href="https://cityofjerseycity.civicweb.net/document/400643/For%20citywide%20plumbing%20services.pdf?handle=95AFC000E6434A69ACCECA47B7C171D8">Resolution PDF</a>
            </p>

            <p><a href="https://cityofjerseycity.civicweb.net/document/434925">7/11/25 - $246.17</a></p>
              <p><a href="https://cityofjerseycity.civicweb.net/document/433084">6/3/25 - $1,599.38</a></p>
              <p><a href="https://cityofjerseycity.civicweb.net/document/431135">5/15/25 - $5,800</a></p>
              <p><a href="https://cityofjerseycity.civicweb.net/document/426925">4/4/25 - $33,333.40</a></p>
              <p><a href="https://cityofjerseycity.civicweb.net/document/411476">9/19/24 - $18,282.16</a></p>
              <p><a href="https://cityofjerseycity.civicweb.net/document/409634">8/12/24 - $38,056.23</a></p>
              <p><a href="https://cityofjerseycity.civicweb.net/document/408268">7/8/24 - $25,290</a></p>
              <p><a href="https://cityofjerseycity.civicweb.net/document/404397">6/7/24 - $45,555.80</a></p>
              <p><a href="https://cityofjerseycity.civicweb.net/document/396109">3/1/24 - $17,041.58</a></p>
              <p><a href="https://cityofjerseycity.civicweb.net/document/390968">1/8/24 - $9,015.71</a></p>
              <p><a href="https://cityofjerseycity.civicweb.net/document/387879">11/22/23 - $6,800</a></p>
              <p><a href="https://cityofjerseycity.civicweb.net/document/92663">6/9/23 - $5,800</a></p>
              <p><a href="https://cityofjerseycity.civicweb.net/document/91602">5/19/23 - $660</a></p>
              <p><a href="https://cityofjerseycity.civicweb.net/document/71510">7/8/22 - $6,985.08</a></p>
              <p><a href="https://cityofjerseycity.civicweb.net/document/70762">6/27/22 - $900</a></p>
              <p><a href="https://cityofjerseycity.civicweb.net/document/65863">3/17/22 - $4,628.40</a></p>
              <p><a href="https://cityofjerseycity.civicweb.net/document/59107">11/4/21 - $2,761.28</a></p>
              <p><a href="https://cityofjerseycity.civicweb.net/document/58567">10/22/21 - $225</a></p>
              <p><a href="https://cityofjerseycity.civicweb.net/document/55789">9/3/21 - $1,246.03</a></p>
              <p><a href="https://cityofjerseycity.civicweb.net/document/52979">8/13/21 - $1,549.72</a></p>
              <p><a href="https://cityofjerseycity.civicweb.net/document/51506">7/9/21 - $681</a></p>
              <p><a href="https://cityofjerseycity.civicweb.net/document/50909">6/25/21 - $294.72</a></p>
              <p><a href="https://cityofjerseycity.civicweb.net/document/46108">4/9/21 - $2,614.53</a></p>
              <p><a href="https://cityofjerseycity.civicweb.net/document/44797">3/18/21 - $1,315.60</a></p>
              <p><a href="https://cityofjerseycity.civicweb.net/document/41559">1/25/21 - $1,991.80</a></p>
              <p><a href="https://cityofjerseycity.civicweb.net/document/40872">$3,124.91 - 1/11/21</a></p>
              <p><a href="https://cityofjerseycity.civicweb.net/document/38868">$1,834.27 - 11/25/20</a></p>
              <p><a href="https://cityofjerseycity.civicweb.net/document/37605">$1,670.10 - 11/5/20</a></p>
              <p><a href="https://cityofjerseycity.civicweb.net/document/33761">$3,885.82 - 9/1/20</a></p>
              <p><a href="https://cityofjerseycity.civicweb.net/document/27626">6/4/20 - $8,500</a></p>
              <p><a href="https://cityofjerseycity.civicweb.net/document/23359">3/18/20 - $5,495.42</a></p>
              <p><a href="https://cityofjerseycity.civicweb.net/document/20322">2/4/20 - $742.50</a></p>
              <p><a href="https://cityofjerseycity.civicweb.net/document/17017">12/11/19 - $570</a></p>
          </div>
        )}
      </div>

      {/* Royal Printing Services */}
      <div className="accordion-item">
        <button
          className={`accordion-header ${openIndex === 4 ? "active" : ""}`}
          onClick={() => toggleAccordion(4)}
          aria-expanded={openIndex === 4}
        >
          Royal Printing Services - $2,600
          <span className="accordion-arrow" />
        </button>
        {openIndex === 4 && (
          <div className="accordion-content">
            <p>O'Dea has received a $2,600 donation from the company on May 24, 2022. This company has received several contracts related to ballots for elections and other printing needs listed below.</p>
            <p>
              <strong>Res 24-507:</strong> The City of Jersey City ratified a contract awarded to Royal Printing Service for $84,300.00 for printing official election machine and sample ballots for the June 4, 2024 primary election. The Hudson County Clerk, E. Junior Maldonado, designated Royal Printing Service as the official printer for Hudson County ballots. This contract was exempt from public bidding as per N.J.S.A. 40A:11-5(1)(1), which covers goods and services required for election preparation and conduct. Funds in the amount of $10,000.00 were initially available for the payment of this resolution. The contract award is also subject to Royal Printing Service providing satisfactory evidence of compliance with Affirmative Action Amendments to the Law Against Discrimination.{" "}
              <a href="https://cityofjerseycity.civicweb.net/document/404001/Contract%20Reso%20for%20Royal%20Printing%20-%20Primary%20Elec.pdf?handle=69D645D1F41C4D91B9B763FCA2946EE1">Resolution PDF</a>
            </p>
            <p>
              <strong>Res 23-652:</strong> This resolution from the City of Jersey City authorizes the award of a contract to Royal Printing Service for various City printing needs. The total contract amount is $31,134.00. The contract term will be completed upon receipt of the goods and/or services. The resolution also outlines compliance with various regulations, including Equal Employment Opportunity (EEO)/Affirmative Action (AA) requirements and the Americans with Disabilities Act. It was approved on September 7, 2023.{" "}
              <a href="https://cityofjerseycity.civicweb.net/document/96696/For%20printing%20service%20for%20the%20year%20in%20review%20mas.pdf?handle=75ADD11D40454B3F82E076E64AB06F5F">Resolution PDF</a>
            </p>
            <p>
              <strong>Res 23-653:</strong> This resolution from the City of Jersey City ratifies a contract awarded to Royal Printing Service for printing official election machine and sample ballots for the Primary Election held on June 6, 2023. Hudson County Clerk E. Junior Maldonado designated Royal Printing Service as the official printer for Hudson County ballots. The contract is for the sum of $84,300.00 and is exempt from public bidding under N.J.S.A. 40A:11-5(1)(1) because it pertains to services necessary for conducting an election. Royal Printing Service also submitted certifications related to business entity disclosure, political contributions, and compliance with the City's Pay-to-Play Reform Ordinance and affirmative action requirements. The resolution was approved on September 7, 2023. <a href="https://cityofjerseycity.civicweb.net/document/96266">Resolution PDF</a>
            </p>
            <p>
              <strong>Res 20-666:</strong> The City of Jersey City has ratified a contract award to Royal Printing Service for printing official election machine and sample ballots for the July 7, 2020, primary election. The contract amount is $83,177.00. This contract was exempt from public bidding as per N.J.S.A. 40A:11-5(1)(1) because it involves goods and services necessary for conducting an election. Royal Printing Service was designated as the official ballot printer for Hudson County by the County Clerk. The resolution also states that the City is acquiring these services directly and openly as a statutorily permitted contract under the "Pay-to-Play Law".{" "}
              <a href="https://cityofjerseycity.civicweb.net/document/33849/Reso%20Contract%20Royal%20Printing.pdf?handle=B70083430C774A3B9D26CD8B7E237BA9">Resolution PDF</a>
            </p>
            <p><strong>Res 19-460 </strong>The City of Jersey City ratified a contract with Royal Printing Service for $78,710 to print official election machine and sample ballots for the June 4, 2019, primary election. The contract is exempt from public bidding under N.J.S.A. 40A:11-5(1)(l) because it is necessary for conducting the election. Royal Printing Service submitted all required certifications, including the Business Entity Disclosure, Chapter 271 Political Contribution Disclosure, and compliance with the City’s Pay-to-Play Reform Ordinance, confirming no prohibited contributions were made. The contract also requires the company to comply with affirmative action and anti-discrimination laws. Funds for the contract are available in Account No. 201-01-201-20-121-305, and all supporting documentation is placed on file with the resolution. <a href="https://cityofjerseycity.civicweb.net/document/5982">Resolution PDF</a></p>

            <p><a href="https://cityofjerseycity.civicweb.net/document/436252">8/14/25 - $87,672.00</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/409634">8/12/24 - $84,300</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/242953">10/5/23 - $84,300</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/170562">9/20/23 - $31,134.00</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/73623">8/17/22 - $84,300</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/69017">5/25/22 - $35,969.70</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/63350">2/2/22 - $2,500</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/58567">10/22/21 - $230</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/52979">8/13/21 - $80,285.00</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/37605">11/5/20 - $600</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/35574">9/29/20 - $83,177.00</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/15268">11/7/19 - $1400</a></p>

          </div>
        )}
      </div>

      {/* McManimon, Scotland & Baumann, LLC */}
      <div className="accordion-item">
        <button
          className={`accordion-header ${openIndex === 5 ? "active" : ""}`}
          onClick={() => toggleAccordion(5)}
          aria-expanded={openIndex === 5}
        >
          Joseph Baumann, Member - $400
          John Cavaliere, Member - $400
          Jennifer Credidio, Member - $400
          Andrea Dobin, Member - $200
          Matthew Jessup, Member - $400
          Leaf Kauman, Member - $400
          Christopher Langhart, Member - $400
          Bakari Lee, Member - $400
          Kevin McManimon, Member - $400
          William Northgrave, Member - $400
          William Opel, Member - $400
          Jeffrey Sherry - $400
          Anthony Sodono - $400
          Eric Tomaszweski - $400
          <span className="accordion-arrow" />
        </button>
        {openIndex === 5 && (
          <div className="accordion-content">
            <p>
            On March 14, 2025, fourteen employees of McManimon, Scotland & Baumann, LLC each donated to O'Dea’s campaign, totaling $5,400. These coordinated contributions are a red flag because the firm has received numerous contracts from Jersey City in recent years, covering matters such as land use, litigation, tax issues, and real estate. Many of these contracts were awarded without public bidding under the professional services exemption, with values ranging from tens of thousands to hundreds of thousands of dollars. In addition, the firm has been paid repeatedly through city expenditures for legal services across multiple departments. The timing and scale of these donations, combined with the firm’s ongoing financial relationship with the city, raise concerns about potential conflicts of interest and pay-to-play practices.
            </p>

                <p>
                  <strong>Res 24-415:</strong> This resolution from the City of Jersey City ratifies the renewal of a professional services agreement with the law firm McManimon, Scotland & Baumann, LLC. The firm is retained to represent the City and the Jersey City Planning Board in the case of "Clinton Crescent N. Madison Community v. Planning Board of the City of Jersey City, et al". This agreement is a renewal of a previous contract approved on March 23, 2023. The renewed contract is for one year, effective from January 1, 2024, and the total amount, including expenses, is not to exceed $130,000.00, with an hourly rate of $200.00. The resolution was approved on May 22, 2024. <a href="https://cityofjerseycity.civicweb.net/document/400402/Renewal%20of%20a%20professional%20services%20agreement%20wi.pdf?handle=A1DE271A561E40F58E59AE031B98951B">Resolution PDF</a>
                </p>

                <p>
                  <strong>Res 24-416:</strong> The firm will continue to provide local land use legal counsel services in connection with the Sixth Street Embankment settlement. This is a renewal of previous agreements from 2020, 2021, and 2023. The contract is effective for one year, beginning on January 8, 2024, and the total contract amount is increased by an additional $50,000.00, making the new total contract amount $250,000.00, including expenses. The firm will be compensated at a rate of $200.00 per hour, including expenses. The resolution was approved on May 22, 2024. <a href="https://cityofjerseycity.civicweb.net/document/400567/Renewal%20of%20a%20professional%20services%20agreement%20wi.pdf?handle=A47EB30F6274413582FF3637B66C3CB3">Resolution PDF</a>
                </p>

                <p>
                  <strong>Res 24-350:</strong> On May 8, 2024, Jersey City approved Resolution 24-350, ratifying the renewal of a professional services agreement with the law firm McManimon, Scotland & Baumann, LLC to provide legal advice on tax matters. This renewal adds $30,000 to the contract, bringing the total contract amount to $90,000, with services billed at $200/hour including expenses. The contract qualifies as a professional service under NJ law, allowing it to be awarded without public bidding, and is compliant with Pay-to-Play and affirmative action regulations. Funding of $1,000 is currently available under PO#151260, with continuation subject to future appropriations. The agreement will be made publicly available and published in a local newspaper as required. <a href="https://cityofjerseycity.civicweb.net/document/400377/R0208646_%20TAX%20MATTERS%20McManimon,%20Scotland%20_%20Bau.pdf?handle=D80A870BC86F420BA33BAB53914D5612">Resolution PDF</a>
                </p>

                <p>
                  <strong>Res 23-937:</strong> On December 13, 2023, Jersey City approved Resolution 23-937, renewing a professional services agreement with McManimon, Scotland & Baumann, LLC to continue providing legal advice on tax matters. The renewal adds $30,000 to the contract, bringing the total to $60,000, with services billed at $200 per hour, including expenses. The agreement qualifies as a professional service under NJ law and is awarded without competitive bidding but in compliance with Pay-to-Play and affirmative action requirements. Funding of $1,000 is currently available under PO#149888, with future payments contingent on budget appropriations. The agreement will also be published for public inspection as required by law. <a href="https://cityofjerseycity.civicweb.net/document/340819/R0207074_%20Legal%20Advice%20_%20Tax%20Matters%20Counsel.pdf?handle=00E83E9537EE4E22880398A6652964C1">Resolution PDF</a>
                </p>

                <p>
                  <strong>Res 23-893:</strong> On November 29, 2023, Jersey City approved Resolution 23-893, ratifying a professional services agreement with McManimon, Scotland & Baumann, LLC to represent the City and the Jersey City Planning Board in the lawsuit LHN Owner, LLC and LHN II, LLC v. City of Jersey City et al. The contract runs for one year starting July 1, 2023, with a maximum value of $50,000, billed at $175 per hour including expenses. The agreement is awarded without public bidding under NJ’s professional services and Pay-to-Play laws. An initial $5,000 is available under PO#149796, with further payments contingent on future budget appropriations. The law firm must also comply with affirmative action requirements, and the resolution will be published for public notice. <a href="https://cityofjerseycity.civicweb.net/document/340822/Ratifying%20a%20professional%20services%20agreement%20wit.pdf?handle=DBEE892609C2458FB7CE464EC417A4F1">Resolution PDF</a>
                </p>

                <p>
                  <strong>Res 23-233:</strong> On March 23, 2023, Jersey City approved Resolution 23-233, ratifying a professional services agreement with McManimon, Scotland & Baumann, LLC to represent the city in the lawsuit Jeff Joseph & Syringa Ko v. City of Jersey City, et al. The agreement is for one year starting January 1, 2023, at an hourly rate of $200, with a contract not to exceed $65,000, including expenses. The contract is awarded without public bidding as a professional service under NJ law and complies with Pay-to-Play and affirmative action requirements. The firm submitted all necessary political contribution and compliance certifications. An initial $8,775 is available under PO#147555, and future payments are contingent on budget appropriations. <a href="https://cityofjerseycity.civicweb.net/document/84747/R0204518_%20J.%20Joseph%20_%20S.%20KO%20V.%20City.pdf?handle=213EE25053064041A00AC79B6B1ABC2D">Resolution PDF</a>
                </p>

                <p>
                  <strong>Res 23-234:</strong> On March 23, 2023, Jersey City approved Resolution 23-234, ratifying a professional services agreement with McManimon, Scotland & Baumann, LLC to represent the City and the Jersey City Planning Board in the lawsuit Clinton Crescent N. Madison Community v. Planning Board of the City of Jersey City, et al. The contract runs for one year starting January 1, 2023, at an hourly rate of $200, with a total not to exceed $65,000, including expenses. The firm complied with all Pay-to-Play and political contribution disclosure laws and submitted necessary certifications. An initial $2,255 is available under PO#147554, and continued payment depends on future budget appropriations. The agreement is awarded without public bidding under NJ’s professional services exemption. <a href="https://cityofjerseycity.civicweb.net/document/84602/R0204517_%20Clinton%20N.%20Madison%20Community%20V.%20City.pdf?handle=5BED33AC16F043ABA1192E32BD057D6B">Resolution PDF</a>
                </p>

                <p>
                  <strong>Res 23-147:</strong> Jersey City renewed its professional services agreement with the law firm McManimon, Scotland & Baumann, LLC to provide land use legal counsel for the ongoing Sixth Street Embankment settlement. The renewal adds $50,000 to the existing contract, bringing the total to $200,000. The agreement runs for one year from January 8, 2023, with services billed at $200 per hour, and is exempt from public bidding under New Jersey's Local Public Contracts Law. The contract complies with the City’s Pay-to-Play Reform Ordinance and Affirmative Action requirements, and $5,000 is currently available under PO# 147342. <a href="https://cityofjerseycity.civicweb.net/document/82313/R0204266_%20Renewal%206th%20Street%20Embankmentof%20a%20pro.pdf?handle=E0DB7272AA564D3F9C3B17C50B635603">Resolution PDF</a>
                </p>

                <p>
                  <strong>Res 22-533:</strong> The City of Jersey City awarded a $30,000 professional services contract to McManimon, Scotland & Baumann, LLC to provide legal advice and counsel on certain tax matters for one year beginning May 9, 2022. Services will be billed at $150/hour, including expenses. The agreement was awarded as a non-fair and open contract under New Jersey’s Pay-to-Play Law and Local Public Contracts Law, exempt from public bidding. The firm submitted all required disclosures and compliance certifications. $5,000 was confirmed available in Account No. 01-201-20-155-312; PO#145279. <a href="https://cityofjerseycity.civicweb.net/document/69116/Ratifying%20a%20professional%20services%20agreement%20wit.pdf?handle=68CFB4EA959848CFAC4D49581A8C3787">Resolution PDF</a>
                </p>

                <p>
                  <strong>Res 21-881:</strong> The City of Jersey City awarded a $50,000 professional services contract to McManimon, Scotland & Baumann, LLC for legal advice and counsel on certain real estate matters for a one-year term starting July 1, 2021. The firm will be compensated at an hourly rate of $150, including expenses. The contract was awarded as a professional services agreement exempt from public bidding under New Jersey law and through the “fair and open” Pay-to-Play process. All necessary certifications were submitted, and $15,000 in funds were confirmed available in Account No. 01-201-20-155-312; PO# 142935. <a href="https://cityofjerseycity.civicweb.net/document/58918/Professional%20Services%20Agreement%20with%20McManimon,.pdf?handle=10305472AC3141D98AF60C9E7AEA9C7E">Resolution PDF</a>
                </p>

                <p>
                  <strong>Res 21-882:</strong> Resolution 21-882 renews a professional services agreement between the City of Jersey City and the law firm McManimon, Scotland & Baumann, LLC. The firm will continue to provide local land use counsel services related to the Sixth Street Embankment settlement. The renewed contract is effective January 8, 2022, for one year, with an additional $50,000 added, bringing the total contract value to $100,000 at a rate of $200/hour. The agreement was awarded under the “fair and open” Pay-to-Play law and does not require public bidding. The firm has submitted all required compliance certifications, and the agreement is subject to the appropriation of funds in the 2022 budget. <a href="https://cityofjerseycity.civicweb.net/document/59897/Professional%20Services%20Agreement%20with%20McManimon,.pdf?handle=AB8D18072714463A87C21B0457170563">Resolution PDF</a>
                </p>

                <p>
                  <strong>Res 21-209:</strong> Resolution 21-209 renews a professional services agreement between the City of Jersey City and the law firm McManimon, Scotland & Baumann, LLC to provide local land use counsel services for the Sixth Street Embankment settlement. The contract is effective January 8, 2021, for one year, with a total value not to exceed $50,000 at a rate of $200 per hour. The contract was awarded through a fair and open process under the New Jersey Pay-to-Play Law and exempt from public bidding under state law. The law firm has submitted all required certifications, including compliance with affirmative action and pay-to-play ordinances. Funding of $5,000 is available in the city’s budget, and the contract continuation depends on available appropriations in the 2021 budget. <a href="https://cityofjerseycity.civicweb.net/document/41732/Professional%20Services%20Agreement%20with%20McManimon%20.pdf?handle=B356A4FDC23F4914A6B3F927FF91EA72">Resolution PDF</a>
                </p>

                <p>
                  <strong>Res 20-658:</strong> The City of Jersey City awarded a one-year professional services agreement to the law firm McManimon, Scotland & Baumann, LLC to provide legal services related to insurance coverage litigation for multiple matters. The contract, effective August 5, 2020, is valued up to $50,000 at an hourly rate of $150, including expenses. The award was made through a fair and open process under the New Jersey Local Unit Pay-to-Play Law and is exempt from public bidding under state law. The firm submitted all required certifications, including compliance with affirmative action and the city’s pay-to-play reform ordinance. Funding of $10,000 was available in the city’s 2020 budget, with contract continuation subject to appropriation of funds in future budgets. <a href="https://cityofjerseycity.civicweb.net/document/32364/Professional%20Service%20Agreement%20with%20McManimon,%20.pdf?handle=83A8F0E18ABB4C09B72B27FD05393F8A">Resolution PDF</a>
                </p>

                <p>
                  <strong>Res 20-050:</strong> The City of Jersey City awarded a one-year professional services contract to the law firm McManimon, Scotland & Baumann, LLC to provide local land use counsel services for the Sixth Street Embankment settlement. The contract, effective January 8, 2020, is for a total amount not to exceed $50,000 at an hourly rate of $150, including expenses. The award was made through a fair and open process in compliance with the New Jersey Local Unit Pay-to-Play Law and is exempt from public bidding under state law. The law firm submitted all required certifications, including compliance with the City’s Contractor Pay-to-Play Reform Ordinance and affirmative action laws. Funding of $10,000 was certified available in the city’s 2020 budget, with continuation contingent on the appropriation of sufficient funds. <a href="https://cityofjerseycity.civicweb.net/document/18463/Professional%20Service%20Contract%20for%20McManimon%20Sco.pdf?handle=E64B23B3A080462781CE8F41FE179D62:">Resolution PDF</a>
                </p>
                <p><a href="https://cityofjerseycity.civicweb.net/document/412458">10/10/24 - $357.87</a></p>
                <p><a href="https://cityofjerseycity.civicweb.net/document/410721">9/6/24 - $13,536.39</a></p>
                <p><a href="https://cityofjerseycity.civicweb.net/document/409634">8/12/24 - $18,338</a></p>
                <p><a href="https://cityofjerseycity.civicweb.net/document/408268">7/8/24 - $8,877.55</a></p>
                <p><a href="https://cityofjerseycity.civicweb.net/document/406617">6/24/24 - $7,665.46</a></p>
                <p><a href="https://cityofjerseycity.civicweb.net/document/398781">4/9/24 - $22,168.47</a></p>
                <p><a href="https://cityofjerseycity.civicweb.net/document/396109">3/1/24 - $840</a></p>
                <p><a href="https://cityofjerseycity.civicweb.net/document/394633">2/5/24 - $380</a></p>
                <p><a href="https://cityofjerseycity.civicweb.net/document/393695">1/22/24 - $780.00</a></p>
                <p><a href="https://cityofjerseycity.civicweb.net/document/390968">1/8/24 - $3,520</a></p>
                <p><a href="https://cityofjerseycity.civicweb.net/document/390093">12/11/23 - $1,933.66</a></p>
                <p><a href="https://cityofjerseycity.civicweb.net/document/357072">11/6/23 - $3,151.25</a></p>
                <p><a href="https://cityofjerseycity.civicweb.net/document/156507">9/18/23 - $8,826.25</a></p>
                <p><a href="https://cityofjerseycity.civicweb.net/document/99143">9/5/23 - $10,108.17</a></p>
                <p><a href="https://cityofjerseycity.civicweb.net/document/95854">8/11/23 - $9,860</a></p>
                <p><a href="https://cityofjerseycity.civicweb.net/document/93549">6/26/23 - $5,100.00</a></p>
                <p><a href="https://cityofjerseycity.civicweb.net/document/92663">6/9/23 - $4,120</a></p>
                <p><a href="https://cityofjerseycity.civicweb.net/document/89720">4/24/23 - $5,200</a></p>
                <p><a href="https://cityofjerseycity.civicweb.net/document/88651">4/6/23 - $18,730</a></p>
                <p><a href="https://cityofjerseycity.civicweb.net/document/84304">2/3/23 - $7,400</a></p>
                <p><a href="https://cityofjerseycity.civicweb.net/document/82744">1/6/23 - $18,956.85</a></p>
                <p><a href="https://cityofjerseycity.civicweb.net/document/80927">11/23/22 - $17,439.12</a></p>
                <p><a href="https://cityofjerseycity.civicweb.net/document/78028">10/25/22 - $2,520.00</a></p>
                <p><a href="https://cityofjerseycity.civicweb.net/document/74496">9/2/22 - $1,000</a></p>
                <p><a href="https://cityofjerseycity.civicweb.net/document/73114">8/12/22 - $6,240</a></p>
                <p><a href="https://cityofjerseycity.civicweb.net/document/70762">6/27/22 - $11,050</a></p>
                <p><a href="https://cityofjerseycity.civicweb.net/document/69755">6/10/22 - $1,360</a></p>
                <p><a href="https://cityofjerseycity.civicweb.net/document/65863">3/17/22 - $3,412.10</a></p>
                <p><a href="https://cityofjerseycity.civicweb.net/document/64888">3/3/22 - $7,187.33</a></p>
                <p><a href="https://cityofjerseycity.civicweb.net/document/61646">1/6/22 - $6,153.50</a></p>
                <p><a href="https://cityofjerseycity.civicweb.net/document/59107">11/4/21 - $12,668.25</a></p>
                <p><a href="https://cityofjerseycity.civicweb.net/document/55789">9/3/21 - $200</a></p>
                <p><a href="https://cityofjerseycity.civicweb.net/document/52979">8/13/21 - $380.00</a></p>
                <p><a href="https://cityofjerseycity.civicweb.net/document/51506">7/9/21 - $1,421.28</a></p>
                <p><a href="https://cityofjerseycity.civicweb.net/document/49373">6/9/21 - $1,840.00</a></p>
                <p><a href="https://cityofjerseycity.civicweb.net/document/47945">5/7/21 - $7,710.00</a></p>
                <p><a href="https://cityofjerseycity.civicweb.net/document/46108">4/9/21 - $2,715.00</a></p>
                <p><a href="https://cityofjerseycity.civicweb.net/document/44797">3/18/21 - $3,105</a></p>
                <p><a href="https://cityofjerseycity.civicweb.net/document/43483">2/18/21 - $885</a></p>
                <p><a href="https://cityofjerseycity.civicweb.net/document/43026">2/9/21 - $3,960</a></p>
                <p><a href="https://cityofjerseycity.civicweb.net/document/41559">1/25/21 - $16,595.70</a></p>
                <p><a href="https://cityofjerseycity.civicweb.net/document/38868">11/25/20 - $4,170.00</a></p>
                <p><a href="https://cityofjerseycity.civicweb.net/document/33761">9/1/20 - $32,567.98</a></p>
                    </div>
                  )}
                </div>

    {/*Nicholas Netta*/}
    <div className="accordion-item">
        <button
          className={`accordion-header ${openIndex === 6 ? "active" : ""}`}
          onClick={() => toggleAccordion(6)}
          aria-expanded={openIndex === 6}
        >
          Nicholas Netta - Netta Architects LLC - $250
          <span className="accordion-arrow" />
        </button>
        {openIndex === 6 && (
          <div className="accordion-content">
            <p>
            O'Dea received a $250 contribution from Nicholas Netta. This donation raises concerns because Netta Architects LLC has been awarded multiple contracts and amendments with Jersey City, particularly for the design and construction administration of new firehouse projects. These contracts, which have grown significantly through amendments addressing environmental issues, design changes, and project delays, now total over $1 million. In addition, the firm has been paid repeatedly through city expenditures for architectural services over several years. The overlap between campaign contributions and substantial city contracts creates the appearance of a potential conflict of interest and pay-to-play risk.
            </p>
            <p><strong>Res 25-077 </strong>This resolution ratifies a third amendment to a contract with Netta Architects for services related to the Engine Co. #10 and Ladder #12 New Firehouse project. The original contract was for schematic design, design development, construction documents, and construction administration services. Previous amendments were made due to geotechnical and environmental evaluations, contaminated groundwater, and design changes, which increased the contract amount and extended the term. Due to COVID-19 supply chain issues, unforeseen subsurface conditions, and a Stop Work Order, the project experienced extensive delays, and the initial construction company was declared in default. This third amendment provides an additional $384,676.72 for supplemental geotechnical investigation services, modifications to contract documents, and additional bid assistance and construction administration services, bringing the total contract amount to $1,080,830.00. The contract term is also extended for an additional twenty-four months, from June 28, 2023, to June 28, 2025. <a href="https://cityofjerseycity.civicweb.net/document/93088/R0205683_%20NETTA%20ARCHITECTS%20Amending%20Resolution.pdf?handle=F8D8DEFAC3D64A89BAD9FE83F3C75CC6">Resolution PDF</a></p>
            <p><strong>Res 22-420 </strong>This resolution from the City of Jersey City ratifies a second amendment to a professional services contract with Netta Architects. The amendment is for schematic design, design development, construction documents, and construction administration services for the new Engine Co #10 and Ladder #12 Firehouse. Due to unforeseen site conditions, including the need for geotechnical and environmental evaluations and subsequent redesign, the contract amount was increased by an additional $220,500.00, bringing the total to $818,000.00. The original contract for $498,500.00 was awarded in August 2018 for a 36-month term, with previous amendments increasing the total to $597,500.00. This agreement was processed as a professional service, exempt from public bidding, and complies with "Pay-to-Play" regulations. <a href="https://cityofjerseycity.civicweb.net/document/66670/Resolution%20Ratifying%20a%20Second%20Amendment%20to%20a%20co.pdf?handle=F0C6148D03F74F37A3A38DCDD3F0750C">Resolution PDF</a></p>
            <p><strong>Res 20-541 </strong>The City of Jersey City has authorized an amendment to its contract with Netta Architects for services related to the Engine Co. #10 - New Firehouse project. This amendment, approved on August 12, 2020, increases the total contract amount by an additional $29,400.00, bringing the new total to $626,900.00. The amendment is necessary due to the discovery of contaminated groundwater at the site, requiring the design and incorporation of a sub-slab vapor mitigation system. Netta Architects will provide architectural, MEP engineering, and civil engineering services for this additional work. The original contract and previous amendments were also for schematic design, design development, construction documents, and construction administration services. <a href="https://cityofjerseycity.civicweb.net/document/31444/Resolution%20authorizing%20an%20amendment%20to%20Netta%20Ar.pdf?handle=B97332BC06AE4503AFEA397F2A18DF96">Resolution PDF</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/436252">8/14/25 - $2,210</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/434925">7/11/25 - $24,717.00</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/425256">3/24/25 - $3,562.50</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/424296">3/7/25 - $4,504.07</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/419821">1/24/25 - $14,754.61</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/409634">8/12/24 - $21,037.50</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/408268">7/8/24 - $47,562.50</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/404397">6/7/24 - $34,009.16</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/390968">1/8/24 - $51,042.93</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/78028">10/25/22 - $8,656.76</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/76260">9/16/22 - $8,656.66</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/73114">8/12/22 - $8,656.66</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/69755">6/10/22 - $8,656.66</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/68836">5/20/22 - $8,656.66</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/66966">4/13/22 - $8,656.66</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/64888">3/3/22 - $8,656.66</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/61646">1/6/22 - $17,313.32</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/59833">11/22/21 - $8,656.66</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/58567">10/22/21 - $8,656.66</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/56325">9/16/21 - $8,656.66</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/52979">8/13/21 - $8,656.66</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/51506">7/9/21 - $8,656.66</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/30334">7/9/20 - $3,000</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/25215">4/15/20 - $29,880.00</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/23359">3/18/20 - $39,840</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/20322">2/4/20 - $134,480.00</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/17017">12/11/19 - $34,660.00</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/15268">11/7/19 - $60,000</a></p>
          </div>
        )}
    </div>

    {/*Florio Kenny Raval, LLP*/}
    <div className="accordion-item">
        <button
          className={`accordion-header ${openIndex === 7 ? "active" : ""}`}
          onClick={() => toggleAccordion(7)}
          aria-expanded={openIndex === 7}
        >
          Edward Florio, Senior Partner - $4,000
          Bernie Kenny, Senior Partner - $1,000
          Niti Raval, Managing Partner - $2,500
          Florio Kenny Raval, LLP - $2,300
          <span className="accordion-arrow" />
        </button>
        {openIndex === 7 && (
          <div className="accordion-content">
            <p>
            O'Dea has received a total of $9,800 connected to Florio Kenny Raval, LLP—$2,300 from the law firm itself, $2,500 from Managing Partner Niti Raval, $1,000 from Senior Partner Bernie Kenny, and $4,000 from Senior Partner Edward Florio. While the dollar amounts may not be the largest compared to other donors, the concern arises because Florio Kenny Raval has secured numerous lucrative contracts with Jersey City, including multimillion-dollar agreements to represent the City in tax appeals and high-profile litigation involving police officers and civil rights cases. These contracts have been repeatedly renewed and expanded over the years, with individual amendments often adding tens or hundreds of thousands of dollars in legal fees. In addition to the resolutions, the firm has also received a steady stream of direct payments from the City for legal services. The overlap between campaign donations and significant ongoing city business creates the appearance of a conflict of interest and raises potential pay-to-play concerns.
            </p>
            <p><strong>Res 25-077 </strong>The Jersey City Council passed Resolution 25-077 on January 29, 2025, renewing its professional services agreement with the law firm Florio, Kenny, Raval, LLP to represent the city in ongoing tax appeal matters. This marks the latest in a series of annual renewals and amendments since 2018, bringing the total contract amount to $1,425,000. The firm will continue providing legal services at an hourly rate of $175, and $5,000 in funds are currently available for the renewed term. The contract is awarded under the “fair and open” process outlined in New Jersey’s Pay-to-Play law and is exempt from competitive bidding due to its professional services status. Continuation of the agreement depends on future budget appropriations. <a href="https://cityofjerseycity.civicweb.net/document/419119/Renewal%20of%20a%20professional%20services%20agreement%20wi.pdf?handle=4A986F87F8A5407D9E83B296CF75CA56">Resolution PDF</a></p>
            <p><strong>Res 25-078 </strong>Resolution 25-078, approved on January 29, 2025, renews a professional services agreement with the law firm Florio Kenny Raval, LLP to represent former police officer Omar Polanco in the ongoing lawsuit Estate of Robertson v. City of Jersey City et al.. This renewal adds $50,000 to the legal services contract, bringing the total to $180,000, and sets the term for one year beginning January 1, 2025. The firm will be paid an hourly rate of $175, and the award follows New Jersey’s Pay-to-Play Law under the "fair and open" process. The agreement is exempt from public bidding as a professional service under state law. Continuation of the contract is contingent on sufficient funds being appropriated in the 2025 permanent budget. <a href="https://cityofjerseycity.civicweb.net/document/419112/Renewal%20of%20a%20professional%20services%20agreement%20wi.pdf?handle=8A06D8321D8D4A1588FC68A7F0B12B4B">Resolution PDF</a></p>
            <p><strong>Res 25-079 </strong>Resolution 25-079, approved January 29, 2025, renews a professional services agreement with the law firm Florio Kenny Raval, LLP to represent Police Officer Christopher Fodor in the ongoing lawsuit Arthur Jones v. City of Jersey City et al.. The contract renewal is for one year starting January 1, 2025, with an additional $50,000, bringing the total contract amount to $100,000. The firm will provide services at an hourly rate of $175, and the contract is awarded under New Jersey’s “fair and open” Pay-to-Play Law without competitive bidding. The contract continuation is contingent on the appropriation of sufficient funds in the City’s 2025 permanent budget. The resolution requires publication in a newspaper within 10 days and compliance with Affirmative Action laws. <a href="https://cityofjerseycity.civicweb.net/document/419126/Renewal%20of%20a%20professional%20services%20agreement%20wi.pdf?handle=9B7970B91EB8423EB3A2A6EE11EC47C0">Resolution PDF</a></p>
            <p><strong>Res 25-080 </strong>Resolution 25-080, approved January 29, 2025, renews a professional services agreement with Florio Kenny Raval, LLP to represent Police Officer Joseph Ross in the ongoing lawsuit Samuel Nehemiah v. City of Jersey City et al.. The renewal is for one year starting January 1, 2025, with an additional $50,000, increasing the total contract amount to $100,000, including expenses. The law firm will provide services at an hourly rate of $175, and the contract is awarded under New Jersey’s fair and open Pay-to-Play Law without competitive bidding. Continuation of the contract depends on sufficient funds being appropriated in the City’s 2025 budget. The resolution mandates publication in a local newspaper within 10 days and requires compliance with Affirmative Action laws. <a href="https://cityofjerseycity.civicweb.net/document/419130/Renewal%20of%20a%20professional%20services%20agreement%20wi.pdf?handle=3B0E49ECDD8B43ACA20453F472ACE01D">Resolution PDF</a></p>
            <p><strong>Res 25-081 </strong>Resolution 25-081, approved January 29, 2025, renews a professional services agreement with Florio Kenny Raval, LLP to represent Police Officer Charles Tavares in the ongoing lawsuit Chirag Khushalani v. City of Jersey City et al.. The contract is renewed for one year starting February 15, 2025, with an additional $40,000, increasing the total contract amount to $120,000, including expenses. The law firm will provide services at an hourly rate of $175, and the contract is awarded without competitive bidding under New Jersey’s Local Public Contracts Law and Pay-to-Play Law. Continuation of the contract depends on sufficient funds being appropriated in the City’s 2025 budget. The resolution requires publication in a local newspaper within 10 days and compliance with Affirmative Action laws. <a href="https://cityofjerseycity.civicweb.net/document/419143/Renewal%20of%20a%20professional%20services%20agreement%20wi.pdf?handle=1B0F6DD7592E4EC0AF7FD68B6CFBC6FA">Resolution PDF</a></p>
            <p><strong>Res 24-722 </strong>Resolution 24-722, approved September 25, 2024, amends a professional services agreement with the law firm Florio Kenny Raval, LLP to represent former Police Officer Omar Polanco in the ongoing Estate of Robertson v. City of Jersey City, et al. case. The contract amount is increased by $80,000, raising the total to $130,000, to cover outstanding invoices as litigation continues. The firm provides services at an hourly rate of $175, and the contract was awarded under fair and open Pay-to-Play provisions without public bidding. Funds for the increase are available in the City’s budget account 01-201-23-210-312. The resolution requires publishing notice in a local newspaper within 10 days. <a href="https://cityofjerseycity.civicweb.net/document/410156/Amendment%20of%20a%20professional%20services%20agreement%20.pdf?handle=471E7771EF554F298773B65528B1D39F">Resolution PDF</a></p>
            <p><strong>Res 24-408 </strong>The City of Jersey City ratified and awarded a one-year professional services contract to the law firm Florio Kenny Raval, LLP to represent former Police Officer Omar Polanco in the lawsuit Estate of Robertson v. City of Jersey City, et al. The contract amount is set at $50,000, with the firm providing legal services at $175 per hour, including expenses. The contract was awarded under the Local Public Contracts Law without competitive bidding and complies with the City’s Pay-to-Play Law and Affirmative Action requirements. The law firm submitted all required political contribution and business disclosure certifications. Funding for the contract is available in the City’s budget, and the contract is subject to further budget appropriations for the fiscal year. <a href="https://cityofjerseycity.civicweb.net/document/402543/R0208869_%20ESTATE%20OF%20ROBERTSON%20V.%20COJC.pdf?handle=72CA1013BCBA4EF99FCC800E3248FF14">Resolution PDF</a></p>
            <p><strong>Res 24-409 </strong>The City of Jersey City ratified and renewed a one-year professional services agreement with the law firm Florio Kenny Raval, LLP to serve as special counsel representing the City in ongoing tax appeal matters. The contract amount was increased by $200,000, bringing the total to $1,025,000, with an hourly rate of $175 including expenses. The contract is awarded without competitive bidding under New Jersey’s Local Public Contracts Law and complies with the Pay-to-Play Law and Affirmative Action requirements. Funds of $5,000 are available for this contract in the City’s budget. The resolution requires publication for public inspection and continuation depends on budget appropriations in the current and subsequent fiscal years. <a href="https://cityofjerseycity.civicweb.net/document/400563/Renewal%20of%20a%20professional%20services%20agreement%20wi.pdf?handle=F0021ABA6CFF4409B62284D23B7C3FDE">Resolution PDF</a></p>
            <p><strong>Res 24-410 </strong>The City of Jersey City ratified and awarded a one-year professional services contract to the law firm Florio Kenny Raval, LLP to represent Police Officer Joseph Ross in the lawsuit Samuel Nehemiah v. City of Jersey City, et al. The contract amount is up to $50,000, with an hourly rate of $175 including expenses. This agreement was made without public bidding under New Jersey’s Local Public Contracts Law and complies with the Local Unit Pay-to-Play Law and Affirmative Action requirements. The firm provided the necessary disclosure certifications, and funds are available in the City’s budget. The contract’s continuation depends on budget appropriations for the 2024 fiscal year. <a href="https://cityofjerseycity.civicweb.net/document/402558/R0208870_%20NEHEMIAH%20VS.%20COJC.pdf?handle=175473D462894A4D84655F9317C7F512">Resolution PDF</a></p>
            <p><strong>Res 24-411 </strong>The City of Jersey City ratified and awarded a one-year professional services contract to the law firm Florio Kenny Raval, LLP to represent Police Officer Christopher Fodor in the lawsuit Arthur Jones v. City of Jersey City, et al. The contract amount is up to $50,000, with an hourly rate of $175 including expenses. This agreement was made without public bidding under New Jersey’s Local Public Contracts Law and complies with the Local Unit Pay-to-Play Law and Affirmative Action requirements. The law firm provided necessary political contribution disclosures, and funds are available in the City’s budget. Continuation of the contract depends on budget appropriations for the 2024 fiscal year. <a href="https://cityofjerseycity.civicweb.net/document/402548/R0208872_%20ARTHUR%20JONES%20VS%20COJC.pdf?handle=18B1E4A3C7C047CF81C36269E7331AEF">Resolution PDF</a></p>
            <p><strong>Res 24-166 </strong>The City of Jersey City renewed a one-year professional services agreement with the law firm Florio Kenny Raval, LLP to represent Police Officer Charles Tavares in the ongoing lawsuit Chirag Khushalani v. City of Jersey City, et al. The contract renewal adds $40,000, bringing the total contract amount to $80,000, with services billed at $175 per hour including expenses. The contract was awarded without public bidding under applicable New Jersey laws and complies with the City’s Pay-to-Play and Affirmative Action requirements. Funding is available in the City budget, and continuation depends on future budget appropriations. <a href="https://cityofjerseycity.civicweb.net/document/394449/Renewal%20of%20a%20professional%20services%20agreement%20wi.pdf?handle=824BED93565746F8934C7EA339908532">Resolution PDF</a></p>
            <p><strong>Res 23-793 </strong>The City of Jersey City ratified a one-year professional services agreement with the law firm Florio Kenny Raval, LLP to represent Police Officer Edwin Hernandez in the lawsuit Douglas Salom v. City of Jersey City, et al. The contract, effective June 15, 2023, is for up to $50,000, with services billed at $175 per hour including expenses. The contract was awarded without public bidding under New Jersey laws and complies with the City’s Pay-to-Play and Affirmative Action requirements. Funding is available in the City’s 2023 budget, and contract continuation depends on future budget appropriations. <a href="https://cityofjerseycity.civicweb.net/document/96049/Ratifying%20a%20professional%20services%20agreement%20wit.pdf?handle=2266EECA29C0460CAB31BB0DD0EB22A0">Resolution PDF</a></p>
            <p><strong>Res 23-366 </strong>The City of Jersey City ratified a one-year professional services agreement with the law firm Florio Kenny Raval, LLP to represent Police Officer Charles Tavares in the lawsuit Chirag Khushalani v. City of Jersey City, et al. The contract, effective February 15, 2023, is for up to $40,000, with services billed at $150 per hour including expenses. The contract was awarded without competitive bidding under New Jersey laws and complies with the City’s Pay-to-Play and Affirmative Action requirements. Funding is available in the City’s 2023 budget, and continuation of the agreement depends on future budget appropriations. <a href="https://cityofjerseycity.civicweb.net/document/89203/r0205237_%20Florio%20Kenny%20Raval_%20Tavares%20itmo%20Chir.pdf?handle=F6E29F4BAF0744DDB88C070ED719E1D3">Resolution PDF</a></p>
            <p><strong>Res 23-319 </strong>The City of Jersey City renewed a one-year professional services agreement with the law firm Florio Kenny Raval, LLP to serve as special counsel representing the City in ongoing tax appeal cases. The contract, effective February 28, 2023, increases the total contract amount by $200,000 to a maximum of $825,000, including expenses. The firm provides services at an hourly rate of $150. This contract was awarded without competitive bidding under New Jersey’s Local Public Contracts Law and complies with the City’s Pay-to-Play and Affirmative Action requirements. Funds are available in the 2023 budget, with continuation dependent on future appropriations. <a href="https://cityofjerseycity.civicweb.net/document/87817/R0205136_%20Renewal%20with%20Florio%20Kenny%20Raval,%20LLP.pdf?handle=4E193886DA834FDDB5BAD0DAAABA87FE">Resolution PDF</a></p>
            <p><strong>Res 23-229 </strong>The City of Jersey City amended its professional services agreement with the law firm Florio Kenny Raval, LLP, increasing the total contract amount by $100,000 to $725,000. This amendment is to cover outstanding invoices for tax appeal legal services provided to the City, including expenses for the remainder of the 2022 fiscal year and the first two months of 2023. The firm charges $150 per hour, and the contract remains exempt from public bidding under New Jersey law. The Mayor or Business Administrator is authorized to execute the amendment, and a public notice of the amendment will be published as required. <a href="https://cityofjerseycity.civicweb.net/document/83860/Amendment%20of%20a%20professional%20services%20agreement%20.pdf?handle=BA831BCC4ADF44E2B125A83722D26748">Resolution PDF</a></p>
            <p><strong>Res 23-145 </strong>The City of Jersey City awarded a one-year professional services contract to the law firm Florio Kenny Raval to provide defense counsel services for worker’s compensation claim petitions filed against the City. The contract is effective January 1, 2023, with a total amount not to exceed $10,000. The firm will be paid $1,500 per case, with an option for an additional $1,500 if prolonged litigation occurs. This contract is exempt from public bidding under New Jersey law and awarded through a fair and open process compliant with the Pay-to-Play Law. The contract is subject to compliance with affirmative action laws and available for public inspection. The Mayor or Business Administrator is authorized to execute the agreement, and funds have been certified as available. <a href="https://cityofjerseycity.civicweb.net/document/83711/R0204095_%20Worker_s%20Comp%20-%20Defense%202023%20FKR%20WC%20D.pdf?handle=A6DB434345E74A03B250465E8B5ED9E2">Resolution PDF</a></p>
            <p><strong>Res 22-534 </strong>The City of Jersey City ratified a one-year professional services agreement with the law firm Florio Kenny Raval, LLP to represent Sergeant Keith Armstrong, the Jersey City Police Department, and the City in the federal civil rights lawsuit filed by Pierre Lindor, Jr. The contract is effective March 1, 2022, with a total amount not to exceed $100,000, billed at $150 per hour including expenses. This professional services contract is exempt from public bidding under New Jersey law and awarded under the fair and open provisions of the Pay-to-Play Law. The contract is subject to affirmative action compliance, and funds have been certified as available. The Mayor or Business Administrator is authorized to execute the agreement, which will be made available for public inspection. <a href="https://cityofjerseycity.civicweb.net/document/69209/Ratifying%20a%20professional%20services%20agreement%20wit.pdf?handle=2F83869CCCC24C3A8C98AA2875CB93F9">Resolution PDF</a></p>
            <p><strong>Res 22-245 </strong>The City of Jersey City amended its professional services agreement with the law firm Florio Kenny Raval, LLP to increase the contract amount by $75,000, raising the total contract to $525,000. This contract is for Florio Kenny Raval to serve as special counsel representing the City in tax appeals. The increase covers unpaid invoices from the 2021 fiscal year and invoices for the first two months of the 2022 fiscal year. The services are billed at $150 per hour, including expenses, and are exempt from public bidding under New Jersey law. The Mayor or Business Administrator is authorized to execute this amendment, which will be published publicly as required by law. <a href="https://cityofjerseycity.civicweb.net/document/63325/Amendment%20of%20a%20professional%20services%20agreement%20.pdf?handle=37EA1336F2AA49DEBBD0B3D8FFD9C2E8">Resolution PDF</a></p>
            <p><strong>Res 22-162 </strong>The City of Jersey City renewed and increased its professional services agreement with the law firm Florio Kenny Raval, LLP to serve as special counsel for the City in ongoing tax appeals. The one-year contract, effective February 28, 2022, increases the total contract amount by $100,000 to $625,000. The firm provides services at an hourly rate of $150, including expenses. This contract is awarded without competitive bidding under New Jersey law and is subject to compliance with affirmative action requirements. The Mayor or Business Administrator is authorized to execute the agreement, which will be publicly published as required. Funding for this contract is secured and continuation depends on budget appropriations. <a href="https://cityofjerseycity.civicweb.net/document/63329/Renewal%20of%20a%20professional%20services%20agreement%20wi.pdf?handle=C616715E1E704842B8C758D92D802BD8">Resolution PDF</a></p>
            <p><strong>Res 21-425 </strong>The Jersey City Council renewed a one-year professional services agreement with the law firm Florio Kenny Raval, LLP to continue serving as special counsel for tax appeal matters. The contract was increased by $100,000, bringing the total to $450,000, with services billed at $150 per hour including expenses. This renewal follows a series of amendments and renewals to the original 2018 agreement due to ongoing tax appeal litigation. The agreement was awarded through a fair and open process under New Jersey's Pay-to-Play Law and is exempt from public bidding. The contract is contingent on budget appropriations and compliance with affirmative action and pay-to-play regulations. <a href="https://cityofjerseycity.civicweb.net/document/46980/Professional%20Services%20Agreement%20with%20Florio%20Ken.pdf?handle=AA24410CFBAE433F845A69AFD908D5E1">Resolution PDF</a></p>
            <p><strong>Res 21-285 </strong>Resolution 21-285, passed on April 15, 2021, authorized Jersey City to amend its contract with the law firm Florio Kenny Raval, LLP by increasing it by $25,000, bringing the total to $125,000. The increase covers legal services for tax appeal matters, including $14,950 for 2021 work and $10,050 in unpaid 2020 invoices. The firm charges $150 per hour, including expenses. This agreement is exempt from public bidding under New Jersey law and qualifies as a “fair and open” contract under the state’s Pay-to-Play rules. <a href="https://cityofjerseycity.civicweb.net/document/46019/Professional%20Services%20Agreement%20with%20Florio%20Ken.pdf?handle=4134184CAA7B4B62B6347EFAD7B48976">Resolution PDF</a></p>
            <p><strong>Res 21-138 </strong>Resolution 21-138, approved on February 10, 2021, awarded a one-year professional services agreement to the law firm Florio Kenny Raval to serve as defense counsel for worker’s compensation claims filed against Jersey City. The firm will be paid $1,500 per case, with an additional $1,500 available if extended litigation is required, not to exceed a total of $50,000. This contract, awarded through a fair and open process under New Jersey's Pay-to-Play law, is exempt from public bidding due to its classification as a professional service. Funds are initially allocated from the city’s 2021 temporary budget, with the remainder to come from the permanent budget. The resolution requires compliance with affirmative action and pay-to-play ordinances and allows the Mayor or Business Administrator to execute the agreement. <a href="https://cityofjerseycity.civicweb.net/document/40152/FKR%20s_c%20contract%20for%202021.pdf?handle=9C78B917B425448B9E229E1F67DBFB2C">Resolution PDF</a></p>
            <p><strong>Res 20-746 </strong>The Jersey City Municipal Council approved an amendment to its professional services agreement with the law firm Florio Kenny Raval, LLP to continue serving as special counsel in tax appeal litigation. Originally approved in 2018 for $150,000 and renewed in 2019 and 2020 for $75,000 and $50,000 respectively, the contract is now being increased by an additional $50,000, bringing the current total to $100,000. The firm will continue providing legal services at a rate of $150 per hour. The amendment was necessary because previously allocated funds had been fully expended, and the City is still engaged in ongoing tax appeal cases. The required funds are available and certified by the Chief Financial Officer, and the resolution mandates public notice within ten days of adoption. <a href="https://cityofjerseycity.civicweb.net/document/35710/Professional%20Service%20Agreement%20with%20Florio%20Kenn.pdf?handle=4341F1D1B4324EDD95CB9CCBF3E2712F">Resolution PDF</a></p>
            <p><strong>Res 20-265 </strong>The Jersey City Council approved the renewal of a one-year professional services contract with the law firm Florio Kenny Raval, LLP to continue representing the city in tax appeal matters. Originally approved in 2018 and previously renewed in 2019, the contract was extended again in 2020 with an additional $50,000, bringing the total not to exceed $275,000. The firm will continue to be paid at a rate of $150 per hour, including expenses. The contract was awarded through the "fair and open process" under the state’s Pay-to-Play law and is exempt from public bidding as a professional service. The agreement includes compliance with affirmative action laws and funding availability has been certified by the city’s CFO. <a href="https://cityofjerseycity.civicweb.net/document/21169/Professional%20Service%20Contract%20for%20Florio%20Kenny%20.pdf?handle=93DBC1697F0D4862980AF0D2947F90DD">Resolution PDF</a></p>
            <p><strong>Res 19-961 </strong>The Jersey City Council approved a one-year professional services agreement with Florio Kenny Raval LLP, effective January 1, 2020, for an amount not to exceed $50,000. The firm will provide defense counsel services for workers' compensation claim petitions filed against the city, charging $1,500 per case with the possibility of an additional $1,500 for complex litigation. The contract was awarded under the “fair and open” provisions of New Jersey’s Pay-to-Play law and is exempt from public bidding. The firm met compliance requirements under the city’s Pay-to-Play Reform Ordinance and affirmative action laws. The contract is contingent upon the appropriation of funds in the city’s 2020 budgets. <a href="https://cityofjerseycity.civicweb.net/document/16768/FKR%20WC%20Def%20Counsel%20via%20RFQ.pdf?handle=3433651C7EDE45F89E91DF8F7FA9CE3E">Resolution PDF</a></p>
          
            <p><a href="https://cityofjerseycity.civicweb.net/document/436252">8/14/25 - $107,555.66</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/419821">1/24/25 - $18,836.75</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/418957">1/9/25 - $9,100</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/416983">12/6/24 - $6,422.50</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/415425">11/22/24 - $23,791.22</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/413799">11/8/24 - $9,187.50</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/413149">10/25/24 - $13,509.50</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/412458">10/10/24 - $40,460.00</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/411476">9/19/24 - $11,427.50</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/410721">9/6/24 - $16,117.50</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/409634">8/12/24 - $8,666.09</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/408268">7/8/24 - $68,763.94</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/406617">6/24/24 - $27,655</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/405701">6/12/24 - $3,150</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/402302">5/3/24 - $20,960.93</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/400554">4/22/24 - $13,663.43</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/395534">2/20/24 - $192.50</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/390968">1/8/24 - $16,668.50</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/387879">11/22/23 - $8,522.50</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/357072">11/6/23 - $13,562.50</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/313478">10/23/23 - $11,322.50</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/156507">9/18/23 - $4,637.50</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/99143">9/5/23 - $58,893.10</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/95854">8/11/23 - $19,207.50</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/88651">4/6/23 - $44,710.57</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/82744">1/6/23 - $30,933.30</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/81765">12/9/22 - $10,654.44</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/80927">11/23/22 - $27,103.45</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/78028">10/25/22 - $2,145</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/77318">10/11/22 - $14,967.42</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/74496">9/2/22 - $16,592.12</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/73114">8/12/22 - $9,390</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/71510">7/8/22 - $9,915</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/70762">6/27/22 - $5,481.90</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/70072">6/15/22 - $1,199.33</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/67909">5/5/22 - $68,055</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/67367">4/22/22 - $4,525</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/66966">4/13/22 - $16,868.04</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/59833">11/22/21 - $10,170</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/52979">8/13/21 - $9,095.00</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/51506">7/9/21 - $14,490</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/50909">6/25/21 - $4,805</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/49373">6/9/21 - $6,915</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/47945">5/7/21 - $18,870</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/44797">3/18/21 - $7,742.19</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/43026">2/9/21 - $4,260</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/40872">1/11/21 - $21,776.15</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/38868">11/25/20 - $41,050</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/37605">11/5/20 - $45,210</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/26640">5/14/20 - $2,850</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/22804">3/3/20 - $47,910.74</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/20322">2/4/20 - $22,174.53</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/19070">1/15/20 - $1,747.71</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/17017">12/11/19 - $10,925.52</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/11373">9/3/19 - $42,568.39</a></p>
          </div>
        )}
    </div>

    {/* Spiniello Companies */}
    <div className="accordion-item">
      <button
        className={`accordion-header ${openIndex === 8 ? "active" : ""}`}
        onClick={() => toggleAccordion(8)}
        aria-expanded={openIndex === 8}
      >
        Spiniello Companies - $10,400
        <span className="accordion-arrow" />
      </button>
      {openIndex === 8 && (
        <div className="accordion-content">
        <p>Spiniello Companies’ $10,400 donation to Bill O’Dea raises potential red flags given the firm’s recent and sizable contracting history with Jersey City. In October 2024, the City awarded Spiniello a $1.17 million contract for the City Hall Foundation Project (Res. 24-454) after rejecting a lower bid as “unbalanced,” and subsequent records show City payments of $297,428 (Oct. 2024), $124,284 (Jan. 2025), and $58,942 (Apr. 2025) tied to the project. While the contract was approved through a public bidding process, the overlap between large municipal payments and campaign contributions creates the appearance of a pay-to-play relationship, particularly since O’Dea is running for mayor and could influence future infrastructure funding. </p>
         <p><a href="https://cityofjerseycity.civicweb.net/document/426925">4/4/25 - $58,942.69</a></p>
         <p><a href="https://cityofjerseycity.civicweb.net/document/419821">1/24/25 - $124,284.38</a></p>
         <p><a href="https://cityofjerseycity.civicweb.net/document/413149">10/25/24 - $297,428.86</a></p>
         <p><strong>24-454 </strong>the Jersey City Council approved Resolution 24-454 rejecting the lowest bid of $800,000 from Hear Construction, Inc. for the City Hall – Foundation Project (No. 2022-029A), deeming it “unbalanced” and unresponsive since it was significantly lower than the City’s estimated cost. Instead, the contract was awarded to Spiniello Companies, the second lowest responsive and responsible bidder, for $1,175,500. The City authorized a total encumbrance of $1,410,600, which includes a 20% contingency, with funds certified as available under the Department of Infrastructure, Division of Architecture’s capital accounts. <a href="https://cityofjerseycity.civicweb.net/document/403929">Resolution PDF</a></p>
         
        </div>
      )}
    </div>

    {/* Waters, McPherson, McNeil */}
    <div className="accordion-item">
      <button
        className={`accordion-header ${openIndex === 9 ? "active" : ""}`}
        onClick={() => toggleAccordion(9)}
        aria-expanded={openIndex === 9}
      >
        Waters, McPherson, McNeil - $6,750 
        <span className="accordion-arrow" />
      </button>
      {openIndex === 9 && (
        <div className="accordion-content">
          <p>The donations from Waters, McPherson, McNeil P.C. to Bill O'Dea and other Jersey City candidates raise potential red flags due to the firm’s direct financial and business interests with the city, as well as the timing of these contributions. The law firm represents Honeywell International Inc. in environmental remediation projects affecting public rights-of-way in Jersey City, including the execution and termination of Notices in Lieu of Deed Notices, such as the resolution approving the updated NILODN for Fisk Street and other ROWs in July 2024 (<a href="https://cityofjerseycity.civicweb.net/document/406670">Resolution PDF</a>). Additionally, the firm has historically represented developers in high-value waterfront redevelopment projects in the city (<a href="https://www.lawwmm.com/HudsonRiverRedev.asp">Waters, McPherson, McNeil Hudson River Waterfront Redevelopment</a>). The firm has also received substantial payments from the city itself, including $448,690.70 (<a href="https://cityofjerseycity.civicweb.net/document/436252">8/14/25</a>), $338,281.63 (<a href="https://cityofjerseycity.civicweb.net/document/403052">5/14/25</a>), $26,852.32 (<a href="https://cityofjerseycity.civicweb.net/document/387879">11/22/23</a>) $11,510.03 (<a href="https://cityofjerseycity.civicweb.net/document/95854">8/11/2023</a>). The donations, totaling $31,200 from the firm and $5,200 from David McPherson personally, occurred shortly after or around the time of these municipal approvals and expenditures, creating a perception that the contributions could influence officials overseeing matters directly affecting the firm’s clients. While no direct quid pro quo is proven, the overlap of campaign contributions with public decisions and city payments involving the firm constitutes a potential pay-to-play concern and represents a red flag for regulatory or ethical scrutiny.</p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/436252">8/14/25 - $338,281.63</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/403052">5/17/24 - $448,690.70</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/402589">5/8/24 - $5,669.04</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/394848">2/7/24 - $20,644.31</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/391059">1/10/24 - $19,280.53</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/387879">11/22/23 - $26,582.32</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/95854">8/11/23 - $10,854.87</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/93739">6/28/23 - $1,887.06</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/92928">6/14/23 - $29,577.57</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/83762">1/25/23 - $272,354.59</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/81004">11/23/22 - $1,270.50</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/76497">9/20/22 - $14,639.41</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/74749">9/8/22 - $10,524.42</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/70072">6/15/22 - $7,925.09</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/69013">5/25/22 - $41,436.65</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/66949">4/13/22 - $3,962.86</a></p>
        </div>
      )}
    </div>

    


    

    <div className="accordion-item"> 
      <button
        className={`accordion-header ${openIndex === 10 ? "active" : ""}`}
        onClick={() => toggleAccordion(10)}
        aria-expanded={openIndex === 10}
      >
        AMI Hospitality - $1,000
        <span className="accordion-arrow" />
      </button>
      {openIndex === 10 && (
        <div className="accordion-content">
          <p>AMI Hospitality's donation has been flagged because the company appears on the city's Special Improvement District assessment list with a property valued $4,639,000. AMI Hospitality stands to benefit financially from public spending that enhances the value and marketability of its property, raising the concerns of potential conflict of interest and pay-to-play concern. The ordinace is listed below.</p>
          <a href="https://cityofjerseycity.civicweb.net/document/413672">Ordinance 24-104</a>
        </div>
      )}
    </div>

      {/* Leemark Electrics */}
    <div className ="accordion-item">
      <button
        className={`accordion-header ${openIndex === 11 ? "active" : ""}`}
        onClick={() => toggleAccordion(11)}
        aria-expanded={openIndex === 11}
      >
        Leemark Electrics - $3,000
        <span className="accordion-arrow" />
      </button>
      {openIndex === 11 && (
        <div className="accordion-content">
          <p>Leemark Electrics has donated $1,000 to O'Dea, and Anthony Cantanio has made a total of $3,000 in contributions to Bill O'Dea's campaign. Leemark Electrics have done several projects in Jersey City relating lighting, power distribution, etc. Along with their projects, they have received expenditures from Jersey City and had received a contract in October 2020. The details are listed below.</p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/44186">$32,700 - 3/4/21</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/35805">Resolution PDF</a></p>
          <p><a href ="https://cityofjerseycity.civicweb.net/document/30560">$9,800 - 2/19/20</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/23359">$4,120 - 3/18/20</a></p>

        </div>
      )}
    </div>

    {/* Connell Foley PAC */}
    <div className="accordion-item">
      <button
        className={`accordion-header ${openIndex === 12 ? "active" : ""}`}
        onClick={() => toggleAccordion(12)}
        aria-expanded={openIndex === 12}
      >
        Connell Foley PAC - $5,000
        Employees - $7,500
        <span className="accordion-arrow" />
      </button>
      {openIndex === 12 && (
        <div className="accordion-content">
          <p>Connell Foley’s deep entanglement in Jersey City politics is underscored by both its financial and political ties. The firm, which represents multiple properties along the Jersey City waterfront, has benefited from a steady stream of lucrative city expenditures ranging from hundreds of thousands to nearly a million dollars across 2023 and 2024. At the same time, Connell Foley’s influence has extended into the political sphere. Maureen Hulings, formerly an administrative assistant at the firm, was appointed by the City Council to serve as the Ward B representative on April 14. 2025. This overlap between a politically connected law firm that profits from substantial city business and its direct pipeline into council membership raises significant concerns about conflicts of interest and the blending of private legal advocacy with public governance in Jersey City.</p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/394848">2/7/24 - $42,646.04</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/387879">11/22/23 - $129,336.04</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/427653">Resolution PDF</a>Maureen Hulings was an administrative assistant at Connell Foley, and was voted in by the Jersey City Council to be Ward B's council member.</p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/416983">12/6/24 - $7,698.98</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/413799">11/8/24 - $309,445.12</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/409786">8/14/24 - $896,265.38</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/402589">5/8/24 - $72,834.31</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/394848">2/7/24 - $42,646.04</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/387879">11/22/23 - $129,336.04</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/89130">4/12/23 - $8,169.10</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/86928">3/8/23 - $448,300.11</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/83762">1/25/23 - $701,390.29</a></p>

        </div>
      )}
    </div>
    <div className = "accordion-item">
      <button
        className={`accordion-header ${openIndex === 13 ? "active" : ""}`}
        onClick={() => toggleAccordion(13)}
        aria-expanded={openIndex === 13}
      >
        Excelsior Plumbing - $11,200
        UA Plumbers Local 24 PAC - $16,400
        <span className="accordion-arrow" />
      </button>
      {openIndex === 13 && (
        <div className="accordion-content">
          <p>The donations from both Excelsior Plumbing and Plumbers Local 24 to Bill O’Dea raise a red flag because they suggest coordinated financial support from a union and one of its contractors. While unions often contribute to political campaigns, the added donation from a contractor that directly benefits from union projects creates the appearance of a networked effort to amplify influence. This dual backing increases the risk of pay-to-play dynamics, where financial contributions from labor groups and their business partners could be seen as attempts to secure favorable treatment on future contracts, labor agreements, or city-backed projects.</p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/434925">7/11/25 - $8,056.14</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/434179">6/20/25 - $7,419.72</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/427629">4/17/25 - $5,370.76</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/425256">3/24/25 - $7,504.70</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/422620">2/24/25 - $16,322.11</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/415425">11/22/24 - $13,002.28</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/413149">10/25/24 - $22,526.24</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/412458">10/10/24 - $7,888.33</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/410721">9/6/24 - $8,811.42</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/409634">8/12/24 - $17,609.14</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/408429">7/10/24 - $18,760.01</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/406617">6/24/24 - $15,417.57</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/404397">6/7/24 - $32,920.14</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/394633">2/5/24 - $14,804.74</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/390968">1/8/24 - $27,780.42</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/390093">12/11/23 - $13,926.95</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/313478">10/23/23 - $8,530.24</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/156507">9/18/23 - $5,093.89</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/95854">8/11/23 - $16,285.21</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/94298">7/7/23 - $12,591.65</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/91602">5/19/23 - $14,343.82</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/90508">5/8/23 - $17,570.63</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/88651">4/6/23 - $20,854.90</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/87444">3/17//23 - $23,685.07</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/85108">2/17/23 - $21,810.42</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/81765">12/9/22 - $16,061.33</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/78580">11/4/22 - $15,549.44</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/77318">10/11/22 - $12,500.35</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/74496">9/2/22 - $8,047.44</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/73114">8/12/22 - $7,510.95</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/71510">7/8/22 - $25,612.22</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/67367">4/22/22 - $13,967.32</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/64888">3/3/22 - $2,422.61</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/62536">1/20/22 - $7,959.99</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/61646">1/6/22 - $30,843.78</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/58727">10/26/21 - $32,532.20</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/48651">5/26/21 - $37,995.86</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/46338">4/14/21 - $37,995.86</a></p>
        </div>
      )}
    </div>

    <div className = "accordion-item">
      <button
        className={`accordion-header ${openIndex === 14 ? "active" : ""}`}
        onClick={() => toggleAccordion(14)}
        aria-expanded={openIndex === 14}
      >
        Tom Zuppa (Ward C Candidate for O'Dea) - $250
        <span className="accordion-arrow" />
      </button>
      {openIndex === 14 && (
        <div className="accordion-content">
          <p>Tom Zuppa, a current partner at Chasan Lamparello Mallon & Cappuzzo PC,a firm that has received multiple Jersey City contracts,donated $250 to Bill O’Dea while also running as his Ward C candidate. Although the contribution is small, the overlap between Zuppa’s role at a firm that profits from city business and his political alignment with O’Dea heightens concerns about conflicts of interest. It suggests a blending of private legal interests with public office, raising transparency and pay-to-play questions. The resolutions awarding contracts and expenditure claims fron Jersey City are listed below.</p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/434179">6/20/25 - $41,233.38</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/424296">3/7/25 - $9,996.34</a></p>
          <p><strong>Res 24-645</strong>The City of Jersey Council approved Resolution 24-645 on August 14, 2024, awarding a one-year contract to Chasan, Lamparello, Mallon & Cappuzzo to provide defense counsel for workers’ compensation claims against Jersey City. The contract allows payment of $1,500 per case, with an additional $1,500 for prolonged litigation, and is capped at $50,000 total. It was awarded as a professional services agreement, exempt from competitive bidding but compliant with New Jersey’s Pay-to-Play and affirmative action requirements. Funds are allocated from the FY 2024 budget, and the agreement must be publicly available and published in a local newspaper. The resolution ensures that the firm meets all legal and compliance standards while providing specialized legal defense services to the city. <a href="https://cityofjerseycity.civicweb.net/document/406521">Resolution PDF</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/400554">4/22/24 - $38,833.38</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/390968">1/8/24 - $35.00</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/156507">9/18/23 - $1,808.60</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/95854">8/11/23 - $192.50</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/93549">6/26/23 - $180.00</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/92663">6/9/23 - $870.00</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/90508">5/8/23 - $4,666.70</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/86739">3/6/23 - $11,136.62</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/85108">2/17/23 - $465</a></p>
          <p><strong>Res 23-093 </strong>On February 8, 2023, the Jersey City Council approved Resolution 23-093, awarding a one-year professional services contract to Chasan, Lamparello, Mallon & Cappuzzo to provide defense counsel for workers’ compensation claims against the city. The firm is paid $1,500 per case, with an additional $1,500 allowed for protracted litigation, and the total contract is capped at $50,000. The award was made under the Fair and Open provisions of the Pay-to-Play Law and is exempt from competitive bidding as a professional services agreement. The contract requires compliance with affirmative action laws and must be publicly available and published in a local newspaper within ten days of adoption. Funding for the contract is drawn from the FY 2023 budget, with $10,000 certified as available, ensuring the firm can provide legal defense services in accordance with city and state regulations.<a href="https://cityofjerseycity.civicweb.net/document/83684">Resolution PDF</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/83495">1//20/23 - $19,833.98</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/82744">1/6/23 - $1,500.50</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/80927">11/23/22 - $195.00</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/78028">10/25/22 - $3,959.00</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/77318">10/11/22 - $3,646.72</a></p>
          <p><strong>Res 22-770 </strong>On October 26, 2022, the Jersey City Council approved Resolution 22-770, renewing a professional services agreement with Chasan, Lamparello, Mallon & Cappuzzo, PC to represent Sergeant Rossy Barzola in the ongoing federal lawsuit Donna and Michael Glaesener v. City of Jersey City. The renewal added $50,000 to the contract, bringing the total amount to $200,000, covering legal services and related expenses. The contract was awarded under the Fair and Open provisions of the Pay-to-Play Law and is exempt from competitive bidding as a professional services agreement. The agreement requires compliance with affirmative action laws, and a copy of the resolution and contract must be made publicly available and published in a local newspaper. Funding for the contract comes from the city’s 2022 budget, with additional renewal subject to appropriation in subsequent fiscal years. <a href="https://cityofjerseycity.civicweb.net/document/76326">Resolution PDF</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/73114">8/12/22 - $510.00</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/69755">6/10/22 - $660.00</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/67909">5/5/22 - $4,762.65</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/66966">4/13/22 - $2,496.40</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/64888">3/3/22 - $3,834.95</a></p>
          <p><strong>Res 22-160 </strong>On February 24, 2022, the Jersey City Council approved Resolution 22-160, renewing a professional services agreement with Chasan, Lamparello, Mallon & Cappuzzo, PC to represent Sergeant Rossy Barzola in the ongoing federal lawsuit Donna and Michel Glaesener v. City of Jersey City. The renewal added $50,000 to the contract, bringing the total to $150,000, including legal expenses. The contract was awarded as a professional services agreement, exempt from competitive bidding but compliant with the Fair and Open provisions of the Pay-to-Play Law. It requires compliance with affirmative action regulations, and copies of the resolution and agreement must be publicly available and published in a local newspaper. Funding for the contract comes from the city’s 2021 budget, with continuation subject to appropriation in subsequent fiscal years.<a href="https://cityofjerseycity.civicweb.net/document/63495">Resolution PDF</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/63350">2/2/22 - $45</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/62536">1/20/22 - $6,084.42</a></p>
          <p><strong>Res 22-113 </strong>On February 9, 2022, the Jersey City Council approved Resolution 22-113, awarding a one-year professional services contract to Chasan, Lamparello, Mallon & Cappuzzo to provide defense counsel for workers’ compensation claims filed against the city. The contract is capped at $50,000 and pays $1,500 per case, with an additional $1,500 allowed for protracted litigation. It was awarded as a professional services agreement, exempt from competitive bidding but compliant with the Fair and Open provisions of the Pay-to-Play Law. The firm is required to comply with affirmative action regulations, and a copy of the resolution and agreement must be publicly available and published in a local newspaper. Funding for the contract comes from the FY 2022 budget, with continuation contingent on appropriation of sufficient funds in the permanent budget.<a href="https://cityofjerseycity.civicweb.net/document/61892">Resolution PDF</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/61646">1/6/22 - $120.00</a></p>
          <p><strong>Res 21-880 </strong>On December 15, 2021, the Jersey City Council approved Resolution 21-880, renewing a professional services agreement with Chasan, Lamparello, Mallon & Cappuzzo, PC to represent Police Officer Morton Otundo in the federal lawsuit Samy Faragalla v. City of Jersey City. The contract covers legal services at $150 per hour, with a total not to exceed $50,000, including expenses. The award was made as a professional services agreement, exempt from competitive bidding, and follows the Fair and Open provisions of the Pay-to-Play Law. Compliance with affirmative action regulations is required, and the resolution and agreement must be publicly available and published in a local newspaper. Funding for the contract comes from the city’s 2022 budget, with continuation contingent on appropriation of sufficient funds in both temporary and permanent budgets. <a href="https://cityofjerseycity.civicweb.net/document/59876">Resolution PDF</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/59833">11/22/21 - $15,729.33</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/59107">11/4/21 - $195.00</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/58567">10/22/21 - $4,965.00</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/58054">10/7/21 - $825.00</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/52979">8/13/21 - $225.00</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/49373">6/9/21 - $360.00</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/46864">4/22/21 - $38.65</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/46108">4/9/21 - $10,252.27</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/43483">2/18/21 - $450.00</a></p>
          <p><strong>Res 21-213 </strong>On March 10, 2021, the Jersey City Council approved Resolution 21-213, ratifying a professional services agreement with Chasan, Lamparello, Mallon & Cappuzzo, PC to represent Police Officer Morton Otundo in the federal lawsuit Samy Faragalla v. City of Jersey City. The contract covers legal services at $150 per hour, with a total not to exceed $50,000, including expenses. The agreement was awarded as a professional services contract, exempt from competitive bidding, under the Fair and Open provisions of the Pay-to-Play Law. Compliance with affirmative action regulations is required, and the resolution and agreement must be publicly available and published in a local newspaper. Funding comes from the city’s 2021 budget, and continuation of the contract is contingent on the appropriation of sufficient funds in the permanent budget. <a href="https://cityofjerseycity.civicweb.net/document/43440">Resolution PDF</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/43026">2/9/21 - $1,095.00</a></p>
          <p><strong>Res 21-091 </strong>On January 27, 2021, the Jersey City Council approved Resolution 21-091, awarding a professional services agreement to Chasan, Lamparello, Mallon & Cappuzzo to provide defense counsel for worker’s compensation claims filed against the city. The contract covers services at $1,500 per case, with an additional $1,500 allowed for protracted litigation, for a total amount not to exceed $50,000. The agreement is classified as a professional services contract, exempt from competitive bidding under the Local Public Contracts Law, and follows the Fair and Open provisions of the Pay-to-Play Law. Compliance with affirmative action regulations is required, and the resolution and agreement must be publicly available and published in a city newspaper. Initial funding of $10,000 was allocated from the 2021 temporary budget, with the remainder provided through the 2021 permanent budget. <a href="https://cityofjerseycity.civicweb.net/document/40147">Resolution PDF</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/38868">11/25/20 - $165.00</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/37605">11/5/20 - $4,608.94</a></p>
          <p><strong>Res 21-046 </strong>On January 13, 2021, the Jersey City Council approved Resolution 21-046, renewing a professional services agreement with Chasan Lamparello Mallon & Cappuzzo, PC to represent Sergeant Rossy Barzola in the ongoing lawsuit filed by Donna and Michel Glaesener. The case alleges assault, violations of civil rights, violations of the New Jersey Constitution, the New Jersey Civil Rights Act, and false arrest. The renewal increases the contract by $50,000, bringing the total to $100,000, including expenses, for a one-year term effective October 18, 2020. The contract is awarded as a professional services agreement exempt from competitive bidding under the Local Public Contracts Law and complies with the Fair and Open provisions of the Pay-to-Play Law. Funds of $3,000 were initially allocated from the 2020 budget, and the continuation of the contract depends on the availability of funds in the 2021 temporary and permanent budgets. <a href="https://cityofjerseycity.civicweb.net/document/37540">Resolution PDF</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/35574">9/29/20 - $1,262.30</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/28568">6/16/20 - $3,826.27</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/27626">6/4/20 - $1,141.50</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/20322">2/4/20 - $420</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/19070">1/15/20 - $5,460.28</a></p>
          <p><strong>Res 19-962 </strong>On December 18, 2019, the Jersey City Council approved Resolution 19-962, awarding a professional services agreement to Chasan, Lamparello, Mallon & Cappuzzo to provide defense counsel for worker’s compensation claim petitions filed against the City. The law firm will handle cases at a rate of $1,500 per case, with an additional $1,500 available for protracted litigation if necessary. The contract is exempt from competitive bidding under the Local Public Contracts Law and follows the Fair and Open provisions of the Pay-to-Play Law. The one-year contract, effective January 1, 2020, has a maximum total amount of $50,000 and requires compliance with affirmative action and pay-to-play regulations. Continuation of the contract depends on the appropriation of sufficient funds in the City’s 2020 temporary and permanent budgets. <a href="https://cityofjerseycity.civicweb.net/document/16079">Resolution PDF</a></p>
          <p><strong>Res 19-909 </strong>On December 4, 2019, the Jersey City Council approved Resolution 19-909, ratifying a professional services agreement with Chasan, Lamparello, Mallon & Cappuzzo, PC to represent Sergeant Rossy Barzola in the civil rights case filed by Donna and Michel Glaesener. The complaint, filed on September 18, 2019, alleged assault, civil rights violations, and false arrest. The law firm will provide services at $150 per hour, with a total contract amount not to exceed $50,000, including expenses. The contract is exempt from competitive bidding under the Local Public Contracts Law and follows the “fair and open” Pay-to-Play process. Continuation of the contract depends on available funds in the City’s 2019 and 2020 fiscal year budgets, and compliance with affirmative action and pay-to-play regulations is required. <a href="https://cityofjerseycity.civicweb.net/document/15747">Resolution PDF</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/13574">10/1/19 - $12,666.08</a></p>
          <p><strong>Res 19-593 </strong>On June 25, 2019, the Jersey City Council approved Resolution 19-593, awarding a professional services agreement to Chasan Lamparello Mallon & Capuzzo, PC to represent the Municipal Council, Council President Rolando Lavarro, and Municipal Clerk Robert Byrne in the Wave Urban Renewal v. City of Jersey City case. The complaint, filed on June 18, 2019, alleged that the City failed to comply with the long-term tax exemption law. The law firm will provide services at $175 per hour, with a total contract amount not to exceed $30,000, including expenses. The contract is exempt from competitive bidding under the Local Public Contracts Law and was awarded through the City’s “fair and open” Pay-to-Play process. Continuation of the contract is contingent on compliance with affirmative action and pay-to-play regulations, and funds have been certified as available in the City’s budget. <a href="https://cityofjerseycity.civicweb.net/document/8419">Resolution PDF</a></p>
          <p><strong>Res 19-162 </strong>On January 1, 2019, the Jersey City Council ratified Resolution 19-162, awarding a one-year professional services contract to Chasan Lamparello Mallon & Cappuzzo, PC to provide defense counsel for worker’s compensation claims filed against the City. The law firm will be compensated at $1,500 per case, with an option for an additional $1,500 if protracted litigation is necessary, for a total contract amount not to exceed $50,000. This contract is exempt from competitive bidding under the Local Public Contracts Law and was awarded through the City’s fair and open Pay-to-Play process. Continuation of the contract is contingent on compliance with affirmative action laws and the City’s Pay-to-Play Reform Ordinance. Funds have been certified as available in the City’s budget, and a copy of the resolution will be published publicly within ten days of adoption. <a href="https://cityofjerseycity.civicweb.net/document/7925">Resolution PDF (pgs 254-274)</a></p>
        </div>
      )}
    </div>

    <div className = "accordion-item">
      <button
        className={`accordion-header ${openIndex === 15 ? "active" : ""}`}
        onClick={() => toggleAccordion(15)}
        aria-expanded={openIndex === 15}
      >
        Mast Construction Services - $6,250
        <span className="accordion-arrow" />
      </button>
      {openIndex === 15 && (
        <div className="accordion-content">
          <p>Mast Construction Services raises potential red flag concerns despite not currently holding direct contracts with Jersey City. The company has made multiple contributions, ranging from $250 to $2,500, both as corporate and “P2P Corporate,” spanning the years 2020 through 2025. While the donations themselves are not unusually large, the repeated contributions over time, combined with Mast’s extensive involvement in high-profile public projects in the region,such as courthouse renovations, Hudson County Community College buildings, and other infrastructure initiatives,suggest a potential interest in maintaining influence or favorable relationships with city officials. Even without formal contracts in Jersey City, their consistent presence and donations indicate strategic relationship-building that could warrant closer scrutiny.</p>
        </div>
      )}
    </div>



    <div className = "accordion-item">
      <button
        className={`accordion-header ${openIndex === 16 ? "active" : ""}`}
        onClick={() => toggleAccordion(16)}
        aria-expanded={openIndex === 16}
      >
        GD Correctional Services LLC - $11,400
        <span className="accordion-arrow" />
      </button>
      {openIndex === 16 && (
        <div className="accordion-content">
          <p>The donations from GD Correctional Services LLC and its president are a red flag because they come directly from a company that relies almost entirely on government contracts in Hudson County. With nearly $11 million in correctional food service contracts already awarded, their financial stability depends on continued public funding. By donating the maximum allowed amount to Councilman O’Dea, who has influence over city and county decisions, the company appears to be investing in political relationships that could safeguard or expand its contracts. Their prior attempt to enter Jersey City’s food service market, even though they were disqualified, shows a clear interest in securing new city contracts.</p>
          <p><strong>Res 22-605 </strong>The Hudson County Correctional Center’s food services contract with GD Correctional Services, LLC is running out of funds, prompting officials to request an additional $163,264 to cover ongoing expenses. Originally awarded at $9.2 million, the contract has already been increased three times—by $385,000, $975,000, and $250,000—bringing the total contract value to $10,973,264. This request highlights the growing costs tied to the county’s agreement with GD Correctional Services to provide meals at the jail. <a href="https://cityofjerseycity.civicweb.net/document/71984">Resolution PDF (pg 26)</a></p>
          <p><strong>Res 20-346 </strong>GD Correctional Services submitted the lowest bid—$546,184.86—for Jersey City’s Summer Food Service Program, which would have made them the most cost-effective option on paper. However, their bid was rejected because they were not an approved vendor for the program, which requires compliance with state and federal standards for child nutrition services. As a result, the city was forced to award the contract to Red Rabbit LLC, the lowest responsive bidder at $758,076.54. This shows that while GD Correctional is actively seeking food service contracts beyond correctional facilities, their lack of required program approval disqualified them, highlighting both their aggressive pursuit of public food contracts and the regulatory limits on their eligibility. <a href="https://cityofjerseycity.civicweb.net/document/28357">Resolution PDF (pgs 6-7)</a></p>
        </div>
      )}
    </div>

    <div className = "accordion-item">
      <button
        className={`accordion-header ${openIndex === 17 ? "active" : ""}`}
        onClick={() => toggleAccordion(17)}
        aria-expanded={openIndex === 17}
      >
        Anthony and Angelo Beskaly: John & Maryan LLC - $6,000
        <span className="accordion-arrow" />
      </button>
      {openIndex === 17 && (
        <div className="accordion-content">
          <p>John & Maryann, LLC represents a notable red flag in terms of campaign contributions because, in addition to receiving payments from the City of Jersey City on two occasions, employees associated with the company have collectively donated $6,000 to O’Dea’s campaign. This financial relationship raises concerns about potential conflicts of interest, especially given that the company owns multiple properties across the city, including parcels directly affected by redevelopment and eminent domain decisions. The combination of city payments, employee donations, and widespread property holdings suggests a situation where campaign contributions could be perceived as a way to gain influence or favorable treatment in city planning and redevelopment decisions. This creates a heightened risk of public perception that financial support may be tied to municipal actions that benefit the company’s real estate interests.</p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/410960">9/11/24 - $7,349.94</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/32473">8/6/20 - $8,800.00</a></p>
          <p><strong>Res 22-905 </strong>John & Maryann, LLC is a property owner whose parcels are included in the Ocean Avenue South Expansion Study Area being considered for redevelopment by the City of Jersey City. Under this process, the Planning Board has identified portions of the study area—specifically Block 27201 Lots 21, 23, 24, and 25—as a “Condemnation Area” in need of redevelopment, which would allow the city or a designated redevelopment entity to use eminent domain to acquire properties against the owners’ will. John & Maryann, LLC, as the last known owner of one or more parcels in this area, is formally notified so that they have the opportunity to participate in the public hearing, present objections or support, and potentially challenge the designation in court within 45 days if the city moves forward with the condemnation redevelopment. Essentially, they are directly affected stakeholders in a process that could lead to the compulsory sale of their property for public redevelopment purposes. <a href="https://cityofjerseycity.civicweb.net/document/79183">Resolution PDF (pg 9)</a></p>
        </div>
      )}
    </div>

    <div className = "accordion-item">
      <button
        className={`accordion-header ${openIndex === 18 ? "active" : ""}`}
        onClick={() => toggleAccordion(18)}
        aria-expanded={openIndex === 18}
      >
        Armando Derrico and Beatrice Sangosse: Pinnacle Development Group - $5,750
        <span className="accordion-arrow" />
      </button>
      {openIndex === 18 && (
        <div className="accordion-content">
            <p>The donations from Armando Derrico, owner of Pinnacle Development Group, and Beatrice Sangosse, an associate working under both Pinnacle Development Group and Weichert Realtors, represent a potential red flag. Both have made contributions to O’Dea while their company actively engages in real estate projects in Jersey City, as evidenced by their portfolio showcasing multiple local properties. Large donations from individuals with direct business interests in the city raise concerns about possible conflicts of interest, particularly regarding zoning, approvals, or redevelopment decisions. This overlap between financial support and local business activity makes these donations a noteworthy red flag.</p>
            <a href="https://pdgbuilding.com/portfolio">Pinnacle Development's Portfolio</a>
        </div>
      )}
    </div>

    <div className = "accordion-item">
      <button
        className={`accordion-header ${openIndex === 19 ? "active" : ""}`}
        onClick={() => toggleAccordion(19)}
        aria-expanded={openIndex === 19}
      >
        Ronnie Greco, President of Jersey City Education Association - $5,200
        <span className="accordion-arrow" />
      </button>
      {openIndex === 19 && (
        <div className="accordion-content">
            <p>Ronnie Greco’s donation to O’Dea is a red flag because, as president of the Jersey City Education Association, he holds a key leadership role in a powerful local union that directly interacts with city government on education policies, budgets, and contracts. Large contributions from union leaders can create the appearance of seeking influence or preferential treatment from elected officials, raising concerns about potential conflicts of interest. The combination of his position, the size of the donation, and the union’s stake in city decisions makes this contribution particularly sensitive from an ethical and transparency perspective.</p>
        </div>
      )}
    </div>

    <div className = "accordion-item">
      <button
        className={`accordion-header ${openIndex === 20 ? "active" : ""}`}
        onClick={() => toggleAccordion(20)}
        aria-expanded={openIndex === 20}
      >
        Scott Grogan & Deirdre Owen: Landmark Developers: $5,000
        <span className="accordion-arrow" />
      </button>
      {openIndex === 20 && (
        <div className="accordion-content">
            <p>The donations from Scott Grogan and Deidre Owens of Landmark Developers to O’Dea are a red flag because the company is actively involved in significant Jersey City projects, including the Liberty House and Hudson House developments. In addition, Landmark Developers formally communicated with Robert Byrne, the City Clerk, through letters regarding proposed projects and NJDEP applications, showing active engagement with city officials on development matters. As CFO and representatives of a firm directly affected by city approvals and permits, their contributions could be perceived as an attempt to gain political favor or influence decisions benefiting their business interests. Their letters are listed in the agendas below.</p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/17855">1/8/20 Agenda, 6.17</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/17087">12/18/19 Agenda, 6.40</a></p>
        </div>
      )}
    </div>

    <div className = "accordion-item">
      <button
        className={`accordion-header ${openIndex === 21 ? "active" : ""}`}
        onClick={() => toggleAccordion(21)}
        aria-expanded={openIndex === 21}
      >
        Mark Grossbard, CEO of Kai Strategic Insurance and VP of Insurance World: $5,000
        <span className="accordion-arrow" />
      </button>
      {openIndex === 21 && (
        <div className="accordion-content">
          <p>Mark Grossbard’s $5,000 donation to O’Dea is a red flag because he is CEO of Kai Strategic Insurance, a company that has received substantial payments from Jersey City—over $2.7 million across recent expenditures. The large sums combined with his personal political contribution create the appearance of a potential conflict of interest. The timing and scale of the donation relative to the city’s financial interactions with Kai Strategic Insurance could be perceived as an attempt to gain influence or preferential treatment, raising concerns about transparency and ethical optics.</p>
           <p><a href="https://cityofjerseycity.civicweb.net/document/426925">4/4/25 - $602,197.40</a></p>
           <p><a href="https://cityofjerseycity.civicweb.net/document/418957">1/9/25 - $561,050.40</a></p>
           <p><a href="https://cityofjerseycity.civicweb.net/document/412698">10/16/24 - $1,568,074.46</a></p>
        </div>
      )}
    </div>

    <div className = "accordion-item">
      <button
        className={`accordion-header ${openIndex === 22 ? "active" : ""}`}
        onClick={() => toggleAccordion(22)}
        aria-expanded={openIndex === 22}
      >
        Albert Mauti, Co-Founder of M&M Construction: $5,200
        <span className="accordion-arrow" />
      </button>
      {openIndex === 22 && (
        <div className="accordion-content">
          <p>Albert Mauti, as the co-founder of M & M Construction Company, which received a substantial $5.64 million contract from the City of Jersey City for the construction of Engine Co. #10 and Ladder 12 and has received several expenditure payments from Jersey City, donated to O’Dea’s campaign. This contribution is a red flag because it comes directly from a principal of a company that benefits from significant city expenditures, creating a potential conflict of interest. The donation raises concerns about the possibility of political influence, as the company’s financial interests could be seen as linked to O’Dea’s political support. The contract itself involved multiple payments and oversight from city officials, meaning any perceived favoritism or expectation of favorable treatment could compromise the integrity of the procurement process.</p>
          <p><strong>Res 21-242 </strong>The City of Jersey Council awarded a contract to M & M Construction Company, Inc. for the construction of Engine Co. #10 and Ladder 12 – a new firehouse, Project No. 18-004, for the Department of Administration, Division of Architecture. The contract was the result of a public bidding process, where M & M Construction was the lowest responsive and responsible bidder after the lowest bid from Thomas & Sons Builders was deemed non-responsive. The total bid amount is $5,642,000, with a total encumbrance of $6,206,200 available across multiple capital accounts. Payments will be made once city officials certify that the materials and services are delivered in accordance with the contract. The contract award is subject to compliance with New Jersey’s Affirmative Action Amendments to the Law Against Discrimination, and the Mayor or Business Administrator is authorized to execute the contract on behalf of the city. <a href="https://cityofjerseycity.civicweb.net/document/44316">Resolution PDF</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/71510">7/8/22 - $101,626.00</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/68836">5/20/22 - $198,450.00</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/66966">4/13/22 - $73,500.00</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/64888">3/3/22 - $242,007.39</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/60449">12/8/21 - $24,500</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/58567">10/22/21 - $175,665.00</a></p>
        </div>
      )}
    </div>

    <div className="accordion-item">
        <button
          className={`accordion-header ${openIndex === 23 ? "active" : ""}`}
          onClick={() => toggleAccordion(23)}
          aria-expanded={openIndex === 23}
        >
          Frank Robinson, Associate of Garden Greenz - $5,000
          Brian Markey, Owner of Garden Greenz - $2,800
          <span className="accordion-arrow" />
        </button>
        {openIndex === 23 && (
          <div className="accordion-content">
            <p>The $5,000 donation from Frank Robinson is a significant red flag given his recent controversies as co-owner of Garden Greenz. Multiple Jersey City cannabis commissioners alleged that Robinson was caught on video using racist and homophobic slurs, including the n-word and f-word, while also engaging in intimidation of other businesses. These incidents prompted strong condemnation from board members, who stated that his behavior violated the city’s principles of diversity and inclusion and was “truly disturbing.” Accepting financial support from Robinson raises serious concerns about a candidate’s alignment with community values, tolerance, and responsible business practices, especially in a city where inclusion and equity are key political issues.</p>
            <p>
              <a href="https://hudsoncountyview.com/jersey-city-cannabis-board-denies-local-modiv-again-oks-ex-councilmans-application">Article relating to Robinson's allegations.</a>
            </p>
            <p>
              <p><strong>Res 22-765 </strong> The Jersey City Council provides support for Garden Greenz to run a cannabis business. </p><a href="https://cityofjerseycity.civicweb.net/document/77364">Resolution PDF</a>
            </p>
          </div>
        )}
      </div>

       <div className="accordion-item">
        <button
          className={`accordion-header ${openIndex === 24 ? "active" : ""}`}
          onClick={() => toggleAccordion(24)}
          aria-expanded={openIndex === 24}
        >
          Chisea Shaninian & Giantomisi - $1,000
          <span className="accordion-arrow" />
        </button>
        {openIndex === 24 && (
          <div className="accordion-content">
          <p>The $1,000 donation from Chiesa Shahinian & Giantomasi PC raises concerns because the firm has been directly awarded legal service contracts by Jersey City, including a 2023 agreement worth up to $40,000 to represent police officers in a lawsuit tied to the Estate of Hiram Gonzalez. While the firm did comply with all required pay-to-play and disclosure rules, the fact that an active city contractor is also making political contributions to a candidate like O’Dea creates the appearance of potential conflicts of interest. Even if technically legal, these kinds of donations raise questions about whether firms with ongoing or future business before the city may be attempting to maintain goodwill or secure favorable treatment through campaign contributions.</p>
          <p><strong>Res 23-481 </strong>This resolution ratifies a professional services agreement with the law firm Chiesa Shahinian & Giantomasi PC to represent Jersey City Police Officers Leon Tucker and Saad Hashmi in a lawsuit related to the Estate of Hiram Gonzalez. The contract, effective March 29, 2023, is for up to $40,000 at an hourly rate of $175, and includes expenses. The firm has complied with all required political contribution disclosures and the City's Pay-to-Play laws. Funds of $5,000 are available for this purpose in the current budget, with continuation contingent on future budget appropriations. The resolution and related documents will be made publicly available as required by law. <a href="https://cityofjerseycity.civicweb.net/document/90902/R0205489_%20Chiesa%20Shahinian%20_%20Giantomasi.pdf?handle=30D5C0EA4875471BAE6D17B7FF828B36">Resolution PDF</a></p>
          </div>
        )}
      </div>

      <div className = "accordion-item">
      <button 
        className={`accordion-header ${openIndex === 25 ? "active" : ""}`}
        onClick={() => toggleAccordion(25)}
        aria-expanded={openIndex === 25}>
        Peter Roselle - President of Regional Industries LLC, Meadowbrook Industries LLC, and Waste Industries LLC - $500
        <span className="accordion-arrow" />
      </button>
      {openIndex === 25 && (
        <div className="accordion-content">
          <p>The 500 dollar donation to O'Dea is a red flag because Regional Industries currently has a five-year, 77.5 million dollar contract with Jersey City with relations to night collection of garbage and recyclables. This is clear pay-to-play behavior, as a company holding a lucrative city contract is contributing directly to a candidate who could influence or oversee future contract negotiations, extensions, or oversight. The donation suggests an effort to maintain favorable political ties, raising concerns about conflicts of interest and undermining public trust in fair governance.</p>
          <p><strong>Res 20-586 </strong>This resolution (Res. 20-586, approved August 12, 2020) awards a five-year, $77.5 million contract to Regional Industries LLC for night collection of solid waste and recyclables for Jersey City’s Department of Public Works, Division of Sanitation. The contract runs from September 1, 2020, to August 31, 2025, per bid specifications and state regulations. Regional Industries submitted the only bid, which the Purchasing Director deemed fair and reasonable. An initial $400,000 is allocated from account 01-201-26-290-314, with future payments subject to annual budget appropriations. The contract requires compliance with affirmative action laws, proper receipt of services before payment, and execution by the Mayor or Business Administrator.</p>
        </div>
      )}
    </div>

    <div className = "accordion-item">
      <button 
        className={`accordion-header ${openIndex === 26 ? "active" : ""}`}
        onClick={() => toggleAccordion(26)}
        aria-expanded={openIndex === 26}>
          Richard Sciaretta, Managing Partner of Claremont Development - $2,500
        <span className="accordion-arrow" />
      </button>
      {openIndex === 26 && (
        <div className="accordion-content">
          <p>Richard Sciaretta, managing partner of Claremont Development, contributed $2,500 to Bill O’Dea’s campaign in August 2024. Claremont Development is a major real estate developer with longstanding interests in Jersey City, particularly in large-scale residential and mixed-use projects, such as St. Lucy's Tower, the Rivet and Rivet 28, and new dorms in Saint Peter's University. The donation is notable because O’Dea has positioned himself as a watchdog against unchecked development, yet his acceptance of funds from a prominent developer may raise questions about consistency. Real estate donations are often scrutinized in Jersey City politics, where concerns about overdevelopment and affordability remain front and center. Sciaretta’s contribution could be interpreted as an attempt to maintain influence over zoning and development decisions should O’Dea become mayor. Critics might argue that this fits into a broader pattern of developers seeking access through campaign contributions. Supporters, however, may downplay the donation as a routine part of political fundraising. Still, in the context of Jersey City’s history with pay-to-play, the $2,500 from Claremont Development raises a clear red flag.</p>
          <p><a href="https://www.claredev.com/projects">Claremont Development's Projects</a></p>
        </div>
      )}
    </div>

    <div className = "accordion-item">
      <button 
        className={`accordion-header ${openIndex === 27 ? "active" : ""}`}
        onClick={() => toggleAccordion(27)}
        aria-expanded={openIndex === 27}>
          Richard Ranalli, Managing Partner of Rivermayn - $1,500
        <span className="accordion-arrow" />
      </button>
      {openIndex === 27 && (
        <div className="accordion-content">
          <p>Richard Ranalli, Managing Partner of Rivermayr Realty Advisors, presents a potential red flag because of his firm’s extensive footprint in Jersey City real estate projects. Developments connected to Rivermayr include Dream Tower, Path Plaza Condos, Sugar House, Saint Aloysius “Little School,” Skylark on the Hudson Restaurant, State Theater Redevelopment, and West Side Station, all of which are significant Jersey City properties. Although a few projects are outside the city, such as Aberdeen Train Station and 81 Two Bridges Road, the concentration of Jersey City holdings shows a vested financial interest in the city’s development decisions. Any substantial campaign contributions from Ranalli or his associates to local candidates like Bill O’Dea should be understood in the context of these investments, since they raise concerns about influence over zoning, approvals, or city-backed redevelopment initiatives that directly affect his portfolio.</p>
          <p><a href="https://www.rivermaynrealty.com/our-work">Rivermayn Realty Advisor's Projects</a></p>
        </div>
      )}
    </div>

   <div className="accordion-item">
    <button 
      className={`accordion-header ${openIndex === 28 ? "active" : ""}`}
      onClick={() => toggleAccordion(28)}
      aria-expanded={openIndex === 28}>
         Jeffrey Persky, Executive Vice President of Kushner Real Estate Group - $1,500
      <span className="accordion-arrow" />
    </button>
    {openIndex === 28 && (
      <div className="accordion-content">
        <p>
          Jeffrey Persky, Executive Vice President of the Kushner Real Estate Group (KRE Group), contributed to Bill O’Dea’s mayoral campaign. This raises concerns because KRE Group is one of the most active real estate developers in Jersey City, with major projects such as Journal Squared, 235 Grand, 18 Park, Bay 151, and 485 Marin. These developments depend on zoning approvals, tax abatements, and city planning decisions, creating a direct overlap between the company’s financial interests and the authority of the mayor’s office. While such contributions may be legal under New Jersey’s campaign finance rules, they exemplify the “pay-to-play” dynamic in which powerful developers support candidates who will ultimately hold sway over their projects. <a href="https://thekregroup.com/residential/urban-living">Kushner Real Estate Group</a>
        </p>
      </div>
    )}
  </div>

  <div className="accordion-item">
    <button 
      className={`accordion-header ${openIndex === 29 ? "active" : ""}`}
      onClick={() => toggleAccordion(29)}
      aria-expanded={openIndex === 29}>
        Edward Geerlof, CEO of Noble Construction Group - $11,000
      <span className="accordion-arrow" />
    </button>
    {openIndex === 29 && (
      <div className="accordion-content">
        <p>
          Noble Construction Group’s ties to Jersey City development raise questions about their $11,000 donation to Bill O’Dea’s campaign. The firm has been directly involved in major local projects such as Summit Avenue, Hudson Exchange Phases 1A, 1B, and 2, Gulls Cove, 55 Hudson, 110 First Street, and Cast Iron Lofts,developments that required significant city approvals and oversight. With their CEO contributing a sizable donation, the optics suggest a possible pay-to-play dynamic, where large contributions may buy influence or favorable treatment in future city contracts and approvals. Given O’Dea’s long history in Hudson County politics and the concentration of donations from developers, critics may see this as a red flag, pointing to the longstanding problem of developers attempting to shape policy through financial support. Even if not illegal, such a connection risks undermining public trust, as voters may question whether O’Dea will prioritize residents’ needs,such as affordability and transparency,over the interests of developers bankrolling his campaign. This is especially sensitive in Jersey City, where rapid development has fueled gentrification concerns and fears of political favoritism. For many residents, large developer-linked donations symbolize an old-school machine-style politics that continues to dominate Hudson County. The donation, therefore, is controversial not just for the amount, but for the deeper implications it carries in a city struggling with trust in local governance.
        </p>
        <p><a href="https://ncgllc.com/portfolio">Noble Construction's Projects</a></p>
      </div>
    )}
  </div>

  <div className="accordion-item">
    <button 
      className={`accordion-header ${openIndex === 30 ? "active" : ""}`}
      onClick={() => toggleAccordion(30)}
      aria-expanded={openIndex === 30}>
        Euro Concrete - $5,000
      <span className="accordion-arrow" />
    </button>
    {openIndex === 30 && (
      <div className="accordion-content">
        <p>
            Euro Concrete donated $5,000 to Bill O’Dea’s campaign. Their own project portfolio lists multiple active or recent Jersey City construction sites, including 96 Tonnelle Ave, 2958 JFK Blvd, 682 Route 440, 135 Columbus Dr., 337 Johnston Ave, and 177 Academy St. This establishes a direct business interest in Jersey City development. When a contractor with substantial work in the city makes the maximum contribution to a mayoral candidate, it raises concerns of pay-to-play dynamics: a company with current and potential future contracts aligning itself financially with the candidate who could influence city approvals and development pipelines. The overlap between Euro Concrete’s active Jersey City projects and their maximum donation makes this contribution especially concerning.        </p>
        <p><a href="https://euroconcrete.com/index.html">Euro Concrete Website.</a></p>
      </div>
    )}
  </div>

  <div className="accordion-item">
    <button 
      className={`accordion-header ${openIndex === 31 ? "active" : ""}`}
      onClick={() => toggleAccordion(31)}
      aria-expanded={openIndex === 31}>
        Del-Sano Contracting - $2,500
      <span className="accordion-arrow" />
    </button>
    {openIndex === 31 && (
      <div className="accordion-content">
        <p>
          Del-Sano Contracting Corporation donated $2,500 to Bill O’Dea’s campaign on May 29, 2024. At the same time, the company lists multiple Jersey City projects in its portfolio, including Ocean Green Senior Apartments, NJCU School of Business, and St. Peter’s School of Business and Education. This overlap creates a direct pay-to-play concern: a company that has profited from municipal and institutional projects in Jersey City is now financially backing a candidate for mayor, potentially to secure favorable treatment in future contracting decisions. Given Jersey City’s long history of corruption tied to developers and contractors, this contribution raises serious questions about whether the donation was motivated by civic engagement or by an expectation of political access and influence.        </p>
        <p><a href="https://www.delsano.com/projects.html">Del-Sano Projects.</a></p>
      </div>
    )}
  </div>

      <div className="accordion-item">
        <button
          className={`accordion-header ${openIndex === 32 ? "active" : ""}`}
          onClick={() => toggleAccordion(32)}
          aria-expanded={openIndex === 32}
        >
          Dave Jefferson, Owner of The Leaf Joint - $1,350
          <span className="accordion-arrow" />
        </button>
        {openIndex === 32 && (
          <div className="accordion-content">
            <p>Dave Jefferson, owner of The Leaf Joint, contributed $1,350 to O'Dea’s campaign. This donation is a potential red flag because Jefferson’s business required and received approval from the Jersey City Council to operate a Class 5 retail cannabis establishment within the city. When individuals who are seeking or have obtained municipal approvals contribute to a candidate’s campaign, it can create the appearance of a pay-to-play scenario, where financial support might be perceived as influencing official decisions. While the contribution is legal, its connection to city approvals warrants scrutiny to maintain transparency and public trust.</p>
            <p><strong>Res 22-675 </strong>On February 8, 2023, the Jersey City Council approved Resolution 23-100 providing local support for The Leaf Joint to operate a Class 5 retail cannabis business. <a href="https://cityofjerseycity.civicweb.net/document/74396">Resolution PDF</a></p>
          </div>
        )}
      </div>

      <div className="accordion-item">
        <button
          className={`accordion-header ${openIndex === 33 ? "active" : ""}`}
          onClick={() => toggleAccordion(33)}
          aria-expanded={openIndex === 33}
        >
          Sprinkler Fitters Local #696 - $5,200
          <span className="accordion-arrow" />
        </button>
        {openIndex === 33 && (
          <div className="accordion-content">
            <p>
              Local 696, the sprinkler fitters union, donated \$5,200 to Bill O’Dea’s campaign while simultaneously receiving multiple payments from Jersey City through its various funds, including pension, welfare, training, building trades, and sprinkler industry accounts. These expenditures, tied to labor and benefit obligations across city building and infrastructure projects, establish a financial relationship between the city and the union. While such payments may reflect contractual obligations, the union’s political contributions create the appearance of a conflict of interest. This overlap between city disbursements and campaign donations raises pay-to-play concerns and represents a strong red flag.
            </p>
           <p><a href="https://cityofjerseycity.civicweb.net/document/410721">9/6/24 - $6,064.57</a></p>
           <p><a href="https://cityofjerseycity.civicweb.net/document/409634">8/12/24 - $4,399.35</a></p>
           <p><a href="https://cityofjerseycity.civicweb.net/document/405701">6/12/24 - $23,006.28</a></p>
           <p><a href="https://cityofjerseycity.civicweb.net/document/398846">4/10/24 - $5,411.17</a></p>
           <p><a href="https://cityofjerseycity.civicweb.net/document/394633">2/5/24 - $6,288.38</a></p>
           <p><a href="https://cityofjerseycity.civicweb.net/document/393695">1/22/24 - $11,123.66</a></p>
           <p><a href="https://cityofjerseycity.civicweb.net/document/390093">12/11/23 - $12,534.94</a></p>
           <p><a href="https://cityofjerseycity.civicweb.net/document/313478">10/23/23 - $14,470.30</a></p>
           <p><a href="https://cityofjerseycity.civicweb.net/document/156507">9/18/23 - $11,478.59</a></p>
           <p><a href="https://cityofjerseycity.civicweb.net/document/95854">8/11/23 - $14,177.51</a></p>
           <p><a href="https://cityofjerseycity.civicweb.net/document/94298">7/7/23 - $16,616.19</a></p>
           <p><a href="https://cityofjerseycity.civicweb.net/document/91602">5/19/23 - $7,483.77</a></p>
           <p><a href="https://cityofjerseycity.civicweb.net/document/89720">4/24/23 - $6,536.28</a></p>
           <p><a href="https://cityofjerseycity.civicweb.net/document/87444">3/17/23 - $1,345.07</a></p>
           <p><a href="https://cityofjerseycity.civicweb.net/document/85108">2/17/23 - $1,057.04</a></p>
           <p><a href="https://cityofjerseycity.civicweb.net/document/82744">1/6/23 - $9,258.33</a></p>
           <p><a href="https://cityofjerseycity.civicweb.net/document/77318">10/11/22 - $1,545.12</a></p>
           <p><a href="https://cityofjerseycity.civicweb.net/document/76260">9/16/22 - $13,002.43</a></p>
           <p><a href="https://cityofjerseycity.civicweb.net/document/74496">9/22/22 - $2,317.81</a></p>
           <p><a href="https://cityofjerseycity.civicweb.net/document/73114">8/12/22 - $13,069.01</a></p>
           <p><a href="https://cityofjerseycity.civicweb.net/document/59833">11/22/21 - $108.88</a></p>
           <p><a href="https://cityofjerseycity.civicweb.net/document/59215">11/09/21 - $362.94</a></p>
           <p><a href="https://cityofjerseycity.civicweb.net/document/58727">10/26/21 - $544.42</a></p>
           <p><a href="https://cityofjerseycity.civicweb.net/document/56489">9/20/21 - $330.25</a></p>
           <p><a href="https://cityofjerseycity.civicweb.net/document/46338">4/14/21 - $2,796.19</a></p>
          </div>
        )}
      </div>

      <div className="accordion-item">
        <button
          className={`accordion-header ${openIndex === 34 ? "active" : ""}`}
          onClick={() => toggleAccordion(34)}
          aria-expanded={openIndex === 34}
        >
          32BJ United America Dream Fund PAC - $15,000
          <span className="accordion-arrow" />
        </button>
        {openIndex === 34 && (
          <div className="accordion-content">
            <p>A significant red flag arises from the $15,000 contribution from the 32BJ United America Dream Fund PAC to Bill O’Dea’s campaign on June 18, 2025. This donation preceded the Jersey City Council’s September 10, 2025 resolution supporting 32BJ SEIU security officers in their 2025 contract campaign. The timing and alignment of the donation with these council actions suggest a potential conflict of interest and raise pay-to-play concerns, as the political committee making the contribution represents a union directly impacted by city contracts. Such a pattern of giving signals the possibility of undue influence over municipal decision-making, even in the absence of explicit legal violations.</p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/436644">Res 25-574 - Sep 10, 2025</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/343830">Res 23-805 - Nov 8, 2023</a></p>
          </div>
        )}
      </div>

      <div className="accordion-item">
        <button
          className={`accordion-header ${openIndex === 35 ? "active" : ""}`}
          onClick={() => toggleAccordion(35)}
          aria-expanded={openIndex === 35}
        >
          Pipefitters Local Union 274 - $10,500
          <span className="accordion-arrow" />
        </button>
        {openIndex === 35 && (
          <div className="accordion-content">
            <p>Pipefitters Local Union 274 donated \$10,500 to Bill O’Dea’s campaign. The union has received multiple payments from Jersey City for labor and benefits, including \$57,210.94 on 1/6/22, \$9,858.07 on 7/9/21, and \$58,795.54 on 4/14/21, demonstrating a direct financial relationship with the city. Contributions from unions with municipal exposure present a potential conflict of interest, as elected officials could influence decisions affecting union members’ pay, benefits, or work opportunities. Given this overlap between campaign donations and city expenditures, the contribution raises clear pay-to-play concerns and is appropriately classified as a strong red flag.</p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/61646">1/6/22 - $57,210.94</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/51506">7/9/21 - $9,858.07</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/46338">4/14/21 - $58,795.54</a></p>
          </div>
        )}
      </div>

      <div className="accordion-item">
        <button
          className={`accordion-header ${openIndex === 36 ? "active" : ""}`}
          onClick={() => toggleAccordion(36)}
          aria-expanded={openIndex === 36}
        >
          Businesses for Better Neighborhoods - $42,500
          <span className="accordion-arrow" />
        </button>
        {openIndex === 36 && (
          <div className="accordion-content">
           <p>A potential red flag emerges around the nonprofit Businesses for Better Neighborhoods, which donated a total of $42,500 to Bill O’Dea’s campaign in 2024. Public records list the group at the same 537 North Avenue, Plainfield address as Landmark Hospitality, a company that owns two luxury event venues in Jersey City, Hudson House and Liberty House, both of which depend heavily on city approvals, permits, and favorable relationships with local government. The unusually large nonprofit contributions, coupled with the shared address and direct business interests in Jersey City, raise concerns about whether these donations reflect genuine community advocacy or are instead a vehicle for advancing a developer’s agenda. While more transparency is needed to fully establish the nature of this nonprofit’s role, the overlap of large campaign donations, real estate interests, and businesses reliant on city regulation is a clear warning sign of potential pay-to-play influence.</p>
          </div>
        )}
      </div>

      <div className="accordion-item">
        <button
          className={`accordion-header ${openIndex === 37 ? "active" : ""}`}
          onClick={() => toggleAccordion(37)}
          aria-expanded={openIndex === 37}
        >
          Junior Maldonado, Hudson County Clerk - $5,750
          <span className="accordion-arrow" />
        </button>
        {openIndex === 37 && (
          <div className="accordion-content">
            <p>Hudson County Clerk Junior Maldonado, a longtime figure within the Hudson County Democratic Organization (HCDO), directed a total of $5,750 to Bill O’Dea’s campaign between November 2023 and March 2025 through his election committee. While Maldonado’s office does not oversee city contracting, his position as county clerk gives him influence within the broader Hudson County political machine. The scale and frequency of these contributions point to more than routine political support, suggesting a deliberate effort to align O’Dea with the HCDO establishment. This alignment raises concerns about Jersey City’s political independence, as significant financial backing from county power brokers can translate into expectations of political favors or patronage. The donations therefore represent a strong red flag, not only because of their size but also because they reinforce the broader issue of county machine dominance in Jersey City politics.</p>
          </div>
        )}
      </div>

      <div className = "accordion-item">
      <button
        className={`accordion-header ${openIndex === 76 ? "active" : ""}`}
        onClick={() => toggleAccordion(76)}
        aria-expanded={openIndex === 76}
      >
        B.A.C Administrative District Council of NJ - $3,000
        <span className="accordion-arrow" />
      </button>
      {openIndex === 76 && (
        <div className="accordion-content">
          <p>
            The B.A.C. Administrative District Council of New Jersey contributed $3,000 to O'Dea's campaign, while records show the City of Jersey City has paid the union substantial sums for various projects, including $36,506.07 on April 6, 2023, and $28,265.70 on March 17, 2023, among numerous other disbursements exceeding $100,000 since early 2023. This overlap between significant campaign contributions and recurring city expenditures creates a strong pay-to-play concern. While unions have a legitimate role in supporting candidates, the scale of financial ties in this case raises questions about whether public contracting decisions could be influenced by political donations, signaling a potential conflict of interest.
          </p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/434925">7/11/25 - $7,614.84</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/434179">6/20/25 - $6,980.80</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/424296">3/7/25 - $3,080.16</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/405701">6/12/24 - $4,956.00</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/390968">1/8/24 - $8,538.79</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/313478">10/23/23 - $5,155.92</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/156507">9/18/23 - $267.84</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/94298">7/7/23 - $3,427.90</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/91602">5/19/23 - $6,355.20</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/90508">5/8/23 - $14,012.29</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/88651">4/6/23 - $36,506.07</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/87444">3/17/23 - $28,265.70</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/85108">2/17/23 - $5,481.36</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/82744">1/6/23 - $5,185.98</a></p>
        </div>
      )}
    </div>





    




    










    



    





    









    </section>
    <div className="other-candidates-section">
      <h2>Other Candidates</h2>
      <ul className="other-candidates-list">
        {otherCandidates
          .filter(c => c.name !== "Bill O'Dea") // exclude current candidate
          .map(c => (
            <li key={c.name}>
              <Link to={c.path}>{c.name}</Link>
            </li>
        ))}
      </ul>
    </div>

      <div style={{ marginTop: "2rem", display: "flex", justifyContent: "space-between", flexWrap: "wrap" }}>
        <a href={`${backendUrl}/download/Bill_O'Dea_combined_contributions.csv`} download className="btn-download">Download Full Contributions CSV</a>
        <a href="/" className="btn-return">Return to Home Page</a>
        <a href="https://www.njelecefilesearch.com/SearchContributionInteractive?eid=459066">View Full ELEC Records</a>
      </div>

     <footer className="footer">
  <p>PAID FOR BY ALI FOR JERSEY CITY PO BOX 8237, JERSEY CITY, NJ 07308</p>
</footer>

    </div>
  );
}
