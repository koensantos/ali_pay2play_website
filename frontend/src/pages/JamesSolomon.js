import React, {useEffect, useState} from "react";
import { Pie, Bar } from "react-chartjs-2";
import "chart.js/auto";
import "./Draft.css";
import SolomonPhoto from "./img/solomon.jpg";

export default function Draft() {
  const [chartData, setChartData] = useState(null);
  const [topDonorsBarData, setTopDonorsBarData] = useState(null);
  const [topEmployersBarData, setTopEmployersBarData] = useState(null);
  const [donorSearchResults, setDonorSearchResults] = useState([]);
  const [donorHistory, setDonorHistory] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchStatus, setSearchStatus] = useState(null);
  const [totalDonations, setTotalDonations] = useState(null);

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
          "#E63946", "#1D3557", "#457B9D", "#000000", "#FFBE0B",
          "#FB8500", "#6A994E", "#9D4EDD", "#D62828", "#2A9D8F",
          "#B5838D", "#FF006E", "#8338EC", "#3A86FF"
        ];
        setChartData({
          labels,
          datasets: [{ data: values, backgroundColor: backgroundColors.slice(0, labels.length) }],
          total,
        });
      }).catch(console.error);
  }, []);

  useEffect(() => {
    fetch(`${backendUrl}/api/top_donors_bar/James_Solomon`)
      .then((res) => res.json())
      .then(setTopDonorsBarData)
      .catch(console.error);
  }, []);

  useEffect(() => {
    fetch(`${backendUrl}/api/top_employers_bar/James_Solomon`)
      .then((res) => res.json())
      .then(setTopEmployersBarData)
      .catch(console.error);
  }, []);

  useEffect(() => {
    fetch(`${backendUrl}/api/total_donations/James_Solomon`)
      .then(res => res.json())
      .then(data => {
        if (data.total_donations !== undefined) {
          setTotalDonations(data.total_donations);
        }
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
  return label.slice(0, maxLength - 1) + '…';
}


    const donorChartOptions = {
    indexAxis: "y",
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: {
        ticks: {
          callback: (value) => "$" + value.toLocaleString(),
        },
        beginAtZero: true,
      },
      y: {
        ticks: {
          callback: function(value) {
            const label = this.getLabelForValue(value);
            return truncateLabel(label);
          },
          font: { size: 12 },
          padding: 10
        },
        grid: { display: false },
      }
    }
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
        <p>This candidate has been flagged for having suspicious donations. <a href="#red-flags">Click here to view them.</a></p>
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
              <Bar data={topDonorsBarData} options={donorChartOptions} />
            ) : <p>Loading top donors...</p>}
          </div>
        </div>

        <div className="bar-chart">
          <h2>Top 10 Employer Donors</h2>
          <div className="chart-inner-wrapper">
            {topEmployersBarData ? (
              <Bar data={topEmployersBarData} options={donorChartOptions} />
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

      <section id="red-flags">
        <div style={{ marginTop: "3rem", padding: "1rem" }}>
          <h2>Red Flags</h2>
          <p>James Solomon has been flagged for suspicious donations listed below.</p>
          <ul>
            <li>RD Parisi Associates</li>
            <ul>
              <li>Solomon has received a total of $31,300 from donations from the company and Robert Parisi, the owner of RD Parisi Associates, and his wife. </li>
              <li>RD Parisi was voted in unanimously to replace Acrisure for providing Jersey City with insurance consulting services and to be the city's broker for obtaining and monitoring the city's health benefits, prescription, and stop-loss coverage. That vote occurred on and approved on October 17, 2024. Solomon has received two $5,200 on August 26, 2024, and on September 30, 2024. </li>
              <li>This information can be found on the 2024 pay2play contributions list on the NJ Elec website under "Team Soloman for JC." (That is not a typo. The link to the website is listed below.)</li>
              <li> <a href="https://www.elec.nj.gov/pay2play/quickdownload.html">Pay2Play Contributions Website</a></li>
            </ul>
            <li>Michael Oriani - Manager of William J Guarini INC</li>
              <ul>
                <li>Solomon has receieved a donation of $5,500 from Oriani on March 27, 2025. Due to his high position in the company, and that fact they have receveied contracts from Jersey City, it has been flagged as a suspicious donation.</li>
                <ul>
                  <li>
                    Res 24-335: The City of Jersey City approved Resolution 24-335 on May 8, 2024, authorizing a contract award of $120,000.00 to William J. Guarini, Inc. for citywide plumbing services. This contract was awarded through the New Jersey Cooperative Purchasing Alliance (NJCPA), Bergen County Coop, for the Department of Public Works, Division of Buildings and Street Maintenance. The contract term is effective from May 9, 2024, through December 31, 2024. Initial funding of $20,000.00 is available in the operating account, with the continuation of the contract subject to the availability of funds in the 2024 fiscal year permanent budget. <a href="cityofjerseycity.civicweb.net/document/82736/Contract%20to%20Adams,%20Rehmann%20_%20Heggan%20Associates,.pdf?handle=06787F11D0DB4932A30D9C6D6A3C8CA2">Resolution PDF</a>
                  </li>
                </ul>
              </ul>
            <li>Wilentz, Goldman, and Spitzer</li>
              <ul>
                <li>
                  Solomon has received a total of $5,200 from Wilentz, Goldman, and Spitzer, a law firm that has been awarded multiple contracts by the city below. The law firm has been awarded contracts for bond counsel services, which amounts to upwards of $270,000 in total.
                  <ul>
                    <li>Res 24-577 - The Jersey City Municipal Council approved a resolution to amend its professional services agreement with Wilentz, Goldman & Spitzer, P.A., which provides bond counsel services to the city. The original contract, approved in November 2023, was for $185,000, but all funds have been expended. This amendment increases the contract by $85,000, bringing the total to $270,000, in order to cover outstanding invoices. The contract was awarded under the fair and open provisions of New Jersey’s Pay-to-Play law and qualifies as a professional service exempt from public bidding. <a href="https://cityofjerseycity.civicweb.net/document/412367/2024%20HB%20Broker.pdf?handle=9FAFFD5E27DF4EBF9E066D8479D118F4"> Resolution PDF</a></li>
                    <li>Res 23-581 - This resolution authorizes the City of Jersey City to enter into a professional services agreement with Wilentz, Goldman & Spitzer, P.A. to serve as bond counsel. The firm will provide legal services related to the authorization, issuance, sale, and delivery of City bonds, notes, and other obligations. The agreement is effective from October 1, 2023, to September 30, 2024, with a total contract amount not exceeding $185,000. The services were procured under the "fair and open" provisions of the "Pay to Play Law" and are exempt from public bidding as professional services.<a href="https://cityofjerseycity.civicweb.net/document/218840/Professional%20Services%20Agreement%20with%20Wilentz,%20G.pdf?handle=DC62C9EEE25944C1BD428E404A6BA9D1"> Resolution PDF</a></li>
                  </ul>
                </li>
              </ul>
            <li>Boswell Engineering</li>
              <ul>
                <li>Solomon has received a donation of $2,500 from the company on April 23, 2025. They hold several contracts around New Jersey, and have been involved in several projects in Hoboken. They were also awarded a contract in 2020 listed below, which Solomon voted Yes to.</li>
                  <li>The Jersey City Municipal Council approved a resolution to award a $73,500 professional engineering services contract to Boswell Engineering, Inc. for the Grand Street Improvements project (No. 19-014-E). The firm was selected based on its qualifications and compliance with the city's Pay-to-Play and political contribution disclosure regulations. The contract will run for 12 months and is exempt from public bidding under New Jersey law for professional services. Funds for the project are available from account #04-215-55-151-990, and all required compliance and disclosure certifications will be filed with the resolution. The award must be publicly announced within 10 days. <a href="https://cityofjerseycity.civicweb.net/document/34505/Resolution%20Awarding%20a%20Professional%20Services%20Con.pdf?handle=C23EDB7B40904F9DBBAB8254A67B2500" >Resolution</a></li>
              </ul>
            <li>Adams Rehmann & Heggan Associates INC</li>
              <ul>
                <li>Solomon has received a $5,000 donation from the company on March 27, 2025. This company has been awareded several contracts to maintain digital tax maps. The resolutions are explained below:</li>
                <ul>
                  <li>Res 25-086: The Jersey City Council approved Resolution 25-086 on January 29, 2025, awarding a $165,975 contract to Adams, Rehmann & Heggan Associates, Inc. (doing business as Civil Solutions) for digital tax map maintenance and the creation of a comprehensive address point layer. The contract is exempt from public bidding under N.J.S.A. 40A:11-5(1)(d) because it involves furnishing tax maps. Civil Solutions submitted all required political contribution and pay-to-play compliance certifications, confirming no recent reportable contributions to local political campaigns. $20,000 in funds are available from the 2025 temporary budget to begin the work, with future payments contingent on funding in the permanent and subsequent budgets. The contract will last up to 12 months, and payments will be made upon confirmation that services have been delivered as specified. <a href="https://cityofjerseycity.civicweb.net/document/419266/Resolution%20to%20perform%20Digital%20Tax%20Map%20Maintenan.pdf?handle=B6B6D8FBEBA34C9C8482B9EF9F73B355">Resolution PDF</a></li>
                  <li>Res 24-057: The City of Jersey City approved Resolution 24-057 on February 7, 2024, awarding a contract to Adams, Rehmann & Heggan Associates, Inc. T/A Civil Solutions for digital tax map maintenance. This contract, not exceeding $165,975.00, is for a twelve-month period, effective from February 7, 2024, to February 6, 2025. The firm will update and maintain the City's official digital tax maps, create a comprehensive address point layer, and provide a web-based system for tracking map changes. This work is vital for property identification, assessment, zoning, and construction purposes, ensuring compliance with various local and state regulations. <a href="https://cityofjerseycity.civicweb.net/document/391047/Contract%20to%20Adams,%20Rehmann%20_%20Heggan%20Associates,.pdf?handle=277065F4CD1D41E1BC3C56089FBC97A2">Resolution PDF</a></li>
                  <li>Res 23-037: This resolution from the City of Jersey City awards a contract to Adams, Rehmann, Heggan Associates, Inc. T/A Civil Solutions for digital tax map maintenance. The City's digital tax maps are crucial for identifying properties, synchronizing assessment data, and supporting zoning and construction purposes. The contract, awarded without public bidding as authorized by N.J.S.A. 40A:11-5(1)(d) , is for a total amount not exceeding $165,975.00 and will last for twelve months from the award date. The services include updating tax maps and creating a comprehensive address point layer. The resolution emphasizes compliance with "Pay-to-Play" regulations and affirmative action requirements, with funds of $20,000.00 available in the temporary budget for the 2023 fiscal year. <a href="https://cityofjerseycity.civicweb.net/document/82736/Contract%20to%20Adams,%20Rehmann%20_%20Heggan%20Associates,.pdf?handle=06787F11D0DB4932A30D9C6D6A3C8CA2">Resolution PDf</a></li>
                  <li>Res 22-461: This resolution from the City of Jersey City awards a contract to Adams, Rehmann & Heggan Associates, Inc. T/A Civil Solutions for digital tax map maintenance. The firm will update the city's certified digital tax maps and create a comprehensive address point layer, which are essential for identifying properties, zoning, and construction purposes. The contract amount is not to exceed $219,825.00 and was awarded without public bidding as it falls under the furnishing of tax maps, as authorized by N.J.S.A. 40A:11-5(1)(d). The resolution, approved on June 29, 2022, also includes requirements for compliance with "Pay-to-Play" regulations, including business registration. <a href="cityofjerseycity.civicweb.net/document/82736/Contract%20to%20Adams,%20Rehmann%20_%20Heggan%20Associates,.pdf?handle=06787F11D0DB4932A30D9C6D6A3C8CA2">Resolution PDF</a></li>
                  <li>Res 19-582 (Cannot Access)</li>
                </ul>
    
              </ul>
            <li>Anthony Grano, Owner of Persistent Construction Corp</li>
              <ul>
                <li>Solomon received a donation of $2,000 from Anthony Grano on March 27, 2025. Persistent Construction Corp has received multiple contracts from Jersey City listed below.</li>
                <ul>
                  <li>Res 24-859: The City of Jersey City has renewed an open-end contract with Persistent Construction, Inc. for snow removal services for the Department of Public Works, Division of Sanitation. This renewal, approved on November 26, 2024, is for an additional one-year period effective from January 1, 2025, to December 31, 2025. The total cost of this renewed contract will not exceed $1,130,370.00, with an initial allocation of $10,000.00 from the Division of Sanitation Operating Account. <a href="https://cityofjerseycity.civicweb.net/document/413259/R0210559_%20Renewal%201_1%20for%20Snow%20Removal%20Only.pdf?handle=EE9FDAD333FA488CBBBAF537DB24F84A">Resolution PDF</a></li>
                  <li>Res 23-931: On December 13, 2023, Jersey City approved Resolution 23-931, awarding a one-year open-end contract to Persistent Construction Inc. for snow removal services for the Department of Public Works, Division of Sanitation. The contract is valued at $1,102,800.00, with an initial encumbrance of $10,000.00 from the 2024 operating budget. The agreement includes set unit costs and allows for an optional one-year extension. The contract is contingent on compliance with affirmative action requirements and the availability of future budget appropriations. Payments will be made only upon certified completion of services according to specifications. <a href="cityofjerseycity.civicweb.net/document/413259/R0210559_%20Renewal%201_1%20for%20Snow%20Removal%20Only.pdf?handle=EE9FDAD333FA488CBBBAF537DB24F84A">Resolution PDF</a></li>
                  <li>Res 21-334: The City of Jersey City ratified an emergency contract with Persistent Construction, Inc. for $24,000.00 to build six parklets across the city. This initiative aimed to create outdoor spaces for small businesses and residents for social distancing and reopening efforts during the COVID-19 pandemic. The contract was awarded as an emergency measure, exempting it from public bidding requirements. Brian D. Platt, the then Business Administrator, issued an emergency certification on October 17, 2020, formally authorizing the parklet construction due to the public health emergency. Paul Russo, the Municipal Engineer, certified that the services rendered by Persistent Construction, Inc. were fair and reasonable.<a href="https://cityofjerseycity.civicweb.net/document/46245/Resolution%20ratifying%20an%20emergency%20contract%20awar.pdf?handle=91AC5DC128344431A12830A6261832AD">Resolution PDF</a></li>
                </ul>
              </ul>
            <li>Antonelli Kantor Rivera</li>
              <ul>
                <li>The company has donated $3,750, along with several other attorneys/partners that have donated small amounts. Jersey City has given them a contract in 2024 listed below.</li>
                <ul>
                  <li>Res 24-412: This resolution from the City of Jersey City ratifies a professional services agreement with the law firm Antonelli Kantor Rivera. The firm will represent Paul Tamburelli in the case of "Synea Hicks v. City of Jersey City et al.". The contract is for a one-year term, effective from January 1, 2024, with a total amount not to exceed $30,000.00, including expenses, at an hourly rate of $175.00. The resolution was approved on May 22, 2024<a href="https://cityofjerseycity.civicweb.net/document/402028/Ratifying%20a%20professional%20services%20agreement%20wit.pdf?handle=9B13DF77BC3D428E9E9E99B86C07B524">Resolution PDF</a></li>
                </ul>
              </ul>
            </ul>
        </div>
      </section>

      <div style={{ marginTop: "2rem", display: "flex", justifyContent: "space-between", flexWrap: "wrap" }}>
        <a href={`${backendUrl}/download/James_Solomon_combined_contributions.csv`} download className="btn-download">Download Full Contributions CSV</a>
        <a href="/" className="btn-return">Return to Home Page</a>
        <a href="https://www.njelecefilesearch.com/SearchContributionInteractive?eid=454445">View Full ELEC Records</a>
      </div>
    </div>
  );
}
