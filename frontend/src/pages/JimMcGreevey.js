import React, {useEffect, useState} from "react";
import { Link } from "react-router-dom";
import { Pie, Bar } from "react-chartjs-2";
import "chart.js/auto";
import "./Draft.css";
import McGreeveyPhoto from "./img/mcgreevey1.jpg";
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
    fetch(`${backendUrl}/api/contributions/Jim_McGreevey`)
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
    fetch(`${backendUrl}/api/top_donors_bar/Jim_McGreevey`)
      .then((res) => res.json())
      .then(setTopDonorsBarData)
      .catch(console.error);

    // top employers
    fetch(`${backendUrl}/api/top_employers_bar/Jim_McGreevey`)
      .then((res) => res.json())
      .then(setTopEmployersBarData)
      .catch(console.error);

    // total donations
    fetch(`${backendUrl}/api/total_donations/Jim_McGreevey`)
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
    fetch(`${backendUrl}/api/search_donor/Jim_McGreevey?q=${encodeURIComponent(searchTerm.trim())}`)
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
    fetch(`${backendUrl}/api/search_donor/Jim_McGreevey?q=${encodeURIComponent(name)}`)
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

      <h1>Jim McGreevey: Campaign Finance Visuals</h1>

      {totalDonations !== null && (
        <div className="total-donations-panel">
          <h2>Total Donations</h2>
          <p>${totalDonations.toLocaleString()}</p>
        </div>
      )}

      <div className="red-flag-warning">
        <p>
          This candidate has been flagged for having suspicious donations, totaling to $1,258,633.{" "}
          <HashLink smooth to="#red-flags">Click here to view them.</HashLink>
        </p>
      </div>

      <div className="bio-container">
        <section className="bio-text">
          <h2>Biography</h2>
          <p>Jim McGreevey served as the 52nd Governor of New Jersey from 2002 to 2004. A Democrat known for championing progressive policies, he previously held public office as a state assemblyman, state senator, and Mayor of Woodbridge Township. His tenure as governor ended with a high-profile resignation in 2004, during which he came out as gay and admitted to a personal scandal involving an extramarital affair. Since then, McGreevey has shifted his public service focus toward criminal justice reform and reentry programs, especially aiding formerly incarcerated individuals with workforce training and social reintegration.</p>
          <h2>Policies</h2>
          <ul>
            <li>Reentry and rehabilitation programs: Building on his work with the Jersey City Employment and Training Program (JCETP), he advocates for better services for the formerly incarcerated, including housing, mental health care, and job placement.</li>
            <li>Affordable housing: Pushing for safeguards against gentrification and increased investment in housing accessible to low- and middle-income residents.</li>
            <li>Ethics and transparency: Reviving his earlier reputation as a proponent of ethics reform, he calls for stronger oversight of city contracts and campaign financing.</li>
            <li>Public safety: Supporting community policing and investments in mental health crisis response teams as alternatives to traditional policing for nonviolent issues.</li>
            <li>Education and workforce development: Promoting partnerships between the city and local institutions to improve access to job training, especially in healthcare and tech sectors.</li>
          </ul>
          <h2>Background</h2>
          <p>Jim McGreevey was born in Jersey City in 1957 and raised in nearby Metuchen. He earned his B.A. from Columbia University, a J.D. from Georgetown Law, and an M.Ed. from Harvard University. Before entering public office, he worked as a prosecutor and attorney. McGreevey’s political ascent began in the 1990s, but after resigning from the governorship, he dedicated much of his post-political career to faith-based and nonprofit work, including studying at a seminary and leading reentry initiatives in Hudson County. His return to Jersey City politics marks an effort to reclaim public trust and serve the community where his story began.</p>
        </section>
        <div className="bio-image">
          <img src={McGreeveyPhoto} alt="Jim McGreevey" />
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
        <p>Jim McGreevey's mayoral campaign in Jersey City has received the highest amount of donations linked to potential pay-to-play, conflicts of interest, or suspicious actors, totaling $1,091,533. Despite his public stance on ethical governance, a significant portion of these funds comes from individuals and entities with notable political and business influence, including Eliot Spitzer and Charles Kushner. This discrepancy between McGreevey’s stated commitment to transparency and the sources of his campaign contributions raises concerns about the perception of pay-to-play politics. As more donations are reported and quarterly filings are updated, this list continues to evolve, highlighting the ongoing scrutiny of his fundraising practices.</p>
        {/* Accordion item 0 */}
      <div className="accordion-item">
        <button
          className={`accordion-header ${openIndex === 0 ? "active" : ""}`}
          onClick={() => toggleAccordion(0)}
          aria-expanded={openIndex === 0}
        >
          Chisea Shaninian & Giantomisi - $103,150
          <span className="accordion-arrow" />
        </button>
        {openIndex === 0 && (
          <div className="accordion-content">
          <p>Chiesa Shahinian & Giantomasi PC (CSG) has contributed approximately $103,150 to Jim McGreevey’s campaign through a mix of employee and firm donations, spread across nearly 200 individual contributions. Donation activity notably spiked in December 2023 and again in December 2024, suggesting coordinated giving patterns. At the same time, CSG has maintained business ties with Jersey City. In March 2023 (Res. 23-481), the City Council ratified a professional services agreement with the firm worth up to $40,000 to represent police officers in ongoing litigation. Since then, the firm has received multiple additional city expenditures totaling tens of thousands of dollars between 2023 and 2025. The overlap between six-figure campaign contributions and steady city contracts raises questions about the influence of donor-connected firms on Jersey City governance.</p>
          <p><strong>Res 23-481 </strong>This resolution ratifies a professional services agreement with the law firm Chiesa Shahinian & Giantomasi PC to represent Jersey City Police Officers Leon Tucker and Saad Hashmi in a lawsuit related to the Estate of Hiram Gonzalez. The contract, effective March 29, 2023, is for up to $40,000 at an hourly rate of $175, and includes expenses. The firm has complied with all required political contribution disclosures and the City's Pay-to-Play laws. Funds of $5,000 are available for this purpose in the current budget, with continuation contingent on future budget appropriations. The resolution and related documents will be made publicly available as required by law. <a href="https://cityofjerseycity.civicweb.net/document/90902/R0205489_%20Chiesa%20Shahinian%20_%20Giantomasi.pdf?handle=30D5C0EA4875471BAE6D17B7FF828B36">Resolution PDF</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/436252">8/14/25 - $5,483.52</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/425256">3/24/25 - $19,938.31</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/416983">12/6/24 - $9,669.78</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/410721">9/6/24 - $3,955.00</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/406617">6/24/24 - $3,010.00</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/404397">6/7/24 - $52.50</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/402589">5/8/24 - $41,379.19</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/313478">10/23/23 - $1,517.50</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/156507">9/18/23 - $9,707.40</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/95854">8/11/23 - $10,143.11</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/17017">12/11/19 - $16,950.98</a></p>
          </div>
        )}
      </div>
      <div className="accordion-item">
        <button
          className={`accordion-header ${openIndex === 1 ? "active" : ""}`}
          onClick={() => toggleAccordion(1)}
          aria-expanded={openIndex === 1}
        >
          T&M Associates - $11,250
          <span className="accordion-arrow" />
          </button>
        {openIndex === 1 && (
          <div className="accordion-content">
            <p>T&M Associates has contributed approximately $11,250 to Jim McGreevey’s campaign, raising concerns due to the firm’s extensive contracting history with Jersey City. Over the past several years, T&M has been awarded multiple professional services agreements, including a $300,000 on-call civil engineering contract approved in January 2025 (Res. 25-073), as well as prior contracts for electrical engineering, rail crossing design, Reservoir #3 safety improvements, the Morris Canal Greenway, and other infrastructure projects dating back to at least 2019. In addition, Jersey City expenditure records show numerous payments to the firm totaling tens of thousands of dollars between 2019 and 2024. Although these contracts were awarded through “fair and open” or “pay-to-play compliant” processes, the overlap between campaign donations and lucrative city contracts underscores the appearance of a pay-to-play dynamic.</p>
            <p><strong>Res 25-073 </strong>The City of Jersey City approved Resolution 25-073 on January 29, 2025 , awarding a professional services contract to T&M Associates. This contract, not to exceed $300,000.00 , is for on-call civil engineering services for the Department of Infrastructure, Division of Engineering. The term of the contract is twelve (12) months , effective upon its execution by City Officials. Assuming execution around the approval date, the contract is expected to run from approximately January 29, 2025, to January 28, 2026. <a href="https://cityofjerseycity.civicweb.net/document/419212/Resolution%20authorizing%20an%20On-Call%20Engineering%20P.pdf?handle=806F0E4674C744FF9B1D369B03C2C114">Resolution PDF</a></p>
            <p><strong>Res 22-421 </strong>This resolution from the City of Jersey City authorizes a professional services contract with T & M Associates for electrical engineering design and construction administration services. The services are specifically for site lighting improvements at Canco Park (Project No. 2019-042). The contract amount will not exceed $23,140.00. This agreement was awarded through a "fair and open" process, complying with the "Pay-to-Play Law" provisions, and is exempt from public bidding as a professional service. The resolution, approved on June 15, 2022, also includes requirements for Equal Employment Opportunity (EEO) and Affirmative Action (AA) compliance. <a href="https://cityofjerseycity.civicweb.net/document/67682/Resolution%20authorizing%20the%20award%20of%20a%20professio.pdf?handle=6380AC9B1A6F42CCB8AA2EED8AE03DDD">Resolution PDF</a></p>
            <p><strong>Res 21-169 </strong>This resolution authorizes awarding a $32,500 professional engineering services contract to T&M Associates for the design of the Second Street rail crossing, roadway, and signal improvements (Project No. 17-010-T). Three proposals were received, and T&M Associates was selected based on experience and cost, offering the lowest bid compared to $119,932 and $167,395 from other firms. The contract, effective upon execution for 12 months, is exempt from competitive bidding under the Local Public Contracts Law and awarded through the Pay-to-Play “Direct and Open Process.” T&M Associates met all compliance requirements, including Pay-to-Play and EEO/AA certifications, and funds are available from account 04-215-55-151-990. The resolution and agreement will be made publicly available as required by law. <a href="https://cityofjerseycity.civicweb.net/document/41538/Second%20Street%20Rail%20Crossing%20Improvements.pdf?handle=8B3ACEC34ACE4E9292B8513614AD7ACC">Resolution PDF</a></p>
            <p><strong>Res 20-503 </strong>The City of Jersey City has authorized a professional services contract with T & M Associates for services related to Reservoir #3 Safety Improvements and Restoration of Reservoir #3 Screen House projects. The contract is for $17,720.00 and is for a twelve-month term. These services include updating land and base mapping, performing site inspection and preliminary NJDEP coordination, and providing ADA compliance recommendations. The City informally solicited a quotation from T & M Associates, who had previously provided a land survey of the site. The Director of Architecture recommended awarding the contract to T & M Associates based on their qualifications. <a href="cityofjerseycity.civicweb.net/document/46974/Professional%20Services%20Agreement%20with%20Eric%20M.%20Be.pdf?handle=8814FBDE9C4A4165A8583CC51BAEFE65">Resolution PDF</a></p>
            <p><strong>Res 20-270 </strong>The City of Jersey City has awarded a professional services contract to T&M Associates to prepare plans and specifications for the Morris Canal Greenway Segments 5, 10, and 11. This project is funded by a $3,500,000.00 Regional Transportation Alternatives Program grant from the New Jersey Department of Transportation. T&M Associates, a qualified engineering firm, will provide surveying, construction plans, and specifications, with the contract value exceeding $17,500.00. The contract was awarded directly and openly as a statutorily permitted contract under the "Pay to Play Law." The resolution ensures that the firm complies with all necessary certifications and disclosure requirements. <a href="cityofjerseycity.civicweb.net/document/46974/Professional%20Services%20Agreement%20with%20Eric%20M.%20Be.pdf?handle=8814FBDE9C4A4165A8583CC51BAEFE65">Resolution PDF</a></p>
            <p><strong>Res 19-1766 </strong>The City of Jersey City has awarded a one-year professional engineering services contract to T&M Associates for on-call civil engineering services, with a total cost not to exceed $250,000.00. This contract was awarded through a "fair and open process" in accordance with the New Jersey Pay-to-Play Law and is exempt from public bidding under the Local Public Contracts Law. T&M Associates was chosen due to its pre-qualification, experience in municipal engineering, and satisfactory past performance. The agreement is subject to the firm providing evidence of compliance with Affirmative Action Amendments to the Law Against Discrimination, and the resolution will be publicly published. <a href="https://cityofjerseycity.civicweb.net/filepro/document/7925/RES%202019%2002%2027.pdf">Resolution PDF (Listed in pgs 345-389)</a></p>
          
            <p><a href="https://cityofjerseycity.civicweb.net/document/413799">11/8/24 - $700</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/397144">3/18/24 - $3,626.36</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/156507">9/18/23 - $2,913.46</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/80927">11/23/23 - $47,920.52</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/76260">9/16/22 - $5,780.19</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/73114">8/12/22 - $314.78</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/65863">3/17/22 - $1,206.93</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/58054">10/7/21 - $921.85</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/55789">9/3/21 - $3,325.00</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/49373">6/9/21 - $2,238.84</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/43483">2/18/21 - $66,900.85</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/41559">1/25/21 - $22,995.11</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/38868">11/25/20 - $16,988.14</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/34825">9/17/20 - $16,676.81</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/15268">11/7/19 - $23,875.20</a></p>
          </div>
        )}  
      </div>  
      {/*French & Parrello Associates*/}
      <div className="accordion-item">
        <buttton
          className={`accordion-header ${openIndex === 2 ? "active" : ""}`}
          onClick={() => toggleAccordion(2)}
          aria-expanded={openIndex === 2}
          >
          French & Parrello Associates - $14,900
          <span className="accordion-arrow" />
          </buttton>
          {openIndex === 2 && (
          <div className="accordion-content">
            <p>French & Parrello Associates have donated $9,700 across two years. The company's donations are deemed suspicious because the company has received several contracts with Jersey City, calling into question violating pay2play and conflict of interest. The contracts are listed below.</p>
            <p><strong>Res 25-185 </strong>The City of Jersey City approved Resolution 25-185 on March 12, 2025, authorizing a professional services contract with French and Parrello Associates, PA. This contract, not to exceed $162,113.00, is for engineering design services related to improvements on Manhattan Avenue and Franklin Street. The project is funded by a FY 2023 Bikeways Program grant from the New Jersey Department of Transportation (NJDOT), which has allocated $670,000.00 for the project's construction. French and Parrello Associates, PA will provide services including site investigation, preliminary and final design, bid support, and construction administration and inspection over a twelve-month period. <a href="https://cityofjerseycity.civicweb.net/document/423978/A%20resolution%20authorizing%20the%20award%20of%20a%20Profess.pdf?handle=3B15684D8D82440FA91FEA9B99C3DF71">Resolution PDF</a></p>
            <p><strong>Res 23-276 </strong>This resolution from the City of Jersey City authorizes an amendment to a professional engineering services contract with French & Parrello Associates (FPA) for the Central Avenue Streetscape and Roadway Improvements Project No. 18-017-E. The amendment increases the contract by an additional $73,668.00 due to unforeseen site conditions and material delivery delays, requiring additional inspection and construction management services. These additional services include streetscape renderings, "Hollywood Star" research, basement slab designs, night paving inspection, and coordination with PSE&G. The original contract was for $368,340.00, awarded on January 8, 2020, and this amendment extends the term by one year. <a href="https://cityofjerseycity.civicweb.net/document/88149/R0204894_%20CENTRAL%20AVE%20CLOSEOUT%20Addtl%20Srvcs.pdf?handle=6C63AD7797814142BBB5B6CD4E8C811E">Resolution PDF</a></p>
            <p><strong>Res 22-604 </strong>This resolution awards a $199,960 professional services contract to French and Parrello Associates to prepare surveys, construction plans, specifications, and provide project administration for the West Side Avenue Improvements Project. The project is funded by a $1,768,519 FY 2022 NJDOT Municipal Aid grant, and the contract term is 12 months from execution. The firm met all compliance requirements under the City’s Pay-to-Play laws, political contribution disclosure rules, and affirmative action regulations. The contract is exempt from public bidding under the Local Public Contracts Law and will be made publicly available as required. Funds for the contract are available in account 04-215-55-985-990. <a href="https://cityofjerseycity.civicweb.net/document/71966/Resolution%20Authorizing%20a%20Professional%20Services%20.pdf?handle=3474AC5BBBA1437DAC78FC97E0B397E5">Resolution PDF</a></p>
            <p><strong>Res 20-142 </strong>This resolution awards a $27,600 professional services contract to French & Parrello Associates for electrical and plumbing engineering services for the Ferris Triangle Park Improvements project. The firm was selected as the lowest of three proposals received and will provide electrical design, drawings, and specifications to complement plans prepared by the Division of Architecture for public bidding. The 24-month contract is exempt from public bidding under the Local Public Contracts Law and complies with the City’s Pay-to-Play, political contribution disclosure, and affirmative action requirements. Funding is available from account 04-215-55-141-990, and the resolution and agreement will be made publicly accessible. <a href="https://cityofjerseycity.civicweb.net/document/20098/Resolution%20authorizing%20a%20PSA%20to%20French%20_%20Parrel.pdf?handle=BF0EDBF0CE09497E9CC3E22E1D418E8F">Resolution PDF</a></p>
            <p><strong>Res 20-038 </strong>The City of Jersey City has awarded a professional services contract to French and Parrello Associates to prepare plans and specifications for the Central Avenue Streetscape and Roadway Improvements project. This project is supported by a $2,370,990.00 Municipal Aid Program grant from the New Jersey Department of Transportation. French and Parrello Associates, a qualified consulting firm, will provide surveying, construction plans, specifications, and project administration. The contract, valued at over $17,500.00, was awarded directly and openly as a statutorily permitted contract under the "Pay to Play Law". The resolution ensures the firm's compliance with necessary certifications and disclosure requirements. <a href="https://cityofjerseycity.civicweb.net/document/18461/Resolution%20Awarding%20a%20Professional%20Services%20Con.pdf?handle=FBCBD4EF025249679D93310A30405804">Resolution PDF</a></p>
          
            <p><a href="https://cityofjerseycity.civicweb.net/document/436931">9/3/25 - $1,000</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/436252">8/14/25 - $118.75</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/434925">7/11/25 - $11,524.89</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/434179">6/20/25 - $16,357.50</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/429486">5/2/25 - $20,821.49</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/400554">4/22/24 - $12,341.50</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/390093">12/11/23 - $5,594.00</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/313478">10/23/23 - $73,661.62</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/242953">10/5/23 - $9,726.23</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/93549">6/26/23 - $24,163.49</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/84304">2/3/23 - $34,214</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/66966">4/13/22 - $16,517.50</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/56325">9/16/21 - $30,700.32</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/51506">7/9/21 - $73,860.52</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/47945">5/7/21 - $1,088.62</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/44186">3/4/21 - $1,375.61</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/41559">1/25/21 - $34,005.52</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/39624">12/10/20 - $3,384.78</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/30334">7/9/20 - $14,090.00</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/26642">5/14/20 - $183,870.98</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/25721">4/28/20 - $2,462.72</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/16087">11/26/19 - $847.50</a></p>

          </div>
        )}

      </div>

      
      {/*Charles and Seryl Kushner - Kushner Company*/}
      <div className = "accordion-item">
        <button
          className={`accordion-header ${openIndex === 3 ? "active" : ""}`}
          onClick={() => toggleAccordion(3)}
          aria-expanded={openIndex === 3}>
          Charles and Seryl Kushner - Kushner Company - $41,000
          Nicole Meyer Kushner, President of Kushner Companies - $5,200
          Joseph Meyer - $5,200
          <span className="accordion-arrow" />
        </button>
        {openIndex === 3 && (
           <div className="accordion-content">
            <p>Charles and Seryl Kushner have donated $10,100 each to McGreevey's campaign in 2023 and 2024. Nicole Kushner Meyers, sister of Jared Kushner, and her husband Joseph Meyers, each donated $5,200 to McGreeyey's campaign. Charles and Seryl has donated $100,000 to the Make America Great Again PAC in 2015 and $1 million to America First PAC in 2023, a pro-Trump PAC. They have also held a fundraiser for Trump in their Long Branch home in 2017. They have also begun real estate developments in Jersey City, such as One Journal Square, 65 Bay Street, known as Trump Bay Street, and Journal Squared. These developments  have often been shadowed by ethical, legal, and labor disputes, ranging from funding transparency to compliance with labor laws and local governance challenges.</p>
            <p>The support of McGreevey shows the favorability of his campaign to their real estate interests. These donations have been deemed a red flag because of the history of the donations of the Kushners, their alignment with Donald Trump, and possible real estate favorability for current projects. </p>
            <p>Furthermore, Jersey City has accepeted a donation of $47,800, which was approved on November 14, 2024. The donation was to the  Department of Recreation and Youth Development to provide financial support to any Pershing Field Pool projects and f a new refrigeration system at the Lafayette Pool complex concession stand. This was voted unanimously by the Jersey City Council. <a href="https://cityofjerseycity.civicweb.net/document/413754/Aquatics%20Donation.pdf?handle=A5324B6A2456431F8E32B36D6938E0E7">Donation PDF</a></p>
          </div>
        )}
            
      </div>

      {/*Anthony Grano, Owner of Persistent Construction Corp*/}
      <div className = "accordion-item">
        <button
          className ={`accordion-header ${openIndex === 4 ? "active" : ""}`}
          onClick={() => toggleAccordion(4)}
          aria-expanded={openIndex === 4}>
          Anthony Grano, Owner of Persistent Construction Corp - $2,000
          <span className="accordion-arrow" />
        </button>
        {openIndex === 4 && (
          <div className="accordion-content">
            <p>Anthony Grano has donated $2,000 to his campaign on September 5, 2024. Persistent Construction Corp has been awarded several contracts with Jersey City, and has been deemed a suspicious donation due to conflict of interest and pay2play.</p>
            <p><strong>Res 24-859</strong> The City of Jersey City has renewed an open-end contract with Persistent Construction, Inc. for snow removal services for the Department of Public Works, Division of Sanitation. This renewal, approved on November 26, 2024, is for an additional one-year period effective from January 1, 2025, to December 31, 2025. The total cost of this renewed contract will not exceed $1,130,370.00, with an initial allocation of $10,000.00 from the Division of Sanitation Operating Account. <a href="https://cityofjerseycity.civicweb.net/document/413259/R0210559_%20Renewal%201_1%20for%20Snow%20Removal%20Only.pdf?handle=EE9FDAD333FA488CBBBAF537DB24F84A">Resolution PDF</a></p>
            <p><strong>Res 23-931 </strong>On December 13, 2023, Jersey City approved Resolution 23-931, awarding a one-year open-end contract to Persistent Construction Inc. for snow removal services for the Department of Public Works, Division of Sanitation. The contract is valued at $1,102,800.00, with an initial encumbrance of $10,000.00 from the 2024 operating budget. The agreement includes set unit costs and allows for an optional one-year extension. The contract is contingent on compliance with affirmative action requirements and the availability of future budget appropriations. Payments will be made only upon certified completion of services according to specifications. <a href="https://cityofjerseycity.civicweb.net/document/413259/R0210559_%20Renewal%201_1%20for%20Snow%20Removal%20Only.pdf?handle=EE9FDAD333FA488CBBBAF537DB24F84A">Resolution PDF</a></p>
            <p><strong>Res 21-334 </strong>The City of Jersey City ratified an emergency contract with Persistent Construction, Inc. for $24,000.00 to build six parklets across the city. This initiative aimed to create outdoor spaces for small businesses and residents for social distancing and reopening efforts during the COVID-19 pandemic. The contract was awarded as an emergency measure, exempting it from public bidding requirements. Brian D. Platt, the then Business Administrator, issued an emergency certification on October 17, 2020, formally authorizing the parklet construction due to the public health emergency. Paul Russo, the Municipal Engineer, certified that the services rendered by Persistent Construction, Inc. were fair and reasonable. <a href="https://cityofjerseycity.civicweb.net/document/46245/Resolution%20ratifying%20an%20emergency%20contract%20awar.pdf?handle=91AC5DC128344431A12830A6261832AD">Resolution PDF</a></p>

            <p><a href="https://cityofjerseycity.civicweb.net/document/409634">8/12/24 - $9,980.69</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/406617">6/24/24 - $107,996</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/403052">5/17/24 - $22,652.70</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/400554">4/22/24 - $349,920.47</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/397144">3/18/24 - $8,484.84</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/48496">5/21/21 - $24,000</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/30334">7/9/20 - $90,414.55</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/24237">3/31/20 - $105,842.47</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/22804">3/3/20 - $36,442.88</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/20322">2/4/20 - $257,337.85</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/17964">1/6/20 - $258,796.44</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/15268">11/7/19 - $229,713.84</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/11373">9/3/19 - $168,400.63</a></p>
          </div>
        )}


      </div>

      <div className = "accordion-item">
      <button
        className ={`accordion-header ${openIndex === 5 ? "active" : ""}`}
        onClick={() => toggleAccordion(5)}
        aria-expanded={openIndex === 5}>
        Merrie Bernstein, Wife of Eric Bernstein - $5,200
        Eric M Bernstein, Owner of Eric M Bernstein & Associates - $24,300
        Eric M. Berstein & Associates, LLC - $5,200
        <span className="accordion-arrow" />
      </button>
      {openIndex === 5 && (
        <div className="accordion-content">
          <p>McGreevey has received a total of 15,600 from Eric Bernstein and his wife. These donations have been deemed suspicious because Eric M Berstein & Associates has received several contracts in Jersey City, which falls into conflict of interest donations. The contracts are listed below.</p>
          <p><strong>Res 24-801 </strong>Resolution 24-801, was approved by the City of Jersey City on October 30, 2024. It authorizes the payment of an $8,435.00 claim to Eric M. Bernstein & Associates, LLC for legal services. These services were provided to the City regarding the case of "The Cannabis Place 420 Corp. v. City of Jersey City and Kushmart Jersey, LLC.". The resolution confirms that the services were provided, the invoices are reasonable, and the payment is authorized from the Law Department's account. The document also includes various compliance forms such as Equal Employment Opportunity, Americans with Disabilities Act, and Political Contribution Disclosure requirements. <a href="https://cityofjerseycity.civicweb.net/document/412432">Resolution PDF</a></p>
          <p><strong>Res 24-774 </strong>Resolution 24-773, was approved by the City of Jersey City on October 17, 2024. It authorizes the payment of a $44,117.50 claim to Eric M. Bernstein & Associates, LLC for legal services provided in tax appeal matters. The resolution confirms that the services were rendered, the invoices are reasonable, and the payment is authorized from the Law Department's account. The document also includes various compliance forms, such as those related to Equal Employment Opportunity and the Americans with Disabilities Act. <a href="https://cityofjerseycity.civicweb.net/document/411711">Resolution PDF</a></p>
          <p><strong>Res 23-230 </strong>The Jersey City Municipal Council ratified the renewal of its professional services agreement with Eric M. Bernstein & Associates to continue representing the city in tax appeal cases. The original 2018 contract for $150,000 has been amended and increased multiple times, and with this renewal, an additional $200,000 is added, bringing the total contract value to $1,120,000. The firm will continue to charge $150 per hour under the “fair and open” Pay-to-Play law, and the agreement is exempt from competitive bidding as a professional service. The renewal is effective February 13, 2023, and includes compliance requirements with affirmative action and the city’s Pay-to-Play Reform Ordinance. The resolution will be published and is contingent on the appropriation of sufficient funds in the city’s budget. <a href="https://cityofjerseycity.civicweb.net/document/85282">Resolution PDF</a></p>
          <p><strong>Res 23-074 </strong>This resolution from the City of Jersey City amends a professional services agreement with the law firm Eric Bernstein & Associates, which serves as special counsel for tax appeals. The amendment increases the contract by an additional $75,000.00 to pay outstanding invoices for 2022 and cover services for the first month of fiscal year 2023. This brings the total contract amount to $995,000.00, with services provided at an hourly rate of $150.00, including expenses. The agreement was awarded under the "fair and open" provisions of the New Jersey Local Unit Pay-to-Play Law and is exempt from public bidding. Additionally, the resolution includes mandatory Equal Employment Opportunity (EEO) and Americans with Disabilities Act (ADA) compliance requirements for the contractor. <a href="https://cityofjerseycity.civicweb.net/document/81812">Resolution PDF</a></p>
          <p><strong>Res 22-246 </strong>The Jersey City Municipal Council approved an amendment to its professional services agreement with Eric M. Bernstein & Associates to represent the city in tax appeal cases. The original contract, awarded in 2018 for $150,000, had been increased multiple times over the years, reaching $695,000 by June 2021. Due to ongoing litigation and outstanding invoices, the council authorized an additional $75,000, bringing the total contract value to $770,000. The firm’s hourly rate remains $150, and the contract was awarded under New Jersey’s fair and open Pay-to-Play law as a professional service exempt from public bidding. Funds for this increase are available, and the amendment will be published in accordance with legal requirements. <a href="https://cityofjerseycity.civicweb.net/document/60895">Resolution PDF</a></p>
          <p><strong>Res 22-163 </strong>The Jersey City Municipal Council renewed its professional services agreement with Eric M. Bernstein & Associates to continue representing the city in tax appeal cases. First awarded in 2018 for $150,000, the contract has been amended and increased multiple times, and this renewal adds $150,000, bringing the total contract amount to $840,000. The firm will continue to bill $150 per hour under the “fair and open” Pay-to-Play process, and the contract is exempt from competitive bidding as a professional service. The renewal is effective February 13, 2022, and requires compliance with affirmative action and the city’s Pay-to-Play Reform Ordinance. The resolution will be published and is contingent on sufficient funding in the city’s budget. <a href="https://cityofjerseycity.civicweb.net/document/63173">Resolution PDF</a></p>
          <p><strong>Res 21-470 </strong>The City of Jersey City has ratified the renewal of a professional services agreement with the law firm of Eric M. Bernstein & Associates to serve as special counsel for tax appeals. This resolution, approved on June 16, 2021, reauthorizes the agreement for one year, effective February 13, 2021, and increases the contract amount by an additional $150,000.00, bringing the total to $690,000.00. The firm will provide services at an hourly rate of $150.00, including expenses. The agreement was awarded without competitive bidding as a professional services agreement under the Local Public Contracts Law. The resolution also outlines strict guidelines for conflicts of interest, billing practices, and ethical standards, emphasizing transparency and cost control. <a href="https://cityofjerseycity.civicweb.net/document/46974">Resolution PDF</a></p>
          <p><strong>Res 21-284 </strong>The City of Jersey City has amended a professional services agreement with the law firm of Eric M. Bernstein & Associates to continue serving as special counsel for tax appeals. This amendment, approved on April 15, 2021, increases the total contract amount by an additional $50,000.00, bringing the new total not to exceed $415,000.00, including expenses. The firm will provide services at an hourly rate of $150.00. The original contract was awarded without competitive bidding as a professional services agreement. The resolution also outlines strict guidelines for conflicts of interest, billing practices, and ethical standards, along with mandatory Equal Employment Opportunity (EEO) and Americans with Disabilities Act (ADA) language to prevent discrimination. <a href="https://cityofjerseycity.civicweb.net/document/43961">Resolution PDF</a></p>
          <p><strong>Res 20-884 </strong>The City of Jersey City has amended its professional services agreement with the law firm of Eric M. Bernstein & Associates to continue serving as special counsel for tax appeals. This amendment, approved on December 16, 2020, increases the total contract amount by an additional $50,000.00, raising the new total to $415,000.00, including expenses. The firm will provide services at an hourly rate of $150.00. The agreement was initially awarded without competitive bidding as a professional services contract. The resolution also outlines strict guidelines for conflicts of interest, billing practices, and ethical standards, along with mandatory Equal Employment Opportunity and Americans with Disabilities Act language. <a href="https://cityofjerseycity.civicweb.net/document/34811">Resolution PDF</a></p>
          <p><strong>Res 20-298 </strong>The City of Jersey City has awarded a professional services agreement to the law firm of Eric M. Bernstein & Associates to serve as special counsel for tax appeals. This resolution, approved on April 22, 2020, specifies a total contract amount of $365,000.00. The firm will represent the City in tax appeal cases, with the agreement falling under the professional services exemption from public bidding. The resolution acknowledges that while professional services contracts are typically limited to twelve months, the ongoing nature of these tax appeal matters necessitates continued legal representation. The firm is also required to comply with "Pay-to-Play Law" provisions, ensuring transparency in political contributions and adherence to Equal Employment Opportunity (EEO) and Americans with Disabilities Act (ADA) guidelines. <a href="https://cityofjerseycity.civicweb.net/document/23310">Resolution PDF</a></p>
          <p><strong>Res 19-120 </strong>The City of Jersey City has reauthorized and increased a professional services agreement with Eric M. Bernstein & Associates for tax appeal representation. Initially, the contract was for $150,000, which increased to $215,000 after a first amendment. The current amendment, effective February 13, 2019, adds another $150,000, bringing the total to $365,000 for one year. The firm charges $150.00 per hour, including expenses, and the contract was awarded through a "fair and open process," exempt from competitive bidding. The firm complies with relevant ordinances and the agreement will be publicly available. <a href="https://cityofjerseycity.civicweb.net/document/5330">Resolution PDF (Pgs 635-666</a></p>
        
          <p><a href="https://cityofjerseycity.civicweb.net/document/415425">11/22/24 - $8,435</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/413799">11/8/24 - $44,117.50</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/404397">6/7/24 - $14,175.00</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/400554">4/22/24 - $23,292.50</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/390968">1/8/24 - $13,335.00</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/357072">11/6/23 - $17,535.00</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/313478">10/23/23 - $22,645.00</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/156507">9/18/23 - $46,025.00</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/95854">8/11/23 - $16,410</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/93549">6/26/23 - $15,090</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/89720">4/24/23 - $24,540</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/87444">3/17/23 - $40,380</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/85108">2/17/23 - $19,755</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/82744">1/6/23 - $22,575</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/80927">11/23/22 - $18,435</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/77318">10/11/22 - $17,415</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/73114">8/12/22 - $34,121.75</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/71510">7/8/22 - $18,675</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/70762">6/27/22 - $18,675</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/69755">6/10/22 - $18,030</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/68836">5/20/22 - $72,460</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/67909">5/5/22 - $12,810</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/59107">11/4/21 - $18,750</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/56325">9/16/21 - $20,865</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/52979">8/13/21 - $12,900</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/51506">7/9/21 - $82,503.65</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/47945">5/7/21 - $54,270</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/43483">2/18/21 - $42,150</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/43026">2/9/21 - $1,290</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/38868">11/25/20 - $24,150</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/37605">11/5/20 - $37,680</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/27626">6/4/20 - $11,880</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/23359">3/18/20 - $12,690</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/22804">3/3/20 - $7,140</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/20322">2/4/20 - $8,415</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/17017">12/11/19 - $15,600</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/15268">11/7/19 - $11,619.99</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/13574">10/1/19 - $13,758.40</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/11373">9/3/19 - $44,458.38</a></p>

        </div>
      )}


      </div>

      {/* McManimon, Scotland & Baumann, LLC */}
      <div className="accordion-item">
        <button
          className={`accordion-header ${openIndex === 6 ? "active" : ""}`}
          onClick={() => toggleAccordion(6)}
          aria-expanded={openIndex === 6}
        >
          McManimon, Scotland & Baumann, LLC - $21,000
          <span className="accordion-arrow" />
        </button>
        {openIndex === 6 && (
          <div className="accordion-content">
            <p>Several employees have donated a total of $21,000 to McGreevey, including Joseph Baumann, Kevin McManimon, and 11 more partners and members of the lawfirm. These donations have been deemed suspicious because they average around $2,000 per donation, and they have been awarded several contracts in Jersey City, listed below.</p>

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

      {/*Florio Kenny Raval, LLP*/}
    <div className="accordion-item">
        <button
          className={`accordion-header ${openIndex === 7 ? "active" : ""}`}
          onClick={() => toggleAccordion(7)}
          aria-expanded={openIndex === 7}
        >
          Florio Kenny Raval, LLP - $4,500
          <span className="accordion-arrow" />
        </button>
        {openIndex === 7 && (
          <div className="accordion-content">
            <p>McGreevey has received $1,000 from the law firm itself, and $3,500 from Edward Florio. These donations have been deemed suspicious because the lawfirm has received several contracts and renewals to a contract to represent the city in tax appeals. All of the resolutions are shown below.</p>
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

    {/*Rainone Coughlin Minchello LLC*/}
      <div className = "accordion-item">
        <button
          className ={`accordion-header ${openIndex === 8 ? "active" : ""}`}
          onClick={() => toggleAccordion(8)}
          aria-expanded={openIndex === 8}>
          Rainone Coughlin Minchello LLC - $27,633
          <span className="accordion-arrow" />
        </button>
        {openIndex === 8 && (
          <div className="accordion-content">
            <p>McGreevey has recieved a total of $12,000 from the law firm, a total of $5,500 from Louis Rainone, a total of $5,500 from David Minchello, and a total of $3,800 from Craig Coughlin. These donations have been deemed suspicious because the law firm has received several contracts from Jersey City. This could fall under conflict of interest or possible future influence if McGreevey is elected. The contracts are listed below.</p>
            <p><strong>Res 24-702 </strong>The Jersey City Municipal Council approved a one-year professional services agreement with the law firm Rainone Coughlin Minchello, LLC to represent the city in various union arbitrations. The contract, effective June 1, 2024, is valued at up to $30,000, with an hourly rate of $175 including expenses. The firm was selected under the “fair and open” process of New Jersey’s Pay-to-Play law and has certified compliance with political contribution restrictions and affirmative action requirements. An initial $5,000 is available in the city’s budget, with future payments subject to budget appropriations. The resolution and agreement will be publicly available and published as required by law. <a href="https://cityofjerseycity.civicweb.net/document/406303">Resolution PDF</a></p>
            <p><strong>Res 23-766 </strong>This resolution from the City of Jersey City ratifies a professional services agreement with the law firm Rainone Coughlin Minchello, LLC. The firm is retained to provide legal advice and counsel regarding JCSA SOE Double Time and Contract Negotiations. The agreement is for one year, effective July 11, 2023, with a total contract amount not to exceed $30,000.00, including expenses, at an hourly rate of $175.00. These services are considered professional services and are exempt from public bidding under the Local Public Contracts Law. The resolution was approved on October 12, 2023. <a href="https://cityofjerseycity.civicweb.net/document/172601">Resolution PDF</a></p>
            <p><strong>Res 23-317 </strong>The Jersey City Municipal Council renewed its professional services agreement with Rainone Coughlin Minchello, LLC to represent the city in various arbitrations. The firm has provided these services since 2019 under multiple renewals and amendments, with the current renewal effective January 1, 2023. This amendment increases the contract by $60,000, bringing the total to $190,000, with services billed at $150 per hour including expenses. The agreement is awarded under New Jersey’s “fair and open” Pay-to-Play process, is exempt from competitive bidding, and requires compliance with affirmative action and the city’s Pay-to-Play Reform Ordinance. The resolution will be published as required by law, with $10,000 currently allocated from the city’s budget. <a href="https://cityofjerseycity.civicweb.net/document/86533">Resolution PDF</a></p>
            <p><strong>Res 22-285 </strong>The Jersey City Municipal Council amended its professional services agreement with Rainone Coughlin Minchello, LLC, which has represented the city in arbitration matters since 2019. The amendment increases the contract by $10,000 to pay outstanding invoices, raising the total contract amount to $95,000. Services are billed at $150 per hour, including expenses, under the “fair and open” Pay-to-Play process. The additional funds will come from the city’s budget account for 2021 fiscal year legal expenses. The amendment will be published in a local newspaper as required by law. <a href="https://cityofjerseycity.civicweb.net/document/65060">Resolution PDF</a></p>
            <p><strong>Res 22-215 </strong>This resolution from the City of Jersey City renews a professional services agreement with the law firm Rainone Coughlin Minchello, LLC. The firm will continue to represent the City in various arbitrations for a one-year term effective February 15, 2022. The renewed contract is for a total amount of $35,000.00. This agreement was awarded through a "fair and open process" under the "Pay-to-Play Law" and is exempt from public bidding as a professional service. The resolution, approved on March 9, 2022, also includes requirements for Equal Employment Opportunity (EEO) and Affirmative Action (AA) compliance. <a href="https://cityofjerseycity.civicweb.net/document/63320">Resolution PDF</a></p>
            <p><strong>Res 21-287 </strong>The City of Jersey City has amended a professional services agreement with Rainone Coughlin Minchello, LLC, to represent the City in various arbitrations. This amendment, approved on April 15, 2021, increases the contract amount by an additional $75,000.00, bringing the total not to exceed $125,000.00, including expenses. The firm will provide services at an hourly rate of $150.00, with a cap on annual increases to the hourly rate. The contract was awarded under the "fair and open process" of the Pay-to-Play Law. The resolution also mandates compliance with Equal Employment Opportunity (EEO) and Americans with Disabilities Act (ADA) provisions. <a href="https://cityofjerseycity.civicweb.net/document/44682">Resolution PDF</a></p>
            <p><strong>Res 20-506 </strong>The City of Jersey City has amended and renewed a professional services agreement with Rainone Coughlin Minchello, LLC, to continue representing the City in various arbitrations. This renewal, approved on July 15, 2020, increases the contract amount by an additional $25,000.00, bringing the new total not to exceed $50,000.00, including expenses. The agreement extends for an additional twelve months, effective February 15, 2020, due to ongoing arbitration matters. The contract was awarded under the "fair and open process" of the Pay-to-Play Law and is exempt from the twelve-month term limit for professional services contracts due to its nature. The resolution also mandates compliance with Equal Employment Opportunity (EEO) and Americans with Disabilities Act (ADA) provisions. <a href="https://cityofjerseycity.civicweb.net/document/28327">Resolution PDF</a></p>
            <p><strong>Res 20-137 </strong>The Jersey City Municipal Council renewed the professional services agreement with Rainone Coughlin Minchello, LLC to represent the city, the Police Department, and Officer David McNeese in the ongoing federal lawsuit Jauwyince Fountain v. City of Jersey City, et al. The renewal, effective January 22, 2020, increases the contract by $50,000, bringing the total to $125,000. The firm was selected under the “fair and open” Pay-to-Play process and is exempt from competitive bidding as a professional service. The agreement requires compliance with affirmative action laws and the city’s Pay-to-Play Reform Ordinance. Funds for the contract are available in the city’s budget, and the resolution will be published as required by law. <a href="https://cityofjerseycity.civicweb.net/document/19762">Resolution PDF</a></p>
            <p><strong>Res 19-305 </strong>The City of Jersey City has ratified a professional services agreement with Rainone Coughlin Minchello, LLC, to represent the City in an arbitration regarding double-time pay for a March 6, 2018 snowstorm emergency. The law firm will be compensated at an hourly rate of $150.00, with a total contract amount not to exceed $25,000.00. This agreement, effective February 15, 2019, is exempt from public bidding as a professional service and was awarded through the "fair and open process" under the Pay-to-Play Law. The resolution ensures the firm's compliance with Affirmative Action Amendments to the Law against Discrimination and mandates public inspection of the agreement. <a href="https://cityofjerseycity.civicweb.net/document/7881">Resolution PDF (pgs 828-830)</a></p>
            <p><strong>Res 19-174 </strong>The Jersey City Municipal Council ratified a professional services agreement with Rainone Coughlin Minchello, LLC to represent the City, the Jersey City Police Department, and Officer David McNeese in the federal lawsuit Jauwyince Fountain v. City of Jersey City, et al. The contract, effective January 22, 2019, is for one year with a total amount not to exceed $75,000, billed at $150 per hour including expenses. The firm was selected through a publicly advertised Request for Qualifications under the “fair and open” Pay-to-Play process and is exempt from competitive bidding as a professional service. The agreement requires compliance with affirmative action laws and the City’s Pay-to-Play Reform Ordinance. Funds for the contract were encumbered in the 2019 fiscal year budget, with continuation dependent on sufficient appropriation in subsequent budgets. <a href="https://cityofjerseycity.civicweb.net/document/7925">Resolution PDF (pgs 550-579) </a></p>
          
            <p><a href="https://cityofjerseycity.civicweb.net/document/412458">10/10/24 - $2,918.60</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/396109">3/1/24 - $1,262.10</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/390968">1/8/24 - $1,167</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/390093">12/11/23 - $595</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/357072">11/6/23 - $10,895.65</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/99143">9/5/23 - $3,458.70</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/95854">8/11/23 - $8,054</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/93549">6/26/23 - $13,422.10</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/84304">2/3/23 - $600</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/82744">1/6/23 - $3,537.60</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/80927">11/23/22 - $4,148.60</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/73114">8/12/22 - $10,485.55</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/69755">6/10/22 - $15,958.16</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/67909">5/5/22 - $10,232.12</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/67367">4/22/22 - $10,678.46</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/52979">8/13/21 - $9,900.96</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/51506">7/9/21 - $9,399.75</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/48496">5/21/21 - $210</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/47945">5/7/21 - $4,341.25</a></p>
            
          </div>
        )}
      </div>

      {/*Antonelli Kantor Rivera*/}
      <div className="accordion-item">
        <button
          className={`accordion-header ${openIndex === 9 ? "active" : ""}`}
          onClick={() => toggleAccordion(9)}
          aria-expanded={openIndex === 9}
        >
          Antonelli Kantor Rivera - $10,000
          <span className="accordion-arrow" />
        </button>
        {openIndex === 9 && (
          <div className="accordion-content">
              <p>
                The company has donated a total of $5,000 to McGreevey's campaign and Daniel Rivera has donated $5,000 as well. The law firm has received a contract from Jersey City in 2024. This could be seen as a conflict of interest or possible future influence if McGreevey is elected.
              </p>
                <p>
                  <strong>Res 24-412</strong>: This resolution from the City of Jersey City ratifies a professional services agreement with the law firm Antonelli Kantor Rivera. The firm will represent Paul Tamburelli in the case of "Synea Hicks v. City of Jersey City et al.". The contract is for a one-year term, effective from January 1, 2024, with a total amount not to exceed $30,000.00, including expenses, at an hourly rate of $175.00. The resolution was approved on May 22, 2024{" "}
                  <a
                    href="https://cityofjerseycity.civicweb.net/document/402028/Ratifying%20a%20professional%20services%20agreement%20wit.pdf?handle=9B13DF77BC3D428E9E9E99B86C07B524"
                  >
                    Resolution PDF
                  </a>
                </p>
          </div>
        )}
      </div>

      {/*Nicholas Netta*/}
    <div className="accordion-item">
        <button
          className={`accordion-header ${openIndex === 10 ? "active" : ""}`}
          onClick={() => toggleAccordion(10)}
          aria-expanded={openIndex === 10}
        >
          Nicholas Netta - Netta Architects LLC - $7,000
          <span className="accordion-arrow" />
        </button>
        {openIndex === 10 && (
          <div className="accordion-content">
            <p>McGreevey has received a total of $5,000 from multiple donations from Nicholas Netta. Netta Architects has received several contracts and amendments related to constuction projects with firehouses. This has beend deemed a suspicious donation because it could represent conflict of interest with the company.</p>
            <p><strong>Res 25-077 </strong>This resolution ratifies a third amendment to a contract with Netta Architects for services related to the Engine Co. #10 and Ladder #12 New Firehouse project. The original contract was for schematic design, design development, construction documents, and construction administration services. Previous amendments were made due to geotechnical and environmental evaluations, contaminated groundwater, and design changes, which increased the contract amount and extended the term. Due to COVID-19 supply chain issues, unforeseen subsurface conditions, and a Stop Work Order, the project experienced extensive delays, and the initial construction company was declared in default. This third amendment provides an additional $384,676.72 for supplemental geotechnical investigation services, modifications to contract documents, and additional bid assistance and construction administration services, bringing the total contract amount to $1,080,830.00. The contract term is also extended for an additional twenty-four months, from June 28, 2023, to June 28, 2025. <a href="https://cityofjerseycity.civicweb.net/document/93088/R0205683_%20NETTA%20ARCHITECTS%20Amending%20Resolution.pdf?handle=F8D8DEFAC3D64A89BAD9FE83F3C75CC6">Resolution PDF</a></p>
            <p><strong>Res 22-420 </strong>This resolution from the City of Jersey City ratifies a second amendment to a professional services contract with Netta Architects. The amendment is for schematic design, design development, construction documents, and construction administration services for the new Engine Co #10 and Ladder #12 Firehouse. Due to unforeseen site conditions, including the need for geotechnical and environmental evaluations and subsequent redesign, the contract amount was increased by an additional $220,500.00, bringing the total to $818,000.00. The original contract for $498,500.00 was awarded in August 2018 for a 36-month term, with previous amendments increasing the total to $597,500.00. This agreement was processed as a professional service, exempt from public bidding, and complies with "Pay-to-Play" regulations. <a href="https://cityofjerseycity.civicweb.net/document/66670/Resolution%20Ratifying%20a%20Second%20Amendment%20to%20a%20co.pdf?handle=F0C6148D03F74F37A3A38DCDD3F0750C">Resolution PDF</a></p>
            <p><strong>Res 20-541 </strong>The City of Jersey City has authorized an amendment to its contract with Netta Architects for services related to the Engine Co. #10 - New Firehouse project. This amendment, approved on August 12, 2020, increases the total contract amount by an additional $29,400.00, bringing the new total to $626,900.00. The amendment is necessary due to the discovery of contaminated groundwater at the site, requiring the design and incorporation of a sub-slab vapor mitigation system. Netta Architects will provide architectural, MEP engineering, and civil engineering services for this additional work. The original contract and previous amendments were also for schematic design, design development, construction documents, and construction administration services. <a href="https://cityofjerseycity.civicweb.net/document/31444/Resolution%20authorizing%20an%20amendment%20to%20Netta%20Ar.pdf?handle=B97332BC06AE4503AFEA397F2A18DF96">Resolution PDF</a></p>
          </div>
        )}
    </div>

    {/* Boswell Engineering */}
    <div className="accordion-item">
      <button
        className={`accordion-header ${openIndex === 11 ? "active" : ""}`}
        onClick={() => toggleAccordion(11)}
        aria-expanded={openIndex === 11}
      > 
        Boswell Engineering - $8,500
        <span className="accordion-arrow" />
      </button>
      {openIndex === 11 && (
        <div className="accordion-content">
            <p>
              McGreevey has received a total of $4,000 from Boswell Engineering. The company has received a contract from Jersey City in 2024. This could be seen as a conflict of interest or possible future influence due to this contract. They have also donated to Solomon, signifying a possible connection to both candidates.
            </p>
            <p>
              The Jersey City Municipal Council approved a resolution to award a $73,500 professional engineering services contract to Boswell Engineering, Inc. for the Grand Street Improvements project (No. 19-014-E). The firm was selected based on its qualifications and compliance with the city's Pay-to-Play and political contribution disclosure regulations. The contract will run for 12 months and is exempt from public bidding under New Jersey law for professional services. Funds for the project are available from account #04-215-55-151-990, and all required compliance and disclosure certifications will be filed with the resolution. The award must be publicly announced within 10 days.{" "}
              <a
                href="https://cityofjerseycity.civicweb.net/document/34505/Resolution%20Awarding%20a%20Professional%20Services%20Con.pdf?handle=C23EDB7B40904F9DBBAB8254A67B2500"
              >
                Resolution
              </a>
            </p>
        </div>
      )}
    </div>

    {/* Peter Roselle - President of Regional Industries LLC, Meadowbrook Industries LLC, and Waste Industries LLC */}
    <div className = "accordion-item">
      <button 
        className={`accordion-header ${openIndex === 12 ? "active" : ""}`}
        onClick={() => toggleAccordion(12)}
        aria-expanded={openIndex === 12}>
        Peter Roselle - President of Regional Industries LLC, Meadowbrook Industries LLC, and Waste Industries LLC - $13,500
        <span className="accordion-arrow" />
      </button>
      {openIndex === 12 && (
        <div className="accordion-content">
          <p>Peter Roselle, the President of Regional Industries, Meadowbrook Industries, and Waste Industries has donated a total of $13,500 to McGreevey's campaign. He donated 3 times on January 29, 2024, when he donated on the same day under his three different companies. These donations have been marked as a red flag because it seems Peter is circumventing the max amount one can donate by listing his employer as his three different companies, which has been marked as Pay2Play by NJ Elec. They have also received a five year contract from Jersey City related to sanitation and waste, listed below.</p>
          <p><strong>Res 20-586 </strong>This resolution (Res. 20-586, approved August 12, 2020) awards a five-year, $77.5 million contract to Regional Industries LLC for night collection of solid waste and recyclables for Jersey City’s Department of Public Works, Division of Sanitation. The contract runs from September 1, 2020, to August 31, 2025, per bid specifications and state regulations. Regional Industries submitted the only bid, which the Purchasing Director deemed fair and reasonable. An initial $400,000 is allocated from account 01-201-26-290-314, with future payments subject to annual budget appropriations. The contract requires compliance with affirmative action laws, proper receipt of services before payment, and execution by the Mayor or Business Administrator.</p>
        </div>
      )}
    </div>

    {/* Angelo Genova and James Burns - Genova Burns LLC */}
    <div className="accordion-item">
      <button
        className={`accordion-header ${openIndex === 13 ? "active" : ""}`}
        onClick={() => toggleAccordion(13)}
        aria-expanded={openIndex === 13}
      >
        Angelo Genova and James Burns = Genova Burns LLC - $10,400
        <span className="accordion-arrow" />
      </button>
      {openIndex === 13 && (
        <div className="accordion-content">
          <p>Genova Burns LLC made significant donations of $5,200 each from partners Angelo Genova and James Burns to former Jersey City Mayor Jim McGreevey’s campaign. The firm has appeared as legal counsel in major development projects in Jersey City, including the rehabilitation of the historic Great Atlantic & Pacific Auxiliary Building and Bakery. In 2020, the Planning Board approved Warren at Bay’s site plan (Case P19-123) with deviations for office and retail use, streetscape improvements, and public art, following certificates of appropriateness from the Historic Preservation Commission. In 2023, the Board approved an amendment (Case P22-099) allowing additional retail entryways, garage and accordion-style doors, internal reconfigurations, and a mezzanine, with no new deviations required. These approvals involved high-value changes to a historic property, creating potential incentives for political influence. The combination of large campaign donations and subsequent project approvals raises red flags for possible “pay-to-play” practices, suggesting that contributions may have helped secure favorable treatment from city officials. <a href= "https://cityofjerseycity.civicweb.net/document/433891">Resolution PDF (pgs 503-521) </a></p>
          <p><strong>Res 22-779 </strong>Genova Burns LLC, represented by attorney Gerard D. Pizzillo, served as legal counsel for Perennial Group Corporation in its application to open a Class 5 Cannabis Retail Dispensary at 284 First Street in Jersey City. The firm prepared and submitted the conditional use application to the Planning Board, ensuring compliance with the city’s Land Development Ordinance and cannabis regulations. They coordinated required supporting documents, including a Community Impact Plan, Workforce Plan, Diversity Plan, and Buffer Maps. Genova Burns also presented the project and applicant testimony at the public hearing, responding to Board and staff recommendations. Their work resulted in Planning Board approval, subject to conditions, allowing the project to proceed. <a href="https://cityofjerseycity.civicweb.net/document/77954">Resolution PDF</a></p>
          <p><strong>Res 22-675 </strong>Genova Burns LLC, through attorneys Gerard D. Pizzillo and Charles Messina, represented The Leaf Joint, LLC in its application before the Jersey City Cannabis Control Board for a Class 5 Retail Cannabis Dispensary license. They presented the business plan, highlighted the microbusiness structure, and emphasized the owners’ community service and social equity commitments. The firm coordinated witness testimony to demonstrate compliance with city ordinances and the applicant’s positive community impact. They also addressed board concerns about security, buffer zones, and regulatory compliance, countering objections from a competing dispensary’s attorney. Their advocacy helped secure unanimous Board approval for the application without any conditions. <a href="https://cityofjerseycity.civicweb.net/document/74396">Resolution PDF</a></p>
          <p><strong>Res 22-264 </strong>Genova Burns LLC is present here as the attorney representing the creditors, specifically the MEPT Journal Square Urban Renewal entities. The City of Jersey City owed these entities a large debt of $2,710,769. The judgment records that the court recognized the MEPT companies’ claim and awarded them the amount owed. Genova Burns handled the legal proceedings on behalf of the MEPT entities, filing motions and representing their interests in court. <a href="https://cityofjerseycity.civicweb.net/document/66464">Resolution PDF</a></p>
        </div>
      )}
    </div>

    {/* Barry Wiegmann - SHULMAN WIEGMANN AND ASSOCIATES */}
    <div className="accordion-item">
      <button
        className={`accordion-header ${openIndex === 14 ? "active" : ""}`}
        onClick={() => toggleAccordion(14)}
        aria-expanded={openIndex === 14}
      >
        Barry Wiegmann - Shulman Wiegmann and Associates - $1,600
        <span className="accordion-arrow" />
      </button>
      {openIndex === 14 && (
        <div className="accordion-content">
          <p>Barry Wiegmann donated $1,600 to McGreevey's campaign in 2024. The donations are suspicious because they came after the city awarded contracts, which could give the appearance that the donor is rewarding favorable treatment. Even if legally allowed, such timing can suggest a pay-to-play dynamic or attempt to maintain influence. The contracts are listed below.</p>
          <p><strong>Res 23-394 </strong>The City of Jersey City awarded a $40,000 contract to Schulman, Wiegmann & Associates for court reporting services during City Council meetings from June 1, 2023, to May 31, 2024. The vendor was selected after informal solicitation of three quotes and deemed the most advantageous by the Purchasing Director. Schulman, Wiegmann & Associates submitted all required certifications, including Business Entity Disclosure, Political Contribution Disclosure, and Pay-to-Play compliance, confirming no prohibited political contributions. Payments will be made after services are certified as performed, following state fiscal law. Continuation of the contract beyond the current budget year depends on the availability of funds in future budgets. <a href="https://cityofjerseycity.civicweb.net/document/91075">Resolution PDF</a></p>
          <p><strong>Res 22-800 </strong>The City of Jersey City ratified a one-year, $20,000 contract with Schulman, Wiegmann & Associates to provide court reporting services to the Jersey City Cannabis Control Board, effective September 1, 2022. The contract qualifies as a professional services agreement procured without public bidding under state law. The vendor submitted all required certifications, including Business Entity Disclosure, Political Contribution Disclosure, Pay-to-Play compliance, and Affirmative Action compliance. Payment will be made from the designated city account once funds are available, and the contract continuation depends on future budget appropriations. The resolution and agreement will be publicly available and published in a newspaper as required by law. <a href="https://cityofjerseycity.civicweb.net/document/77355">Resolution PDF</a></p>
          <p><strong>Res 22-562 </strong>The City of Jersey City awarded a one-year contract to Schulman, Wiegmann & Associates for $30,830 to provide court reporting services for City Council meetings from May 2022 to May 2023. The contract was procured through informal quotes and qualifies as a Pay-to-Play-compliant professional services contract. The vendor submitted all required certifications, including Business Entity Disclosure, Political Contribution Disclosure, and Pay-to-Play compliance. Payment will be made from the designated city account once services are certified as completed, and continuation depends on future budget appropriations. All certifications and the resolution will be placed on file for public record. <a href="https://cityofjerseycity.civicweb.net/document/71989">Resolution PDF</a></p>
          <p><strong>Res 21-347 </strong>The City of Jersey City has authorized a contract award to Schulman, Wiegmann & Associates for court reporting services during Council meetings and other official proceedings. The contract is for $30,830.00 and is effective from April 24, 2021, through April 23, 2022. The services were procured through an informal solicitation of three quotes, with Schulman, Wiegmann & Associates' proposal deemed most advantageous. The firm has a track record of over 25 years with Jersey City and will maintain their previous rates of $300 for the first four hours of attendance and $6.50 per page of transcript for regular delivery. The resolution also ensures compliance with "Pay-to-Play Law" provisions, requiring certifications regarding political contributions and adherence to Equal Employment Opportunity (EEO) and Americans with Disabilities Act (ADA) guidelines. <a href="https://cityofjerseycity.civicweb.net/document/46876">Resolution PDF</a></p>
          <p><strong>Res 20-235 </strong>The City of Jersey City has awarded a contract to Schulman, Wiegmann & Associates for court reporting services during Council meetings for the Office of the City Clerk. The contract amount is $30,830.00. These services are necessary to transcribe spoken or recorded speech into written form, producing official transcripts of City Council meetings and other official proceedings. The Purchasing Director informally solicited three quotes, and Schulman, Wiegmann & Associates' proposal was deemed most advantageous. The contract, effective from March 15, 2019, to March 15, 2020, was awarded as a statutorily permitted contract under the "Pay-to-Play Law." <a href="https://cityofjerseycity.civicweb.net/document/23343">Resolution PDF</a></p>
          <p><strong>Res 19-371 </strong>The City of Jersey City awarded a one-year contract to Schulman, Wiegmann & Associates for $30,800 to provide court reporting services for City Council meetings from April 24, 2019, to April 23, 2020. The contract was obtained through informal solicitation of three quotes and qualifies as a Pay-to-Play-compliant professional services agreement. The contractor submitted all required certifications, including Business Entity Disclosure, Political Contribution Disclosure, and Pay-to-Play compliance. Payment will be made once services are certified as completed, in accordance with local fiscal law. Continuation of the contract depends on the availability of funds in the city’s budget, and all certifications will be filed with the resolution. <a href="https://cityofjerseycity.civicweb.net/document/7933">Resolution PDF (pgs 157-171)</a></p>
          <p><strong>Res 19-116 </strong>The City of Jersey Council approved an amendment to the contract with Schulman, Wiegmann & Associates for court reporting services. The original one-year contract from April 1, 2018, to March 31, 2019, was $28,200, and an earlier $5,000 increase had already been added. Due to longer Council meetings in early 2019, an additional $6,300 was added, bringing the total contract amount to $39,500. This change exceeds 20% of the original contract, requiring formal Council approval under state regulations. Notice of the contract amendment will be published in a local newspaper as required by law. <a href="https://cityofjerseycity.civicweb.net/document/5330">Resolution PDF (pgs 578-586) </a></p>
        </div>
      )}
    </div>

    {/* Waters, McPherson, McNeil */}
    <div className="accordion-item">
      <button
        className={`accordion-header ${openIndex === 15 ? "active" : ""}`}
        onClick={() => toggleAccordion(15)}
        aria-expanded={openIndex === 15}
      >
        David McPherson - $22,300
        Mark McPherson - $10,400
        Waters, McPherson, McNeil - $31,200
        <span className="accordion-arrow" />
      </button>
      {openIndex === 15 && (
        <div className="accordion-content">
          <p>The donations from Waters, McPherson, McNeil P.C., including a personal contribution from David McPherson, to Jim McGreevey and other Jersey City candidates raise potential red flags due to the firm’s direct financial and business interests with the city, as well as the timing of these contributions. The law firm represents Honeywell International Inc. in environmental remediation projects affecting public rights-of-way in Jersey City, including the execution and termination of Notices in Lieu of Deed Notices, such as the resolution approving the updated NILODN for Fisk Street and other ROWs in July 2024 (<a href="https://cityofjerseycity.civicweb.net/document/406670">Resolution PDF</a>). Additionally, the firm has historically represented developers in high-value waterfront redevelopment projects in the city (<a href="https://www.lawwmm.com/HudsonRiverRedev.asp">Waters, McPherson, McNeil Hudson River Waterfront Redevelopment</a>). The firm has also received substantial payments from the city itself, including $448,690.70 (<a href="https://cityofjerseycity.civicweb.net/document/436252">8/14/25</a>), $338,281.63 (<a href="https://cityofjerseycity.civicweb.net/document/403052">5/14/25</a>), $26,852.32 (<a href="https://cityofjerseycity.civicweb.net/document/387879">11/22/23</a>) $11,510.03 (<a href="https://cityofjerseycity.civicweb.net/document/95854">8/11/2023</a>). The donations, totaling $31,200 from the firm and $5,200 from David McPherson personally, occurred shortly after or around the time of these municipal approvals and expenditures, creating a perception that the contributions could influence officials overseeing matters directly affecting the firm’s clients. While no direct quid pro quo is proven, the overlap of campaign contributions with public decisions and city payments involving the firm constitutes a potential pay-to-play concern and represents a red flag for regulatory or ethical scrutiny.</p>
        </div>
      )}
    </div>

    {/* Spiniello Companies */}
    <div className="accordion-item">
      <button
        className={`accordion-header ${openIndex === 16 ? "active" : ""}`}
        onClick={() => toggleAccordion(16)}
        aria-expanded={openIndex === 16}
      >
        Spiniello Companies - $10,100
        <span className="accordion-arrow" />
      </button>
      {openIndex === 16 && (
        <div className="accordion-content">
         <p><a href="https://cityofjerseycity.civicweb.net/document/426925">4/4/25 - $58,942.69</a></p>
         <p><a href="https://cityofjerseycity.civicweb.net/document/419821">1/24/25 - $124,284.38</a></p>
         <p><a href="https://cityofjerseycity.civicweb.net/document/413149">10/25/24 - $297,428.86</a></p>
         <p><strong>24-454 </strong>the Jersey City Council approved Resolution 24-454 rejecting the lowest bid of $800,000 from Hear Construction, Inc. for the City Hall – Foundation Project (No. 2022-029A), deeming it “unbalanced” and unresponsive since it was significantly lower than the City’s estimated cost. Instead, the contract was awarded to Spiniello Companies, the second lowest responsive and responsible bidder, for $1,175,500. The City authorized a total encumbrance of $1,410,600, which includes a 20% contingency, with funds certified as available under the Department of Infrastructure, Division of Architecture’s capital accounts. <a href="https://cityofjerseycity.civicweb.net/document/403929">Resolution PDF</a></p>
         
        </div>
      )}
    </div>

    {/* United Sales USA Corp */}
      <div className="accordion-item">
        <button
          className={`accordion-header ${openIndex === 17 ? "active" : ""}`}
          onClick={() => toggleAccordion(17)}
          aria-expanded={openIndex === 17}
        >
          United Sales USA Corp - $2,500
          <span className="accordion-arrow" />
        </button>
        {openIndex === 17 && (
          <div className="accordion-content">
            <p>United Sales USA Corp has been receiving expenditures from Jersey City since 2019 and have received several contracts with the city. Because of these transactions, this donation has been flagged as suspicious due to possible conflict of interest and pay-to-play concerns. All of the details are listed below.</p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/419172">Resolution PDF</a> On January 29, 2025, the Jersey City Council approved Resolution 25-067, awarding an open-end, one-year contract to United Sales USA Corp. of Brooklyn, NY, to provide custodial supplies for the Department of Public Works, Division of Solid Waste Recycling. The contract totals $387,786.97, with an initial encumbrance of $60,000 available from the city’s budget. The agreement allows the City to renew for an additional one-year term. Payment will only be made once contract requirements are met, and continuation of the contract depends on future budget appropriations.</p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/92984">Resolution PDF</a>On June 28, 2023, the Jersey City Council approved Resolution 23-512, renewing an open-end contract with United Sales USA Corporation to supply custodial products for the Department of Public Works, Division of Recycling. The renewal covers the period from June 16, 2023, through June 15, 2024, at a maximum cost of $109,284, with $10,000 initially encumbered from the city budget. This renewal was the final option year from the original 2021 contract, which began at $97,089.55 and was increased annually per the Consumer Price Index. Payments are contingent on performance, compliance with specifications, and the availability of future budget funds</p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/68873">Resolution PDF</a>On June 15, 2022, the Jersey City Council approved Resolution 22-446 to renew its custodial supplies contract with United Sales USA Corporation.
The original 2021 contract was for $97,089.55, and the renewal allows spending up to $104,080.00 for one year (June 16, 2022–June 15, 2023), adjusted by the Consumer Price Index.
The City certified $400.00 immediately available, with the rest to be allocated as orders are placed.
Payment depends on the contractor meeting specifications and compliance with fiscal laws.
The contractor must also follow affirmative action requirements under state law.</p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/48809">Resolution PDF</a> On June 16, 2021, the Jersey City Council approved Resolution 21-455 to award an open-end contract to United Sales USA Corporation for custodial supplies for the Department of Public Works, Division of Recycling and Enforcement.
The contract was bid in December 2020, with three companies responding, but only United Sales USA submitted a complete and responsive bid.
United Sales USA’s bid was for $97,089.55, which the Purchasing Agent deemed fair and reasonable.
An initial $5,000 was certified as available, with the rest of the funds to be allocated as orders are placed during the contract term.
The one-year contract may be extended for up to two additional years and requires compliance with fiscal laws and affirmative action regulations.</p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/12343">Resolution PDf</a>On September 13, 2019, the Jersey City Council approved Resolution 19-0736 to renew an open-end contract with United Sales USA Corporation for custodial supplies for the Department of Public Works / Division of Buildings and Street Maintenance.
The original contract was awarded in 2017 for $56,990.00, renewed once in 2018 for $58,585.72, and this resolution exercised the final renewal option.
The new one-year renewal runs from September 14, 2019 to September 13, 2020, with a maximum contract amount of $59,757.46.
An initial $10,000 was certified as available, with the remainder to be provided as service orders are placed.
The contract requires compliance with specifications, fiscal laws, and affirmative action regulations.</p>
          </div>
        )}
      </div>

      {/* Green Flamingo Dispensery */}
      <div className="accordion-item">
        <button
          className={`accordion-header ${openIndex === 18 ? "active" : ""}`}
          onClick={() => toggleAccordion(18)}
          aria-expanded={openIndex === 18}
        >
          Green Flamingo Dispensery - $250
          <span className="accordion-arrow" />
        </button>
        {openIndex === 18 && (
          <div className="accordion-content">
            <p>Green Flamingo Dispensery has donated $250 to McGreevey on April 22, 2024. They rely on city approval to run a cannibis business, which they received on February 8, 2023. While the donation is small, the donation can still raise concerns because the company’s success depends on local licensing and regulatory decisions overseen by city officials. The resolution is listed below.</p>
            <p><strong>Res. 23-099</strong>: On February 8, 2023, the Jersey City Council approved Resolution 23-099 providing local support for Green Flamingo Dispensary, LLC to operate a Class 5 retail cannabis business.
The resolution was made under the New Jersey Cannabis Regulatory and Marketplace Modernization Act and Jersey City’s own cannabis ordinance.
Applicants for cannabis licenses must show municipal approval as part of their application to the State Cannabis Regulatory Commission.
The City’s Cannabis Control Board reviewed Green Flamingo’s application and recommended Council support.
The resolution confirms that Jersey City allows this type of license, has no cap on cannabis businesses, and gives local approval without preference.
              <a
                href="https://cityofjerseycity.civicweb.net/document/83506"
              >
                Resolution PDF
              </a>
            </p>
          </div>
        )}
      </div>

      {/* Atalune INC */}

      <div className="accordion-item">
        <button
          className={`accordion-header ${openIndex === 19 ? "active" : ""}`}
          onClick={() => toggleAccordion(19)}
          aria-expanded={openIndex === 19}
        >
          Atalune INC - $500
          <span className="accordion-arrow" />
        </button>
        {openIndex === 19 && (
          <div className="accordion-content">
            <p>Altalune, Inc., which received city approval to operate a retail cannabis business, contributed $500 to Jim McGreevey. This raises concerns because Altalune’s operations are directly dependent on local licensing and oversight. The resolution is listed below.</p>
            <p><strong>Res 23-989 </strong>On November 29, 2023, the Jersey City Council approved Resolution 23-898 providing local support for Altalune, Inc. to operate a Class 5 retail cannabis business.
The resolution was made under the New Jersey Cannabis Regulatory and Marketplace Modernization Act and Jersey City’s cannabis ordinance.
Applicants for cannabis licenses must show municipal approval as part of their application to the State Cannabis Regulatory Commission.
The City’s Cannabis Control Board reviewed Altalune’s application and recommended Council approval.
The resolution confirms Jersey City allows this type of license, has no cap on cannabis businesses, and grants local approval without preference. <a href="https://cityofjerseycity.civicweb.net/document/387441">Resolution PDF</a></p>
          </div>
        )}
      </div>

      <div className="accordion-item">
        <button
          className={`accordion-header ${openIndex === 20 ? "active" : ""}`}
          onClick={() => toggleAccordion(20)}
          aria-expanded={openIndex === 20}
        >
          USA Architects - $4,000
          <span className="accordion-arrow" />
        </button>
        {openIndex === 20 && (
          <div className="accordion-content">
            <p>USA Architects made a significant donation while actively competing for high-value city contracts, such as the City Hall – Building Exterior Rehabilitation ($419,873) and City Hall – Fourth Floor Alterations ($822,503 bid). These projects involve direct oversight by city officials who could influence contract awards, so the contribution creates an appearance of a potential conflict of interest or political leverage. Their bids are listed in the resolutions below.</p>
            <p><strong>City Hall – Building Exterior Rehabilitation (Res. 22-798, Nov 9, 2022) – $561,286 </strong> <a href="https://cityofjerseycity.civicweb.net/document/77994">Resolution PDF</a></p>
            <p><strong>City Hall – Fourth Floor Alterations (Res. 22-797, Nov 9, 2022) – $822,503</strong> <a href="https://cityofjerseycity.civicweb.net/document/77542">Resolution PDF</a></p>
            <p><strong></strong></p>
          </div>
        )}
      </div>

      <div className="accordion-item">
        <button
          className={`accordion-header ${openIndex === 21 ? "active" : ""}`}  
          onClick={() => toggleAccordion(21)}
          aria-expanded={openIndex === 21}
        >
          A-Tech Concrete Co., Inc. - $1,000
          <span className="accordion-arrow" />
        </button>
        {openIndex === 21 && (
          <div className="accordion-content">
            <p>A-Tech Concrete donated McGreevey $1,000. This company has received expenditure payments from the city and has bidded on several contracts. This donation has been marked as a red flag because it creates the appearance of a potential conflict of interest, where campaign contributions could influence the awarding of city contracts. Given their ongoing business relationship with the city, even a relatively small donation may raise concerns about favoritism or undue influence in the procurement process. The expenditures and bidded contracts are listed below.</p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/60449">12/8/21 - $5,065.44</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/52979">8/13/21 - $32,328.87</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/50909">6/25/21 - $65,431.50</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/42857">2/5/21 - $218,501.17</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/40872">1/11/21 - $97,386.48</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/39624">12/10/20 - $162,171.36</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/37605">11/5/20 - $134,527.93</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/35574">9/29/20 - $19,600</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/33761">9/1/20 - $11,539.39</a></p>
            <p><strong>Site safety improvements at #3 - $2,499,000.00 </strong><a href="https://cityofjerseycity.civicweb.net/document/33632">Resolution PDF</a></p>
            <p><strong>Improvements to the playground area in Boyd McGuiness Park - $102,927.00 </strong><a href="https://cityofjerseycity.civicweb.net/document/33431">Resolution PDF</a></p>
            <p><strong>Site improvements to Ferris Triangle Park - $699,200.00 </strong><a href="https://cityofjerseycity.civicweb.net/document/33188">Resolution PDF</a></p>
            <p><strong>Site improvements to Audobon Park - $887,500.00 </strong><a href="https://cityofjerseycity.civicweb.net/document/33140">Resolution PDF</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/32473">8/6/20 - $145,850.95</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/28568">6/16/20 - $92.855.00</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/26642">5/14/20 - $94,080.00</a></p>
          </div>
        )}
      </div>


      {/* Reliable Tree Services INC */}
      <div className="accordion-item">
        <button
          className={`accordion-header ${openIndex === 22 ? "active" : ""}`}
          onClick={() => toggleAccordion(22)}
          aria-expanded={openIndex === 22}
        >
          Reliable Tree Services INC - $15,200
          <span className="accordion-arrow" />
        </button>
        {openIndex === 22 && (
          <div className="accordion-content">
            <p>Reliable Tree Services INC's $4,000 donation has been flagged due to a possible conflict of interest, as the company has received city expenditures and has been awarded a contract. This situation raises concerns under Pay-to-Play regulations, where political contributions may influence the awarding of public contracts. Given their financial ties to the city, the donation could create the appearance that the company is seeking preferential treatment or leveraging political contributions to secure business. The expenditures and resolution are listed below. </p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/95854">8/11/23 - $42,000.000</a></p>
            <p><strong>Res 23-534 </strong>The City of Jersey City awarded a contract to Reliable Tree Services Inc. for Hamilton Park tree maintenance and removal, Project No. 2023-009, through a public bidding process. Reliable Tree Services submitted the lowest responsible bid of $42,000, with an additional 20% contingency, bringing the total encumbrance to $50,400, available in the city’s capital account. The City’s Purchasing Director certified the bid as fair and reasonable, and the contract requires confirmation that work meets specifications before payment. The award is contingent on the contractor’s compliance with Affirmative Action laws. The Mayor or Business Administrator is authorized to execute the contract on behalf of the city. <a href="https://cityofjerseycity.civicweb.net/document/89081">Resolution PDF</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/55789">9/3/21 - $5,000.00</a></p>
          </div>
        )}
      </div>

      {/* Albio Sires */}
      <div className="accordion-item">
        <button
          className={`accordion-header ${openIndex === 23 ? "active" : ""}`}
          onClick={() => toggleAccordion(23)}
          aria-expanded={openIndex === 23}
        >
          Albio Sires - $15,000
          <span className="accordion-arrow" />
        </button>
        {openIndex === 23 && (
          <div className="accordion-content">
            <p>The donations from Sires-affiliated entities to a Jersey City mayoral candidate could be considered potential red flags because they originate from out-of-district political actors and campaign organizations rather than local constituents, signaling possible external influence on local elections. Sires is a former U.S. Congressman from New Jersey and part of the Democratic establishment, so these contributions may indicate establishment backing rather than grassroots support. The sizeable amounts, combined with the donors’ political connections, raise concerns that the candidate could be favoring outside interests or politically connected groups over local priorities.</p>
          </div>
        )}
      </div>

      {/* Archer & Greiner*/}
      <div className="accordion-item">
        <button
          className={`accordion-header ${openIndex === 24 ? "active" : ""}`}
          onClick={() => toggleAccordion(24)}
          aria-expanded={openIndex === 24}
        >
          Archer & Greiner - $20,800
          Employee Donations - $17,000

          <span className="accordion-arrow" />
        </button>
        {openIndex === 24 && (
          <div className="accordion-content">
            <p>Archer & Greiner, P.C. has received multiple substantial payments from Jersey City over the years, going back to 2021. Recurring city expenditures and significant political contributions from the firm and its employees raises potential concerns about conflicts of interest or the perception of undue influence in the local election.</p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/436252">8/14/25 - $371,020.95</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/91884">5/24/23 - $5,253.30</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/89895">4/26/23 - $46,280.96</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/84565">2/7/23 - $31,105.83</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/76497">9/20/22 - $140,568.23</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/47202">4/28/21 - $2,825.24</a></p>

          </div>
        )}
      </div>

      {/* Plaza Auto Body Inc */}

      <div className="accordion-item">
        <button
          className={`accordion-header ${openIndex === 25 ? "active" : ""}`}
          onClick={() => toggleAccordion(25)}
          aria-expanded={openIndex === 25}
        >
          Plaza Auto Body Inc - $700
          <span className="accordion-arrow" />
        </button>
        {openIndex === 25 && (
          <div className="accordion-content">
            <p>Plaza Auto Body Inc has donated $700 to Jim McGreevey. This donation has been deemed suspicious because the company has also received substantial payments from the City of Jersey City for collision repair contracts, creating a potential conflict of interest. This raise questions about whether the contribution could be intended to influence contract renewals or maintain favorable treatment, rather than being a purely voluntary political contribution. </p>
            <p><strong>Res. 25-354 </strong>The City of Jersey City approved Resolution 25-354 on May 21, 2025, to renew one-year open-end contracts with Plaza Auto Body Inc. and Vavi’s Auto Sales, LLC for collision repairs for the Department of Public Works, Division of Automotive Maintenance. The renewal follows the original contracts awarded in June 2024, with total contract amounts of $176,146.95 for Plaza and $245,786.44 for Vavi, and includes adjustments based on the U.S. Department of Commerce Index Rate. The contracts are effective June 13, 2025, and payments will be made as orders are placed, subject to available funds and certification of compliance with contract specifications. The contractors must also provide evidence of compliance with the Affirmative Action Amendments to the Law Against Discrimination. The resolution ensures that continuation of the contracts depends on the availability of sufficient funds in the 2025 permanent budget. <a href="https://cityofjerseycity.civicweb.net/document/429251">Resolution PDF</a></p>
            <p><strong>Res. 24-457 </strong>On June 12, 2024, Jersey City approved Resolution 24-457 to award one-year open-end contracts to Plaza Auto Body Inc. and Vavi’s Auto Sales, LLC for collision repairs for the Department of Public Works, Division of Automotive Maintenance, effective June 13, 2024, to June 12, 2025. Plaza was designated the primary vendor with an hourly labor rate of $31 and a total estimated cost of $172,000, while Vavi, the alternate vendor, had an hourly rate of $65 with a total estimated cost of $240,000. The contracts were based on estimated labor of 2,000 hours and $100,000 in parts and materials, with a 10% markup on materials, and the City reserves the right to extend the contracts for two additional one-year terms. Payments are to be made as services are ordered, contingent upon certification that the vendors complied with specifications, and funds are available in the designated automotive operating account. Contractors must also provide evidence of compliance with the Affirmative Action Amendments to the Law Against Discrimination, and continuation of the contracts depends on sufficient appropriation in the 2024 permanent budget. <a href="https://cityofjerseycity.civicweb.net/document/403033">Resolution PDF</a></p>
            <p><strong>Res. 23-349 </strong>On May 10, 2023, Jersey City approved Resolution 23-349 to renew one-year open-end contracts with Plaza Auto Body Inc., Diamond Auto Sales, and Vavi’s Auto Sales, LLC for collision repairs for the Department of Public Works, Division of Automotive Maintenance, effective May 14, 2023, through May 13, 2024. The contracts are based on estimated labor of 2,000 hours and $100,000 in parts and materials, with hourly labor rates of $32 for Plaza and Diamond and $52 for Vavi, and markups of 5–10%, resulting in total maximum costs of $169,000, $174,000, and $210,000 respectively. The City retains the option to extend the contracts for two additional one-year periods, using prior-year prices adjusted by the Federal Consumer Price Index. Payments are made as services are ordered, contingent upon certification that the vendors have met all specifications, and funds are available in the designated automotive operating account. Contractors are also required to provide evidence of compliance with the Affirmative Action Amendments to the Law Against Discrimination, and continuation of the contracts depends on sufficient appropriations in the City’s budget. <a href="https://cityofjerseycity.civicweb.net/document/89111">Resolution PDF</a></p>
            <p><strong>Res. 22-367 </strong>On May 11, 2022, Jersey City approved Resolution 22-367 to renew one-year open-end contracts with Plaza Auto Body, DABJC, Inc. (Diamond Auto Body), and Vavi’s Auto Sales, LLC for collision repairs for the Department of Public Works, Division of Automotive Maintenance, effective May 14, 2022, through May 13, 2023. The contracts are based on estimated labor of 2,000 hours and $100,000 in parts and materials, with hourly labor rates of $32 for Plaza and Diamond and $52 for Vavi, and markups of 5–10%, resulting in total maximum costs of $169,000, $174,000, and $210,000 respectively. The City reserves the right to extend the contracts for up to two additional one-year periods, using prior-year prices adjusted by the Federal Consumer Price Index. Payments are made as services are ordered, contingent upon certification that the vendors have met all specifications, and funds are available in the designated automotive operating account. Contractors are required to provide evidence of compliance with the Affirmative Action Amendments to the Law Against Discrimination, and continuation of the contracts depends on sufficient appropriations in the City’s budget. <a href="https://cityofjerseycity.civicweb.net/document/67058">Resolution PDF</a></p>
            <p><strong>Res. 21-371 </strong>On May 13, 2021, Jersey City approved Resolution 21-371 to award one-year open-end contracts to Plaza Auto Body Inc., Diamond Auto Body, and Vavi’s Auto Sale, LLC for collision repairs for the Department of Public Works, Division of Automotive Maintenance. The contracts are based on estimated labor of 2,000 hours and $100,000 in parts and materials, with hourly labor rates of $32 for Plaza and Diamond and $52 for Vavi, and markups of 5–10%, resulting in total maximum costs of $169,000, $174,000, and $210,000 respectively. The City retains the option to extend the contracts for up to two additional one-year terms according to the bid specifications. Payments are made as services are ordered, contingent upon certification that the vendors have met all specifications, and funds are available in the designated automotive operating account, with a total of $120,000 temporarily encumbered. Contractors must provide evidence of compliance with the Affirmative Action Amendments to the Law Against Discrimination, and continuation of the contracts depends on sufficient appropriations in the City’s budget. <a href="https://cityofjerseycity.civicweb.net/document/37927">Resolution PDF</a></p>
            <p><strong>Res. 19-693 </strong>On August 7, 2019, Jersey City approved Resolution 19-693 to renew one-year open-end contracts with Plaza Auto Body Inc., A. Lembo Car & Truck Collision Inc., and Diamond Auto Body for collision repairs for the Department of Public Works, Division of Automotive Maintenance, effective August 17, 2019, through August 16, 2020. The contracts are based on an estimated 3,000 labor hours and $100,000 in repair parts and materials, with total maximum costs of $192,236 for Plaza, $200,460 for A. Lembo, and $211,768 for Diamond. Payments are made as services are ordered, contingent on certification that the vendors have met all contract specifications. Funds are temporarily encumbered at $10,000 per vendor, with the balance made available as the City places orders. Vendors are required to provide evidence of compliance with the Affirmative Action Amendments to the Law Against Discrimination, and continuation of the contracts depends on sufficient appropriations in the City’s budget. <a href="https://cityofjerseycity.civicweb.net/document/11455">Resolution PDF</a></p>
          </div>
        )}
      </div>

      {/* RSC Architects */}
      <div className="accordion-item">
        <button
          className={`accordion-header ${openIndex === 26 ? "active" : ""}`}
          onClick={() => toggleAccordion(26)}
          aria-expanded={openIndex === 26}
        >
          RSC Architects - $4,900
          <span className="accordion-arrow" />
        </button>
        {openIndex === 26 && (
          <div className="accordion-content">
            <p>The company has donated $4,900 to Jim McGreevey. RSC Architects has been involved with a construct improvement project with St. Ann's Home for the Aged (Res. 24-241) and has bidded for several contracts given by Jersey City. These donations have been deemed as suspicious because they have bidded on multiple city contracts. such as the Pershing Field Pool Natatorium Roof Replacement and City Hall exterior renovations. RSC Architects have also been involved with a construction improvement project for St Ann's Home for the Aged. Even though RSC Architects was not awarded with these contracts, their financial contributions create a perception of influence or preferential treatment in the competitive bidding process. These donations could be used as potential influence for future government members to choose them for city contracts. The biddings and resolution for the improvement project is listed below.</p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/396829">Improvement Project (pg 42)</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/77994">City Hall Building Exterior Rehabilitation - $362,000</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/77542">City Hall Fourth Floor Alterations - $419,000</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/43626">Pershing Field Pool Natatorium Roof Replacement - $55,000</a></p>
          </div>
        )}
      </div>

      {/* The Leaf Joiny */}
      <div className="accordion-item">
        <button
          className={`accordion-header ${openIndex === 27 ? "active" : ""}`}
          onClick={() => toggleAccordion(27)}
          aria-expanded={openIndex === 27}
        >
          The Leaf Joint - $600
          <span className="accordion-arrow" />
        </button>
        {openIndex === 27 && (
          <div className="accordion-content">
            <p>The Leaf Joint has donated $600 to Jim McGreevey. This donation has been flagged as suspicious because the company has received city approval to operate a retail cannabis business, which creates a potential conflict of interest. The company’s success depends on local licensing and regulatory decisions overseen by city officials, so the contribution could be seen as an attempt to influence those decisions. The resolution is listed below.</p>
            <p><strong>Res 22-675 </strong>On February 8, 2023, the Jersey City Council approved Resolution 23-100 providing local support for The Leaf Joint to operate a Class 5 retail cannabis business. <a href="https://cityofjerseycity.civicweb.net/document/74396">Resolution PDF</a></p>
          </div>
        )}
      </div>

      {/* Hartz Mountain Industries */}
      <div className="accordion-item">
        <button
          className={`accordion-header ${openIndex === 28 ? "active" : ""}`}
          onClick={() => toggleAccordion(28)}
          aria-expanded={openIndex === 28}
        >
          Hartz Mountain Industries - $7,000
          Constantino "Gus" Milano, President and COO - $1,000
          <span className="accordion-arrow" />
        </button>
        {openIndex === 28 && (
          <div className="accordion-content">
            <p>The donations connected to Hartz Mountain Industries raise potential red flag concerns. Hartz has contributed a combined $7,000, including $1,000 from President and COO Constantino “Gus” Milano. This is notable because the company, via its subsidiary 15 Exchange Place Corp., held a license agreement with Jersey City for event space and staging in 2019. They are also the landlord of the property housing RPM Raceway and have been involved with developments in 70 and 90 Hudson Street in the Waterfront. The overlap between Hartz’s business relationship with the city and its sizable campaign contributions to Jim McGreevey highlights the risk of pay-to-play dynamics. The resolutions are listed below for the developments mentioned.</p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/422902">Res 25-153 listing Hartz Mountain Industries as the landlord. (Page 5)</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/67729">Res 22-369 listing Hartz Mountain Industires as developers of 70 and 90 Hudson Street (pg 94)</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/6768">Res 19-509 RESOLUTION AUTHORIZING TI-HEEXECUTION OF A LICENSE AGREENENT
WITH 15 EXCHANGE PLACE CORPORATION, A SUBSIDIARY CORPORATION OF
HARTZ MOUNTAIN INDUSTRIES, INC, FOR THE USE OF VARIOUS PROPERTIES
IN CONNECTION WITH THE CITY OF JERSEY CITY’S FREEDOM AND
FIREWORKS CELEBRATION ON JULY 4, 2019 NEAR EXCHANGE PLACE</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/403052">Liberty Science Center Project - $1,500,000</a></p>
          </div>
        )}
      </div>

      {/*Marttine Management*/ }
      <div className="accordion-item">
        <button
          className={`accordion-header ${openIndex === 29 ? "active" : ""}`}
          onClick={() => toggleAccordion(29)}
          aria-expanded={openIndex === 29}
        >
          Marttine Management - $2,500
          James Marttine / James Martini, Owner - $5,000
          <span className="accordion-arrow" />
        </button>
        {openIndex === 29 && (
          <div className="accordion-content">
            <p>Donations from Marttine Management can be considered red flags because the company is directly tied to Kushklub, the cannabis business that received City Council approval to operate in Jersey City on August 16, 2023. Marttine Management is listed as the architectural and development entity on site and architectural plans submitted for KushKlub NJ LLC’s cannabis retail project at 550–560 Tonnele Avenue. Contributions from businesses or individuals tied to industries awaiting local approval can create the appearance of influence, even if no direct quid pro quo is proven. This makes donations in proximity to regulatory wins particularly sensitive in discussions of pay-to-play dynamics.</p>
          </div>
        )}
      </div>

      {/* Kad Associates */}
      <div className="accordion-item">
        <button
          className={`accordion-header ${openIndex === 30 ? "active" : ""}`}
          onClick={() => toggleAccordion(30)}
          aria-expanded={openIndex === 30}
        >
          KAD Associates - $5,000
          <span className="accordion-arrow" />
        </button>
        {openIndex === 30 && (
          <div className="accordion-content">
            <p>Kad Associates' donations to McGreevey have been deemed as suspicious because they have received several expenditure payments from Jersey City, beginning on April 9 2021. The repeated pattern of payments alongside their political contributions raises concerns about potential conflicts of interest. The overlap suggests that their donations could be seen as a way to maintain goodwill with city leadership, blurring the line between routine business transactions and political influence. The expenditures are listed below.</p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/409634">8/12/24 - $3,443.56</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/408268">7/8/24 - $42,566.60</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/56325">9/16/21 - $2,636.27</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/52979">8/13/21 - $5,703.64</a></p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/46108">4/9/21 - $6,121.50</a></p>
          </div>
        )}
      </div>

        {/* Pennoni */}


        {/* Jasco Management Corp */}
      <div className="accordion-item">
        <button
          className={`accordion-header ${openIndex === 31 ? "active" : ""}`}
          onClick={() => toggleAccordion(31)}
          aria-expanded={openIndex === 31}
        >
          Jasco Management Corp - $5,000
          <span className="accordion-arrow" />
        </button>
        {openIndex === 31 && (
          <div className="accordion-content">
            <p>Jasco Management Corp.’s $5,000 donation to Jim McGreevey on February 2, 2024, raises concerns because it preceded a major approval the company later received from Jersey City. On October 30, 2024, the City Council unanimously passed Ordinance 24-097, granting Jasco a 99-year franchise right to construct and maintain a large ramp encroachment into the public right-of-way at 307 Pacific Avenue, where the company leases space to the Jersey City Free Public Library. Although the ordinance was framed as serving public accessibility needs, the close proximity between Jasco’s substantial political contribution and the city’s decision to award the company a long-term benefit creates the appearance of pay-to-play dynamics. This overlap makes the donation a potential red flag. </p>
            <p><a href="https://cityofjerseycity.civicweb.net/document/411334">Ord 24-097</a></p>
          </div>
        )}
      </div>


      {/* Remington and Vernick Engineers */}
      <div className="accordion-item">
        <button
          className={`accordion-header ${openIndex === 32 ? "active" : ""}`}
          onClick={() => toggleAccordion(32)}
          aria-expanded={openIndex === 32}
        >
          Remington and Vernick Engineers - $2,000
          <span className="accordion-arrow" />
        </button>
        {openIndex === 32 && (
          <div className="accordion-content">
            <p>A $2,000 donation to McGreevey is a red flag because the firm has directly provided professional engineering and design services for city projects, such as structural plans and geotechnical work for public buildings. This creates a potential conflict of interest: the donation could be perceived as an attempt to influence McGreevey or maintain favorable relations with the city administration, which could indirectly affect contract approvals, project oversight, or future business opportunities. Even if the donation is legal and disclosed, the fact that the donor is a company actively involved in city projects heightens the appearance of impropriety. The red flag arises from the overlap between the donor’s financial contribution and their professional interest in city decisions.</p>
            <p><strong>Res 23-514 </strong>Remington & Vernick Engineers is acting as the structural engineering consultant for the Engine 10 / Ladder 12 Fire Station project in Jersey City. Their role involves updating the structural design to account for new site conditions, including modifications to the foundation system based on geotechnical findings. They ensure that all structural plans comply with the 2021 International Building Code and coordinate closely with other consultants, including Netta Architects, Langan (geotechnical), and Polise Engineering (MEP), to integrate these updates into the overall project documents. Additionally, they provide construction administration support by reviewing contractor submittals, participating in progress meetings, and assisting the city with interpretation of structural aspects of the contract documents. <a href="https://cityofjerseycity.civicweb.net/document/93088">Resolution PDF</a></p>
            <p><strong>Ord 22-112 </strong>Remington & Vernick are involved as the design and engineering consultants, having provided the proposed layout and plans for the renovations and expansions at 514 Newark Avenue. Their work includes designing the modifications to ensure ADA compliance, improving facilities to reduce COVID-19 transmission risks, and creating space for showers, laundry, and congregate meals for residents experiencing homelessness. Essentially, Remington & Vernick’s plans form the basis for the City and Garden State Community Development Corporation to implement the Hudson CASA Coordinated Entry Program at the property. Their proposed layout is incorporated into the ordinance as part of the city’s authorization to proceed with the $2,100,400 in improvements. <a href="https://cityofjerseycity.civicweb.net/document/81763">Ordinance PDF</a></p>
            <p><strong>6.19</strong>This letter, dated April 10, 2025, from James L. Hankins, P.E., a project manager and engineer at Remington & Vernick Engineers, was sent to Sean J. Gallagher, the Jersey City Clerk, regarding the NJDEP Waterfront Development Individual Permit for the Van Winkle Combined Sewer Outfall project in Jersey City. It indicates that Remington & Vernick Engineers are acting as the engineering consultants responsible for preparing and submitting technical documentation and permitting materials to the New Jersey Department of Environmental Protection. The correspondence highlights Vernick’s direct involvement in the regulatory and design aspects of the waterfront development project. <a href="https://cityofjerseycity.civicweb.net/document/427697">4/23/25 Agenda</a></p>
          </div>
        )}
      </div>



      <div className="accordion-item">
        <button
          className={`accordion-header ${openIndex === 33 ? "active" : ""}`}
          onClick={() => toggleAccordion(33)}
          aria-expanded={openIndex === 33}
        >
          New York Stone - $5,200
          Employees of New York Stone - $28,400
          <span className="accordion-arrow" />
        </button>
        {openIndex === 33 && (
          <div className="accordion-content">
            <p>The donations from New York Stone—$5,200 from the company and $25,400 from its employees—are a red flag given that the company not only has multiple projects in Jersey City relating to hotels but also maintains a warehouse in the city for storing their stone slabs. This local presence indicates direct, ongoing business interests that could be affected by city policies, approvals, or contracts. Contributions to candidates like McGreevey may therefore be perceived as attempts to curry favor or ensure favorable treatment from officials who have influence over municipal decisions that impact their operations. The combination of substantial donations and a physical stake in the city heightens the potential for conflicts of interest or the appearance of undue influence.</p>
        </div>
        )}
      </div>

      <div className="accordion-item">
        <button
          className={`accordion-header ${openIndex === 34 ? "active" : ""}`}
          onClick={() => toggleAccordion(34)}
          aria-expanded={openIndex === 34}
        >
          Eastern Millwork - $15,400
          Andrew Campbell, CEO/Founder - $27,700
          Natalya Campbell - $5,200
          Heiko Sieling, COO - $7,700

          <span className="accordion-arrow" />
        </button>
        {openIndex === 34 && (
          <div className="accordion-content">
            <p>The donations from Eastern Millwork—$10,400 in total, including contributions from CEO Andrew Campbell, co-founder Natalya Campbell, and COO Heiko Sieling—are a red flag because the company has significant projects in Jersey City, such as Hudson Exchange Phase 1B and Liberty National Villas. These projects suggest that Eastern Millwork has ongoing business interests that could be directly affected by municipal decisions or approvals. Contributions to McGreevey may create, or appear to create, a conflict of interest, as the company could benefit from favorable treatment, zoning approvals, or city contracts. The combination of sizable donations and active projects in the city raises concerns about potential influence over elected officials.</p>
            <p><a href="https://easternmillwork.com/portfolio-item/hudson-exchange-phase-1b">HUDSON EXCHANGE PHASE 1B</a></p>
            <p><a href="https://easternmillwork.com/portfolio-item/liberty-national-villas">Liberty National Villas Project</a></p>
        </div>
        )}
      </div>



    <div className="accordion-item">
        <button
          className={`accordion-header ${openIndex === 35 ? "active" : ""}`}
          onClick={() => toggleAccordion(35)}
          aria-expanded={openIndex === 35}
        >
          Craig Guy for Hudson County Executive - $5,500
          <span className="accordion-arrow" />
        </button>
        {openIndex === 35 && (
          <div className="accordion-content">
            <p>The donations from Craig Guy for Hudson County Executive to Jim McGreevey — $5,000 in June 2024 and $500 in April 2025 — raise red flag concerns. Craig Guy, as Hudson County Executive, oversees significant influence over county resources, contracts, and political networks. Contributions from his campaign committee to McGreevey, who is running for mayor of Jersey City, suggest a tightening of the county political machine around McGreevey’s candidacy. These donations may signal an effort to consolidate power and ensure alignment between county and city leadership, blurring the lines between independent campaigns and entrenched political patronage.</p>
        </div>
        )}
    </div>

    <div className="accordion-item">
        <button
          className={`accordion-header ${openIndex === 36 ? "active" : ""}`}
          onClick={() => toggleAccordion(36)}
          aria-expanded={openIndex === 36}
        >
          Raj Mukherji for Senate - $16,400
          <span className="accordion-arrow" />
        </button>
        {openIndex === 36 && (
          <div className="accordion-content">
            <p>Senator Raj Mukherji’s campaign committees contributed over $16,000 to Jim McGreevey’s mayoral run—including $5,000 twice in December 2023 and additional contributions in March 2024. Mukherji wields considerable influence as a state senator and long-standing Hudson County political figure. His push to replace Jersey City’s fully elected Board of Education with an appointed model—a move broadly criticized as undemocratic and a power grab—has sparked intense backlash from local educators, parents, and elected officials, who argue it strips residents of their voice. These paired developments—a sizable multi-cycle donation combined with efforts to restructure school governance—signal concerning consolidation of political power and raise serious ethical red flags about democratic accountability and undue influence.</p>
        </div>
        )}
    </div>

    <div className="accordion-item">
        <button
          className={`accordion-header ${openIndex === 37 ? "active" : ""}`}
          onClick={() => toggleAccordion(37)}
          aria-expanded={openIndex === 37}
        >
          Election Fund of Daniel Reiman - $5,000
          <span className="accordion-arrow" />
        </button>
        {openIndex === 37 && (
          <div className="accordion-content">
            <p>Daniel Reiman’s campaign entity donated $5,000 to McGreevey—an amount notably high for a single political contribution. This contribution raises red-flag concerns given Reiman’s long tenure as Mayor of Carteret, and his past controversies. Reiman has faced serious reputational challenges, including sexual predator allegations from a former acquaintance that he publicly contested as defamatory. While Reiman denied these claims, the combination of the controversy and the sizable donation suggests possible reputational leverage or political alignment, which warrant careful scrutiny for potential ethical concerns or attempts to influence.</p>
        </div>
        )}
    </div>

    <div className="accordion-item">
        <button
          className={`accordion-header ${openIndex === 38 ? "active" : ""}`}
          onClick={() => toggleAccordion(38)}
          aria-expanded={openIndex === 38}
        >
          Josh Gottheimer for Congress - $5,200
          <span className="accordion-arrow" />
        </button>
        {openIndex === 38 && (
          <div className="accordion-content">
            <p>Josh Gottheimer’s donation can be flagged as a red flag given his history of controversy. While representing New Jersey in Congress, Gottheimer has faced criticism for being closely aligned with Wall Street and corporate donors, often clashing with progressives within his own party who argue that his positions favor corporate interests over working-class constituents. He has also been accused of undermining party unity by opposing more progressive legislation on healthcare and financial regulation. A contribution from Gottheimer could therefore suggest potential alignment with big-money politics rather than grassroots-driven priorities, raising concerns about outside influence in Jersey City’s mayoral race.</p>
        </div>
        )}
    </div>

    <div className="accordion-item">
        <button
          className={`accordion-header ${openIndex === 39 ? "active" : ""}`}
          onClick={() => toggleAccordion(39)}
          aria-expanded={openIndex === 39}
        >
          Vin Gopal for Senate - $14,400
          <span className="accordion-arrow" />
        </button>
        {openIndex === 39 && (
          <div className="accordion-content">
            <p>Senator Vin Gopal has been at the center of several controversial actions related to New Jersey education that could raise red flags for donors. In 2025, he threatened to withhold state funding from school districts that did not offer kindergarten programs, a move that could force teacher layoffs and cut essential programs, disproportionately affecting vulnerable communities. In 2023, he criticized the State Board of Education for considering sanctions on districts slow to implement equity plans, arguing that such measures could remove funding that students rely on, sparking backlash from education advocates. Gopal also pushed for increased scrutiny and transparency over school curricula, including legislation in 2022 requiring schools to post health and sex education materials online before the school year, a move that critics say inflamed public distrust and political tension. These controversies highlight his significant influence over funding and policy in education, and contributions to his campaign,like the $14,400 from Gopal for Senate,may raise concerns about potential conflicts of interest or attempts to curry favor with a politically powerful figure involved in contentious, high-stakes decisions affecting school districts, including those in Jersey City.</p>
        </div>
        )}
    </div>

    <div className="accordion-item">
        <button
          className={`accordion-header ${openIndex === 40 ? "active" : ""}`}
          onClick={() => toggleAccordion(40)}
          aria-expanded={openIndex === 40}
        >
          Kyle Antonucci, Phoenix Warehouse  - $5,200
          <span className="accordion-arrow" />
        </button>
        {openIndex === 40 && (
          <div className="accordion-content">
            <p>The $5,200 donation to Jim McGreevey from Kyle Antonucci, Director of Operations at Phoenix Warehouse of NJ, could be considered a red flag. Phoenix Warehouse is an active site under the New Jersey Department of Environmental Protection’s Contaminated Site Remediation & Redevelopment Program, which involves regulatory oversight for soil remediation. Given Antonucci’s executive role and the company’s involvement in redevelopment projects subject to city approvals, the donation raises potential ethical concerns. While legally permissible, the contribution could be perceived as an attempt to gain favor or influence decisions related to redevelopment or regulatory matters, creating a possible conflict of interest and drawing scrutiny in Jersey City’s politically sensitive environment. <a href="https://cityofjerseycity.civicweb.net/document/90485">May 10 2023 Agenda (pg 7)</a></p>
        </div>
        )}
    </div>

    <div className = "accordion-item">
      <button
        className={`accordion-header ${openIndex === 41 ? "active" : ""}`}
        onClick={() => toggleAccordion(41)}
        aria-expanded={openIndex === 41}
      >
        Anthony Diaco, Founder of AJD Construction - $5,200
        Zackary,Diaco, AJD Construction - $5,200
        Nick Diaco, AJD Construction - $5,200
        <span className="accordion-arrow" />
      </button>
      {openIndex === 41 && (
        <div className="accordion-content">
          <p>The donations from Zackary Diaco ($5,200), Nick Diaco ($5,200), and Anthony Diaco ($5,200)—all tied to AJD Construction, the general contractor for the 808 Pavonia Owner Urban Renewal project—are potential red flags because of the close financial and regulatory connection between the contractor and the city. AJD Construction is executing a project that qualifies for a Long-Term Tax Exemption under Ordinance 24-086, which allows the developer to receive a significant property tax abatement contingent on completing specific infrastructure and residential improvements. At the same time, the city has already made expenditures toward the company (e.g., $14,692.50 on 6/4/20), demonstrating direct public investment or support. Large personal contributions from the contractor’s executives and trade employees could be perceived as attempts to gain political favor or influence decisions related to approvals, tax incentives, or oversight of the redevelopment project. While legal, the combination of substantial city-backed incentives and large contributions from a contractor benefiting from the project creates the appearance of a potential conflict of interest or pay-to-play dynamic, making these donations ethically sensitive.</p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/410733">Ord 24-086</a>AJD Construction’s role as the general contractor for the 808 Pavonia Owner Urban Renewal project is directly tied to the financial and regulatory framework established by the City of Jersey City through the Long-Term Tax Exemption ordinance. This ordinance allows developers to receive a tax abatement—effectively paying only a percentage of gross revenue instead of full property taxes—in exchange for constructing significant residential, commercial, and public infrastructure improvements. Under this framework, AJD Construction is responsible for executing the project in compliance with the city-approved site plans, public infrastructure requirements, and redevelopment agreements. Their construction work enables the developer to qualify for the staged tax exemptions and financial incentives outlined in the ordinance, linking AJD’s performance directly to the economic benefits provided by the city’s policy. This connection means that AJD Construction’s role is not only operational but also integral to realizing the tax benefits granted under municipal law.</p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/27626">6/4/20 - $14,692.50</a></p>
        </div>
      )}
    </div>

    <div className = "accordion-item">
      <button
        className={`accordion-header ${openIndex === 42 ? "active" : ""}`}
        onClick={() => toggleAccordion(42)}
        aria-expanded={openIndex === 42}
      >
        Edward Farmer, President and CEO of Millennium Strategies - $5,500
        <span className="accordion-arrow" />
      </button>
      {openIndex === 42 && (
        <div className="accordion-content">
          <p>The $5,500 donation from Edward Farmer, President and CEO of Millennium Strategies, raises a red flag because his firm holds a long-standing and lucrative relationship with Jersey City through its grant writing and consulting contracts. Since at least 2016, Millennium Strategies has been awarded or renewed contracts with the city worth hundreds of thousands of dollars annually, with payments documented across multiple years and resolutions showing consistent renewals. The most recent agreements (Res. 23-504 and Res. 24-681) extend the firm’s contract at annual costs of $156,000, demonstrating Millennium’s ongoing financial reliance on the city. A political donation from the company’s chief executive to local officials who oversee or influence these contracts could create the appearance of a pay-to-play arrangement, where contributions may help secure or maintain public contracts. Even if fully legal under New Jersey’s pay-to-play and disclosure laws, the timing and size of Farmer’s donation are concerning because they overlap with repeated city approvals of significant payments to his firm, making it a potential conflict-of-interest risk.</p>
         <p><a href="https://cityofjerseycity.civicweb.net/document/431135">5/15/25 - $13,000</a></p>
         <p><a href="https://cityofjerseycity.civicweb.net/document/427629">4/17/25 - $13,000</a></p>
         <p><a href="https://cityofjerseycity.civicweb.net/document/425256">3/24/25 - $13,000</a></p>
         <p><a href="https://cityofjerseycity.civicweb.net/document/422620">2/24/25 - $13,000</a></p>
         <p><a href="https://cityofjerseycity.civicweb.net/document/419821">1/24/25 - $13,000</a></p>
         <p><a href="https://cityofjerseycity.civicweb.net/document/418957">1/9/25 - $26,000</a></p>
         <p><a href="https://cityofjerseycity.civicweb.net/document/415425">11/22/24 - $13,000</a></p>
         <p><a href="https://cityofjerseycity.civicweb.net/document/412458">10/10/24 - $39,000</a></p>
         <p><strong>Res 24-681 </strong>On September 11, 2024, Jersey City approved a resolution to renew its contract with Millennium Strategies, LLC for grant writing and consulting services. The original two-year, $300,000 contract from 2021 included three one-year renewal options, and this is the second renewal. The new agreement extends services from June 1, 2024, through May 31, 2025, at a cost of $156,000. Of that amount, $94,500 has already been budgeted for 2024, with future payments contingent on appropriations. Millennium will continue helping the city secure funding while remaining subject to affirmative action and anti-discrimination requirements. <a href="https://cityofjerseycity.civicweb.net/document/408741">Resolution PDF</a></p>
         <p><a href="https://cityofjerseycity.civicweb.net/document/406617">6/24/24 - $13,000</a></p>
         <p><a href="https://cityofjerseycity.civicweb.net/document/403052">5/17/24 - $26,000</a></p>
         <p><a href="https://cityofjerseycity.civicweb.net/document/398781">4/9/24 - $26,000</a></p>
         <p><a href="https://cityofjerseycity.civicweb.net/document/390968">1/8/24 - $13,000</a></p>
         <p><a href="https://cityofjerseycity.civicweb.net/document/390093">12/11/23 - $13,000</a></p>
         <p><a href="https://cityofjerseycity.civicweb.net/document/387879">11/22/23 - $39,000</a></p>
         <p><a href="https://cityofjerseycity.civicweb.net/document/99143">9/5/23 - $51,000</a></p>
         <p><strong>Res 23-504 </strong>On June 28, 2023, Jersey City approved Resolution 23-504 to renew its contract with Millennium Strategies, LLC for grant writing and consulting services. The original two-year, $300,000 contract from 2021 included renewal options, and this resolution exercised the first one-year renewal. The new contract term runs from June 1, 2023 through May 31, 2024, at a total cost not to exceed $156,000. An initial $1,500 was allocated from the 2023 temporary budget, with the balance to be covered by the permanent and subsequent budgets. Millennium will continue assisting the city in securing outside funding, subject to compliance with affirmative action and anti-discrimination laws. <a href="https://cityofjerseycity.civicweb.net/document/92661">Resolution PDF</a></p>
         <p><a href="https://cityofjerseycity.civicweb.net/document/89720">4/24/23 - $25,000</a></p>
         <p><a href="https://cityofjerseycity.civicweb.net/document/86739">3/6/23 - $12,500</a></p>
         <p><a href="https://cityofjerseycity.civicweb.net/document/85108">2/17/23 - $12,500</a></p>
         <p><a href="https://cityofjerseycity.civicweb.net/document/81765">12/9/22 - $12,500</a></p>
         <p><a href="https://cityofjerseycity.civicweb.net/document/80927">11/23/22 - $25,000</a></p>
         <p><a href="https://cityofjerseycity.civicweb.net/document/78580">11/4/22 - $12,500</a></p>
         <p><a href="https://cityofjerseycity.civicweb.net/document/73114">8/12/22 - $37,500</a></p>
         <p><a href="https://cityofjerseycity.civicweb.net/document/68836">5/20/22 - $37,500</a></p>
         <p><a href="https://cityofjerseycity.civicweb.net/document/64888">3/3/22 - $12,500</a></p>
         <p><a href="https://cityofjerseycity.civicweb.net/document/62536">1/20/22 - $12,500</a></p>
         <p><a href="https://cityofjerseycity.civicweb.net/document/60449">12/8/21 - $12,500</a></p>
         <p><a href="https://cityofjerseycity.civicweb.net/document/59833">11/22/21 - $12,500</a></p>
         <p><a href="https://cityofjerseycity.civicweb.net/document/59107">11/4/21 - $12,500</a></p>
         <p><a href="https://cityofjerseycity.civicweb.net/document/58054">10/7/21 - $12,500</a></p>
         <p><a href="https://cityofjerseycity.civicweb.net/document/52979">8/13/21 - $25,000</a></p>
         <p><a href="https://cityofjerseycity.civicweb.net/document/50909">6/25/21 - $36,000</a></p>
         <p><strong>Res 21-453 </strong>On June 16, 2021, Jersey City approved Resolution 21-453 awarding a two-year, $300,000 contract to Millennium Strategies, LLC for grant writing and consulting services. The contract was awarded through a competitive contracting process under New Jersey law, with Millennium selected as the best-qualified firm after a review of proposals. The agreement includes the option for up to three additional one-year renewals, which could bring the total contract value to $768,000 over five years. The initial payment of $25,000 was certified as available in the city’s budget at the time of approval. The contract requires Millennium to comply with affirmative action and anti-discrimination laws, and payments are contingent on certification that services are properly delivered. <a href="https://cityofjerseycity.civicweb.net/document/48085">Resolution PDF</a></p>
         <p><a href="https://cityofjerseycity.civicweb.net/document/46108">4/9/21 - $24,000</a></p>
         <p><a href="https://cityofjerseycity.civicweb.net/document/43483">2/18/21 - $12,000</a></p>
         <p><a href="https://cityofjerseycity.civicweb.net/document/39624">12/10/20 - $12,000</a></p>
         <p><a href="https://cityofjerseycity.civicweb.net/document/38868">11/25/20 - $12,000</a></p>
         <p><a href="https://cityofjerseycity.civicweb.net/document/34825">9/17/20 - $36,000</a></p>
         <p><strong>Res 20-302 </strong>On April 22, 2020, Jersey City approved Resolution 20-302 renewing its contract with Millennium Strategies, LLC for grant consulting services. The original two-year contract, first awarded in 2016 for $264,000, included three optional one-year renewals, and this resolution exercised the third and final renewal option. The renewal set the contract cost at $144,000 for the year beginning June 1, 2020. Of this amount, $72,000 was certified as available in the city’s temporary budget, with the remaining funds to be allocated in the permanent and subsequent fiscal year budgets. As with prior agreements, the renewal required compliance with affirmative action laws and conditioned payments on verified delivery of services. <a href="https://cityofjerseycity.civicweb.net/document/23626">Resolution PDF</a></p>
         <p><a href="https://cityofjerseycity.civicweb.net/document/17964">1/6/20 - $24,000</a></p>
         <p><a href="https://cityofjerseycity.civicweb.net/document/17017">12/11/19 - $12,000</a></p>
         <p><a href="https://cityofjerseycity.civicweb.net/document/14345">10/16/19 - $12,000</a></p>
         <p><a href="https://cityofjerseycity.civicweb.net/document/12926">9/17/19 - $12,000</a></p>
         <p><a href="https://cityofjerseycity.civicweb.net/document/11373">9/3/19 - $12,000</a></p>
         <p><strong>Res 19-470 </strong>On May 22, 2019, Jersey City adopted Resolution 19-470, renewing its contract with Millennium Strategies, LLC for grant consulting services. The original contract, awarded in 2016 for $264,000, allowed up to three one-year renewals at an annual cost of $144,000, and this resolution exercised the second renewal option. The renewed term covered June 1, 2019 through May 31, 2020, with funding beginning with $20,000 allocated in the city’s temporary budget. As with prior contracts, payments were conditioned on proof of services delivered and compliance with the Local Fiscal Affairs Law. Additionally, the renewal required compliance with affirmative action laws and public notice of the award within ten days. <a href="https://cityofjerseycity.civicweb.net/document/5992">Resolution PDF</a></p>
        </div>
      )}
    </div>

    <div className = "accordion-item">
      <button
        className={`accordion-header ${openIndex === 43 ? "active" : ""}`}
        onClick={() => toggleAccordion(43)}
        aria-expanded={openIndex === 43}
      >
        Johnathan Feifer, Park Stone - $3,000
        <span className="accordion-arrow" />
      </button>
      {openIndex === 43 && (
        <div className="accordion-content">
          <p>Jonathan Feifer’s $3,000 donation to Jim McGreevey through his firm, Park Stone, raises clear red flag concerns because of the company’s direct involvement in real estate development in Jersey City, one of the most politically sensitive and lucrative sectors in the city. Park Stone specializes in opportunistic investments, including ground-up development and repositioning of multi-family and mixed-use properties, which are projects that require favorable zoning decisions, city approvals, and political backing. Given McGreevey’s potential influence over development policy and contracts, a donation from a developer with clear financial interests in Jersey City creates the appearance of pay-to-play politics. This dynamic suggests that Feifer and Park Stone could be seeking favorable treatment for future projects in exchange for campaign support. In a city already plagued by concerns about developer influence, this contribution underscores the deep entanglement between political fundraising and real estate interests. <a href="https://parkstonemanagement.com/about-us.html">Park Stone Website</a></p>
        </div>
      )}
    </div>

    <div className = "accordion-item">
      <button
        className={`accordion-header ${openIndex === 44 ? "active" : ""}`}
        onClick={() => toggleAccordion(44)}
        aria-expanded={openIndex === 44}
      >
        Bikram Gill, Carepoint Health System - $5,200
        <span className="accordion-arrow" />
      </button>
      {openIndex === 44 && (
        <div className="accordion-content">
          <p>Bikram Gill’s $5,200 donation to Jim McGreevey is a red flag because of his position as a trustee of CarePoint Health, the parent system of Christ Hospital, Hoboken University Medical Center, and Bayonne Medical Center. Jersey City has repeatedly passed resolutions (<a href="https://cityofjerseycity.civicweb.net/document/89649">Res 23-332</a> in 2023 and <a href="https://cityofjerseycity.civicweb.net/document/412156">Res 24-735</a> in 2024) explicitly calling for state and county leaders to provide financial support and long-term stabilization for CarePoint’s hospitals, including advocating for tens of millions of dollars in funding. As a trustee, Gill has a direct governance role in an organization that stands to benefit from these public subsidies, restructuring plans, and political backing. His donation creates the appearance that CarePoint’s leadership is financially supporting a candidate who could influence the city’s advocacy and allocation of resources. This overlap between campaign contributions and ongoing government efforts to secure CarePoint’s financial survival raises serious concerns about conflicts of interest and pay-to-play dynamics.</p>
        </div>
      )}
    </div>

    <div className = "accordion-item">
      <button
        className={`accordion-header ${openIndex === 45? "active" : ""}`}
        onClick={() => toggleAccordion(45)}
        aria-expanded={openIndex === 45}
      >
        Scott Heagney, Owner of GPI Builders & Engineers - $7,000
        <span className="accordion-arrow" />
      </button>
      {openIndex === 45 && (
        <div className="accordion-content">
          <p>Scott Heagney’s donations to Jim McGreevey raise serious pay-to-play concerns because his company, GPI Engineers and Builders, is heavily dependent on public-sector contracts, including its multimillion-dollar role in the Pulaski Skyway rehabilitation project. As a firm whose revenue comes from government-funded infrastructure work, GPI’s success is closely tied to political decision-making around contracts, funding, and development priorities. By contributing to McGreevey’s mayoral campaign, Heagney creates the appearance of buying access or favorable consideration for future projects in Jersey City, blurring the line between civic participation and self-interested influence. This intersection of political donations and lucrative public contracts highlights a potential conflict of interest and fits a broader pattern of pay-to-play dynamics in local politics. <a href="https://www.gpinet.com/projects/pulaski-skyway-rehabilitation">Link to their project.</a></p>
        </div>
      )}
    </div>

    <div className = "accordion-item">
      <button
        className={`accordion-header ${openIndex === 46? "active" : ""}`}
        onClick={() => toggleAccordion(46)}
        aria-expanded={openIndex === 46}
      >
        Donald Scarinci - $66,000
        Dave Hollenbeck - $5,200
        Kenneth J Hollenbeck - $22,900
        <span className="accordion-arrow" />
      </button>
      {openIndex === 46 && (
        <div className="accordion-content">
          <p>These donations are a red flag because Scarinci & Hollenbeck, the law firm behind them, is one of the most prominent municipal law firms in New Jersey, earning millions in public contracts for services like municipal counsel, redevelopment, and bond work. When multiple attorneys from the firm each give the legal maximum to the same candidate, it suggests a coordinated effort to secure political goodwill. This is concerning because the firm regularly represents cities and agencies in Hudson County—exactly the type of entities that could be impacted by the mayor’s decisions. If the candidate were to win, awarding future legal contracts to Scarinci & Hollenbeck could create an apparent quid pro quo, blurring the line between public service and private profit. The scale and pattern of these donations look less like community support and more like a strategic investment in influence.</p>
        </div>
      )}
    </div>

    <div className = "accordion-item">
      <button
        className={`accordion-header ${openIndex === 47? "active" : ""}`}
        onClick={() => toggleAccordion(47)}
        aria-expanded={openIndex === 47}
      >
        Connell Foley PAC - $5,200
        Leo Hurley, Partner and Co-Chair - $5,200
        Philip McGovern, Partner - $5,200
        Thomas Scuderi - $5,200
        <span className="accordion-arrow" />
      </button>
      {openIndex === 47 && (
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
        className={`accordion-header ${openIndex === 48? "active" : ""}`}
        onClick={() => toggleAccordion(48)}
        aria-expanded={openIndex === 48}
      >
        Najarian Associates - $5,000
        Tavit Najarian, Founder and President - $5,000
        <span className="accordion-arrow" />
      </button>
      {openIndex === 48 && (
        <div className="accordion-content">
          <p>Najarian Associates has played a pivotal role in major redevelopment work right here in Jersey City—notably earning a Brownfield Redevelopment Outstanding Achievement Award from K. Hovnanian Companies for their work transforming a chromium-contaminated site into the waterfront <a href="https://www.najarian.com/projects/society-hill-droyers-point">“Society Hill at Droyers Point” residential complex</a>. Their work included environmental assessment, remediation planning, obtaining NJDEP No-Further-Action approvals, and securing a slew of critical permits from local and state agencies—all integral to enabling redevelopment. Given this close intersection of Najarian’s business interests with city and state regulatory authority, the simultaneous $5,000 corporate donation from Najarian Associates and $5,000 personal donation from founder Tavit Najarian to a candidate who could influence such approvals understandably creates the appearance of pay-to-play or undue influence. The concern isn’t hypothetical—it comes from the firm’s known dependence on approvals and trust from municipal agencies to deliver projects. That alignment between their business model and political contribution makes this a clear and credible red flag.</p>
        </div>
      )}
    </div>

    <div className = "accordion-item">
      <button
        className={`accordion-header ${openIndex === 49? "active" : ""}`}
        onClick={() => toggleAccordion(49)}
        aria-expanded={openIndex === 49}
      >
        Stephen Nislick - $5,200
        <span className="accordion-arrow" />
      </button>
      {openIndex === 49 && (
        <div className="accordion-content">
          <p>Stephen Nislick’s $5,200 donation to Jim McGreevey raises serious red flags given Nislick’s controversial history as a political power broker and donor. Nislick, a New Jersey real estate developer and founder of NYCLASS (New Yorkers for Clean, Livable and Safe Streets), is best known for bankrolling campaigns to ban horse-drawn carriages in New York City. In 2013, his group poured over $1 million into a super PAC that was later investigated for potential campaign finance violations and pay-to-play tactics tied to Bill de Blasio’s mayoral run. Beyond the carriage issue, Nislick’s dual role as a developer and political financier has long sparked concerns over whether his donations are leveraged to gain influence on land use, zoning, or city contracts. McGreevey’s acceptance of the maximum individual contribution from a figure repeatedly tied to pay-to-play scandals suggests a troubling willingness to align with donors whose reputations are linked to backroom political influence, raising questions about transparency and potential conflicts of interest in his campaign.</p>
        </div>
      )}
    </div>

    <div className="accordion-item">
      <button
        className={`accordion-header ${openIndex === 50 ? "active" : ""}`}
        onClick={() => toggleAccordion(50)}
        aria-expanded={openIndex === 50}
      >
        Kevin J. O'Toole ($59,400) & Thomas Scrivo ($59,400) – Managing Partners, O'Toole Scrivo, LLC
        <span className="accordion-arrow" />
      </button>
      {openIndex === 50 && (
        <div className="accordion-content">
          <p>The donations from Kevin J. O’Toole ($59,400) and Thomas Scrivo ($59,400), both managing partners of O’Toole Scrivo, LLC, to Jim McGreevey represent significant red flags due to their extensive connections to government projects and redevelopment in New Jersey. Kevin O’Toole, a former state senator and current Chair of the Port Authority of New York and New Jersey, oversees major infrastructure investments, while Thomas Scrivo, a former Chief Counsel to Governor Christie and ex-chair of the New Jersey Economic Development Authority, has direct influence over land use and municipal approvals. Their firm specializes in municipal law, redevelopment, and regulatory compliance—fields directly affected by decisions from city officials. Accepting these large contributions from individuals and a firm whose business success depends on government contracts creates a strong appearance of pay-to-play, suggesting that the donations could be intended to gain access or favorable treatment. McGreevey’s acceptance of multiple high-dollar contributions from such politically connected figures raises serious questions about potential conflicts of interest and the transparency of his campaign funding.</p>
        </div>
      )}
    </div>

    <div className="accordion-item">
      <button
        className={`accordion-header ${openIndex === 51 ? "active" : ""}`}
        onClick={() => toggleAccordion(51)}
        aria-expanded={openIndex === 51}
      >
        Dylan Oanano, Vice President of Blue Star Glass - $5,200
        <span className="accordion-arrow" />
      </button>
      {openIndex === 51 && (
        <div className="accordion-content">
          <p>Dylan Oanono’s $5,200 donation to Jim McGreevey is a strong red flag because he is the Vice President of Blue Star Glass, a company that had actively engaged in a real estate development project in Jersey City: <a href="https://bluestarglass.net/projects/hudson-house-lofts">Hudson House Lofts – Phase II</a>By contributing to a mayoral candidate, Oanono is in a position to potentially influence city decisions that could benefit his company’s ongoing or future projects. The overlap between his corporate interests and political contributions raises clear concerns about pay-to-play dynamics, especially since McGreevey could be involved in approvals, permits, or zoning decisions affecting Blue Star’s developments if he were elected mayor. Accepting donations from executives tied to local development projects blurs the line between private business interests and public policy, creating both a real and perceived conflict of interest that undermines public trust.</p>
        </div>
      )}
    </div>

    <div className="accordion-item">
      <button
        className={`accordion-header ${openIndex === 52 ? "active" : ""}`}
        onClick={() => toggleAccordion(52)}
        aria-expanded={openIndex === 52}
      >
        Leonard Savino, Principal of Langan Engineering - $2,500
        <span className="accordion-arrow" />
      </button>
      {openIndex === 52 && (
        <div className="accordion-content">
          <p>Leonard Savino’s donation to the Jersey City mayoral campaign could be considered a red flag because he is a senior principal at Langan Engineering and Environmental Services, a firm that has repeatedly received substantial city contracts, including environmental consulting, site investigations, and demolition services. The firm’s contracts were awarded under the Fair and Open Pay-to-Play process, which legally permits contributions from executives, but the concentration of donations from high-level employees alongside lucrative city contracts raises concerns about the appearance of a conflict of interest. While there is no proof of wrongdoing, the pattern suggests that executives with direct influence over a firm’s business could be using political contributions to maintain favorable access or visibility with city officials. The overlap between Savino’s professional role and the firm’s ongoing city projects makes this donation worth scrutiny, as it highlights the broader tension between public contracting and private political giving in Jersey City.</p>
          <p><strong>Res 25-546 </strong>The Jersey City Council approved Resolution 25-546 on August 20, 2025, awarding a professional services contract to Langan Engineering and Environmental Services, LLC for the demolition of the County Administration Building. The contract covers demolition services, material testing, design, specifications, and bid documents under Project No. 2023-019. Four firms submitted proposals, with bids ranging from $171,750 to $2,276,385, and Langan was selected despite not being the lowest bidder, based on qualifications reviewed by city departments. The contract is valued at $395,030 for a 24-month period and is being awarded under the Fair and Open Pay-to-Play Law provisions. Funding will come from the Municipal Court Capital Account, and the award requires compliance with affirmative action laws and public notice requirements. <a href="https://cityofjerseycity.civicweb.net/document/435637">Resolution PDF</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/78028">10/25/22 - $13,330</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/77318">10/11/22 - $225</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/76260">9/16/22 - $975</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/73114">8/12/22 - $375</a></p>
          <p><strong>Res 22-259 </strong>The Jersey City Council approved Resolution 22-529, amending a professional services contract with Langan Engineering and Environmental Services, Inc. for the new firehouse project at 627 Grand Street. The original 2020 contract, valued at $50,300, was for environmental remediation services related to contaminated fill material and NJDEP compliance. Due to the discovery of contaminated groundwater, the contract had previously been increased by $9,500, bringing the total to $59,800. The new amendment adds $36,100 for Langan to provide geotechnical engineering services, including oversight of a revised micropile foundation design and quality assurance site visits. This raises the total contract amount to $95,900, with funds available from the City’s capital account. <a href="https://cityofjerseycity.civicweb.net/document/70700">Resolution PDF</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/64284">2/17/22 - $562.50</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/61646">1/6/22 - $8,256.03</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/59833">11/22/21 - $3,885</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/49373">6/9/21 - $2,536.84</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/44797">3/18/21 - $6,810.21</a></p>
          <p><strong>Res 20-749 </strong>The Jersey City Council approved Resolution 20-749, awarding a professional services contract to Langan Engineering and Environmental Services, Inc. for the new firehouse project at 627 Grand Street. The contract, valued at $50,300, covers Licensed Site Remediation Professional (LSRP) services to address contaminated groundwater and impacted fill material, ensuring compliance with NJDEP regulations. The award was made under the Pay-to-Play Law and the city’s contractor reform ordinance, with Langan certifying it had made no reportable political contributions in the prior year. The agreement, authorized for a 24-month term, was issued without public bidding under the Local Public Contracts Law. Funding for the contract was confirmed from the City’s Firehouse Buildings capital account. <a href="https://cityofjerseycity.civicweb.net/document/35742">Resolution PDF</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/26642">5/14/20 - $19,810.80</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/15268">11/7/19 - $21,320.61</a></p>
          <p><strong>Res 19-172 </strong>The Jersey City Council authorized awarding a $45,275 professional engineering services contract to Langan Engineering and Environmental Services, Inc. for a Phase II site investigation at the planned Rescue 1 Firehouse site at 612–616 Communipaw Avenue. The need for this investigation arose after the Phase I review identified areas requiring further geophysical study. Funding was confirmed from the city’s capital account, and the contract term was set for 12 months. The agreement was awarded without competitive bidding as a professional services contract under the Local Public Contracts Law but followed the Fair and Open Pay-to-Play process. Langan submitted the required compliance certifications, and the resolution mandated public notice and adherence to affirmative action requirements. <a href="https://cityofjerseycity.civicweb.net/document/7925">Resolution PDF (pg 504)</a></p>
        </div>
      )}
    </div>

    <div className="accordion-item">
      <button
        className={`accordion-header ${openIndex === 53 ? "active" : ""}`}
        onClick={() => toggleAccordion(53)}
        aria-expanded={openIndex === 53}
      >
        Howard & Jonathan Schwartz, Partners - $6,450
        Alan Pines - $1,000
        Rhonda Tayloe-Calinda, Chief Financial Officer - $1,000
        David, Marc, and Larry Pantirer - $3,000
        BNE Real Estate Group
        <span className="accordion-arrow" />
      </button>
      {openIndex === 53 && (
        <div className="accordion-content">
          <p>
           Howard and Jonathan Schwartz, partners at BNE Real Estate Group, contributed $5,200 and $1,000 respectively to the Jersey City mayoral campaign. Alan Pines, another BNE partner, donated $1,000, while the company’s Chief Financial Officer, Rhonda Tayloe-Calinda, added $1,000. In addition, David, Marc, and Larry Pantirer—closely tied to BNE’s operations—collectively gave $3,000. These contributions raise a strong red flag because BNE Real Estate leases and manages multiple luxury properties in Jersey City, including <a href="https://lifebybne.com/communities">One Ten, 100 House, and The Enclave</a>, giving the company a direct financial stake in city zoning, approvals, and development policy. Taken together, these donations from multiple senior executives and family members create the perception of coordinated influence-buying, especially since BNE’s business success is tied to favorable treatment from local government. While the donations may comply with disclosure and pay-to-play regulations, the concentration of contributions from a single firm blurs the line between public service and private gain, warranting significant public scrutiny.
          </p>
        </div>
      )}
    </div>

    <div className="accordion-item">
      <button
        className={`accordion-header ${openIndex === 54 ? "active" : ""}`}
        onClick={() => toggleAccordion(54)}
        aria-expanded={openIndex === 54}
      >
        David Wolfe, Skoloff and Wolfe PC - $2,500
        <span className="accordion-arrow" />
      </button>
      {openIndex === 54 && (
        <div className="accordion-content">
          <p>David Wolfe’s $2,500 donation to McGreevey is a significant red flag because his law firm, Skoloff & Wolfe PC, has been tied to substantial financial dealings with Jersey City, as evidenced by multiple large expenditure claims totaling millions of dollars in recent years. While no formal “contract” is listed under the firm’s name, the repeated and high-value payments — including one exceeding $5.8 million in 2023 — indicate that the firm is deeply embedded in city-related legal or financial matters. When a managing partner at a firm that directly profits from city expenditures donates to a candidate for mayor, it raises the risk of pay-to-play influence, where political donations could be seen as a way to protect or expand city business ties. Even without a formal contract on record, the scale and consistency of the firm’s financial connections to Jersey City make this donation a strong conflict-of-interest concern.</p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/413799">11/8/24 - $7,117.47</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/387879">11/22/23 - $600,591.88</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/84565">2/7/23 - $6,165.01</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/83762">1/25/23 - $5,883,266.97</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/74749">9/8/22 - $12,544.24</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/70072">6/15/22 - $34,933.43</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/53126">8/17/21 - $21,337.66</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/17017">12/11/19 - $99,159.46</a></p>
        </div>
      )}
    </div>

    <div className="accordion-item">
      <button
        className={`accordion-header ${openIndex === 55 ? "active" : ""}`}
        onClick={() => toggleAccordion(55)}
        aria-expanded={openIndex === 55}
      >
        Arvinder Singh Minhas, President of GN Management - $1,500
        Kiran Samra Minhas, GN Management - $9,000
        <span className="accordion-arrow" />
      </button>
      {openIndex === 55 && (
        <div className="accordion-content">
          <p>These contributions raise a red flag because GN Management Inc. is an active real estate developer in Jersey City, where Arvinder Singh serves as President and Kiran Samra is a senior executive. The firm has spearheaded dozens of local projects—from historic residential conversions to modern mixed-use high-rises—such as the 29-story “Singh Tower” at 622 Summit Avenue, a 77-unit complex at 829 Bergen Avenue, and a five-story residential development at 84–88 Beacon Avenue. Because city officials oversee permitting, zoning, and development decisions that directly impact these projects, the substantial political contributions from top GN Management executives create a strong appearance of a conflict of interest or pay-to-play. Accepting such donations raises serious concerns about whether campaign support could influence development outcomes or policymaking.</p>
        </div>
      )}
    </div>

    <div className = "accordion-item">
      <button
        className={`accordion-header ${openIndex === 56 ? "active" : ""}`}
        onClick={() => toggleAccordion(56)}
        aria-expanded={openIndex === 56}
      >
        Chasan Lamparello Mallon & Cappuzzo - $5,000
        <span className="accordion-arrow" />
      </button>
      {openIndex === 56 && (
        <div className="accordion-content">
          <p>Chasan Lamparello Mallon & Cappuzzo’s $5,000 donation to Jim McGreevey is a major red flag because the firm has been repeatedly awarded lucrative contracts with Jersey City, many of them approved under exemptions from competitive bidding as “professional services agreements.” Since 2019, the firm has received contracts worth tens of thousands of dollars annually to handle workers’ compensation cases and defend city employees in civil rights lawsuits, with caps as high as $200,000 on some agreements. These resolutions—such as Res 24-645, Res 23-093, and Res 22-770—show a long-standing financial relationship between the firm and Jersey City, funded by taxpayer dollars. By donating to McGreevey while actively benefiting from city contracts, the firm’s contribution suggests a strong appearance of pay-to-play, where political donations could help secure or maintain government legal work. This overlap of campaign money and city business raises serious concerns about conflicts of interest, transparency, and the integrity of the contracting process.</p>
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
        className={`accordion-header ${openIndex === 57 ? "active" : ""}`}
        onClick={() => toggleAccordion(57)}
        aria-expanded={openIndex === 57}
      >
        GD Correctional Services LLC - $5,200
        Alfred Frungillo - $5,200
        <span className="accordion-arrow" />
      </button>
      {openIndex === 57 && (
        <div className="accordion-content">
          <p>GD Correctional Services LLC and Alfred Frungillo’s combined $10,400 in donations to Jim McGreevey raise significant red flags because the company has secured millions of dollars in government food service contracts, including a Hudson County Correctional Center contract originally worth $9.2 million that has since ballooned to nearly $11 million through multiple costly amendments. At the same time, GD Correctional has aggressively pursued other Jersey City food contracts, such as the Summer Food Service Program, where its bid was disqualified for not meeting state and federal requirements. These donations from both the company and its principal create a troubling appearance of pay-to-play, where political contributions could be viewed as a strategy to maintain or expand access to lucrative public food service contracts. The overlap between McGreevey’s campaign support and GD Correctional’s extensive financial dealings with Hudson County and attempted dealings with Jersey City underscores the risk of conflicts of interest and undermines public trust in fair contracting practices.</p>
          <p><strong>Res 22-605 </strong>The Hudson County Correctional Center’s food services contract with GD Correctional Services, LLC is running out of funds, prompting officials to request an additional $163,264 to cover ongoing expenses. Originally awarded at $9.2 million, the contract has already been increased three times—by $385,000, $975,000, and $250,000—bringing the total contract value to $10,973,264. This request highlights the growing costs tied to the county’s agreement with GD Correctional Services to provide meals at the jail. <a href="https://cityofjerseycity.civicweb.net/document/71984">Resolution PDF (pg 26)</a></p>
          <p><strong>Res 20-346 </strong>GD Correctional Services submitted the lowest bid—$546,184.86—for Jersey City’s Summer Food Service Program, which would have made them the most cost-effective option on paper. However, their bid was rejected because they were not an approved vendor for the program, which requires compliance with state and federal standards for child nutrition services. As a result, the city was forced to award the contract to Red Rabbit LLC, the lowest responsive bidder at $758,076.54. This shows that while GD Correctional is actively seeking food service contracts beyond correctional facilities, their lack of required program approval disqualified them, highlighting both their aggressive pursuit of public food contracts and the regulatory limits on their eligibility. <a href="https://cityofjerseycity.civicweb.net/document/28357">Resolution PDF (pgs 6-7)</a></p>
        </div>
      )}
    </div>


    <div className="accordion-item">
      <button
        className={`accordion-header ${openIndex === 58 ? "active" : ""}`}
        onClick={() => toggleAccordion(58)}
        aria-expanded={openIndex === 58}
      >
        Joe Zaugg, Managing Executive of Sordoni Construction - $1,000
        <span className="accordion-arrow" />
      </button>
      {openIndex === 58 && (
        <div className="accordion-content">
          <p>Joe Zaugg, a managing executive at Sordoni Construction, contributed $1,000 to Jim McGreevey’s campaign, raising concerns given the company’s history of major development and infrastructure projects in Jersey City. Sordoni has been directly involved in large-scale developments such as the Powerhouse Arts District (2024), West Side Square (2024), and Liberty Towers (2014), as well as critical infrastructure projects like PSE&G’s Jersey City facility. With McGreevey seeking to shape the city’s future development, Zaugg’s financial support could be seen as a potential pay-to-play red flag, suggesting that a construction firm with deep financial and operational ties to Jersey City may be attempting to secure or maintain favorable access to city contracts under a future McGreevey administration.</p>
          <p><a href="https://sococonstruction.com/projects">Sordoni Construction's Projects</a></p>
        </div>
      )}
    </div>

    <div className="accordion-item">
      <button
        className={`accordion-header ${openIndex === 59 ? "active" : ""}`}
        onClick={() => toggleAccordion(59)}
        aria-expanded={openIndex === 59}
      >
        James McKinney, President and Principal - $1,000
        John McKinney, CEO and Principal - $1,000
        Rodd Werstil, Managing Director and Prinicpal - $3,500
        <span className="accordion-arrow" />
      </button>
      {openIndex === 59 && (
        <div className="accordion-content">
          <p>Executives from McKinney Properties, the developer behind massive luxury projects such as 100 House, One Ten, and The Enclave, poured a combined $5,500 into Jim McGreevey’s campaign. McKinney’s business model depends directly on city approvals, zoning changes, and political goodwill. In a city with a long history of pay-to-play politics, a cluster of maximum-level donations from a development firm with so much riding on future decisions looks less like civic support and more like an attempt to buy access and influence. For voters, it’s a clear red flag that raises questions about whether a McGreevey administration would prioritize luxury developers over residents.</p>
          <p><a href="https://www.mckinneyproperties.com/properties">McKinney Properties</a></p>
        </div>
      )}
    </div>

    <div className="accordion-item">
      <button
        className={`accordion-header ${openIndex === 60 ? "active" : ""}`}
        onClick={() => toggleAccordion(60)}
        aria-expanded={openIndex === 60}
      >
        Gibbons Law P.C - $10,000
        Executives of Gibbons Law P.C - $31,250
        <span className="accordion-arrow" />
      </button>
      {openIndex === 60 && (
        <div className="accordion-content">
          <p>
            Executives and attorneys from Gibbons P.C., including Frederick Alworth ($500), Christine Amalfe ($500), Kim Catullo ($500), Michael Deloreto ($250), June Inderwies ($250), Michael Lubben ($250), Lawrence Lustberg ($5,200), David Pascrell ($500), Susanne Peticolas ($1,000), Paul St Onge ($300), Peter Torcicollo ($500), Kevin Weber ($500), and Howard Geneslaw ($10,000), along with a $10,000 P2P corporate donation from Gibbons P.C., collectively contributed over $20,000 to Jim McGreevey’s campaign. Gibbons P.C. has represented major clients in Jersey City development and real estate projects, including SJP Properties, Liberty Harbor North, and other high-profile urban redevelopment projects. Given the firm’s deep ties to city planning and municipal approvals, these donations raise strong red flags about potential influence over local policy decisions. The sheer concentration of contributions from one law firm that routinely represents powerful developers suggests a pattern of seeking favorable treatment from the McGreevey administration, rather than routine political support. For voters, this signals a potential conflict of interest and highlights the ongoing pay-to-play concerns in Jersey City politics.
          </p>          
        </div>
      )}
    </div>

    <div className="accordion-item">
      <button
        className={`accordion-header ${openIndex === 61 ? "active" : ""}`}
        onClick={() => toggleAccordion(61)}
        aria-expanded={openIndex === 61}
      >
       Sanjave Tuli, Owner and CEO of Tuli Realty - $5,000
        <span className="accordion-arrow" />
      </button>
      {openIndex === 61 && (
        <div className="accordion-content">
          <p>
            A $5,000 contribution from Sanjave Tuli, Owner and CEO of Tuli Realty, raises clear concerns given the company’s deep footprint in Jersey City’s housing market. Tuli Realty manages 18 apartment buildings across the city, making it a major landlord with a direct financial stake in local development and housing policy. Large donations from real estate owners often signal a potential pay-to-play dynamic, as decisions around zoning, tax abatements, and tenant protections can significantly impact their bottom line. In a city where affordability and displacement are pressing issues, a maximum-level donation from a landlord of this scale can be seen as an attempt to secure favorable treatment from City Hall.
          </p>          
          <p><a href="https://tulire.com/available-apartments">Tuli Realty's Listed Apartments</a></p>
        </div>
      )}
    </div>

    <div className="accordion-item">
      <button
        className={`accordion-header ${openIndex === 62 ? "active" : ""}`}
        onClick={() => toggleAccordion(62)}
        aria-expanded={openIndex === 62}
      >
        Eliot Spitzer, Former NY Governor - $12,500
        <span className="accordion-arrow" />
      </button>
      {openIndex === 62 && (
        <div className="accordion-content">
          <p>
            Eliot Spitzer, the former New York governor who resigned in disgrace after being caught patronizing a prostitution ring, donated $2,500 to Jim McGreevey’s mayoral campaign. Spitzer’s downfall in 2008 was one of the most high-profile political scandals of the decade, leaving his reputation permanently tied to corruption and personal misconduct. Since his resignation, he has turned to finance and real estate, industries that already carry heavy influence in Jersey City politics. His contribution is significant because McGreevey’s candidacy has been framed in part around ethics, reform, and rebuilding trust in public office. Accepting money from a figure whose career imploded due to scandal directly undermines that message. Moreover, Spitzer’s role in real estate ventures raises deeper concerns, as development and land deals remain some of the most contentious and pay-to-play–laden issues in Jersey City. Critics could easily interpret this donation as another example of outside real estate interests buying access to City Hall. Even if the amount is relatively modest, the symbolism of accepting funds from such a controversial figure is far more damaging than the dollar value. For McGreevey, Spitzer’s donation risks becoming shorthand for the very contradictions his opponents are eager to exploit.          </p>          
        </div>
      )}
    </div>

    <div className="accordion-item">
      <button
        className={`accordion-header ${openIndex === 63 ? "active" : ""}`}
        onClick={() => toggleAccordion(63)}
        aria-expanded={openIndex === 63}
      >
        John Sills - $3,000
        Arthur Sills - $6,350
        Sills, Cummis, & Gross P.C. - $7,000
        <span className="accordion-arrow" />
      </button>
      {openIndex === 63 && (
        <div className="accordion-content">
          <p>Sills Cummis & Gross has played a direct and recurring role in shaping major development and cannabis approvals in Jersey City, showing its deep influence in both real estate finance and regulatory processes. In March 2025, attorney Corey Klein represented Montgomery Gateway Preservation, L.P. in negotiating a financial agreement with the city, almost certainly a tax abatement or PILOT deal that reduced the developer’s property tax obligations—a practice often criticized for shifting the tax burden onto residents. Likewise, in 2023, partner Frank Vitolo represented Kushmart Jersey, LLC before the Planning Board, handling legal notices, expert testimony, and compliance arguments to secure conditional approval for a cannabis retail license on JFK Boulevard, despite strong community and political scrutiny of cannabis zoning. These cases demonstrate how the firm leverages its legal and political connections to win favorable terms for private interests, particularly developers and cannabis operators who rely on city approval. When a firm with this track record donates heavily to a mayoral campaign, it raises concerns about pay-to-play dynamics, as those same donors may later appear before the administration seeking zoning changes, abatements, or regulatory approvals. In Jersey City’s political climate—where developers and politically connected law firms already dominate fundraising—such contributions can be seen as a red flag because they suggest not just support, but an investment in future access and influence over city decisions.</p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/427697">Corey Klein negotiates for a financial agreement. (6.7)</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/101155">Frank Viloto represents Kushmart LLC to secure approval for the business to obtain a cannabis retail license. (pg 4)</a></p>
        </div>
      )}
    </div>

    <div className = "accordion-item">
      <button 
        className={`accordion-header ${openIndex === 64 ? "active" : ""}`}
        onClick={() => toggleAccordion(64)}
        aria-expanded={openIndex === 64}>
          Richard Sciaretta, Managing Partner of Claremont Development - $1,000
        <span className="accordion-arrow" />
      </button>
      {openIndex === 64 && (
        <div className="accordion-content">
          <p>Richard Sciaretta, managing partner of Claremont Development, contributed $1,000 to Bill O’Dea’s campaign in April 2024. Claremont Development is a major real estate developer with longstanding interests in Jersey City, particularly in large-scale residential and mixed-use projects, such as St. Lucy's Tower, the Rivet and Rivet 28, and new dorms in Saint Peter's University. The donation is notable because O’Dea has positioned himself as a watchdog against unchecked development, yet his acceptance of funds from a prominent developer may raise questions about consistency. Real estate donations are often scrutinized in Jersey City politics, where concerns about overdevelopment and affordability remain front and center. Sciaretta’s contribution could be interpreted as an attempt to maintain influence over zoning and development decisions should O’Dea become mayor. Critics might argue that this fits into a broader pattern of developers seeking access through campaign contributions. Supporters, however, may downplay the donation as a routine part of political fundraising. Still, in the context of Jersey City’s history with pay-to-play, the $2,500 from Claremont Development raises a clear red flag.</p>
          <p><a href="https://www.claredev.com/projects">Claremont Development's Projects</a></p>
        </div>
      )}
    </div>

    <div className = "accordion-item">
      <button 
        className={`accordion-header ${openIndex === 65 ? "active" : ""}`}
        onClick={() => toggleAccordion(65)}
        aria-expanded={openIndex === 65}>
          John Flo Rito, Head Motherfucker in Charge - Point Capital Development, $10,000
        <span className="accordion-arrow" />
      </button>
      {openIndex === 65 && (
        <div className="accordion-content">
          <p>John Florito is listed as the “HMFIC” (Head Mother Fucker In Charge) of Point Capital Development, a Jersey City–based real estate development company with a long record of building, renovating, and flipping multi-unit projects across the city. The firm has been involved in dozens of developments — from condo conversions on Erie, Sixth, and Third Street to larger market-rate apartment projects like Mill Rocks, 130 Monitor, and the Baker Building. Many of these required major site plan approvals, tax abatements, or municipal approvals, meaning Point Capital’s profitability is directly tied to City Hall’s discretion. Florito’s $2,500 donation to McGreevey creates a clear conflict of interest because his firm depends on favorable zoning, permitting, and financing arrangements from the city. While donations from developers are legal if properly disclosed, they are often perceived as pay-to-play contributions, especially when tied to active or recent projects in Jersey City. Given Point Capital’s deep footprint in local development, this contribution should be flagged as a strong red flag — signaling an attempt to maintain political influence over the very government processes that determine their business success.</p>
          <p><a href="https://www.pointcapdev.com/current-projects">Point Capital's Current Projects</a></p>
          <p><a href="https://www.pointcapdev.com/completed-projects">Point Capital's Completed Projects</a></p>
        </div>
      )}
    </div>

    <div className="accordion-item">
      <button
        className={`accordion-header ${openIndex === 66 ? "active" : ""}`}
        onClick={() => toggleAccordion(66)}
        aria-expanded={openIndex === 66}
      >
        Scott Rechler, CEO of RXR Realty LLC - $2,000
        <span className="accordion-arrow" />
      </button>
      {openIndex === 66 && (
        <div className="accordion-content">
          <p>Scott Rechler, CEO of RXR Realty LLC, donated $2,000 to Jim McGreevey’s campaign. RXR Realty holds residential properties in Jersey City, including Hudson House and Journal Square, which depend on city approvals, zoning compliance, and permits. In a city with a history of pay-to-play politics, contributions from executives whose projects are directly affected by municipal decisions represent a clear conflict of interest. While the donation may comply with campaign finance laws if properly disclosed, the fact that it comes from the CEO of a company with substantial Jersey City holdings raises a strong red flag. Voters could reasonably question whether such contributions might influence policy decisions, prioritize developer interests over residents, or create perceived favoritism in future city approvals. Accepting donations from top-level executives in development firms with active projects in the city blurs the line between public governance and private gain, warranting scrutiny from both watchdogs and the public.</p>
          <p><a href="https://rxr.com/portfolio/?jsf=epro-posts:properties_grid&tax=location:90">RXR Realty properties in Jersey City</a></p>
        </div>
      )}
    </div>

    <div className="accordion-item">
      <button
        className={`accordion-header ${openIndex === 67 ? "active" : ""}`}
        onClick={() => toggleAccordion(67)}
        aria-expanded={openIndex === 67}
      >
        Jacob Mermelstein, CEO of Ray Builders - $1,000
        <span className="accordion-arrow" />
      </button>
      {openIndex === 67 && (
        <div className="accordion-content">
          <p>Ray Builders is listed as an active developer in the project on 711 Montgomery Street. This direct involvement in a major Jersey City development makes their connection to campaign donations especially significant, as it underscores the potential influence of private construction interests on public decision-making. The overlap between active development projects and political contributions highlights why this case raises concerns about pay-to-play dynamics.</p>
          <p><a href="https://www.rayconstruction.net/current-projects">Ray Builders Current Projects</a></p>
        </div>
      )}
    </div>

    <div className="accordion-item">
      <button
        className={`accordion-header ${openIndex === 68 ? "active" : ""}`}
        onClick={() => toggleAccordion(68)}
        aria-expanded={openIndex === 68}
      >
        Tim Donohue, Partner of Arleo & Donohue LLC - $2,000
        <span className="accordion-arrow" />
      </button>
      {openIndex === 68 && (
        <div className="accordion-content">
          <p>The $2,000 donation from Tim Donohue, a partner at Arleo & Donohue, raises a strong red flag because his firm has been directly compensated by the City of Jersey City, as documented in Resolution 20-142. Pay-to-play concerns are heightened when campaign donors are principals of firms receiving city contracts, especially in professional services like law, which fall under EUS designations. The timing and nature of this contribution suggest a potential conflict of interest, as the firm could reasonably expect to seek or maintain similar city work. This creates the appearance that political donations might be used to preserve access or influence over lucrative municipal contracts.</p>
          <p><strong>Res 20-181 </strong> The City of Jersey City authorized a contract with the law firm Arleo & Donohue, LLC. The resolution approved a payment of $19,140 to cover professional legal services rendered in litigation matters. This contract was categorized as an extraordinary unspecifiable service (EUS), meaning it required specialized expertise. The resolution was adopted by the City Council with formal approval and signatures. Effectively, it documents that Arleo & Donohue received public funds directly from Jersey City for legal representation. <a href="https://cityofjerseycity.civicweb.net/document/21819">Resolution PDF</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/11373">9/3/19 - $1,080</a></p>
        </div>
      )}
    </div>

    <div className="accordion-item">
      <button
        className={`accordion-header ${openIndex === 69 ? "active" : ""}`}
        onClick={() => toggleAccordion(69)}
        aria-expanded={openIndex === 69}
      >
        John Corzine, Former NJ Senator and NJ Governor - $5,000
        <span className="accordion-arrow" />
      </button>
      {openIndex === 69 && (
        <div className="accordion-content">
          <p>Former New Jersey Governor and U.S. Senator John Corzine donating to Jim McGreevey is a strong red flag. Corzine’s career has been marred by financial scandal, most notably the 2011 collapse of MF Global under his leadership, which left a $1.6 billion shortfall in customer funds and cemented his reputation for mismanagement and Wall Street excess. His presence as a donor ties McGreevey to the old political and financial establishment, suggesting backing from a figure long associated with insider politics rather than reform. This raises concerns that McGreevey’s campaign may be aligned with entrenched interests rather than independent or grassroots support.</p>
        </div>
      )}
    </div>

    <div className="accordion-item">
      <button
        className={`accordion-header ${openIndex === 70 ? "active" : ""}`}
        onClick={() => toggleAccordion(70)}
        aria-expanded={openIndex === 70}
      >
        James Caulfield, Co-Founder and Partner of Fields Grade Development - $5,200
        Robert Caulfield, Co-Founder and Partner of Fields Grade Development - $5,200
        <span className="accordion-arrow" />
      </button>
      {openIndex === 70 && (
        <div className="accordion-content">
          <p>Fields Grade has been an active force in Jersey City’s development boom, with multiple large-scale residential projects completed in just the past few years — including The Devan, The Agnes, The Hazel, Atlas, and Starling, among others — plus new developments like 177 Grand and 151 Yale already underway. With such a deep stake in the city’s real estate market, their maximum contributions of $5,200 each to Jim McGreevey strongly suggest an interest in maintaining access and influence over future approvals, zoning changes, or city incentives. Unlike donations from private individuals with no financial ties to Jersey City, these contributions come directly from developers whose business success depends on favorable treatment from city government. Taken together, the scale of Fields Grade’s footprint and the timing of these large donations make this a textbook example of potential pay-to-play politics.</p>
          <p><a href="https://www.fieldsgrade.com/projects">Fields Grade Development Projects</a></p>
        </div>
      )}
    </div>

    <div className ="accordion-item">
      <button
        className={`accordion-header ${openIndex === 71 ? "active" : ""}`}
        onClick={() => toggleAccordion(71)}
        aria-expanded={openIndex === 71}
      >
        Leemark Electrics - $2,500
        <span className="accordion-arrow" />
      </button>
      {openIndex === 71 && (
        <div className="accordion-content">
          <p>Leemark Electrics has donated $2,500 to McGreevey. Leemark Electrics have done several projects in Jersey City relating lighting, power distribution, etc. Along with their projects, they have received expenditures from Jersey City and had received a contract in October 2020. The details are listed below.</p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/44186">$32,700 - 3/4/21</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/35805">Resolution PDF</a></p>
          <p><a href ="https://cityofjerseycity.civicweb.net/document/30560">$9,800 - 2/19/20</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/23359">$4,120 - 3/18/20</a></p>

        </div>
      )}
    </div>

    <div className = "accordion-item">
      <button
        className={`accordion-header ${openIndex === 72 ? "active" : ""}`}
        onClick={() => toggleAccordion(72)}
        aria-expanded={openIndex === 72}
      >
        Mast Construction Services - $7,000
        <span className="accordion-arrow" />
      </button>
      {openIndex === 72 && (
        <div className="accordion-content">
          <p>Mast Construction Services raises potential red flag concerns despite not currently holding direct contracts with Jersey City. The company has made multiple contributions, ranging from $250 to $2,500, both as corporate and “P2P Corporate,” spanning the years 2020 through 2025. While the donations themselves are not unusually large, the repeated contributions over time, combined with Mast’s extensive involvement in high-profile public projects in the region—such as courthouse renovations, Hudson County Community College buildings, and other infrastructure initiatives—suggest a potential interest in maintaining influence or favorable relationships with city officials. Even without formal contracts in Jersey City, their consistent presence and donations indicate strategic relationship-building that could warrant closer scrutiny.</p>
        </div>
      )}
    </div>

    <div className = "accordion-item">
      <button
        className={`accordion-header ${openIndex === 73 ? "active" : ""}`}
        onClick={() => toggleAccordion(73)}
        aria-expanded={openIndex === 73}
      >
        Adam Altman, Managing Member at KABR - $1,000
        <span className="accordion-arrow" />
      </button>
      {openIndex === 73 && (
        <div className="accordion-content">
          <p>
            Adam Altman, a managing member of KABR Group, donated $1,000 to McGreevey’s campaign in 2024. KABR Group is a prominent real estate investment and development firm with multiple high-profile projects in Jersey City, including 26 Journal Square, 30 Journal Square, the Canopy by Hilton Hotel, 65 Bay Street, and the Arts & Powerhouse Building. Because these projects rely on city approvals, zoning decisions, and ongoing support from local leadership, Altman’s donation raises clear concerns about pay-to-play and potential conflicts of interest. Given the direct financial stake KABR has in Jersey City’s development landscape, this contribution is a strong red flag.
          </p>
          <p><a href="https://kabrgroup.com/portfolio/properties">KABR's Projects</a></p>
        </div>
      )}
    </div>

    <div className = "accordion-item">
      <button
        className={`accordion-header ${openIndex === 74 ? "active" : ""}`}
        onClick={() => toggleAccordion(74)}
        aria-expanded={openIndex === 74}
      >
        Greater NJ Carpenters PAC - $120,200
        <span className="accordion-arrow" />
      </button>
      {openIndex === 74 && (
        <div className="accordion-content">
          <p>
            The Greater NJ Carpenters, through their PAC, have donated $120,200 to Jim McGreevey’s Jersey City mayoral campaign while simultaneously receiving a long series of substantial expenditure payments from the City of Jersey City. Public records show repeated payments from April 2021 through September 2025, including $143,038.07 (4/14/21), $90,258.05 (9/7/21), $77,426.57 (1/6/22), $168,212.69 (6/24/24), $117,874.81 (1/22/24), and dozens of others ranging from $15,129 to over $72,000, with many months showing multiple payments. Altogether, these expenditures represent millions of dollars directed to the union over four years. The overlap between such consistent, large-scale municipal payments and the PAC’s significant political contributions to McGreevey represents a strong red flag for potential pay-to-play and conflict of interest concerns, raising questions about whether the union’s financial support could influence the city’s contracting and expenditure decisions.
          </p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/436931">9/3/25 - $25,521.66</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/434925">7/11/25 - $15,941.21</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/434179">6/20/25 - $58,510.39</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/431135">5/15/25 - $33,158.79</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/425256">3/24/25 - $38,253.15</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/422620">2/24/25 - $36,687.15</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/419821">1/24/25 - $28,140.29</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/415425">11/22/24 - $29,116.55</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/413149">10/25/24 - $36,667.00</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/412458">10/10/24 - $30,217.54</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/410721">9/6/24 - $32,504.19</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/409634">8/12/24 - $34,820.65</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/406617">6/24/24 - $168,212.69</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/404397">6/7/24 - $66,602.78</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/394633">2/5/24 - $56,934.79</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/393695">1/22/24 - $117,874.81</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/390093">12/11/23 - $72,711.03</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/313478">10/23/23 - $53,607.40</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/156507">9/18/23 - $45,114.90</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/95854">8/11/23 - $55,762.64</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/94298">7/7/23 - $56,410.81</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/91602">5/19/23 - $35,196.81</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/90508">5/8/23 - $37,071.05</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/88651">4/6/23 - $37,835.81</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/87444">3/17/23 - $41,939.10</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/85108">2/17/23 - $48,206.81</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/82744">1/6/23 - $58,599.19</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/81765">12/9/22 - $49,546.18</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/78028">10/25/22 - $44,633.90</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/77318">10/11/22 - $37,863.91</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/74496">9/2/22 - $29,022.48</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/73623">8/17/22 - $15,129.04</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/70762">6/27/22 - $44,999.56</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/67367">4/22/22 - $44,485.55</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/66966">4/13/22 - $46,873.61</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/64888">3/3/22 - $22,919.20</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/64284">2/17/22 - $36,280.73</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/61646">1/6/22 - $77,426.57</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/55896">9/7/21 - $90,258.05</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/46338">4/14/21 - $143,038.07</a></p>

        </div>
      )}
    </div>

    <div className = "accordion-item">
      <button
        className={`accordion-header ${openIndex === 75 ? "active" : ""}`}
        onClick={() => toggleAccordion(75)}
        aria-expanded={openIndex === 75}
      >
        William Baroni - $2,500
        Wendy Neu - $5,200
        Hugo Neu Corporation - $33,000
        <span className="accordion-arrow" />
      </button>
      {openIndex === 75 && (
        <div className="accordion-content">
          <p>
            Hugo Neu and its principals have made significant contributions to Jim McGreevey’s mayoral campaign, including maximum-level individual donations from Wendy Neu (\$5,200) and William Baroni (\$2,500), as well as large corporate contributions of \$12,200 and \$20,800 from Hugo Neu Corporation. At the same time, Hugo Neu remains the property owner of the contaminated 1 Jersey Avenue site, where NJDEP oversight has resulted in a Response Action Outcome, a Soil Remedial Action Permit, and a Classification Exception Area/Well Restriction Area due to ongoing soil and groundwater contamination. This overlap between substantial political giving and unresolved regulatory obligations tied to a major redevelopment property in Jersey City presents a strong red flag for potential pay-to-play concerns and conflicts of interest, raising questions about whether campaign contributions could influence the city’s handling of environmental and development matters involving Hugo Neu.
          </p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/383306">November 8, 2023 Agenda</a></p>
          <p><a href="https://cityofjerseycity.civicweb.net/document/93909">June 28, 2023 Agenda</a></p>

        </div>
      )}
    </div>

    <div className = "accordion-item">
      <button
        className={`accordion-header ${openIndex === 76 ? "active" : ""}`}
        onClick={() => toggleAccordion(76)}
        aria-expanded={openIndex === 76}
      >
        B.A.C Administrative District Council of NJ - $6,000
        <span className="accordion-arrow" />
      </button>
      {openIndex === 76 && (
        <div className="accordion-content">
          <p>
            The B.A.C. Administrative District Council of New Jersey contributed $6,000 to McGreevey's campaign, while records show the City of Jersey City has paid the union substantial sums for various projects, including $36,506.07 on April 6, 2023, and $28,265.70 on March 17, 2023, among numerous other disbursements exceeding $100,000 since early 2023. This overlap between significant campaign contributions and recurring city expenditures creates a strong pay-to-play concern. While unions have a legitimate role in supporting candidates, the scale of financial ties in this case raises questions about whether public contracting decisions could be influenced by political donations, signaling a potential conflict of interest.
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

    <div className = "accordion-item">
      <button
        className={`accordion-header ${openIndex === 77 ? "active" : ""}`}
        onClick={() => toggleAccordion(77)}
        aria-expanded={openIndex === 77}
      >
        Khacharurian Engineering Assoc INC - $5,200
        <span className="accordion-arrow" />
      </button>
      {openIndex === 77 && (
        <div className="accordion-content">
          <p>
            Khacharurian Engineering Associates, Inc., an MEP engineering firm with multiple active projects in Jersey City, contributed $5,200 to Jim McGreevey’s mayoral campaign. Given the firm’s ongoing and potential city development projects relating to real estate projects, such as 425 Summit Avenue and 351 Marin Boulevard, this donation raises a strong red flag for pay-to-play concerns. The contribution creates the appearance of a conflict of interest, as the firm could potentially benefit from favorable city approvals, expedited permitting, or informal influence over municipal decisions. The timing and size of the donation, relative to the firm’s business interests in the city, further underscore the risk of perceived or actual undue influence.
          </p>
          <p><a href="https://www.keaengineers.com/featured-mep-projects">Featured Projects</a></p>
        </div>
      )}
    </div>



















     

    

    










    














      









    </section>

    <footer className="other-candidates-section">
          <h2>Other Candidates</h2>
          <ul className="other-candidates-list">
            {otherCandidates
              .filter(c => c.name !== "Jim McGreevey") // exclude current candidate
              .map(c => (
                <li key={c.name}>
                  <Link to={c.path}>{c.name}</Link>
                </li>
            ))}
          </ul>
    </footer>



      <div style={{ marginTop: "2rem", display: "flex", justifyContent: "space-between", flexWrap: "wrap" }}>
        <a href={`${backendUrl}/download/Jim_McGreevey_combined_contributions.csv`} download className="btn-download">Download Full Contributions CSV</a>
        <a href="/" className="btn-return">Return to Home Page</a>
        <a href="https://www.njelecefilesearch.com/SearchContributionInteractive?eid=454445">View Full ELEC Records</a>
      </div>
      <footer>PAID FOR BY ALI FOR JERSEY CITY
PO BOX 8237, JERSEY CITY, NJ 07308</footer>
    </div>
  );
}
