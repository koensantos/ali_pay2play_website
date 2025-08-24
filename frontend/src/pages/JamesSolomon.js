import React, {useEffect, useState} from "react";
import { Pie, Bar } from "react-chartjs-2";
import { Link } from "react-router-dom";
import "chart.js/auto";
import "./Draft.css";
import SolomonPhoto from "./img/solomon.jpg";
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
    fetch(`${backendUrl}/api/contributions/James_Solomon`)
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
    fetch(`${backendUrl}/api/top_donors_bar/James_Solomon`)
      .then((res) => res.json())
      .then(setTopDonorsBarData)
      .catch(console.error);

    // top employers
    fetch(`${backendUrl}/api/top_employers_bar/James_Solomon`)
      .then((res) => res.json())
      .then(setTopEmployersBarData)
      .catch(console.error);

    // total donations
    fetch(`${backendUrl}/api/total_donations/James_Solomon`)
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
    fetch(`${backendUrl}/api/search_donor/James_Solomon?q=${encodeURIComponent(searchTerm.trim())}`)
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
    fetch(`${backendUrl}/api/search_donor/James_Solomon?q=${encodeURIComponent(name)}`)
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
      <h1>James Solomon: Campaign Finance Visuals</h1>

      {totalDonations !== null && (
        <div className="total-donations-panel">
          <h2>Total Donations</h2>
          <p>${totalDonations.toLocaleString()}</p>
        </div>
      )}

      <div className="red-flag-warning">
        <p>
          This candidate has been flagged for having suspicious donations, totaling to $94,100.{" "}
          <HashLink smooth to="#red-flags">Click here to view them.</HashLink>
        </p>
      </div>

      <div className="bio-container">
        <section className="bio-text">
          <h2>Biography</h2>
          <p>James Solomon is a Jersey City Councilmember representing Ward E, which includes much of Downtown Jersey City. First elected in 2017, Solomon has built a reputation as a reform-minded progressive who emphasizes transparency, ethics, and community-driven development. With a background in public policy and education, he’s been one of the most vocal members of the council on issues like campaign finance reform, tenant protections, and open government. Known for his independent stance and willingness to challenge entrenched political interests, Solomon is now running for mayor to expand his focus citywide and push for more accountable, equitable governance.</p>
          <h2>Policies</h2>
          <ul>
            <li>Campaign finance and ethics reform: Pushing for stronger pay-to-play laws, public campaign financing, and stricter transparency in city contracts.</li>
            <li>Affordable housing: Expanding inclusionary zoning, rent control, and tenant protections while opposing unchecked luxury development.</li>
            <li>Climate and infrastructure: Prioritizing green building standards, stormwater management, and environmental justice in development decisions.</li>
            <li>Transit and walkability: Improving pedestrian infrastructure, expanding protected bike lanes, and advocating for improved public transit access.</li>
            <li>Education and child care: Supporting universal pre-K and city-backed afterschool and child care programs for working families.</li>
          </ul>
          <h2>Background</h2>
          <p>James Solomon grew up in New Jersey and earned degrees from Rutgers University and Harvard’s Kennedy School of Government, where he studied public policy. Before entering politics, he worked as a public school teacher in underserved communities through Teach for America, and later as an urban policy professor. He moved to Jersey City and became involved in local activism, including affordable housing efforts and anti-corruption campaigns. Since taking office, Solomon has positioned himself as a watchdog for public interest, frequently questioning development deals and prioritizing neighborhood-level concerns. His campaign seeks to bring bold, principled leadership to all of Jersey City.</p>
        </section>
        <div className="bio-image">
          <img src={SolomonPhoto} alt="James Solomon" />
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
        James Solomon has been flagged for suspicious donations listed below.
      </p>

      {/* Accordion item 0 */}
      <div className="accordion-item">
        <button
          className={`accordion-header ${openIndex === 0 ? "active" : ""}`}
          onClick={() => toggleAccordion(0)}
          aria-expanded={openIndex === 0}
        >
          RD Parisi Associates - $31,300
          <span className="accordion-arrow" />
        </button>
        {openIndex === 0 && (
          <div className="accordion-content">
            <p>
              Solomon has received a total of $31,300 from donations from the
              company and Robert Parisi, the owner of RD Parisi Associates, and
              his wife.
            </p>
            <p>
              RD Parisi was voted in unanimously to replace Acrisure for
              providing Jersey City with insurance consulting services and to
              be the city's broker for obtaining and monitoring the city's
              health benefits, prescription, and stop-loss coverage. That vote
              occurred on and approved on October 17, 2024. Solomon has
              received two $5,200 on August 26, 2024, and on September 30,
              2024.
            </p>
            <p>
              This information can be found on the 2024 pay2play contributions
              list on the NJ Elec website under "Team Soloman for JC." (That is
              not a typo. The link to the website is listed below.)
            </p>
            <p>
              <a
                href="https://www.elec.nj.gov/pay2play/quickdownload.html"
                target="_blank"
                rel="noopener noreferrer"
              >
                Pay2Play Contributions Website
              </a>
            </p>
          </div>
        )}
      </div>

      {/* Accordion item 1 */}
      <div className="accordion-item">
        <button
          className={`accordion-header ${openIndex === 1 ? "active" : ""}`}
          onClick={() => toggleAccordion(1)}
          aria-expanded={openIndex === 1}
        >
          Michael Oriani - Manager of William J Guarini INC - $5,500
          William Guarini - $500
          <span className="accordion-arrow" />
        </button>
        {openIndex === 1 && (
          <div className="accordion-content">
            <p>
              Solomon has received a donation of $5,500 from Oriani on March 27,
              2025 and a $500 donation from William Guarini on May 21, 2025. Due to his high position in the company, and that fact they
              have received contracts from Jersey City, it has been flagged as a
              suspicious donation.
            </p>
            <p>
              Res 24-335: The City of Jersey City approved Resolution 24-335 on
              May 8, 2024, authorizing a contract award of $120,000.00 to
              William J. Guarini, Inc. for citywide plumbing services. This
              contract was awarded through the New Jersey Cooperative Purchasing
              Alliance (NJCPA), Bergen County Coop, for the Department of Public
              Works, Division of Buildings and Street Maintenance. The contract
              term is effective from May 9, 2024, through December 31, 2024.
              Initial funding of $20,000.00 is available in the operating
              account, with the continuation of the contract subject to the
              availability of funds in the 2024 fiscal year permanent budget.
            </p>
            <p>
              <a
                href="https://cityofjerseycity.civicweb.net/document/400643/For%20citywide%20plumbing%20services.pdf?handle=95AFC000E6434A69ACCECA47B7C171D8"
              >
                Resolution PDF
              </a>
            </p>
          </div>
        )}
      </div>

      {/* Accordion item 2 */}
<div className="accordion-item">
  <button
    className={`accordion-header ${openIndex === 2 ? "active" : ""}`}
    onClick={() => toggleAccordion(2)}
    aria-expanded={openIndex === 2}
  >
    Wilentz, Goldman, and Spitzer - $5,200
    Everett Johnson - $1,500
    <span className="accordion-arrow" />
  </button>
  {openIndex === 2 && (
    <div className="accordion-content">
      <p>
        Solomon has received $1,500 from Everett Johnson, who is a shareholder and co-chair of the Public Finance Team and the firm's Equal Opportunity Committee, and a total of $5,200 from Wilentz, Goldman, and Spitzer, a law firm that has been awarded multiple contracts by the city below. The law firm has been awarded contracts for bond counsel services, which amounts to upwards of $270,000 in total.
      </p>
      <ul>
        <li>
          Res 24-577 - The Jersey City Municipal Council approved a resolution to amend its professional services agreement with Wilentz, Goldman & Spitzer, P.A., which provides bond counsel services to the city. The original contract, approved in November 2023, was for $185,000, but all funds have been expended. This amendment increases the contract by $85,000, bringing the total to $270,000, in order to cover outstanding invoices. The contract was awarded under the fair and open provisions of New Jersey’s Pay-to-Play law and qualifies as a professional service exempt from public bidding.{" "}
          <a
            href="https://cityofjerseycity.civicweb.net/document/412367/2024%20HB%20Broker.pdf?handle=9FAFFD5E27DF4EBF9E066D8479D118F4"
          >
            Resolution PDF
          </a>
        </li>
        <li>
          Res 23-581 - This resolution authorizes the City of Jersey City to enter into a professional services agreement with Wilentz, Goldman & Spitzer, P.A. to serve as bond counsel. The firm will provide legal services related to the authorization, issuance, sale, and delivery of City bonds, notes, and other obligations. The agreement is effective from October 1, 2023, to September 30, 2024, with a total contract amount not exceeding $185,000. The services were procured under the "fair and open" provisions of the "Pay to Play Law" and are exempt from public bidding as professional services.{" "}
          <a
            href="https://cityofjerseycity.civicweb.net/document/218840/Professional%20Services%20Agreement%20with%20Wilentz,%20G.pdf?handle=DC62C9EEE25944C1BD428E404A6BA9D1"
          >
            Resolution PDF
          </a>
        </li>
      </ul>
    </div>
  )}
</div>

{/* Accordion item 3 */}
<div className="accordion-item">
  <button
    className={`accordion-header ${openIndex === 3 ? "active" : ""}`}
    onClick={() => toggleAccordion(3)}
    aria-expanded={openIndex === 3}
  >
    Boswell Engineering - $2,500
    <span className="accordion-arrow" />
  </button>
  {openIndex === 3 && (
    <div className="accordion-content">
      <ul>
        <li>
          They hold several contracts around New Jersey, and have been involved in several projects in Hoboken. They were also awarded a contract in 2020 listed below, which Solomon voted Yes to.
        </li>
        <li>
          The Jersey City Municipal Council approved a resolution to award a $73,500 professional engineering services contract to Boswell Engineering, Inc. for the Grand Street Improvements project (No. 19-014-E). The firm was selected based on its qualifications and compliance with the city's Pay-to-Play and political contribution disclosure regulations. The contract will run for 12 months and is exempt from public bidding under New Jersey law for professional services. Funds for the project are available from account #04-215-55-151-990, and all required compliance and disclosure certifications will be filed with the resolution. The award must be publicly announced within 10 days.{" "}
          <a
            href="https://cityofjerseycity.civicweb.net/document/34505/Resolution%20Awarding%20a%20Professional%20Services%20Con.pdf?handle=C23EDB7B40904F9DBBAB8254A67B2500"
          >
            Resolution
          </a>
        </li>
      </ul>
    </div>
  )}
</div>

{/* Accordion item 4 */}
<div className="accordion-item">
  <button
    className={`accordion-header ${openIndex === 4 ? "active" : ""}`}
    onClick={() => toggleAccordion(4)}
    aria-expanded={openIndex === 4}
  >
    Adams Rehmann & Heggan Associates INC - $5,000 Donation
    <span className="accordion-arrow" />
  </button>
  {openIndex === 4 && (
    <div className="accordion-content">
      <ul>
        <li>
          This company has been awareded several contracts to maintain digital tax maps. The resolutions are explained below:
        </li>
        <ul>
          <li>
            Res 25-086: The Jersey City Council approved Resolution 25-086 on January 29, 2025, awarding a $165,975 contract to Adams, Rehmann & Heggan Associates, Inc. (doing business as Civil Solutions) for digital tax map maintenance and the creation of a comprehensive address point layer. The contract is exempt from public bidding under N.J.S.A. 40A:11-5(1)(d) because it involves furnishing tax maps. Civil Solutions submitted all required political contribution and pay-to-play compliance certifications, confirming no recent reportable contributions to local political campaigns. $20,000 in funds are available from the 2025 temporary budget to begin the work, with future payments contingent on funding in the permanent and subsequent budgets. The contract will last up to 12 months, and payments will be made upon confirmation that services have been delivered as specified.{" "}
            <a
              href="https://cityofjerseycity.civicweb.net/document/419266/Resolution%20to%20perform%20Digital%20Tax%20Map%20Maintenan.pdf?handle=B6B6D8FBEBA34C9C8482B9EF9F73B355"
            >
              Resolution PDF
            </a>
          </li>
          <li>
            Res 24-057: The City of Jersey City approved Resolution 24-057 on February 7, 2024, awarding a contract to Adams, Rehmann & Heggan Associates, Inc. T/A Civil Solutions for digital tax map maintenance. This contract, not exceeding $165,975.00, is for a twelve-month period, effective from February 7, 2024, to February 6, 2025. The firm will update and maintain the City's official digital tax maps, create a comprehensive address point layer, and provide a web-based system for tracking map changes. This work is vital for property identification, assessment, zoning, and construction purposes, ensuring compliance with various local and state regulations.{" "}
            <a
              href="https://cityofjerseycity.civicweb.net/document/391047/Contract%20to%20Adams,%20Rehmann%20_%20Heggan%20Associates,.pdf?handle=277065F4CD1D41E1BC3C56089FBC97A2"
            >
              Resolution PDF
            </a>
          </li>
          <li>
            Res 23-037: This resolution from the City of Jersey City awards a contract to Adams, Rehmann, Heggan Associates, Inc. T/A Civil Solutions for digital tax map maintenance. The City's digital tax maps are crucial for identifying properties, synchronizing assessment data, and supporting zoning and construction purposes. The contract, awarded without public bidding as authorized by N.J.S.A. 40A:11-5(1)(d) , is for a total amount not exceeding $165,975.00 and will last for twelve months from the award date. The services include updating tax maps and creating a comprehensive address point layer. The resolution emphasizes compliance with "Pay-to-Play" regulations and affirmative action requirements, with funds of $20,000.00 available in the temporary budget for the 2023 fiscal year.{" "}
            <a
              href="https://cityofjerseycity.civicweb.net/document/82736/Contract%20to%20Adams,%20Rehmann%20_%20Heggan%20Associates,.pdf?handle=06787F11D0DB4932A30D9C6D6A3C8CA2"
            >
              Resolution PDf
            </a>
          </li>
          <li>
            Res 22-461: This resolution from the City of Jersey City awards a contract to Adams, Rehmann & Heggan Associates, Inc. T/A Civil Solutions for digital tax map maintenance. The firm will update the city's certified digital tax maps and create a comprehensive address point layer, which are essential for identifying properties, zoning, and construction purposes. The contract amount is not to exceed $219,825.00 and was awarded without public bidding as it falls under the furnishing of tax maps, as authorized by N.J.S.A. 40A:11-5(1)(d). The resolution, approved on June 29, 2022, also includes requirements for compliance with "Pay-to-Play" regulations, including business registration.{" "}
            <a
              href="cityofjerseycity.civicweb.net/document/82736/Contract%20to%20Adams,%20Rehmann%20_%20Heggan%20Associates,.pdf?handle=06787F11D0DB4932A30D9C6D6A3C8CA2"
            >
              Resolution PDF
            </a>
          </li>
          <li>Res 19-582 (Cannot Access)</li>
        </ul>
      </ul>
    </div>
  )}
</div>

{/* Accordion item 5 */}
<div className="accordion-item">
  <button
    className={`accordion-header ${openIndex === 5 ? "active" : ""}`}
    onClick={() => toggleAccordion(5)}
    aria-expanded={openIndex === 5}
  >
    Anthony Grano, Owner of Persistent Construction Corp - $2,000 Donation
    <span className="accordion-arrow" />
  </button>
  {openIndex === 5 && (
    <div className="accordion-content">
      <ul>
        <li>
          Persistent Construction Corp has received multiple contracts from Jersey City listed below.
        </li>
        <ul>
          <li>
            Res 24-859: The City of Jersey City has renewed an open-end contract with Persistent Construction, Inc. for snow removal services for the Department of Public Works, Division of Sanitation. This renewal, approved on November 26, 2024, is for an additional one-year period effective from January 1, 2025, to December 31, 2025. The total cost of this renewed contract will not exceed $1,130,370.00, with an initial allocation of $10,000.00 from the Division of Sanitation Operating Account.{" "}
            <a
              href="https://cityofjerseycity.civicweb.net/document/413259/R0210559_%20Renewal%201_1%20for%20Snow%20Removal%20Only.pdf?handle=EE9FDAD333FA488CBBBAF537DB24F84A"
            >
              Resolution PDF
            </a>
          </li>
          <li>
            Res 23-931: On December 13, 2023, Jersey City approved Resolution 23-931, awarding a one-year open-end contract to Persistent Construction Inc. for snow removal services for the Department of Public Works, Division of Sanitation. The contract is valued at $1,102,800.00, with an initial encumbrance of $10,000.00 from the 2024 operating budget. The agreement includes set unit costs and allows for an optional one-year extension. The contract is contingent on compliance with affirmative action requirements and the availability of future budget appropriations. Payments will be made only upon certified completion of services according to specifications.{" "}
            <a
              href="https://cityofjerseycity.civicweb.net/document/413259/R0210559_%20Renewal%201_1%20for%20Snow%20Removal%20Only.pdf?handle=EE9FDAD333FA488CBBBAF537DB24F84A"
            >
              Resolution PDF
            </a>
          </li>
          <li>
            Res 21-334: The City of Jersey City ratified an emergency contract with Persistent Construction, Inc. for $24,000.00 to build six parklets across the city. This initiative aimed to create outdoor spaces for small businesses and residents for social distancing and reopening efforts during the COVID-19 pandemic. The contract was awarded as an emergency measure, exempting it from public bidding requirements. Brian D. Platt, the then Business Administrator, issued an emergency certification on October 17, 2020, formally authorizing the parklet construction due to the public health emergency. Paul Russo, the Municipal Engineer, certified that the services rendered by Persistent Construction, Inc. were fair and reasonable.{" "}
            <a
              href="https://cityofjerseycity.civicweb.net/document/46245/Resolution%20ratifying%20an%20emergency%20contract%20awar.pdf?handle=91AC5DC128344431A12830A6261832AD"
            >
              Resolution PDF
            </a>
          </li>
        </ul>
      </ul>
    </div>
  )}
</div>

{/* Accordion item 6 */}
<div className="accordion-item">
  <button
    className={`accordion-header ${openIndex === 6 ? "active" : ""}`}
    onClick={() => toggleAccordion(6)}
    aria-expanded={openIndex === 6}
  >
    Antonelli Kantor Rivera - $3,750 Donation
    <span className="accordion-arrow" />
  </button>
  {openIndex === 6 && (
    <div className="accordion-content">
      <ul>
        <li>
          The company has donated $3,750, along with several other attorneys/partners that have donated small amounts. Jersey City has given them a contract in 2024 listed below.
        </li>
        <ul>
          <li>
            Res 24-412: This resolution from the City of Jersey City ratifies a professional services agreement with the law firm Antonelli Kantor Rivera. The firm will represent Paul Tamburelli in the case of "Synea Hicks v. City of Jersey City et al.". The contract is for a one-year term, effective from January 1, 2024, with a total amount not to exceed $30,000.00, including expenses, at an hourly rate of $175.00. The resolution was approved on May 22, 2024{" "}
            <a
              href="https://cityofjerseycity.civicweb.net/document/402028/Ratifying%20a%20professional%20services%20agreement%20wit.pdf?handle=9B13DF77BC3D428E9E9E99B86C07B524"
            >
              Resolution PDF
            </a>
          </li>
        </ul>
      </ul>
    </div>
  )}
</div>

      {/* Accordion item 7 */}
      <div className="accordion-item">
        <button
          className={`accordion-header ${openIndex === 7 ? "active" : ""}`}
          onClick={() => toggleAccordion(7)}
          aria-expanded={openIndex === 7}
        >
          Next Generation Leaders - $5,000
          <span className="accordion-arrow" />
        </button>
        {openIndex === 7 && (
          <div className="accordion-content">
            <p>
              The donation from Next Generation Leaders to James Solomon is a red flag because the PAC itself has been donated to by companies that hold contracts with Jersey City. Public contract resolutions show multiple city vendors — including engineering and law firms like Adams, Rehmann & Heggan Associates (ARH) — contributing thousands of dollars to Next Generation Leaders. These are the same types of contractors who regularly seek and receive city business.
            </p>
            <p>When Next Generation Leaders then donated $5,000 to Solomon, it created an indirect pipeline: City Contractors → Next Generation Leaders → Candidate. In Solomon’s case, the concern is heightened because Adams, Rehmann & Heegan Associates (who has also been flagged for suspicious donations) not only funded the PAC but also donated to him directly, giving contractors two channels of influence. The companies who have received contracts and have contributed to Next Generation Leaders are listed below.</p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/410745">COLLIERS ENGINEERING & DESIGN D/B/A MASER CONSULTING, P.A. to Next Generations($1,000 1/17/23)</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/391047">Adams, Rehmann, & Heegan to Next Generation Leaders ($500 on 1/25/23, $1,000 on 5/19/23, $1,000 on 9/22/23, $1,000 on 10/20/23)</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/93215">COLLIERS ENGINEERING & DESIGN D/B/A MASER CONSULTING, P.A. to Next Generations($4,000 on 11/01/22)</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/82736">Adams, Rehmann, & Heegan to Next Generation Leaders ($1,000 on 9/23/22)</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/71950">Colliers Engineering & Design D/B/A Maser Consulting, P.A. to Next Generation Leaders ($6,500 on 9/21/20 and $700 on 12/30/20)</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/63458">Adams, Rehmann, & Heegan to Next Generation Leaders ($1,000 on 1/15/21 and $2,500 on 10/8/21)</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/28021">T&M Associates ($2,500 on 5/1/20)</a></p>



          </div>
        )}
      </div>

      {/* Waters, McPherson, McNeil */}
    <div className="accordion-item">
      <button
        className={`accordion-header ${openIndex === 8 ? "active" : ""}`}
        onClick={() => toggleAccordion(8)}
        aria-expanded={openIndex === 8}
      >
        Waters, McPherson, McNeil - $1,000
        <span className="accordion-arrow" />
      </button>
      {openIndex === 8 && (
        <div className="accordion-content">
          <p>The donations from Waters, McPherson, McNeil P.C. to  James Solomon and other Jersey City candidates raise potential red flags due to the firm’s direct financial and business interests with the city, as well as the timing of these contributions. The law firm represents Honeywell International Inc. in environmental remediation projects affecting public rights-of-way in Jersey City, including the execution and termination of Notices in Lieu of Deed Notices, such as the resolution approving the updated NILODN for Fisk Street and other ROWs in July 2024 (<a href="https://cityofjerseycity.civicweb.net/document/406670">Resolution PDF</a>). Additionally, the firm has historically represented developers in high-value waterfront redevelopment projects in the city (<a href="https://www.lawwmm.com/HudsonRiverRedev.asp">Waters, McPherson, McNeil Hudson River Waterfront Redevelopment</a>). The firm has also received substantial payments from the city itself, including $448,690.70 (<a href="https://cityofjerseycity.civicweb.net/document/436252">8/14/25</a>), $338,281.63 (<a href="https://cityofjerseycity.civicweb.net/document/403052">5/14/25</a>), $26,852.32 (<a href="https://cityofjerseycity.civicweb.net/document/387879">11/22/23</a>) $11,510.03 (<a href="https://cityofjerseycity.civicweb.net/document/95854">8/11/2023</a>). The donations, totaling $31,200 from the firm and $5,200 from David McPherson personally, occurred shortly after or around the time of these municipal approvals and expenditures, creating a perception that the contributions could influence officials overseeing matters directly affecting the firm’s clients. While no direct quid pro quo is proven, the overlap of campaign contributions with public decisions and city payments involving the firm constitutes a potential pay-to-play concern and represents a red flag for regulatory or ethical scrutiny.</p>
        </div>
      )}
    </div>

    <div className="accordion-item">
      <button
        className={`accordion-header ${openIndex === 9 ? "active" : ""}`}
        onClick={() => toggleAccordion(9)}
        aria-expanded={openIndex === 9}
      >
        Postnet and Rich Mendez, Owner of Postnet - $600
        <span className="accordion-arrow" />
      </button>
      {openIndex === 9 && (
        <div className="accordion-content">
          <p>Solomon has a received a total of $600 from Postnet and Rich Mendez, who is the owner of Postnet. While the donation amounts themselves are modest, the fact that the contributor has received transactionf from the city creates a potential conflict of interest, raising concerns about whether contributions could influence city decisions. The transaction PDFs are listed below.</p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/410721">9/6/24 - $860</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/77318">10/11/22 - $740</a></p>
        </div>
      )}
    </div>

    <div className="accordion-item">
      <button
        className={`accordion-header ${openIndex === 10 ? "active" : ""}`}
        onClick={() => toggleAccordion(10)}
        aria-expanded={openIndex === 10}
      >
        Ravi Bhalla, Mayor of Hoboken - $2,000
        Amardeep Bhalla, Ravi's Brother - $1,750
        Ranbir Bhalla, Ravi's Father - $1,750
        <span className="accordion-arrow" />
      </button>
      {openIndex === 10 && (
        <div className="accordion-content">
          <p>Ravi Bhalla, mayor of Hoboken and a client contact for T&M Associates, personally contributed $2,000 to James Solomon’s campaign, while his father, Rabinder Bhalla, and his brother, Amardeep Bhalla, each contributed $1,750. T&M Associates holds several contracts with Jersey City, creating a potential pay-to-play appearance where contributions from individuals linked to municipal contractors might influence city decisions. Bhalla has also faced multiple controversies, including allegations of parking ticket manipulation, a censure by the New Jersey Supreme Court for ethics violations, and lawsuits claiming quid pro quo or political pressure related to city operations; following these allegations, Hoboken City Council members called for state and federal investigations into his conduct. The combination of Bhalla’s municipal connections, his firm’s city contracts, his family’s donations, and his past controversies strengthens the need for scrutiny to ensure transparency and prevent conflicts of interest.</p>
        </div>
      )}
    </div>


    <div className="accordion-item">
      <button
        className={`accordion-header ${openIndex === 11 ? "active" : ""}`}
        onClick={() => toggleAccordion(11)}
        aria-expanded={openIndex === 11}
      >
        Vincent Buono, President of Munidex INC - $1,000
        <span className="accordion-arrow" />
      </button>
      {openIndex === 11 && (
        <div className="accordion-content">
          <p>Vincent Buono, president of Munidex Inc., contributed $1,000 to James Solomon’s campaign. Munidex Inc. has received multiple payments from the City of Jersey City over several years, including amounts of $11,153 (twice), $6,360, $17,499, $6,235, $17,500, $6,113, $5,760, and $5,875, with transactions spanning from 2019 through 2025. Given that Munidex is a vendor receiving significant city funds, Buono’s contribution to a councilmember’s campaign could create the appearance of a pay-to-play scenario, where political donations might influence city contracts or payments. While the contribution is legal, the repeated business relationship between Munidex and the city warrants scrutiny to ensure transparency and prevent any perception of conflict of interest.</p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/434925">7/11/25 - $11,153.00</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/395534">2/20/24 - $11,153.00</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/85108">2/17/23 - $6,360.00</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/82744">1/6/23 - $17,499.00</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/73114">8/12/22 - $6,235.00</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/67909">5/5/22 - $17,500.00</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/65863">3/17/22 - $6,113.00</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/40872">1/11/21 - $5,760.00</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/17017">12/11/19 - $5,875.00</a></p>
        </div>
      )}
    </div>

    <div className="accordion-item">
      <button
        className={`accordion-header ${openIndex === 12 ? "active" : ""}`}
        onClick={() => toggleAccordion(12)}
        aria-expanded={openIndex === 12}
      >
        Rich Christie, President of Christie Engineering - $750
        <span className="accordion-arrow" />
      </button>
      {openIndex === 12 && (
        <div className="accordion-content">
          <p><a href="https://cityofjerseycity.civicweb.net/document/67367">4/22/22 - $9,600</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/51506">7/9/21 - $9,200.00</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/17017">12/11/19 - $1,440.00</a></p>
        </div>
      )}
    </div>

    <div className="accordion-item">
      <button
        className={`accordion-header ${openIndex === 13 ? "active" : ""}`}
        onClick={() => toggleAccordion(13)}
        aria-expanded={openIndex === 13}
      >
        Sean Gallagher - $300
        Anna Gallagher - $5,500
        <span className="accordion-arrow" />
      </button>
      {openIndex === 13 && (
        <div className="accordion-content">
          <p>The donation history of Sean Gallagher, the current Jersey City Clerk, and his spouse Anna Gallagher raises potential conflict-of-interest concerns for James Solomon’s mayoral campaign. Records show that Anna Gallagher, listed as “not employed” or “homemaker,” made several sizable contributions: $800 on 01/01/2023, $3,300 on 09/05/2024, and $1,400 on 03/31/2025, in addition to smaller donations. Sean Gallagher himself contributed $300 on 01/30/2024 while listed as an architect with DS+R. The fact that the sitting City Clerk, an official responsible for election administration and council records, is directly connected to a household contributing over $5,000 across multiple years could be perceived as problematic</p>
        </div>
      )}
    </div>

    <div className="accordion-item">
      <button
        className={`accordion-header ${openIndex === 14 ? "active" : ""}`}
        onClick={() => toggleAccordion(14)}
        aria-expanded={openIndex === 14}
      >
        Jillian Hernandez, Owner of the Brunswick School - $5,200
        <span className="accordion-arrow" />
      </button>
      {openIndex === 14 && (
        <div className="accordion-content">
          <p>Jillian Hernandez, owner of The Brunswick School in Jersey City, made two sizable contributions to a mayoral campaign in 2024 — $1,000 on March 21 and $4,200 on September 13 — while her school’s property at 444 Warren Street was simultaneously under environmental oversight. A letter dated August 19, 2024, from Ronald F. Dooney, Jr. of TERMS Environmental Services to Hernandez documented a Response Action Outcome (RAO) related to the site, which signifies the completion of environmental remediation under New Jersey DEP’s Site Remediation Program. The timing raises a red flag: Hernandez was both navigating regulatory compliance for her school and donating at levels that could be seen as attempting to build political goodwill with city leadership that often intersects with zoning, permitting, and development approvals. While there is no direct evidence of wrongdoing, the overlap between substantial campaign contributions and active environmental oversight highlights the potential risk of pay-to-play dynamics in Jersey City politics. <a href="https://cityofjerseycity.civicweb.net/document/411484">Letter 6.43 from September 25, 2024 Council Meeting.</a></p>
        </div>
      )}
    </div>

    <div className="accordion-item">
      <button
        className={`accordion-header ${openIndex === 15 ? "active" : ""}`}
        onClick={() => toggleAccordion(15)}
        aria-expanded={openIndex === 15}
      >
        Joseph Luppino, 1st st Vice President of Government and Business Banking - Freedom Bank - $1,000
        <span className="accordion-arrow" />
      </button>
      {openIndex === 15 && (
        <div className="accordion-content">
          <p>Joseph Luppino’s $1,000 donation to Solomon raises red flag concerns due to his former role as 1st Vice President of Government and Business Banking at Freedom Bank, an institution officially listed in Jersey City’s 2025 Cash Management Plan as a GUDPA-approved depository. The plan authorizes the city to deposit and invest public funds in banks like Freedom Bank, and it requires disclosure of any material business or personal relationships between city officials and entities handling city funds. Given Luppino’s senior position at a bank where city funds could be deposited or managed, his contribution to Solomon presents a potential conflict of interest or pay-to-play appearance, as it could be interpreted as attempting to influence the city’s financial decisions or maintain favorable access to city-managed funds. <a href="https://cityofjerseycity.civicweb.net/document/418911">Resolution related to Freedom Bank</a></p>

        </div>
      )}
    </div>

    <div className="accordion-item">
      <button
        className={`accordion-header ${openIndex === 16 ? "active" : ""}`}
        onClick={() => toggleAccordion(16)}
        aria-expanded={openIndex === 16}
      >
        Israel Nieves, McGreevey's Council At-Large Candidate - $500
        <span className="accordion-arrow" />
      </button>
      {openIndex === 16 && (
        <div className="accordion-content">
          <p>Israel Nieves, a member of Jim McGreevey’s council-at-large team, donated $500 to Solomon’s campaign, which raises a potential red flag. While legal, the donation creates the appearance of a conflict of interest or divided loyalty, as Nieves is publicly affiliated with a competing candidate. Such contributions can be interpreted as attempts to influence or maintain access across multiple campaigns, posing ethical concerns for Solomon’s team. For transparency and accountability, this donation warrants attention and disclosure in any summary of potential campaign red flags.</p>
        </div>
      )}
    </div>

    <div className="accordion-item">
      <button
        className={`accordion-header ${openIndex === 17 ? "active" : ""}`}
        onClick={() => toggleAccordion(17)}
        aria-expanded={openIndex === 17}
      >
        Marc Wesson, Treasurer of Jersey City Parks Coalition, and Partner of Tenmarc Building - $4,000
        <span className="accordion-arrow" />
      </button>
      {openIndex === 17 && (
        <div className="accordion-content">
          <p>The donations from Marc Wesson, a partner in the Tenmarc Building and treasurer of the Jersey City Parks Coalition, raise a significant red flag for Solomon’s campaign. The Tenmarc Building was specifically mentioned in the Planning Board’s resolution concerning Ordinance No. 20-103, which adopted amendments to the Morris Canal Redevelopment Plan, including the creation of the Berry Lane Park North Zone. The resolution noted that while some maps indicated the area as open space, existing structures—including the Tenmarc Building—were excluded from public acquisition and would remain privately owned. Wesson’s financial contributions could therefore be perceived as an attempt to influence city officials in matters affecting redevelopment projects near his property interests, particularly given the ordinance’s provisions for mixed-use development, public recreation space, and community-focused amenities. These connections create the appearance of a conflict of interest, making the donations a strong red flag. <a href="https://cityofjerseycity.civicweb.net/document/61998">Ordinance PDF (Tenmarc Building mentioned on pg 8)</a></p>
        </div>
      )}
    </div>

    <div className="accordion-item">
      <button
        className={`accordion-header ${openIndex === 18 ? "active" : ""}`}
        onClick={() => toggleAccordion(18)}
        aria-expanded={openIndex === 18}
      >
        Charles Wilkes - $500
        Matt Schiller - $250
        Chris Murphy - $250 
        MURPHY SCHILLER & WILKES LLP
        <span className="accordion-arrow" />
      </button>
      {openIndex === 18 && (
        <div className="accordion-content">
          <p>Charles Wilkes, Matt Schiller, and Chris Murphy collectively donated $1,000 to Councilmember James Solomon through their firm Murphy Schiller & Wilkes LLP, with individual contributions of $500, $250, and $250, respectively. Chris Murphy also acted as counsel for the applicant 660 Tonnele TMW, LLC in Jersey City Zoning Board of Adjustment case Z23-007, which sought variances and approvals for a Class 5 Cannabis Retail Establishment at 660-684 Tonnele Avenue. The overlap of Murphy’s professional work advocating for a development project before the city and his personal contributions to Solomon’s campaign raises concerns about a potential conflict of interest or the appearance of undue influence, especially given that the firm receives significant payments from Jersey City.</p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/409786">8/14/24 - $124,500.90</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/402589">5/8/24 - $105,367.50</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/89627">Resolution 23-362</a></p>
        </div>
      )}
    </div>

    <div className ="accordion-item">
      <button
        className={`accordion-header ${openIndex === 19 ? "active" : ""}`}
        onClick={() => toggleAccordion(19)}
        aria-expanded={openIndex === 19}
      >
        Anthony Catanio, Owner of Leemark Electrics - $500
        <span className="accordion-arrow" />
      </button>
      {openIndex === 19 && (
        <div className="accordion-content">
          <p>Leemark Electrics have done several projects in Jersey City relating lighting, power distribution, etc. Along with their projects, they have received expenditures from Jersey City and had received a contract in October 2020. The details are listed below.</p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/44186">$32,700 - 3/4/21</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/35805">Resolution PDF</a></p>
          <p><a href ="https://cityofjerseycity.civicweb.net/document/30560">$9,800 - 2/19/20</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/23359">$4,120 - 3/18/20</a></p>

        </div>
      )}
    </div>

    <div className ="accordion-item">
      <button
        className={`accordion-header ${openIndex === 20 ? "active" : ""}`}
        onClick={() => toggleAccordion(20)}
        aria-expanded={openIndex === 20}
      >
        Claims Resolution INC - $1,000
        <span className="accordion-arrow" />
      </button>
      {openIndex === 20 && (
        <div className="accordion-content">
          <p>The $1,000 donation from Claims Resolution, Inc. to Solomon is potentially a red flag because CRC is a recurring city contractor who receives large, multi-year payments for third-party administration of worker’s compensation and liability claims. When a vendor making substantial revenue from city contracts also contributes to an elected official’s campaign, it raises concerns about pay-to-play dynamics, where campaign contributions could influence contract awards or renewals. Even if legal, such contributions can create the appearance of a conflict of interest, especially since Solomon voted on multiple resolutions approving CRC’s contracts. This scenario warrants scrutiny to ensure that the contribution did not improperly affect procurement decisions or create a perceived obligation from the official.</p>
          <p><strong>Res 25-181 </strong>The City of Jersey City authorized payment of $212,499.96 to Claims Resolution Corporation, Inc. for providing third-party administrator services for worker’s compensation and liability claims from January through December 2024. James Carroll, representing the city, reviewed and certified that the services were performed as requested and that the charges were fair and reasonable. The payment will be made from Account No. 14-298-56-000-700 through the Insurance Fund Commission. The approval of the payment is contingent upon Claims Resolution Corporation executing a release and affidavit confirming that the submitted claim represents the total costs and releasing the city from any further liability. The Business Administrator is authorized to take any additional actions necessary to implement the resolution. Solomon votes yes to this resolution. <a href="https://cityofjerseycity.civicweb.net/document/422622">Resolution PDF</a></p>
          <p><strong>Res 25-184 </strong>The City of Jersey City ratified an Extraordinary Unspecifiable Services (EUS) contract with Claims Resolution Corporation, Inc. (CRC) to act as a third-party administrator for worker’s compensation and liability claims. The contract, effective January 1, 2025, is for one year at a total cost not exceeding $229,000, with the option to renew for up to two additional one-year terms. CRC will submit monthly reports detailing new, open, and closed claims, approved payables, loss runs, and invoices for services performed. The contract was awarded without competitive bidding under EUS provisions of the Local Public Contracts Law, and the award is subject to affirmative action compliance and budgetary availability. Notice of the award and the contract will be made publicly available, and $77,000 has been allocated from the 2025 budget for initial funding. Solomon votes yes to this resolution. <a href="https://cityofjerseycity.civicweb.net/document/422460">Resolution PDF</a></p>
          <p><strong>Res 23-063 </strong>The City of Jersey City authorized an Extraordinary Unspecifiable Services (EUS) contract with Claims Resolution Corporation, Inc. (CRC) to serve as a third-party administrator for worker’s compensation and liability claims. The contract, effective January 1, 2023, is for one year at a total cost not exceeding $212,500, paid in twelve equal monthly installments. CRC will provide monthly reports including new, open, and closed claims, approved payables, loss runs, and invoices for services performed. The contract was awarded without competitive bidding under EUS provisions of the Local Public Contracts Law, and compliance with affirmative action and the City’s Pay-to-Play Reform Ordinance is required. Notice of the award and the contract will be published publicly, and sufficient funds were certified to cover the cost of the services. Solomon voted yes to this resolution. <a href="https://cityofjerseycity.civicweb.net/document/81416">Resolution PDF</a></p>
          <p><strong>Res 22-713 </strong>The City of Jersey City approved a month-to-month extension of the contract with Claims Resolution Corporation, Inc. (CRC) to provide third-party administration (TPA) services for the city. The extension is effective September 1, 2022, for up to four months while the city updates its bid specifications. The total cost of the extension is capped at $74,503, with funds certified as available. This extension is authorized under New Jersey contract law and requires public notice of the change order. The resolution ensures continuity of TPA services without interruption during the rebidding process. Solomon voted yes to this resolution. <a href="https://cityofjerseycity.civicweb.net/document/73797">Resolution PDF</a></p>
          <p><strong>Res 21-671 </strong>The City of Jersey City approved the renewal of its contract with Claims Resolution Corporation, Inc. (CRC) to act as a third-party administrator for worker’s compensation and liability claims. This renewal is for one year, effective September 1, 2021, with a total contract amount of $223,509, paid in twelve equal monthly installments. The contract is classified as an Extraordinary Unspecifiable Service (EUS) and does not require competitive bidding. CRC is required to submit monthly reports detailing claims, approved payables, loss runs, and time spent on services. The contract is subject to compliance with Affirmative Action and Pay-to-Play regulations, and funds for the services are certified as available. Solomon voted yes to this resolution. <a href="https://cityofjerseycity.civicweb.net/document/53291">Resolution PDF</a></p>
          <p><strong>Res 20-699 </strong>The City of Jersey City approved the first renewal of its contract with Claims Resolution Corporation, Inc. (CRC) to act as a third-party administrator for worker’s compensation and liability claims. The renewed contract is for one year, effective September 1, 2020, with a total amount of $209,868, reflecting a 2.5% increase based on the Consumer Price Index. Payments are to be made in twelve equal monthly installments, and CRC is required to submit monthly reports detailing open claims, approved payables, loss runs, and services performed. The contract is classified as an Extraordinary Unspecifiable Service (EUS), exempt from competitive bidding, and must comply with Affirmative Action and Pay-to-Play regulations. Funds for the contract are certified as available, and the resolution and contract are to be made publicly accessible. Solomon voted yes to this resolution.<a href="https://cityofjerseycity.civicweb.net/document/31509">Resolution PDF</a></p>
          <p><strong>Res 19-0746 </strong>The City of Jersey City approved a one-year contract with Claims Resolution Corporation, Inc. (CRC) to act as a third-party administrator for worker’s compensation and liability claims, effective September 12, 2019. The contract is classified as an Extraordinary Unspecifiable Service (EUS), exempt from competitive bidding, and the total amount shall not exceed $203,750, with payments made in twelve equal monthly installments. CRC is required to submit monthly reports detailing open claims, approved payables, loss runs, and services performed. The vendor must comply with Affirmative Action and Pay-to-Play regulations, and the contract award and resolution must be publicly accessible. Funds of $68,250 are certified as available for the initial expenditure, with continuation dependent on future budget appropriations. Solomon voted yes to this resolution. <a href="https://cityofjerseycity.civicweb.net/document/12353">Resolution PDF</a></p>

        </div>
      )}
    </div>

    <div className = "accordion-item">
      <button
        className={`accordion-header ${openIndex === 21 ? "active" : ""}`}
        onClick={() => toggleAccordion(21)}
        aria-expanded={openIndex === 21}
      >
        Mark Grossbard, CEO of Kai Strategic Insurance and VP of Insurance World: $1,000
        <span className="accordion-arrow" />
      </button>
      {openIndex === 21 && (
        <div className="accordion-content">
          <p>Mark Grossbard, CEO of Kai Strategic Insurance Partners, personally donated $1,000 to Solomon’s campaign on 06/05/25. This donation is flagged because Kai Strategic has received substantial payments from Jersey City, including $1,568,074.46 on 10/16/24, $561,050.40 on 1/9/25, and $602,197.40 on 4/4/25. Even though the donation is technically personal, the timing and the size of city expenditures to his company suggest a potential conflict of interest, as the donation could be perceived as an attempt to influence Solomon in matters affecting Kai Strategic’s business with the city. This raises pay-to-play and ethical concerns, making it a red flag in campaign finance transparency analysis.</p>
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
        Paul Sartor, President and CEO of Paulus, Sokolowsky & Sartor - $1,000
        <span className="accordion-arrow" />
      </button>
      {openIndex === 22 && (
        <div className="accordion-content">
          <p>Mark Sartor, affiliated with Paulus, Sokolowski & Sartor (PS&S), donated $1,000 to Councilmember Solomon despite PS&S actively pursuing multiple city contracts. Notably, PS&S submitted a $710,400 bid for the HMR Architects City Hall Fourth Floor project (Res. 22-797), far above the winning bid of $367,500 by HMR Architects and other competitors such as DMR Architects ($307,270), The Goldstein Partnership ($309,900), LAN Associates ($325,000), and Clark Caton Hintz ($329,683). Additionally, PS&S submitted a $24,250 bid for electrical engineering services at Canco Park (Res. 22-421) and a $78,915 bid for window replacement and exterior repairs at the Joseph Connors Senior Center (Res. 20-213). This donation is a potential red flag because it comes from a firm with multiple active bids for city projects, suggesting a possible attempt to curry favor or influence municipal decisions, even when their bids were not successful. The combination of the donation and the firm’s vested interest in city contracts makes it politically sensitive and notable for transparency purposes.</p>
           <p><a href="https://cityofjerseycity.civicweb.net/document/77542">Resolution PDF (PS&S bidded $710,400.00)</a></p>
           <p><a href="https://cityofjerseycity.civicweb.net/document/67682">Resolution PDF (PS&S bidded $24,250.00)</a></p>
           <p><a href="https://cityofjerseycity.civicweb.net/document/22151">Resolution PDF (PS&S bidded $78,915.00)</a></p>
        </div>
      )}
    </div>

    <div className = "accordion-item">
      <button
        className={`accordion-header ${openIndex === 23 ? "active" : ""}`}
        onClick={() => toggleAccordion(23)}
        aria-expanded={openIndex === 23}
      >
        Donald Shauger II - $1,000
        Donal Shauger Sr. - $1,000
        <span className="accordion-arrow" />
      </button>
      {openIndex === 23 && (
        <div className="accordion-content">
          <p>Donald Shauger II and Donald Shauger Sr., executives of The Shauger Group Inc., each donated $1,000 to Councilmember Solomon on June 30, 2025. This is notable given the scope of their company’s work in Jersey City. Their projects include Phase V Water and Sewer Main Upgrades, involving the installation of 7,000 LF of 12-inch watermain, 4,000 LF of 8-inch watermain, new valves, hydrants, and service connections throughout Jersey City, as well as 11,000 LF of new PVC sewer main with associated manholes and cleanouts. They also carried out the Large Valve Replacement Project, replacing 30 of the most defective valves in the city’s water distribution system, which involved excavation, timber shoring, temporary bypass piping, and maintaining water service to residents during construction. The size and timing of these donations could raise concerns about potential influence or the appearance of a conflict of interest. <a href="https://shauger.com/major-projects">Shauger Group's Major Projects</a></p>
        </div>
      )}
    </div>






    

      {/* Add more items below in same pattern */}
    </section>

    <div className="other-candidates-section">
      <h2>Other Candidates</h2>
      <ul className="other-candidates-list">
        {otherCandidates
          .filter(c => c.name !== "James Solomon") // exclude current candidate
          .map(c => (
            <li key={c.name}>
              <Link to={c.path}>{c.name}</Link>
            </li>
        ))}
      </ul>
    </div>

      

      <div style={{ marginTop: "2rem", display: "flex", justifyContent: "space-between", flexWrap: "wrap" }}>
        <a href={`${backendUrl}/download/James_Solomon_combined_contributions.csv`} download className="btn-download">Download Full Contributions CSV</a>
        <a href="/" className="btn-return">Return to Home Page</a>
        <a href="https://www.njelecefilesearch.com/SearchContributionInteractive?eid=436752">View Full ELEC Records</a>
      </div>
    </div>
  );
}
