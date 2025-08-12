import React, {useEffect, useState} from "react";
import { Pie, Bar } from "react-chartjs-2";
import "chart.js/auto";
import "./Draft.css";
import McGreeveyPhoto from "./img/mcgreevey1.jpg";

export default function Draft() {
  const [chartData, setChartData] = useState(null);
  const [topDonorsBarData, setTopDonorsBarData] = useState(null);
  const [topEmployersBarData, setTopEmployersBarData] = useState(null);
  const [donorSearchResults, setDonorSearchResults] = useState([]);
  const [donorHistory, setDonorHistory] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchStatus, setSearchStatus] = useState(null);
  const [totalDonations, setTotalDonations] = useState(null);
  const [openIndex, setOpenIndex] = React.useState(null);
    
      const toggleAccordion = (index) => {
        setOpenIndex(openIndex === index ? null : index);
      };
  const backendUrl = "https://ali-pay2play-backend.onrender.com";

 
  

  useEffect(() => {
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
      }).catch(console.error);
  }, []);

  useEffect(() => {
    fetch(`${backendUrl}/api/top_donors_bar/Jim_McGreevey`)
      .then((res) => res.json())
      .then(setTopDonorsBarData)
      .catch(console.error);
  }, []);

  useEffect(() => {
    fetch(`${backendUrl}/api/top_employers_bar/Jim_McGreevey`)
      .then((res) => res.json())
      .then(setTopEmployersBarData)
      .catch(console.error);
  }, []);

  useEffect(() => {
    fetch(`${backendUrl}/api/total_donations/Jim_McGreevey`)
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
      <h1>Jim McGreevey: Campaign Finance Visuals</h1>

      {totalDonations !== null && (
        <div className="total-donations-panel">
          <h2>Total Donations</h2>
          <p>${totalDonations.toLocaleString()}</p>
        </div>
      )}

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

      <div style={{ marginTop: "3rem", padding: "1rem" }}>
        <h2>Red Flags</h2>
        <p>Jim McGreevey has received the most amount of donations that are suspicious in terms of pay2play for conflict of interest. All of them are listed below.</p>
        <ul>
          <li>Chisea Shaninian & Giantomisi PC</li>

            <ul>McGreevey has received at least 200 unique donations from this law firm, ranging from small donations from employees to large donations from the law firm itself. They have raised close to $100,000 for McGreevey, with donations from them spiking around December 2023. </ul>
          <li>Pay-to-play corporate donors</li>
          <li>Large individual contributions from high-net-worth individuals</li>
          <li>Repeated donations from the same entities</li>
        </ul>
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
          Chisea Shaninian & Giantomisi 
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
          T&M Associates
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
          French & Parrello Associates
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

      {/*Persistent Construction Corp*/}
      <div className="accordion-item">
        <button
          className={`accordion-header ${openIndex === 3 ? "active" : ""}`}
          onClick={() => toggleAccordion(3)}
          aria-expanded={openIndex === 3}
        >
          Anthony Grano, Owner of Persistent Construction Corp
          <span className="accordion-arrow" />
        </button>
        {openIndex === 3 && (
          <div className="accordion-content">
            <ul>
              <li>
                Solomon received a donation of $2,000 from Anthony Grano on March 27, 2025. Persistent Construction Corp has received multiple contracts from Jersey City listed below.
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
      {/*Charles and Seryl Kushner - Kushner Company*/}
      <div className = "accordion-item">
        <button
          className={`accordion-header ${openIndex === 4 ? "active" : ""}`}
          onClick={() => toggleAccordion(4)}
          aria-expanded={openIndex === 4}>
          Charles and Seryl Kushner - Kushner Company
          <span className="accordion-arrow" />
        </button>
        {openIndex === 4 && (
           <div className="accordion-content">
            <p>Charles and Seryl Kushner have donated $10,100 each to McGreevey's campaign in 2023 and 2024. Charles and Seryl has donated $100,000 to the Make America Great Again PAC in 2015 and $1 million to America First PAC in 2023, a pro-Trump PAC. They have also held a fundraiser for Trump in their Long Branch home in 2017. They have also begun real estate developments in Jersey City, such as One Journal Square, 65 Bay Street, known as Trump Bay Street, and Journal Squared. These developments  have often been shadowed by ethical, legal, and labor disputes, ranging from funding transparency to compliance with labor laws and local governance challenges.</p>
            <p>The support of McGreevey shows the favorability of his campaign to their real estate interests. These donations have been deemed a red flag because of the history of the donations of the Kushners, their alignment with Donald Trump, and possible real estate favorability for current projects. </p>
            <p>Furthermore, Jersey City has accepeted a donation of $47,800, which was approved on November 14, 2024. The donation was to the  Department of Recreation and Youth Development to provide financial support to any Pershing Field Pool projects and f a new refrigeration system at the Lafayette Pool complex concession stand. This was voted unanimously by the Jersey City Council. <a href="https://cityofjerseycity.civicweb.net/document/413754/Aquatics%20Donation.pdf?handle=A5324B6A2456431F8E32B36D6938E0E7">Donation PDF</a></p>
          </div>
        )}
            
      </div>
      </section>


      <div style={{ marginTop: "2rem", display: "flex", justifyContent: "space-between", flexWrap: "wrap" }}>
        <a href={`${backendUrl}/download/Jim_McGreevey_combined_contributions.csv`} download className="btn-download">Download Full Contributions CSV</a>
        <a href="/" className="btn-return">Return to Home Page</a>
        <a href="https://www.njelecefilesearch.com/SearchContributionInteractive?eid=454445">View Full ELEC Records</a>
      </div>
    </div>
  );
}
