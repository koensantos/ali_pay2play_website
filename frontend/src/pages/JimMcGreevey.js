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
      <h1>Jim McGreevey: Campaign Finance Visuals</h1>

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

      <section id="red-flags" className="accordion-container">
        <h2>Red Flags</h2>
        <p>Jim McGreevey has received the most pay2play and conflict of interest donations out of all the candidates. They are all listed below (Disclaimer: This list is being updated as more research and more donations come through with quarterly reports. This is as up-to-date as it can be.):</p>
        {/* Accordion item 0 */}
      <div className="accordion-item">
        <button
          className={`accordion-header ${openIndex === 0 ? "active" : ""}`}
          onClick={() => toggleAccordion(0)}
          aria-expanded={openIndex === 0}
        >
          Chisea Shaninian & Giantomisi - $97,950
          <span className="accordion-arrow" />
        </button>
        {openIndex === 0 && (
          <div className="accordion-content">
          <p>Chisea Shaninian & Giantomisi has donated approximately $100,000 to McGreevey's campaign. This includes employee donations and company donations, leading up to about to 200 unique donations, with donations spiking around December 2023.</p>
          <p><strong>Res 23-481 </strong>This resolution ratifies a professional services agreement with the law firm Chiesa Shahinian & Giantomasi PC to represent Jersey City Police Officers Leon Tucker and Saad Hashmi in a lawsuit related to the Estate of Hiram Gonzalez. The contract, effective March 29, 2023, is for up to $40,000 at an hourly rate of $175, and includes expenses. The firm has complied with all required political contribution disclosures and the City's Pay-to-Play laws. Funds of $5,000 are available for this purpose in the current budget, with continuation contingent on future budget appropriations. The resolution and related documents will be made publicly available as required by law. <a href="https://cityofjerseycity.civicweb.net/document/90902/R0205489_%20Chiesa%20Shahinian%20_%20Giantomasi.pdf?handle=30D5C0EA4875471BAE6D17B7FF828B36">Resolution PDF</a></p>
          </div>
        )}
      </div>
      <div className="accordion-item">
        <button
          className={`accordion-header ${openIndex === 1 ? "active" : ""}`}
          onClick={() => toggleAccordion(1)}
          aria-expanded={openIndex === 1}
        >
          T&M Associates - $8,250
          <span className="accordion-arrow" />
          </button>
        {openIndex === 1 && (
          <div className="accordion-content">
            <p>T&M Associates have donated $8,250 to McGreevey's campaign. These donations are deemed suspicious because T&M Associates have been given contracts by Jersey City listed below.</p>
            <p><strong>Res 25-073 </strong>The City of Jersey City approved Resolution 25-073 on January 29, 2025 , awarding a professional services contract to T&M Associates. This contract, not to exceed $300,000.00 , is for on-call civil engineering services for the Department of Infrastructure, Division of Engineering. The term of the contract is twelve (12) months , effective upon its execution by City Officials. Assuming execution around the approval date, the contract is expected to run from approximately January 29, 2025, to January 28, 2026. <a href="https://cityofjerseycity.civicweb.net/document/419212/Resolution%20authorizing%20an%20On-Call%20Engineering%20P.pdf?handle=806F0E4674C744FF9B1D369B03C2C114">Resolution PDF</a></p>
            <p><strong>Res 22-421 </strong>This resolution from the City of Jersey City authorizes a professional services contract with T & M Associates for electrical engineering design and construction administration services. The services are specifically for site lighting improvements at Canco Park (Project No. 2019-042). The contract amount will not exceed $23,140.00. This agreement was awarded through a "fair and open" process, complying with the "Pay-to-Play Law" provisions, and is exempt from public bidding as a professional service. The resolution, approved on June 15, 2022, also includes requirements for Equal Employment Opportunity (EEO) and Affirmative Action (AA) compliance. <a href="https://cityofjerseycity.civicweb.net/document/67682/Resolution%20authorizing%20the%20award%20of%20a%20professio.pdf?handle=6380AC9B1A6F42CCB8AA2EED8AE03DDD">Resolution PDF</a></p>
            <p><strong>Res 21-169 </strong>This resolution authorizes awarding a $32,500 professional engineering services contract to T&M Associates for the design of the Second Street rail crossing, roadway, and signal improvements (Project No. 17-010-T). Three proposals were received, and T&M Associates was selected based on experience and cost, offering the lowest bid compared to $119,932 and $167,395 from other firms. The contract, effective upon execution for 12 months, is exempt from competitive bidding under the Local Public Contracts Law and awarded through the Pay-to-Play “Direct and Open Process.” T&M Associates met all compliance requirements, including Pay-to-Play and EEO/AA certifications, and funds are available from account 04-215-55-151-990. The resolution and agreement will be made publicly available as required by law. <a href="https://cityofjerseycity.civicweb.net/document/41538/Second%20Street%20Rail%20Crossing%20Improvements.pdf?handle=8B3ACEC34ACE4E9292B8513614AD7ACC">Resolution PDF</a></p>
            <p><strong>Res 20-503 </strong>The City of Jersey City has authorized a professional services contract with T & M Associates for services related to Reservoir #3 Safety Improvements and Restoration of Reservoir #3 Screen House projects. The contract is for $17,720.00 and is for a twelve-month term. These services include updating land and base mapping, performing site inspection and preliminary NJDEP coordination, and providing ADA compliance recommendations. The City informally solicited a quotation from T & M Associates, who had previously provided a land survey of the site. The Director of Architecture recommended awarding the contract to T & M Associates based on their qualifications. <a href="cityofjerseycity.civicweb.net/document/46974/Professional%20Services%20Agreement%20with%20Eric%20M.%20Be.pdf?handle=8814FBDE9C4A4165A8583CC51BAEFE65">Resolution PDF</a></p>
            <p><strong>Res 20-270 </strong>The City of Jersey City has awarded a professional services contract to T&M Associates to prepare plans and specifications for the Morris Canal Greenway Segments 5, 10, and 11. This project is funded by a $3,500,000.00 Regional Transportation Alternatives Program grant from the New Jersey Department of Transportation. T&M Associates, a qualified engineering firm, will provide surveying, construction plans, and specifications, with the contract value exceeding $17,500.00. The contract was awarded directly and openly as a statutorily permitted contract under the "Pay to Play Law." The resolution ensures that the firm complies with all necessary certifications and disclosure requirements. <a href="cityofjerseycity.civicweb.net/document/46974/Professional%20Services%20Agreement%20with%20Eric%20M.%20Be.pdf?handle=8814FBDE9C4A4165A8583CC51BAEFE65">Resolution PDF</a></p>
            <p><strong>Res 19-1766 </strong>The City of Jersey City has awarded a one-year professional engineering services contract to T&M Associates for on-call civil engineering services, with a total cost not to exceed $250,000.00. This contract was awarded through a "fair and open process" in accordance with the New Jersey Pay-to-Play Law and is exempt from public bidding under the Local Public Contracts Law. T&M Associates was chosen due to its pre-qualification, experience in municipal engineering, and satisfactory past performance. The agreement is subject to the firm providing evidence of compliance with Affirmative Action Amendments to the Law Against Discrimination, and the resolution will be publicly published. <a href="https://cityofjerseycity.civicweb.net/filepro/document/7925/RES%202019%2002%2027.pdf">Resolution PDF (Listed in pgs 345-389)</a></p>
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
          French & Parrello Associates - $9,700
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
          </div>)}

      </div>

      
      {/*Charles and Seryl Kushner - Kushner Company*/}
      <div className = "accordion-item">
        <button
          className={`accordion-header ${openIndex === 3 ? "active" : ""}`}
          onClick={() => toggleAccordion(3)}
          aria-expanded={openIndex === 3}>
          Charles and Seryl Kushner - Kushner Company - $20,200
          <span className="accordion-arrow" />
        </button>
        {openIndex === 3 && (
           <div className="accordion-content">
            <p>Charles and Seryl Kushner have donated $10,100 each to McGreevey's campaign in 2023 and 2024. Charles and Seryl has donated $100,000 to the Make America Great Again PAC in 2015 and $1 million to America First PAC in 2023, a pro-Trump PAC. They have also held a fundraiser for Trump in their Long Branch home in 2017. They have also begun real estate developments in Jersey City, such as One Journal Square, 65 Bay Street, known as Trump Bay Street, and Journal Squared. These developments  have often been shadowed by ethical, legal, and labor disputes, ranging from funding transparency to compliance with labor laws and local governance challenges.</p>
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
          </div>
        )}


      </div>

      <div className = "accordion-item">
      <button
        className ={`accordion-header ${openIndex === 5 ? "active" : ""}`}
        onClick={() => toggleAccordion(5)}
        aria-expanded={openIndex === 5}>
        Eric M Bernstein, Owner of Eric M Bernstein & Associates - $15,600
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
          </div>
        )}
    </div>

    {/*Rainone Coughlin Minchello LLC*/}
      <div className = "accordion-item">
        <button
          className ={`accordion-header ${openIndex === 8 ? "active" : ""}`}
          onClick={() => toggleAccordion(8)}
          aria-expanded={openIndex === 8}>
          Rainone Coughlin Minchello LLC - $26,800
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
          Nicholas Netta - Netta Architects LLC - $5,000
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
        Boswell Engineering - $4,000
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
        Waters, McPherson, McNeil - $36,400 
        <span className="accordion-arrow" />
      </button>
      {openIndex === 16 && (
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
    </div>
  );
}
