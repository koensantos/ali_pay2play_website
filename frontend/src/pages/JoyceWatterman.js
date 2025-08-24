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
    { name: "Joyce Watterman", path: "/JoyceWatterman"}
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
          This candidate has been flagged for having suspicious donations, totaling $35,800.{" "}
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

      <div className ="accordion-item">
      <button
        className={`accordion-header ${openIndex === 0 ? "active" : ""}`}
        onClick={() => toggleAccordion(0)}
        aria-expanded={openIndex === 0}
      >
        Leemark Electrics - $250
        Anthony Cantanio, Owner - $650
        <span className="accordion-arrow" />
      </button>
      {openIndex === 0 && (
        <div className="accordion-content">
          <p>Leemark Electrics has donated $250 to Watterman, and Anthony Cantanio has made a total of $650. Leemark Electrics have done several projects in Jersey City relating lighting, power distribution, etc. Along with their projects, they have received expenditures from Jersey City and had received a contract in October 2020. The details are listed below.</p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/44186">$32,700 - 3/4/21</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/35805">Resolution PDF</a></p>
          <p><a href ="https://cityofjerseycity.civicweb.net/document/30560">$9,800 - 2/19/20</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/23359">$4,120 - 3/18/20</a></p>

        </div>
      )}
    </div>

    {/* Remington and Vernick Engineers */}
      <div className="accordion-item">
        <button
          className={`accordion-header ${openIndex === 1 ? "active" : ""}`}
          onClick={() => toggleAccordion(1)}
          aria-expanded={openIndex === 1}
        >
          Remington and Vernick Engineers - $2,000
          <span className="accordion-arrow" />
        </button>
        {openIndex === 1 && (
          <div className="accordion-content">
            <p>A $2,000 donation to Watterman is a red flag because the firm has directly provided professional engineering and design services for city projects, such as structural plans and geotechnical work for public buildings. This creates a potential conflict of interest: the donation could be perceived as an attempt to influence McGreevey or maintain favorable relations with the city administration, which could indirectly affect contract approvals, project oversight, or future business opportunities. Even if the donation is legal and disclosed, the fact that the donor is a company actively involved in city projects heightens the appearance of impropriety. The red flag arises from the overlap between the donor’s financial contribution and their professional interest in city decisions.</p>
            <p><strong>Res 23-514 </strong>Remington & Vernick Engineers is acting as the structural engineering consultant for the Engine 10 / Ladder 12 Fire Station project in Jersey City. Their role involves updating the structural design to account for new site conditions, including modifications to the foundation system based on geotechnical findings. They ensure that all structural plans comply with the 2021 International Building Code and coordinate closely with other consultants, including Netta Architects, Langan (geotechnical), and Polise Engineering (MEP), to integrate these updates into the overall project documents. Additionally, they provide construction administration support by reviewing contractor submittals, participating in progress meetings, and assisting the city with interpretation of structural aspects of the contract documents. <a href="https://cityofjerseycity.civicweb.net/document/93088">Resolution PDF</a></p>
            <p><strong>Ord 22-112 </strong>Remington & Vernick are involved as the design and engineering consultants, having provided the proposed layout and plans for the renovations and expansions at 514 Newark Avenue. Their work includes designing the modifications to ensure ADA compliance, improving facilities to reduce COVID-19 transmission risks, and creating space for showers, laundry, and congregate meals for residents experiencing homelessness. Essentially, Remington & Vernick’s plans form the basis for the City and Garden State Community Development Corporation to implement the Hudson CASA Coordinated Entry Program at the property. Their proposed layout is incorporated into the ordinance as part of the city’s authorization to proceed with the $2,100,400 in improvements. <a href="https://cityofjerseycity.civicweb.net/document/81763">Ordinance PDF</a></p>
            <p><strong>6.19</strong>This letter, dated April 10, 2025, from James L. Hankins, P.E., a project manager and engineer at Remington & Vernick Engineers, was sent to Sean J. Gallagher, the Jersey City Clerk, regarding the NJDEP Waterfront Development Individual Permit for the Van Winkle Combined Sewer Outfall project in Jersey City. It indicates that Remington & Vernick Engineers are acting as the engineering consultants responsible for preparing and submitting technical documentation and permitting materials to the New Jersey Department of Environmental Protection. The correspondence highlights Vernick’s direct involvement in the regulatory and design aspects of the waterfront development project. <a href="https://cityofjerseycity.civicweb.net/document/427697"></a>4/23/25 Agenda</p>
          </div>
        )}
      </div>

      {/* King's Court */}
      <div className="accordion-item">
        <button
          className={`accordion-header ${openIndex === 2 ? "active" : ""}`}
          onClick={() => toggleAccordion(2)}
          aria-expanded={openIndex === 2}
        >
          King's Court Realty - $1,000
          <span className="accordion-arrow" />
        </button>
        {openIndex === 2 && (
          <div className="accordion-content">
            <p>King's Court Realty donated $1,000 to Watterman's campaign while also receiving expenditure claims from Jersey City starting in December 2023. Although these claims are small, a donation to a mayoral candidate could be seen as trying to sway influence to get better claims when she is mayor. This creates a conflict of interest and possible pay-to-play violations. Due to these concerns, this donation has been deemed a red flag donation.</p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/436252">8/14/25 - $177.50</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/429486">5/2/25 - $155.00</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/425256">3/24/25 - $245.00</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/421779">2/7/25 - $245.00</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/416983">12/6/24 - $245.00</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/412458">10/10/24 - $245.00</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/408268">7/8/24 - $245.00</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/403052">5/17/24 - $245.00</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/397144">3/18/24 - $245.00</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/390093">12/11/23 - $202.94</a></p>

          </div>
        )}
      </div>

       {/* Connell Foley PAC */}
    <div className="accordion-item">
      <button
        className={`accordion-header ${openIndex === 3 ? "active" : ""}`}
        onClick={() => toggleAccordion(3)}
        aria-expanded={openIndex === 3}
      >
        Connell Foley PAC - $5,000
        <span className="accordion-arrow" />
      </button>
      {openIndex === 3 && (
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

    <div className="accordion-item">
        <button
          className={`accordion-header ${openIndex === 4 ? "active" : ""}`}
          onClick={() => toggleAccordion(4)}
          aria-expanded={openIndex === 4}
        >
          New Jersey for All PAC - $7,000
          <span className="accordion-arrow" />
        </button>
        {openIndex === 4 && (
          <div className="accordion-content">
            <p>The New Jersey for All PAC donation to Joyce Watterman could be viewed as a red flag because it represents a large contribution from an out-of-state, Washington D.C.–based political committee rather than from grassroots Jersey City supporters. While the PAC labels itself “union,” its DC registration and shared address with other influence-oriented PACs suggest it may function more as a political funding vehicle than a local labor organization. In a municipal race, a $2,500–$5,000 contribution from such a PAC raises concerns about outside interests seeking influence over local policy and contracts, particularly if the PAC itself is funded by national unions, lobbying groups, or developers with stakes in New Jersey politics.</p>
          </div>
        )}
    </div>

    
{/* William J Guarini Plumbing */}
      <div className="accordion-item">
        <button
          className={`accordion-header ${openIndex === 5 ? "active" : ""}`}
          onClick={() => toggleAccordion(5)}
          aria-expanded={openIndex === 5}
        >
          William J Guarini Plumbing - $5,500
          <span className="accordion-arrow" />
        </button>
        {openIndex === 5 && (
          <div className="accordion-content">
            <p>Watterman has received a total of $5,500. These donations have been flagged as suspicious because William J. Guarini, INC has a contract with the city, raising concerns of potential conflict of interest and pay2play. Watterman is also a council member and she also voted yes on the resolution below. These donations could mean that there is conflict of interest in play if Watterman is elected mayor.  The resolution is listed below.</p>
            <p>
              <strong>Res 24-335:</strong> The City of Jersey City approved Resolution 24-335 on May 8, 2024, authorizing a contract award of $120,000.00 to William J. Guarini, Inc. for citywide plumbing services. This contract was awarded through the New Jersey Cooperative Purchasing Alliance (NJCPA), Bergen County Coop, for the Department of Public Works, Division of Buildings and Street Maintenance. The contract term is effective from May 9, 2024, through December 31, 2024. Initial funding of $20,000.00 is available in the operating account, with the continuation of the contract subject to the availability of funds in the 2024 fiscal year permanent budget.
            </p>
            <p>
              <a href="https://cityofjerseycity.civicweb.net/document/400643/For%20citywide%20plumbing%20services.pdf?handle=95AFC000E6434A69ACCECA47B7C171D8">Resolution PDF</a>
            </p>
          </div>
        )}
      </div>

      <div className="accordion-item">
        <button
          className={`accordion-header ${openIndex === 6 ? "active" : ""}`}
          onClick={() => toggleAccordion(6)}
          aria-expanded={openIndex === 6}
        >
          Brain Markey, Owner of Garden Greenz - $4,200
          Frank Robinson, Associate of Garden Greenz - $1,500
          <span className="accordion-arrow" />
        </button>
        {openIndex === 5 && (
          <div className="accordion-content">
            <p>Watterman has received a total of $5,700 from both Brian Markey, the owner of Garden Greenz, and Frank Robinson, an associate. These donations have been flagged as potentially concerning because they come from individuals with a business seeking city approval and influence. Additionally, Frank Robinson has been accused of using hateful slurs in a video circulating online, which raises further ethical questions about accepting contributions from him. While the donations are legal, the combination of business interests and controversial behavior suggests they may warrant closer scrutiny for potential conflicts of interest or public perception issues.</p>
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
          className={`accordion-header ${openIndex === 7 ? "active" : ""}`}
          onClick={() => toggleAccordion(7)}
          aria-expanded={openIndex === 7}
        >
          Donald Sciaretta, Claremont Construction - $5,000
          <span className="accordion-arrow" />
        </button>
        {openIndex === 7 && (
          <div className="accordion-content">
            <p>Donald Sciaretta, owner of Claremont Construction, contributed $5,000 to Joyce Watterman’s campaign. This donation is potentially a red flag because Claremont Construction received a substantial city contract payment of $16,676.50 on November 5, 2020, from Jersey City. Contributions from individuals or businesses that are actively receiving or have received city funds can create the appearance of a pay-to-play dynamic, where campaign support might influence municipal contracting decisions. While the donation is legal, it warrants scrutiny to ensure that public resources are awarded fairly and transparently.</p>
           <p><a href="https://cityofjerseycity.civicweb.net/document/37605">11/5/20 - $16,676.50</a></p>
          </div>
        )}
      </div>

      {/*Anthony Grano, Owner of Persistent Construction Corp*/}
      <div className = "accordion-item">
        <button
          className ={`accordion-header ${openIndex === 8 ? "active" : ""}`}
          onClick={() => toggleAccordion(8)}
          aria-expanded={openIndex === 8}>
          Anthony and Frank Ralph Grano, Persistent Construction Corp - $3,200
          <span className="accordion-arrow" />
        </button>
        {openIndex === 8 && (
          <div className="accordion-content">
            <p>Anthony and Frank Ralph Grano, owners of Persistent Construction Corp, contributed a total of $3,200 to Joyce Watterman’s campaign. These donations are considered potential red flags because Persistent Construction Corp has been awarded contracts by Jersey City. When individuals or businesses that are actively seeking or receiving city contracts contribute to a candidate’s campaign, it creates the appearance of a pay-to-play scenario, where financial support could be perceived as influencing municipal contracting decisions. While the contributions are legal, their connection to city contracts warrants closer scrutiny to ensure transparency and prevent conflicts of interest.</p>
            <p><strong>Res 24-859</strong> The City of Jersey City has renewed an open-end contract with Persistent Construction, Inc. for snow removal services for the Department of Public Works, Division of Sanitation. This renewal, approved on November 26, 2024, is for an additional one-year period effective from January 1, 2025, to December 31, 2025. The total cost of this renewed contract will not exceed $1,130,370.00, with an initial allocation of $10,000.00 from the Division of Sanitation Operating Account. <a href="https://cityofjerseycity.civicweb.net/document/413259/R0210559_%20Renewal%201_1%20for%20Snow%20Removal%20Only.pdf?handle=EE9FDAD333FA488CBBBAF537DB24F84A">Resolution PDF</a></p>
            <p><strong>Res 23-931 </strong>On December 13, 2023, Jersey City approved Resolution 23-931, awarding a one-year open-end contract to Persistent Construction Inc. for snow removal services for the Department of Public Works, Division of Sanitation. The contract is valued at $1,102,800.00, with an initial encumbrance of $10,000.00 from the 2024 operating budget. The agreement includes set unit costs and allows for an optional one-year extension. The contract is contingent on compliance with affirmative action requirements and the availability of future budget appropriations. Payments will be made only upon certified completion of services according to specifications. <a href="https://cityofjerseycity.civicweb.net/document/413259/R0210559_%20Renewal%201_1%20for%20Snow%20Removal%20Only.pdf?handle=EE9FDAD333FA488CBBBAF537DB24F84A">Resolution PDF</a></p>
            <p><strong>Res 21-334 </strong>The City of Jersey City ratified an emergency contract with Persistent Construction, Inc. for $24,000.00 to build six parklets across the city. This initiative aimed to create outdoor spaces for small businesses and residents for social distancing and reopening efforts during the COVID-19 pandemic. The contract was awarded as an emergency measure, exempting it from public bidding requirements. Brian D. Platt, the then Business Administrator, issued an emergency certification on October 17, 2020, formally authorizing the parklet construction due to the public health emergency. Paul Russo, the Municipal Engineer, certified that the services rendered by Persistent Construction, Inc. were fair and reasonable. <a href="https://cityofjerseycity.civicweb.net/document/46245/Resolution%20ratifying%20an%20emergency%20contract%20awar.pdf?handle=91AC5DC128344431A12830A6261832AD">Resolution PDF</a></p>
          </div>
        )}
      </div>

      {/* The Leaf Joint */}
      <div className="accordion-item">
        <button
          className={`accordion-header ${openIndex === 9 ? "active" : ""}`}
          onClick={() => toggleAccordion(9)}
          aria-expanded={openIndex === 9}
        >
          Dave Jefferson, Owner of The Leaf Joint - $500
          <span className="accordion-arrow" />
        </button>
        {openIndex === 9 && (
          <div className="accordion-content">
            <p>Dave Jefferson, owner of The Leaf Joint, contributed $500 to Joyce Watterman’s campaign. This donation is a potential red flag because Jefferson’s business received approval from the Jersey City Council to operate within the city. Contributions from individuals who are seeking or have obtained city approval for their businesses can create the appearance of a pay-to-play scenario, where political support might influence municipal decisions.</p>
            <p><strong>Res 22-675 </strong>On February 8, 2023, the Jersey City Council approved Resolution 23-100 providing local support for The Leaf Joint to operate a Class 5 retail cannabis business. <a href="https://cityofjerseycity.civicweb.net/document/74396">Resolution PDF</a></p>
          </div>
        )}
      </div>











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
        <a href="https://www.njelecefilesearch.com/SearchContributionInteractive?eid=461973">View Full ELEC Records</a>
      </div>
    </div>
  );
}
