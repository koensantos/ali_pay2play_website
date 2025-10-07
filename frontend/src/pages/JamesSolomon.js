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
    { name: "Joyce Watterman", path: "/JoyceWatterman"},
    { name: "Transparency Dashboard", path: "/comparison" }
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
      <div className="sticky-label">
        <p><a href="https://www.ali2025.com/paytoplay">This website is part of the Ali2025 Pay2Play Pledge</a></p>
      </div>

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

      <h1>James Solomon: Campaign Finance Visuals</h1>

      {totalDonations !== null && (
        <div className="total-donations-panel">
          <h2>Total Donations</h2>
          <p>${totalDonations.toLocaleString()}</p>
        </div>
      )}

      <div className="red-flag-warning">
        <p>
          This candidate has been flagged for having suspicious donations, totaling to $142,220.{" "}
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
    James Solomon’s campaign stresses his independence and opposition to corruption, citing tax breaks for luxury developers and politically-connected contracts as examples of what he opposes. He contrasts himself with rivals, claiming developers and political figures have funneled $424,905 into their campaigns. However, his own campaign has accepted $141,720 from at least 24 donors considered high-risk for conflicts of interest. This contradiction weakens his anti-corruption message and raises concerns about pay-to-play politics and his true commitment to reform.      </p>

      {/* Accordion item 0 */}
      <div className="accordion-item">
        <button
          className={`accordion-header ${openIndex === 0 ? "active" : ""}`}
          onClick={() => toggleAccordion(0)}
          aria-expanded={openIndex === 0}
        >
          Robert Parisi - $5,000
          Rob Parisi, Owner of RD Parisi Associates - $30,200
          Sheila Parisi - $5,200
          RD Parisi Associates - $20,400
          <span className="accordion-arrow" />
        </button>
        {openIndex === 0 && (
          <div className="accordion-content">
            <p>
              Solomon has accepted a total of $60,800 in contributions from Robert Parisi, owner of RD Parisi Associates, his wife Sheila Parisi, and the firm itself. RD Parisi Associates was unanimously approved by the Jersey City Council on October 17, 2024, to replace Acrisure as the city’s insurance consultant and to act as the broker for health benefits, prescription coverage, and stop-loss insurance. Notably, Solomon’s campaign reported receiving two maximum individual contributions of $5,200 from the Parisis just weeks earlier, on August 26, 2024, and September 30, 2024. This sequence raises a serious pay-to-play red flag, as the donations coincided with the firm securing a lucrative city contract. Such timing creates the appearance of potential influence and undermines Solomon’s public pledge to reject developer and politically connected money. Documentation of the two mentioned donations is publicly available on the 2024 Pay-to-Play contributions list on the NJ ELEC website under “Team Soloman for JC”.
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
            <p><a href="https://cityofjerseycity.civicweb.net/document/436252">8/20/25 - $37,000</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/434925">7/11/25 - $37,000</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/434179">6/20/25 - $37,000</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/429486">5/2/25 - $37,000</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/427629">4/17/25 - $74,000</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/424296">3/7/25 - $37,000</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/421779">2/7/25 - $74,000</a></p>
            <p><strong>Res 24-776 </strong>The Jersey City Council passed Resolution 24-776 on October 17, 2024, awarding RD Parisi Associates a one-year, $440,000 contract to serve as the city’s broker of record for health benefits, prescription coverage, and stop-loss insurance. The contract was awarded as an Extraordinary Unspecifiable Service (EUS) under New Jersey’s Local Public Contracts Law, following a Request for Quotations (RFQ) process. The agreement allows the city to renew the contract for up to two additional one-year terms. RD Parisi certified compliance with the city’s Pay-to-Play Reform Ordinance by stating it had not made reportable political contributions in the year prior to the award. The resolution also requires public notice of the award, compliance with affirmative action laws, and continued funding approval in future budgets. Solomon voted yes on this resolution.<a href="https://cityofjerseycity.civicweb.net/document/412367">Resolution PDF</a></p>

          </div>
        )}
      </div>

      <div className="accordion-item">
        <button
          className={`accordion-header ${openIndex === 1 ? "active" : ""}`}
          onClick={() => toggleAccordion(1)}
          aria-expanded={openIndex === 1}
        >
          Florio Kenny Raval, LLP - $5,000
          <span className="accordion-arrow" />
        </button>
        {openIndex === 1 && (
          <div className="accordion-content">
            <p>
            Solomon has received a total of $5,000 connected to Florio Kenny Raval, LLPWhile the dollar amounts may not be the largest compared to other donors, the concern arises because Florio Kenny Raval has secured numerous lucrative contracts with Jersey City, including multimillion-dollar agreements to represent the City in tax appeals and high-profile litigation involving police officers and civil rights cases. These contracts have been repeatedly renewed and expanded over the years, with individual amendments often adding tens or hundreds of thousands of dollars in legal fees. In addition to the resolutions, the firm has also received a steady stream of direct payments from the City for legal services. The overlap between campaign donations and significant ongoing city business creates the appearance of a conflict of interest and raises potential pay-to-play concerns.
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

      {/* Accordion item 1 */}
      <div className="accordion-item">
        <button
          className={`accordion-header ${openIndex === 2 ? "active" : ""}`}
          onClick={() => toggleAccordion(2)}
          aria-expanded={openIndex === 2}
        >
          Michael Oriani - Manager of William J Guarini INC - $5,500
          William Guarini - $500
          <span className="accordion-arrow" />
        </button>
        {openIndex === 2 && (
          <div className="accordion-content">
            <p>
              On March 27, 2025, Solomon received a $5,500 contribution from Oriani, a manager at William Guarini, Inc., followed by a $500 donation from William Guarini, Inc. itself on May 21, 2025. The company has been awarded contracts with the City of Jersey City, making the timing and source of these donations particularly troubling. The fact that both a senior executive and the company he manages contributed directly to Solomon’s campaign while holding active business with the city raises clear red flags of potential pay-to-play influence.
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

            </p>
          </div>
        )}
      </div>

      {/* Accordion item 2 */}
      <div className="accordion-item">
        <button
          className={`accordion-header ${openIndex === 3 ? "active" : ""}`}
          onClick={() => toggleAccordion(3)}
          aria-expanded={openIndex === 3}
        >
          Wilentz, Goldman, and Spitzer - $5,200
          Everett Johnson, co-chair of Public Finance Team - $1,500
          <span className="accordion-arrow" />
        </button>
        {openIndex === 3 && (
          <div className="accordion-content">
            <p>
              Solomon has received a total of <strong>$1,500 from Everett Johnson</strong>, a shareholder and co-chair of the Public Finance Team at Wilentz, Goldman & Spitzer, as well as <strong>$5,200 directly from the firm</strong>. Wilentz, Goldman & Spitzer has been awarded multiple professional services agreements with Jersey City to serve as bond counsel, with contract amounts reaching well over <strong>$270,000</strong>. Given that both a top executive of the firm and the firm itself contributed to Solomon’s campaign while holding lucrative city contracts, these donations raise significant concerns about potential pay-to-play influence.
            </p>

            <ul>
              <li>
                Res 25-554 - On August 20, 2025, Jersey City approved Resolution 25-544, awarding a one-year professional services contract to Wilentz, Goldman & Spitzer, P.A. to serve as bond counsel. The firm will handle legal work for the issuance, sale, and delivery of city bonds, notes, refundings, and related financing matters. The contract runs from August 1, 2025 to July 31, 2026 and is capped at $200,000, with $100,000 already allocated. Fees include flat charges for bond sales and ordinances, plus hourly billing rates of $250/hr for attorneys and $90/hr for paralegals, with higher rates for redevelopment projects. The contract was awarded through a fair and open RFQ process, exempt from public bidding under New Jersey’s Local Public Contract Law. Solomon did not vote for this. <a href="https://cityofjerseycity.civicweb.net/document/435603">Resolution PDF</a>
              </li>
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
            <p><a href="https://cityofjerseycity.civicweb.net/document/419239">1/14/25 - $165,334.20</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/414090">11/14/24 - $76,693.73</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/394848">2/7/24 - $179,614.00</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/96129">8/16/23 - $74,522.31</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/81004">11/23/22 - $160,827.62</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/40872">1/11/21 - $3,220</a></p>
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
        Adams Rehmann & Heggan Associates INC - $5,000
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
              <li>Res 19-582 : The City of Jersey City passed a resolution awarding a $149,900 contract to Adams, Rehmann & Heggan Associates, Inc. (Civil Solutions) to perform digital tax map maintenance. State law requires that the City’s certified tax maps, originally approved in 2009, be maintained in digital format to preserve their usefulness. The contract was awarded without public bidding under N.J.S.A. 40A:11-5(1)(d), which permits direct contracting for tax map services, and in compliance with New Jersey’s Pay-to-Play law. Civil Solutions submitted all required certifications, including political contribution disclosures, confirming they had made no reportable contributions to Jersey City officials in the past year. The initial $40,000 in funds will come from the 2019 temporary budget, with the remainder subject to appropriations in the permanent and subsequent budgets <a href="https://cityofjerseycity.civicweb.net/document/9281">Resolution PDF</a></li>
            </ul>
          </ul>
          <p><a href="https://cityofjerseycity.civicweb.net/document/436252">8/14/25 - $13,046.25</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/434925">7/11/25 - $23,966.25</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/426925">4/4/25 - $8,737</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/418957">1/9/25 - $3,952.72</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/416983">12/6/24 - $12,120.88</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/415425">11/22/24 - $5,291.55</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/413799">11/8/24 - $11,939.10</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/411476">9/19/24 - $32,410</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/404397">6/7/24 - $13,049.50</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/403052">5/17/24 - $9,958.50</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/400554">4/22/24 - $8,329</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/397144">3/18/24 - $6,276</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/390968">1/8/24 - $11,317</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/390093">12/11/23 - $17,042.50</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/357072">11/6/23 - $47,179.50</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/242953">10/5/23 - $12,215</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/94298">7/7/23 - $24,102.25</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/91602">5/19/23 - $17,679.25</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/90508">5/8/23 - $20,147.50</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/83495">1/20/23 - $24,176</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/82744">1/6/23 - $84,537</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/77318">10/11/22 - $15,567</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/61646">1/6/22 - $69,604.50</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/50909">6/25/21 - $21,248</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/47945">5/7/21 - $38,293.50</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/43026">2/9/21 - $10,370</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/40872">1/11/21 - $10,334</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/39624">12/10/20 - $26,661.55</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/19070">1/15/20 - $11,290.80</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/16087">11/26/19 - $15,421.92</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/15268">11/7/19 - $24,480</a></p>

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
    Anthony Grano, Owner of Persistent Construction Corp - $2,000
    <span className="accordion-arrow" />
  </button>
  {openIndex === 5 && (
    <div className="accordion-content">
      <p>
  Anthony Grano, the owner of Persistent Construction Corp, contributed $2,000 to the campaign. This donation raises concerns because Persistent Construction has been a frequent recipient of lucrative Jersey City contracts, including multi-million dollar snow removal agreements (Res 24-859 and Res 23-931), an emergency $24,000 parklet construction contract during COVID-19 (Res 21-334), and a $1.16 million award for the Citywide Speed Humps Project (Res 19-152). In addition to these large-scale projects, the company has repeatedly received substantial payments from the City, ranging from $8,000 to nearly $350,000 for various construction and public works services. The company’s consistent stream of city-funded projects, combined with political contributions from its owner, creates the appearance of a potential pay-to-play relationship. These facts warrant closer scrutiny to ensure public contracting decisions are being made transparently and in the public interest.
</p>
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
          <li>
            Res 19-152: The City of Jersey City originally awarded the 2018 Citywide Speed Humps Project contract to Diamond Construction, but the company refused to proceed, claiming the bid specifications lacked necessary information. Since the bid award period had not expired, the City rescinded Diamond’s contract and awarded it instead to the second-lowest bidder, Persistent Construction Inc., for $1,163,500. The Purchasing Director certified that Persistent’s bid was fair and reasonable. Funding for the contract, including a $232,700 contingency, was confirmed as available in the City’s capital accounts, totaling $1,396,200. The resolution authorized the Mayor or Business Administrator to execute the contract, contingent on compliance with affirmative action and anti-discrimination requirements.
            <a href="https://cityofjerseycity.civicweb.net/document/7925">Resolution PDF (pg 73)</a>
          </li>
        </ul>
      </ul>
      <p><a href="https://cityofjerseycity.civicweb.net/document/409634">8/12/24 - $9,980.69</a></p>
      <p><a href="https://cityofjerseycity.civicweb.net/document/406617">6/24/24 - $107,996</a></p>
      <p><a href="https://cityofjerseycity.civicweb.net/document/403052">5/17/24 - $22,652.70</a></p>
      <p><a href="https://cityofjerseycity.civicweb.net/document/400554">4/22/24 - $349,920.47</a></p>
      <p><a href="https://cityofjerseycity.civicweb.net/document/397144">3/18/24 - $8,484.84</a></p>
      <p><a href="https://cityofjerseycity.civicweb.net/document/48496">5/21/21 - $24,000</a></p>
      <p><a href="https://cityofjerseycity.civicweb.net/document/48496">7/9/20 - $90,414.55</a></p>
      <p><a href="https://cityofjerseycity.civicweb.net/document/24237">3/31/20 - $105,842.47</a></p>
      <p><a href="https://cityofjerseycity.civicweb.net/document/22804">3/3/20 - $36,442.88</a></p>
      <p><a href="https://cityofjerseycity.civicweb.net/document/20322">2/4/20 - $257,337.85</a></p>
      <p><a href="https://cityofjerseycity.civicweb.net/document/17964">1/6/20 - $258,796.44</a></p>
      <p><a href="https://cityofjerseycity.civicweb.net/document/15268">11/7/19 - $229,713.84</a></p>
      <p><a href="https://cityofjerseycity.civicweb.net/document/12926">9/17/19 - $249,251.24</a></p>
      <p><a href="https://cityofjerseycity.civicweb.net/document/11373">9/3/19 - $168,400.63</a></p>

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
    John Burke, Partner - $500
    Madelaine Hicks, Partner - $1,050
    Ramon Rivera, Shareholder/Partner - $1,000
    Larry Teijido, Associate Attorney - $400
    Antonelli Kantor Rivera, PC - $3,750
    <span className="accordion-arrow" />
  </button>
  {openIndex === 6 && (
    <div className="accordion-content">
      <ul>
        <li>
        <p>
  Attorneys and partners from Antonelli Kantor Rivera, PC collectively donated over $7,500 between late 2024 and mid-2025, including contributions from John Burke ($500), Madelaine Hicks ($1,600 total across multiple donations), Ramon Rivera ($1,000), and Larry Teijido ($400 total), in addition to corporate contributions from the firm itself totaling $3,750 in 2024 and more than $3,700 in 2025. Despite these donations, the firm secured a professional services agreement with Jersey City in 2024 (Res 24-412), worth up to $30,000, to represent city officials in litigation. Additional payments to the firm in 2024–2025, including invoices of $3,080.60, $30.96, and $1,072.50, further highlight the financial relationship between the City and the law firm. The overlap of campaign contributions from multiple partners and subsequent city contracts creates the appearance of potential conflicts of interest and underscores the need for transparency in awarding legal service agreements.
        </p>
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

      <p><a href="https://cityofjerseycity.civicweb.net/document/418957">1/9/25 - $1,072.50</a></p>
      <p><a href="https://cityofjerseycity.civicweb.net/document/411476">9/19/24 - $30.96</a></p>
      <p><a href="https://cityofjerseycity.civicweb.net/document/405701">6/12/24 - $3,080.60</a></p>

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
          <p>The donations from Waters, McPherson, McNeil P.C. to  James Solomon and other Jersey City candidates raise potential red flags due to the firm’s direct financial and business interests with the city, as well as the timing of these contributions. The law firm represents Honeywell International Inc. in environmental remediation projects affecting public rights-of-way in Jersey City, including the execution and termination of Notices in Lieu of Deed Notices, such as the resolution approving the updated NILODN for Fisk Street and other ROWs in July 2024 (<a href="https://cityofjerseycity.civicweb.net/document/406670">Resolution PDF</a>). Additionally, the firm has historically represented developers in high-value waterfront redevelopment projects in the city (<a href="https://www.lawwmm.com/HudsonRiverRedev.asp">Waters, McPherson, McNeil Hudson River Waterfront Redevelopment</a>). The firm has also received substantial payments from the city itself, including $448,690.70 (<a href="https://cityofjerseycity.civicweb.net/document/436252">8/14/25</a>), $338,281.63 (<a href="https://cityofjerseycity.civicweb.net/document/403052">5/14/25</a>), $26,852.32 (<a href="https://cityofjerseycity.civicweb.net/document/387879">11/22/23</a>) $11,510.03 (<a href="https://cityofjerseycity.civicweb.net/document/95854">8/11/2023</a>). This creates a perception of pay-to-play where the donations could influence officials overseeing matters directly affecting the firm’s clients. While no direct quid pro quo is proven, the overlap of campaign contributions with public decisions and city payments involving the firm constitutes a potential pay-to-play concern and represents a red flag for regulatory or ethical scrutiny.</p>
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
        className={`accordion-header ${openIndex === 9 ? "active" : ""}`}
        onClick={() => toggleAccordion(9)}
        aria-expanded={openIndex === 9}
      >
        Vincent Buono, President of Munidex INC - $1,000
        <span className="accordion-arrow" />
      </button>
      {openIndex === 9 && (
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
        className={`accordion-header ${openIndex === 10 ? "active" : ""}`}
        onClick={() => toggleAccordion(10)}
        aria-expanded={openIndex === 10}
      >
        Sean Gallagher - $300
        Anna Gallagher - $5,500
        <span className="accordion-arrow" />
      </button>
      {openIndex === 10 && (
        <div className="accordion-content">
          <p>The donation history of Sean Gallagher, the current Jersey City Clerk, and his spouse Anna Gallagher raises potential conflict-of-interest concerns for James Solomon’s mayoral campaign. Records show that Anna Gallagher, listed as “not employed” or “homemaker,” made several sizable contributions: $800 on 01/01/2023, $3,300 on 09/05/2024, and $1,400 on 03/31/2025, in addition to smaller donations. Sean Gallagher himself contributed $300 on 01/30/2024 while listed as an architect with DS+R. The fact that the sitting City Clerk, an official responsible for election administration and council records, is directly connected to a household contributing over $5,000 across multiple years could be perceived as problematic</p>
        </div>
      )}
    </div>

    <div className="accordion-item">
      <button
        className={`accordion-header ${openIndex === 11 ? "active" : ""}`}
        onClick={() => toggleAccordion(11)}
        aria-expanded={openIndex === 11}
      >
        Jillian Hernandez, Owner of the Brunswick School - $8,200
        <span className="accordion-arrow" />
      </button>
      {openIndex === 11 && (
        <div className="accordion-content">
          <p>Jillian Hernandez, owner of The Brunswick School in Jersey City, made two sizable contributions to a mayoral campaign in 2024, $1,000 on March 21, 2024 and $4,200 on September 13, 2024, while her school’s property at 444 Warren Street was simultaneously under environmental oversight. A letter dated August 19, 2024, from Ronald F. Dooney, Jr. of TERMS Environmental Services to Hernandez documented a Response Action Outcome (RAO) related to the site, which signifies the completion of environmental remediation under New Jersey DEP’s Site Remediation Program. The timing raises a red flag: Hernandez was both navigating regulatory compliance for her school and donating at levels that could be seen as attempting to build political goodwill with city leadership that often intersects with zoning, permitting, and development approvals. While there is no direct evidence of wrongdoing, the overlap between substantial campaign contributions and active environmental oversight highlights the potential risk of pay-to-play dynamics in Jersey City politics. <a href="https://cityofjerseycity.civicweb.net/document/411484">Letter 6.43 from September 25, 2024 Council Meeting.</a></p>
        </div>
      )}
    </div>

    <div className="accordion-item">
      <button
        className={`accordion-header ${openIndex === 12 ? "active" : ""}`}
        onClick={() => toggleAccordion(12)}
        aria-expanded={openIndex === 12}
      >
        Joseph Luppino, 1st Vice President of Government and Business Banking - Freedom Bank - $1,000
        <span className="accordion-arrow" />
      </button>
      {openIndex === 12 && (
        <div className="accordion-content">
          <p>Joseph Luppino’s $1,000 donation to Solomon raises red flag concerns due to his former role as 1st Vice President of Government and Business Banking at Freedom Bank, an institution officially listed in Jersey City’s 2025 Cash Management Plan as a GUDPA-approved depository. The plan authorizes the city to deposit and invest public funds in banks like Freedom Bank, and it requires disclosure of any material business or personal relationships between city officials and entities handling city funds. Given Luppino’s senior position at a bank where city funds could be deposited or managed, his contribution to Solomon presents a potential conflict of interest or pay-to-play appearance, as it could be interpreted as attempting to influence the city’s financial decisions or maintain favorable access to city-managed funds. <a href="https://cityofjerseycity.civicweb.net/document/418911">Resolution related to Freedom Bank</a></p>

        </div>
      )}
    </div>

    <div className="accordion-item">
      <button
        className={`accordion-header ${openIndex === 13 ? "active" : ""}`}
        onClick={() => toggleAccordion(13)}
        aria-expanded={openIndex === 13}
      >
        Israel Nieves, McGreevey's Council At-Large Candidate - $500
        <span className="accordion-arrow" />
      </button>
      {openIndex === 13 && (
        <div className="accordion-content">
          <p>Israel Nieves, a member of Jim McGreevey’s council-at-large team, donated $500 to Solomon’s campaign, which raises a potential red flag. While legal, the donation creates the appearance of a conflict of interest or divided loyalty, as Nieves is publicly affiliated with a competing candidate. Such contributions can be interpreted as attempts to influence or maintain access across multiple campaigns, posing ethical concerns for Solomon’s team. For transparency and accountability, this donation warrants attention and disclosure in any summary of potential campaign red flags.</p>
        </div>
      )}
    </div>

    <div className="accordion-item">
      <button
        className={`accordion-header ${openIndex === 14 ? "active" : ""}`}
        onClick={() => toggleAccordion(14)}
        aria-expanded={openIndex === 14}
      >
        Charles Wilkes - $500
        Matt Schiller - $250
        Chris Murphy - $250 
        MURPHY SCHILLER & WILKES LLP
        <span className="accordion-arrow" />
      </button>
      {openIndex === 14 && (
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
        className={`accordion-header ${openIndex === 15 ? "active" : ""}`}
        onClick={() => toggleAccordion(15)}
        aria-expanded={openIndex === 15}
      >
        Claims Resolution INC - $1,000
        <span className="accordion-arrow" />
      </button>
      {openIndex === 15 && (
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
        className={`accordion-header ${openIndex === 16 ? "active" : ""}`}
        onClick={() => toggleAccordion(16)}
        aria-expanded={openIndex === 16}
      >
        Mark Grossbard, CEO of Kai Strategic Insurance and VP of Insurance World: $1,000
        <span className="accordion-arrow" />
      </button>
      {openIndex === 16 && (
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
        className={`accordion-header ${openIndex === 17 ? "active" : ""}`}
        onClick={() => toggleAccordion(17)}
        aria-expanded={openIndex === 17}
      >
        Donald Shauger II - $1,000
        Donald Shauger Sr. - $1,000
        <span className="accordion-arrow" />
      </button>
      {openIndex === 17 && (
        <div className="accordion-content">
          <p>Donald Shauger II and Donald Shauger Sr., executives of The Shauger Group Inc., each donated $1,000 to Councilmember Solomon on June 30, 2025. This is notable given the scope of their company’s work in Jersey City. Their projects include Phase V Water and Sewer Main Upgrades, involving the installation of 7,000 LF of 12-inch watermain, 4,000 LF of 8-inch watermain, new valves, hydrants, and service connections throughout Jersey City, as well as 11,000 LF of new PVC sewer main with associated manholes and cleanouts. They also carried out the Large Valve Replacement Project, replacing 30 of the most defective valves in the city’s water distribution system, which involved excavation, timber shoring, temporary bypass piping, and maintaining water service to residents during construction. The size and timing of these donations could raise concerns about potential influence or the appearance of a conflict of interest. <a href="https://shauger.com/major-projects">Shauger Group's Major Projects</a></p>
        </div>
      )}
    </div>


    <div className = "accordion-item">
      <button
        className={`accordion-header ${openIndex === 18 ? "active" : ""}`}
        onClick={() => toggleAccordion(18)}
        aria-expanded={openIndex === 18}
      >
        Dane Calcagni, Director of Research and Information - $350
        Alex Chang, Chief Happiness Officer - $300
        Leia Duif, Associate - $2,120
        Thomas Gibbons, Associate - $1,000
        Sawyer Smith, Founder and Principal - $1000
        Selina Vargas, Associate - $250
        Corcoran Sawyer Smith
        <span className="accordion-arrow" />
      </button>
      {openIndex === 18 && (
        <div className="accordion-content">
          <p>Employees from a prominent Jersey City real estate brokerage, which manages over 100 luxury and high-end properties in the city, collectively contributed to James Solomon’s mayoral campaign. Donors include Dane Calcagni, Alex Chang, Leia Duif, Thomas Gibbons, Sawyer Smith, and Selina Vargas, all affiliated with the company’s Jersey City office. While Solomon has pledged not to accept direct contributions from developers, these donations from employees who work in the real estate development sector raise questions about the potential for indirect influence. Even if the contributions are legal and within pledge boundaries, the concentration of donations from individuals connected to a firm heavily involved in local property development creates the appearance of a possible conflict of interest or pay-to-play scenario, making this a notable red flag in the campaign finance record.</p>
          <a href="https://www.corcoran.com/search/for-sale/location/downtown-jersey-city-nj/regionId/130?gad_source=1&gad_campaignid=18224731163&gclid=CjwKCAjw2brFBhBOEiwAVJX5GFqbC2SPYJ-FP6J13_w02DuiOqCOWPOp6mvDa8FSSfI_tVhnif3CABoCzCsQAvD_BwE">Listings of properties under them in Jersey City.</a>
        </div>
      )}
    </div>

    </section>

    <section id="red-flags" className="union-section">

      <h2>Union Contributions</h2>

      <p> This campaign understands the importance of unions in protecting workers’ rights and securing fair wages, benefits, and safe working conditions. 
    However, when unions also hold or seek contracts with the City, their donations may fall under pay-to-play rules. 
    Including these contributions in our analysis is not a statement against unions or the labor movement — it is simply part of our commitment to transparency, 
    ensuring that all potential conflicts of interest, regardless of the source, are treated consistently.</p>
    
    
       <div className="accordion-item">
        <button
          className={`accordion-header ${openIndex === 0 ? "active" : ""}`}
          onClick={() => toggleAccordion(0)}
          aria-expanded={openIndex === 0}
        >
          IBEW Local Union 164 - $2,500
          <span className="accordion-arrow" />
        </button>
        {openIndex === 0 && (
          <div className="accordion-content">
            <p>The donations from IBEW Local Union 164 to Solomon, totaling $2,500, raise a strong red flag given the union’s extensive financial ties with Jersey City. Public records show that IBEW Local 164 has received significant city payments over multiple years, including large expenditures in 2021, 2022, 2024, and 2025. The sequence of receiving municipal funds and then contributing heavily to O’Dea’s campaign creates the appearance of a pay-to-play cycle, where taxpayer money flows to the union and then back into local politics. This dynamic heightens concerns about whether the union is seeking to preserve or expand its influence over future contracts and city decisions. While no direct illegality is proven, the overlap between city expenditures and campaign donations underscores the risk of undue influence and the need for greater transparency.</p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/434284">6/25/25 - $8,672.67</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/405701">6/12/24 - $10,086.83</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/66966">4/13/22 - $65,573.14</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/53126">8/17/21 - $44,465.12</a></p>
          </div>
        )}
      </div>

      <div className="accordion-item">
        <button
          className={`accordion-header ${openIndex === 1 ? "active" : ""}`}
          onClick={() => toggleAccordion(1)}
          aria-expanded={openIndex === 1}
        >
          32BJ United America Dream Fund PAC - $15,000
          <span className="accordion-arrow" />
        </button>
        {openIndex === 1 && (
          <div className="accordion-content">
            <p>A significant red flag arises from the $15,000 contribution from the 32BJ United America Dream Fund PAC to James Solomon's campaign on June 26, 2025. This donation preceded the Jersey City Council’s September 10, 2025 resolution supporting 32BJ SEIU security officers in their 2025 contract campaign. The timing and alignment of the donation with these council actions suggest a potential conflict of interest and raise pay-to-play concerns, as the political committee making the contribution represents a union directly impacted by city contracts. Such a pattern of giving signals the possibility of undue influence over municipal decision-making, even in the absence of explicit legal violations.</p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/436644">Res 25-574 - Sep 10, 2025</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/343830">Res 23-805 - Nov 8, 2023</a></p>
          </div>
        )}
      </div> 
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

      <footer className="footer">
  <p>PAID FOR BY ALI FOR JERSEY CITY PO BOX 8237, JERSEY CITY, NJ 07308</p>
</footer>

    </div>
  );
}
