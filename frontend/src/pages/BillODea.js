import React, {useEffect, useState} from "react";
import { Pie, Bar } from "react-chartjs-2";
import "chart.js/auto";
import "./Draft.css";
import ODeaPhoto from "./img/odea.jpg";

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
      }).catch(console.error);
  }, []);

  useEffect(() => {
    fetch(`${backendUrl}/api/top_donors_bar/Bill_O'Dea`)
      .then((res) => res.json())
      .then(setTopDonorsBarData)
      .catch(console.error);
  }, []);

  useEffect(() => {
    fetch(`${backendUrl}/api/top_employers_bar/Bill_O'Dea`)
      .then((res) => res.json())
      .then(setTopEmployersBarData)
      .catch(console.error);
  }, []);

  useEffect(() => {
    fetch(`${backendUrl}/api/total_donations/Bill_O'Dea`)
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
      <h1>Bill O'Dea: Campaign Finance Visuals</h1>

      {totalDonations !== null && (
        <div className="total-donations-panel">
          <h2>Total Donations</h2>
          <p>${totalDonations.toLocaleString()}</p>
        </div>
      )}

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
        <p>Bill O'Dea has received suspicious donations that are listed below:</p>
        <ul>
          <li>Sal's Electric CO.</li>
            <ul>
              <li>O'Dea has received several donations totaling $1,000. The company has recieved several contracts listed below.</li>
              <ul>
                <li>Res 24-628: The City of Jersey City approved Resolution 24-628 on August 14, 2024, awarding a contract worth $198,718.00 to Sal Electric Co., Inc.. This contract is for the purchase and installation of an overhead lighting system at Pershing Field Pool for the Department of Recreation and Youth Development. The contract was awarded through the New Jersey Cooperative Purchasing Alliance (NJCPA), Bergen County Coop, and is a one-time purchase, meaning it will be completed upon the delivery of the goods and services.<a href="cityofjerseycity.civicweb.net/document/402028/Ratifying%20a%20professional%20services%20agreement%20wit.pdf?handle=9B13DF77BC3D428E9E9E99B86C07B524">Resolution PDF</a></li>
                <li>Res 21-745: On October 27, 2021, Jersey City approved Resolution 21-745, awarding a $244,678 contract to Sal Electric Co., Inc. for the installation of EV chargers for five electric garbage trucks. The contract was issued under the New Jersey Cooperative Purchasing Alliance (NJCPA) with Bergen County as the lead agency, which allows municipalities to jointly procure goods and services. Funding is sourced from two capital accounts, with purchase orders totaling the full amount. The contract is considered fair and reasonable by the City Purchasing Agent and will be completed upon delivery and proper certification of service. Payment will be issued in accordance with Local Fiscal Affairs Law, once the contractor meets all obligations. <a href="cityofjerseycity.civicweb.net/document/402028/Ratifying%20a%20professional%20services%20agreement%20wit.pdf?handle=9B13DF77BC3D428E9E9E99B86C07B524">Resolution PDF</a></li>
                <li></li>
              </ul>
            </ul>
          <li>William J Guarini Plumbing</li>
            <ul>
              <li>O'Dea has received a total of </li>
            </ul>
          <li>Royal Printing Services</li>
          <ul>
            <li>O'Dea has received a $2,600 donation from the company on May 24, 2022. This company has received several contracts related to ballots for elections and other printing needs listed below.</li>
            <ul>
              <li>Res 24-507: The City of Jersey City ratified a contract awarded to Royal Printing Service for $84,300.00 for printing official election machine and sample ballots for the June 4, 2024 primary election. The Hudson County Clerk, E. Junior Maldonado, designated Royal Printing Service as the official printer for Hudson County ballots. This contract was exempt from public bidding as per N.J.S.A. 40A:11-5(1)(1), which covers goods and services required for election preparation and conduct. Funds in the amount of $10,000.00 were initially available for the payment of this resolution. The contract award is also subject to Royal Printing Service providing satisfactory evidence of compliance with Affirmative Action Amendments to the Law Against Discrimination. <a href="https://cityofjerseycity.civicweb.net/document/404001/Contract%20Reso%20for%20Royal%20Printing%20-%20Primary%20Elec.pdf?handle=69D645D1F41C4D91B9B763FCA2946EE1">Resolution PDF</a></li>
              <li>Res 23-652: This resolution from the City of Jersey City authorizes the award of a contract to Royal Printing Service for various City printing needs. The total contract amount is $31,134.00. The contract term will be completed upon receipt of the goods and/or services. The resolution also outlines compliance with various regulations, including Equal Employment Opportunity (EEO)/Affirmative Action (AA) requirements and the Americans with Disabilities Act. It was approved on September 7, 2023. <a href="https://cityofjerseycity.civicweb.net/document/96696/For%20printing%20service%20for%20the%20year%20in%20review%20mas.pdf?handle=75ADD11D40454B3F82E076E64AB06F5F">Resolution PDF</a></li>
              <li>Res 23-653: This resolution from the City of Jersey City ratifies a contract awarded to Royal Printing Service for printing official election machine and sample ballots for the Primary Election held on June 6, 2023. Hudson County Clerk E. Junior Maldonado designated Royal Printing Service as the official printer for Hudson County ballots. The contract is for the sum of $84,300.00 and is exempt from public bidding under N.J.S.A. 40A:11-5(1)(1) because it pertains to services necessary for conducting an election. Royal Printing Service also submitted certifications related to business entity disclosure, political contributions, and compliance with the City's Pay-to-Play Reform Ordinance and affirmative action requirements. The resolution was approved on September 7, 2023.</li>
              <li>Res 20-666: The City of Jersey City has ratified a contract award to Royal Printing Service for printing official election machine and sample ballots for the July 7, 2020, primary election. The contract amount is $83,177.00. This contract was exempt from public bidding as per N.J.S.A. 40A:11-5(1)(1) because it involves goods and services necessary for conducting an election. Royal Printing Service was designated as the official ballot printer for Hudson County by the County Clerk. The resolution also states that the City is acquiring these services directly and openly as a statutorily permitted contract under the "Pay-to-Play Law". <a href="https://cityofjerseycity.civicweb.net/document/33849/Reso%20Contract%20Royal%20Printing.pdf?handle=B70083430C774A3B9D26CD8B7E237BA9">Resolution PDF</a></li>
              <li>Res 19-466 (Need Access)</li>
            </ul>
          </ul>
          <li>McManimon, Scotland & Baumann, LLC</li>
            <ul>
              <li>14 different employees of the law firm have donated a total of $5,400 to O'Dea's campaign. The firm has been awarded several contracts by Jersey City for several years. They are listed below.</li>
              <ul>
                <li>Res 24-537:  This resolution from the City of Jersey City ratifies a professional services agreement with the law firm McManimon, Scotland & Baumann, LLC. The firm has been appointed to represent the City of Jersey City in the case of "United Way v. City of Jersey City et al.". The contract is for a one-year term, beginning on January 1, 2024, and ending on December 31, 2024. The total contract amount is not to exceed $50,000.00, including expenses, at an hourly rate of $200.00. The resolution was approved on June 12, 2024 <a href="https://cityofjerseycity.civicweb.net/document/402519/R0208824_%20UNITED%20WAY%20V%20COJC.pdf?handle=5704792B47894C78B5B1E166EA350A69">Resolution PDF</a></li>
                <li>Res 24-415: This resolution from the City of Jersey City ratifies the renewal of a professional services agreement with the law firm McManimon, Scotland & Baumann, LLC. The firm is retained to represent the City and the Jersey City Planning Board in the case of "Clinton Crescent N. Madison Community v. Planning Board of the City of Jersey City, et al". This agreement is a renewal of a previous contract approved on March 23, 2023. The renewed contract is for one year, effective from January 1, 2024, and the total amount, including expenses, is not to exceed $130,000.00, with an hourly rate of $200.00. The resolution was approved on May 22, 2024. <a href="https://cityofjerseycity.civicweb.net/document/400402/Renewal%20of%20a%20professional%20services%20agreement%20wi.pdf?handle=A1DE271A561E40F58E59AE031B98951B">Resolution PDF</a></li>
                <li>Res 24-416:  The firm will continue to provide local land use legal counsel services in connection with the Sixth Street Embankment settlement. This is a renewal of previous agreements from 2020, 2021, and 2023. The contract is effective for one year, beginning on January 8, 2024, and the total contract amount is increased by an additional $50,000.00, making the new total contract amount $250,000.00, including expenses. The firm will be compensated at a rate of $200.00 per hour, including expenses. The resolution was approved on May 22, 2024. <a href="https://cityofjerseycity.civicweb.net/document/400567/Renewal%20of%20a%20professional%20services%20agreement%20wi.pdf?handle=A47EB30F6274413582FF3637B66C3CB3">Resolution PDF</a></li>
                <li>Res 24-350: On May 8, 2024, Jersey City approved Resolution 24-350, ratifying the renewal of a professional services agreement with the law firm McManimon, Scotland & Baumann, LLC to provide legal advice on tax matters. This renewal adds $30,000 to the contract, bringing the total contract amount to $90,000, with services billed at $200/hour including expenses. The contract qualifies as a professional service under NJ law, allowing it to be awarded without public bidding, and is compliant with Pay-to-Play and affirmative action regulations. Funding of $1,000 is currently available under PO#151260, with continuation subject to future appropriations. The agreement will be made publicly available and published in a local newspaper as required. <a href="https://cityofjerseycity.civicweb.net/document/400377/R0208646_%20TAX%20MATTERS%20McManimon,%20Scotland%20_%20Bau.pdf?handle=D80A870BC86F420BA33BAB53914D5612">Resolution PDF</a></li>
                <li>Res 23-937: On December 13, 2023, Jersey City approved Resolution 23-937, renewing a professional services agreement with McManimon, Scotland & Baumann, LLC to continue providing legal advice on tax matters. The renewal adds $30,000 to the contract, bringing the total to $60,000, with services billed at $200 per hour, including expenses. The agreement qualifies as a professional service under NJ law and is awarded without competitive bidding but in compliance with Pay-to-Play and affirmative action requirements. Funding of $1,000 is currently available under PO#149888, with future payments contingent on budget appropriations. The agreement will also be published for public inspection as required by law. <a href="https://cityofjerseycity.civicweb.net/document/340819/R0207074_%20Legal%20Advice%20_%20Tax%20Matters%20Counsel.pdf?handle=00E83E9537EE4E22880398A6652964C1">Resolution PDF</a></li>
                <li>Res 23-893: On November 29, 2023, Jersey City approved Resolution 23-893, ratifying a professional services agreement with McManimon, Scotland & Baumann, LLC to represent the City and the Jersey City Planning Board in the lawsuit LHN Owner, LLC and LHN II, LLC v. City of Jersey City et al. The contract runs for one year starting July 1, 2023, with a maximum value of $50,000, billed at $175 per hour including expenses. The agreement is awarded without public bidding under NJ’s professional services and Pay-to-Play laws. An initial $5,000 is available under PO#149796, with further payments contingent on future budget appropriations. The law firm must also comply with affirmative action requirements, and the resolution will be published for public notice. <a href="https://cityofjerseycity.civicweb.net/document/340822/Ratifying%20a%20professional%20services%20agreement%20wit.pdf?handle=DBEE892609C2458FB7CE464EC417A4F1">Resolution PDF</a></li>
                <li>Res 23-233: On March 23, 2023, Jersey City approved Resolution 23-233, ratifying a professional services agreement with McManimon, Scotland & Baumann, LLC to represent the city in the lawsuit Jeff Joseph & Syringa Ko v. City of Jersey City, et al. The agreement is for one year starting January 1, 2023, at an hourly rate of $200, with a contract not to exceed $65,000, including expenses. The contract is awarded without public bidding as a professional service under NJ law and complies with Pay-to-Play and affirmative action requirements. The firm submitted all necessary political contribution and compliance certifications. An initial $8,775 is available under PO#147555, and future payments are contingent on budget appropriations. <a href="https://cityofjerseycity.civicweb.net/document/84747/R0204518_%20J.%20Joseph%20_%20S.%20KO%20V.%20City.pdf?handle=213EE25053064041A00AC79B6B1ABC2D">Resolution PDF</a></li>
                <li>Res 23-234: On March 23, 2023, Jersey City approved Resolution 23-234, ratifying a professional services agreement with McManimon, Scotland & Baumann, LLC to represent the City and the Jersey City Planning Board in the lawsuit Clinton Crescent N. Madison Community v. Planning Board of the City of Jersey City, et al. The contract runs for one year starting January 1, 2023, at an hourly rate of $200, with a total not to exceed $65,000, including expenses. The firm complied with all Pay-to-Play and political contribution disclosure laws and submitted necessary certifications. An initial $2,255 is available under PO#147554, and continued payment depends on future budget appropriations. The agreement is awarded without public bidding under NJ’s professional services exemption. <a href="https://cityofjerseycity.civicweb.net/document/84602/R0204517_%20Clinton%20N.%20Madison%20Community%20V.%20City.pdf?handle=5BED33AC16F043ABA1192E32BD057D6B">Resolution PDF</a></li>
                <li>Res 23-147: Jersey City renewed its professional services agreement with the law firm McManimon, Scotland & Baumann, LLC to provide land use legal counsel for the ongoing Sixth Street Embankment settlement. The renewal adds $50,000 to the existing contract, bringing the total to $200,000. The agreement runs for one year from January 8, 2023, with services billed at $200 per hour, and is exempt from public bidding under New Jersey's Local Public Contracts Law. The contract complies with the City’s Pay-to-Play Reform Ordinance and Affirmative Action requirements, and $5,000 is currently available under PO# 147342.<a href="https://cityofjerseycity.civicweb.net/document/82313/R0204266_%20Renewal%206th%20Street%20Embankmentof%20a%20pro.pdf?handle=E0DB7272AA564D3F9C3B17C50B635603">Resolution PDF</a></li>
                <li>Res 22-533: The City of Jersey City awarded a $30,000 professional services contract to McManimon, Scotland & Baumann, LLC to provide legal advice and counsel on certain tax matters for one year beginning May 9, 2022. Services will be billed at $150/hour, including expenses. The agreement was awarded as a non-fair and open contract under New Jersey’s Pay-to-Play Law and Local Public Contracts Law, exempt from public bidding. The firm submitted all required disclosures and compliance certifications. $5,000 was confirmed available in Account No. 01-201-20-155-312; PO#145279. <a href="https://cityofjerseycity.civicweb.net/document/69116/Ratifying%20a%20professional%20services%20agreement%20wit.pdf?handle=68CFB4EA959848CFAC4D49581A8C3787">Resolution PDF</a></li>
                <li>Res 21-881: The City of Jersey City awarded a $50,000 professional services contract to McManimon, Scotland & Baumann, LLC for legal advice and counsel on certain real estate matters for a one-year term starting July 1, 2021. The firm will be compensated at an hourly rate of $150, including expenses. The contract was awarded as a professional services agreement exempt from public bidding under New Jersey law and through the “fair and open” Pay-to-Play process. All necessary certifications were submitted, and $15,000 in funds were confirmed available in Account No. 01-201-20-155-312; PO# 142935. <a href="https://cityofjerseycity.civicweb.net/document/58918/Professional%20Services%20Agreement%20with%20McManimon,.pdf?handle=10305472AC3141D98AF60C9E7AEA9C7E">Resolution PDF</a></li>
                <li>Res 21-882: Resolution 21-882 renews a professional services agreement between the City of Jersey City and the law firm McManimon, Scotland & Baumann, LLC. The firm will continue to provide local land use counsel services related to the Sixth Street Embankment settlement. The renewed contract is effective January 8, 2022, for one year, with an additional $50,000 added, bringing the total contract value to $100,000 at a rate of $200/hour. The agreement was awarded under the “fair and open” Pay-to-Play law and does not require public bidding. The firm has submitted all required compliance certifications, and the agreement is subject to the appropriation of funds in the 2022 budget. <a href="https://cityofjerseycity.civicweb.net/document/59897/Professional%20Services%20Agreement%20with%20McManimon,.pdf?handle=AB8D18072714463A87C21B0457170563">Resolution PDF</a></li>
                <li>Res 21-209: Resolution 21-209 renews a professional services agreement between the City of Jersey City and the law firm McManimon, Scotland & Baumann, LLC to provide local land use counsel services for the Sixth Street Embankment settlement. The contract is effective January 8, 2021, for one year, with a total value not to exceed $50,000 at a rate of $200 per hour. The contract was awarded through a fair and open process under the New Jersey Pay-to-Play Law and exempt from public bidding under state law. The law firm has submitted all required certifications, including compliance with affirmative action and pay-to-play ordinances. Funding of $5,000 is available in the city’s budget, and the contract continuation depends on available appropriations in the 2021 budget. <a href="https://cityofjerseycity.civicweb.net/document/41732/Professional%20Services%20Agreement%20with%20McManimon%20.pdf?handle=B356A4FDC23F4914A6B3F927FF91EA72">Resolution PDF</a></li>
                <li>Res 20-658: The City of Jersey City awarded a one-year professional services agreement to the law firm McManimon, Scotland & Baumann, LLC to provide legal services related to insurance coverage litigation for multiple matters. The contract, effective August 5, 2020, is valued up to $50,000 at an hourly rate of $150, including expenses. The award was made through a fair and open process under the New Jersey Local Unit Pay-to-Play Law and is exempt from public bidding under state law. The firm submitted all required certifications, including compliance with affirmative action and the city’s pay-to-play reform ordinance. Funding of $10,000 was available in the city’s 2020 budget, with contract continuation subject to appropriation of funds in future budgets. <a href="https://cityofjerseycity.civicweb.net/document/32364/Professional%20Service%20Agreement%20with%20McManimon,%20.pdf?handle=83A8F0E18ABB4C09B72B27FD05393F8A">Resolution PDF</a></li>
                <li>Res 20-040: The City of Jersey City awarded a one-year professional services contract to the law firm McManimon, Scotland & Baumann, LLC to provide local land use counsel services for the Sixth Street Embankment settlement. The contract, effective January 8, 2020, is for a total amount not to exceed $50,000 at an hourly rate of $150, including expenses. The award was made through a fair and open process in compliance with the New Jersey Local Unit Pay-to-Play Law and is exempt from public bidding under state law. The law firm submitted all required certifications, including compliance with the City’s Contractor Pay-to-Play Reform Ordinance and affirmative action laws. Funding of $10,000 was certified available in the city’s 2020 budget, with continuation contingent on the appropriation of sufficient funds. <a href="https://cityofjerseycity.civicweb.net/document/18463/Professional%20Service%20Contract%20for%20McManimon%20Sco.pdf?handle=E64B23B3A080462781CE8F41FE179D62:">Resolution PDF</a></li>
              </ul>
            </ul>
          <li>Nicholas Netta - Netta Architects</li>
            <ul>
              <li>Res 23-514: This resolution ratifies a third amendment to a contract with Netta Architects for services related to the Engine Co. #10 and Ladder #12 New Firehouse project. The original contract was for schematic design, design development, construction documents, and construction administration services. Previous amendments were made due to geotechnical and environmental evaluations, contaminated groundwater, and design changes, which increased the contract amount and extended the term. Due to COVID-19 supply chain issues, unforeseen subsurface conditions, and a Stop Work Order, the project experienced extensive delays, and the initial construction company was declared in default. This third amendment provides an additional $384,676.72 for supplemental geotechnical investigation services, modifications to contract documents, and additional bid assistance and construction administration services, bringing the total contract amount to $1,080,830.00. The contract term is also extended for an additional twenty-four months, from June 28, 2023, to June 28, 2025. <a href="https://cityofjerseycity.civicweb.net/document/93088/R0205683_%20NETTA%20ARCHITECTS%20Amending%20Resolution.pdf?handle=F8D8DEFAC3D64A89BAD9FE83F3C75CC6">Resolution PDF</a></li>
              <li>Res 22-420: This resolution from the City of Jersey City ratifies a second amendment to a professional services contract with Netta Architects. The amendment is for schematic design, design development, construction documents, and construction administration services for the new Engine Co #10 and Ladder #12 Firehouse. Due to unforeseen site conditions, including the need for geotechnical and environmental evaluations and subsequent redesign, the contract amount was increased by an additional $220,500.00, bringing the total to $818,000.00. The original contract for $498,500.00 was awarded in August 2018 for a 36-month term, with previous amendments increasing the total to $597,500.00. This agreement was processed as a professional service, exempt from public bidding, and complies with "Pay-to-Play" regulations. <a href="https://cityofjerseycity.civicweb.net/document/66670/Resolution%20Ratifying%20a%20Second%20Amendment%20to%20a%20co.pdf?handle=F0C6148D03F74F37A3A38DCDD3F0750C">Resolution PDF</a></li>
              <li>Res 20-541: The City of Jersey City has authorized an amendment to its contract with Netta Architects for services related to the Engine Co. #10 - New Firehouse project. This amendment, approved on August 12, 2020, increases the total contract amount by an additional $29,400.00, bringing the new total to $626,900.00. The amendment is necessary due to the discovery of contaminated groundwater at the site, requiring the design and incorporation of a sub-slab vapor mitigation system. Netta Architects will provide architectural, MEP engineering, and civil engineering services for this additional work. The original contract and previous amendments were also for schematic design, design development, construction documents, and construction administration services. <a href="https://cityofjerseycity.civicweb.net/document/31444/Resolution%20authorizing%20an%20amendment%20to%20Netta%20Ar.pdf?handle=B97332BC06AE4503AFEA397F2A18DF96">Resolution PDF</a></li>
            </ul>
          <li>Florio Kenny Raval</li>
            <ul>
                <li>O'Dea has received a total of $2,300 from the lawfirm itself. He has also received $2,500 from Niti Raval, $1,000 from Bernie Kenny, and $4,000 from Edward Florio. This amounts the total donations to $9,800 in support of O'Dea. They have received several contracts related to different cases in Jersey City listed below.</li>
                <ul>
                  <li>Res 25-077: The Jersey City Council passed Resolution 25-077 on January 29, 2025, renewing its professional services agreement with the law firm Florio, Kenny, Raval, LLP to represent the city in ongoing tax appeal matters. This marks the latest in a series of annual renewals and amendments since 2018, bringing the total contract amount to $1,425,000. The firm will continue providing legal services at an hourly rate of $175, and $5,000 in funds are currently available for the renewed term. The contract is awarded under the “fair and open” process outlined in New Jersey’s Pay-to-Play law and is exempt from competitive bidding due to its professional services status. Continuation of the agreement depends on future budget appropriations. <a href="https://cityofjerseycity.civicweb.net/document/419119/Renewal%20of%20a%20professional%20services%20agreement%20wi.pdf?handle=4A986F87F8A5407D9E83B296CF75CA56">Resolution PDF</a></li>
                  <li>Res 25-078: Resolution 25-078, approved on January 29, 2025, renews a professional services agreement with the law firm Florio Kenny Raval, LLP to represent former police officer Omar Polanco in the ongoing lawsuit Estate of Robertson v. City of Jersey City et al.. This renewal adds $50,000 to the legal services contract, bringing the total to $180,000, and sets the term for one year beginning January 1, 2025. The firm will be paid an hourly rate of $175, and the award follows New Jersey’s Pay-to-Play Law under the "fair and open" process. The agreement is exempt from public bidding as a professional service under state law. Continuation of the contract is contingent on sufficient funds being appropriated in the 2025 permanent budget. <a href="https://cityofjerseycity.civicweb.net/document/419112/Renewal%20of%20a%20professional%20services%20agreement%20wi.pdf?handle=8A06D8321D8D4A1588FC68A7F0B12B4B">Resolution PDF</a></li>
                  <li>Res 25-079: Resolution 25-079, approved January 29, 2025, renews a professional services agreement with the law firm Florio Kenny Raval, LLP to represent Police Officer Christopher Fodor in the ongoing lawsuit Arthur Jones v. City of Jersey City et al.. The contract renewal is for one year starting January 1, 2025, with an additional $50,000, bringing the total contract amount to $100,000. The firm will provide services at an hourly rate of $175, and the contract is awarded under New Jersey’s “fair and open” Pay-to-Play Law without competitive bidding. The contract continuation is contingent on the appropriation of sufficient funds in the City’s 2025 permanent budget. The resolution requires publication in a newspaper within 10 days and compliance with Affirmative Action laws. <a href="https://cityofjerseycity.civicweb.net/document/419126/Renewal%20of%20a%20professional%20services%20agreement%20wi.pdf?handle=9B7970B91EB8423EB3A2A6EE11EC47C0">Resolution PDF</a></li>
                  <li>Res 25-080: Resolution 25-080, approved January 29, 2025, renews a professional services agreement with Florio Kenny Raval, LLP to represent Police Officer Joseph Ross in the ongoing lawsuit Samuel Nehemiah v. City of Jersey City et al.. The renewal is for one year starting January 1, 2025, with an additional $50,000, increasing the total contract amount to $100,000, including expenses. The law firm will provide services at an hourly rate of $175, and the contract is awarded under New Jersey’s fair and open Pay-to-Play Law without competitive bidding. Continuation of the contract depends on sufficient funds being appropriated in the City’s 2025 budget. The resolution mandates publication in a local newspaper within 10 days and requires compliance with Affirmative Action laws. <a href="https://cityofjerseycity.civicweb.net/document/419130/Renewal%20of%20a%20professional%20services%20agreement%20wi.pdf?handle=3B0E49ECDD8B43ACA20453F472ACE01D">Resolution PDF</a></li>
                  <li>Res 25-081: Resolution 25-081, approved January 29, 2025, renews a professional services agreement with Florio Kenny Raval, LLP to represent Police Officer Charles Tavares in the ongoing lawsuit Chirag Khushalani v. City of Jersey City et al.. The contract is renewed for one year starting February 15, 2025, with an additional $40,000, increasing the total contract amount to $120,000, including expenses. The law firm will provide services at an hourly rate of $175, and the contract is awarded without competitive bidding under New Jersey’s Local Public Contracts Law and Pay-to-Play Law. Continuation of the contract depends on sufficient funds being appropriated in the City’s 2025 budget. The resolution requires publication in a local newspaper within 10 days and compliance with Affirmative Action laws. <a href="https://cityofjerseycity.civicweb.net/document/419143/Renewal%20of%20a%20professional%20services%20agreement%20wi.pdf?handle=1B0F6DD7592E4EC0AF7FD68B6CFBC6FA">Resolution PDF</a></li>
                  <li>Res 24-722: Resolution 24-722, approved September 25, 2024, amends a professional services agreement with the law firm Florio Kenny Raval, LLP to represent former Police Officer Omar Polanco in the ongoing Estate of Robertson v. City of Jersey City, et al. case. The contract amount is increased by $80,000, raising the total to $130,000, to cover outstanding invoices as litigation continues. The firm provides services at an hourly rate of $175, and the contract was awarded under fair and open Pay-to-Play provisions without public bidding. Funds for the increase are available in the City’s budget account 01-201-23-210-312. The resolution requires publishing notice in a local newspaper within 10 days. <a href="https://cityofjerseycity.civicweb.net/document/410156/Amendment%20of%20a%20professional%20services%20agreement%20.pdf?handle=471E7771EF554F298773B65528B1D39F">Resolution PDF</a></li>
                  <li>Res 24-408: The City of Jersey City ratified and awarded a one-year professional services contract to the law firm Florio Kenny Raval, LLP to represent former Police Officer Omar Polanco in the lawsuit Estate of Robertson v. City of Jersey City, et al. The contract amount is set at $50,000, with the firm providing legal services at $175 per hour, including expenses. The contract was awarded under the Local Public Contracts Law without competitive bidding and complies with the City’s Pay-to-Play Law and Affirmative Action requirements. The law firm submitted all required political contribution and business disclosure certifications. Funding for the contract is available in the City’s budget, and the contract is subject to further budget appropriations for the fiscal year. <a href="https://cityofjerseycity.civicweb.net/document/402543/R0208869_%20ESTATE%20OF%20ROBERTSON%20V.%20COJC.pdf?handle=72CA1013BCBA4EF99FCC800E3248FF14">Resolution PDF</a></li>
                  <li>Res 24-409: The City of Jersey City ratified and renewed a one-year professional services agreement with the law firm Florio Kenny Raval, LLP to serve as special counsel representing the City in ongoing tax appeal matters. The contract amount was increased by $200,000, bringing the total to $1,025,000, with an hourly rate of $175 including expenses. The contract is awarded without competitive bidding under New Jersey’s Local Public Contracts Law and complies with the Pay-to-Play Law and Affirmative Action requirements. Funds of $5,000 are available for this contract in the City’s budget. The resolution requires publication for public inspection and continuation depends on budget appropriations in the current and subsequent fiscal years. <a href="https://cityofjerseycity.civicweb.net/document/400563/Renewal%20of%20a%20professional%20services%20agreement%20wi.pdf?handle=F0021ABA6CFF4409B62284D23B7C3FDE">Resolution PDF</a></li>
                  <li>Res 24-410: The City of Jersey City ratified and awarded a one-year professional services contract to the law firm Florio Kenny Raval, LLP to represent Police Officer Joseph Ross in the lawsuit Samuel Nehemiah v. City of Jersey City, et al. The contract amount is up to $50,000, with an hourly rate of $175 including expenses. This agreement was made without public bidding under New Jersey’s Local Public Contracts Law and complies with the Local Unit Pay-to-Play Law and Affirmative Action requirements. The firm provided the necessary disclosure certifications, and funds are available in the City’s budget. The contract’s continuation depends on budget appropriations for the 2024 fiscal year. <a href="https://cityofjerseycity.civicweb.net/document/402558/R0208870_%20NEHEMIAH%20VS.%20COJC.pdf?handle=175473D462894A4D84655F9317C7F512">Resolution PDF</a></li>
                  <li>Res 24-411: The City of Jersey City ratified and awarded a one-year professional services contract to the law firm Florio Kenny Raval, LLP to represent Police Officer Christopher Fodor in the lawsuit Arthur Jones v. City of Jersey City, et al. The contract amount is up to $50,000, with an hourly rate of $175 including expenses. This agreement was made without public bidding under New Jersey’s Local Public Contracts Law and complies with the Local Unit Pay-to-Play Law and Affirmative Action requirements. The law firm provided necessary political contribution disclosures, and funds are available in the City’s budget. Continuation of the contract depends on budget appropriations for the 2024 fiscal year. <a href="https://cityofjerseycity.civicweb.net/document/402548/R0208872_%20ARTHUR%20JONES%20VS%20COJC.pdf?handle=18B1E4A3C7C047CF81C36269E7331AEF">Resolution PDF</a></li>
                  <li>Res 24-166: The City of Jersey City renewed a one-year professional services agreement with the law firm Florio Kenny Raval, LLP to represent Police Officer Charles Tavares in the ongoing lawsuit Chirag Khushalani v. City of Jersey City, et al. The contract renewal adds $40,000, bringing the total contract amount to $80,000, with services billed at $175 per hour including expenses. The contract was awarded without public bidding under applicable New Jersey laws and complies with the City’s Pay-to-Play and Affirmative Action requirements. Funding is available in the City budget, and continuation depends on future budget appropriations. <a href="https://cityofjerseycity.civicweb.net/document/394449/Renewal%20of%20a%20professional%20services%20agreement%20wi.pdf?handle=824BED93565746F8934C7EA339908532">Resolution PDF</a></li>
                  <li>Res 23-793: The City of Jersey City ratified a one-year professional services agreement with the law firm Florio Kenny Raval, LLP to represent Police Officer Edwin Hernandez in the lawsuit Douglas Salom v. City of Jersey City, et al. The contract, effective June 15, 2023, is for up to $50,000, with services billed at $175 per hour including expenses. The contract was awarded without public bidding under New Jersey laws and complies with the City’s Pay-to-Play and Affirmative Action requirements. Funding is available in the City’s 2023 budget, and contract continuation depends on future budget appropriations. <a href="https://cityofjerseycity.civicweb.net/document/96049/Ratifying%20a%20professional%20services%20agreement%20wit.pdf?handle=2266EECA29C0460CAB31BB0DD0EB22A0">Resolution PDF</a></li>
                  <li>Res 23-366: The City of Jersey City ratified a one-year professional services agreement with the law firm Florio Kenny Raval, LLP to represent Police Officer Charles Tavares in the lawsuit Chirag Khushalani v. City of Jersey City, et al. The contract, effective February 15, 2023, is for up to $40,000, with services billed at $150 per hour including expenses. The contract was awarded without competitive bidding under New Jersey laws and complies with the City’s Pay-to-Play and Affirmative Action requirements. Funding is available in the City’s 2023 budget, and continuation of the agreement depends on future budget appropriations. <a href="https://cityofjerseycity.civicweb.net/document/89203/r0205237_%20Florio%20Kenny%20Raval_%20Tavares%20itmo%20Chir.pdf?handle=F6E29F4BAF0744DDB88C070ED719E1D3">Resolution PDF</a></li>
                  <li>Res 23-319: The City of Jersey City renewed a one-year professional services agreement with the law firm Florio Kenny Raval, LLP to serve as special counsel representing the City in ongoing tax appeal cases. The contract, effective February 28, 2023, increases the total contract amount by $200,000 to a maximum of $825,000, including expenses. The firm provides services at an hourly rate of $150. This contract was awarded without competitive bidding under New Jersey’s Local Public Contracts Law and complies with the City’s Pay-to-Play and Affirmative Action requirements. Funds are available in the 2023 budget, with continuation dependent on future appropriations. <a href="https://cityofjerseycity.civicweb.net/document/87817/R0205136_%20Renewal%20with%20Florio%20Kenny%20Raval,%20LLP.pdf?handle=4E193886DA834FDDB5BAD0DAAABA87FE">Resolution PDF</a></li>
                  <li>Res 23-229: The City of Jersey City amended its professional services agreement with the law firm Florio Kenny Raval, LLP, increasing the total contract amount by $100,000 to $725,000. This amendment is to cover outstanding invoices for tax appeal legal services provided to the City, including expenses for the remainder of the 2022 fiscal year and the first two months of 2023. The firm charges $150 per hour, and the contract remains exempt from public bidding under New Jersey law. The Mayor or Business Administrator is authorized to execute the amendment, and a public notice of the amendment will be published as required. <a href="https://cityofjerseycity.civicweb.net/document/83860/Amendment%20of%20a%20professional%20services%20agreement%20.pdf?handle=BA831BCC4ADF44E2B125A83722D26748">Resolution PDF</a></li>
                  <li>Res 23-145: The City of Jersey City awarded a one-year professional services contract to the law firm Florio Kenny Raval to provide defense counsel services for worker’s compensation claim petitions filed against the City. The contract is effective January 1, 2023, with a total amount not to exceed $10,000. The firm will be paid $1,500 per case, with an option for an additional $1,500 if prolonged litigation occurs. This contract is exempt from public bidding under New Jersey law and awarded through a fair and open process compliant with the Pay-to-Play Law. The contract is subject to compliance with affirmative action laws and available for public inspection. The Mayor or Business Administrator is authorized to execute the agreement, and funds have been certified as available. <a href="https://cityofjerseycity.civicweb.net/document/83711/R0204095_%20Worker_s%20Comp%20-%20Defense%202023%20FKR%20WC%20D.pdf?handle=A6DB434345E74A03B250465E8B5ED9E2">Resolution PDF</a></li>
                  <li>Res 22-534: The City of Jersey City ratified a one-year professional services agreement with the law firm Florio Kenny Raval, LLP to represent Sergeant Keith Armstrong, the Jersey City Police Department, and the City in the federal civil rights lawsuit filed by Pierre Lindor, Jr. The contract is effective March 1, 2022, with a total amount not to exceed $100,000, billed at $150 per hour including expenses. This professional services contract is exempt from public bidding under New Jersey law and awarded under the fair and open provisions of the Pay-to-Play Law. The contract is subject to affirmative action compliance, and funds have been certified as available. The Mayor or Business Administrator is authorized to execute the agreement, which will be made available for public inspection. <a href="https://cityofjerseycity.civicweb.net/document/69209/Ratifying%20a%20professional%20services%20agreement%20wit.pdf?handle=2F83869CCCC24C3A8C98AA2875CB93F9">Resolution PDF</a></li>
                  <li>Res 22-245: The City of Jersey City amended its professional services agreement with the law firm Florio Kenny Raval, LLP to increase the contract amount by $75,000, raising the total contract to $525,000. This contract is for Florio Kenny Raval to serve as special counsel representing the City in tax appeals. The increase covers unpaid invoices from the 2021 fiscal year and invoices for the first two months of the 2022 fiscal year. The services are billed at $150 per hour, including expenses, and are exempt from public bidding under New Jersey law. The Mayor or Business Administrator is authorized to execute this amendment, which will be published publicly as required by law. <a href="https://cityofjerseycity.civicweb.net/document/63325/Amendment%20of%20a%20professional%20services%20agreement%20.pdf?handle=37EA1336F2AA49DEBBD0B3D8FFD9C2E8">Resolution PDF</a></li>
                  <li>Res 22-162: The City of Jersey City renewed and increased its professional services agreement with the law firm Florio Kenny Raval, LLP to serve as special counsel for the City in ongoing tax appeals. The one-year contract, effective February 28, 2022, increases the total contract amount by $100,000 to $625,000. The firm provides services at an hourly rate of $150, including expenses. This contract is awarded without competitive bidding under New Jersey law and is subject to compliance with affirmative action requirements. The Mayor or Business Administrator is authorized to execute the agreement, which will be publicly published as required. Funding for this contract is secured and continuation depends on budget appropriations. <a href="https://cityofjerseycity.civicweb.net/document/63329/Renewal%20of%20a%20professional%20services%20agreement%20wi.pdf?handle=C616715E1E704842B8C758D92D802BD8">Resolution PDF</a></li>
                  <li>Res 21-425: The Jersey City Council renewed a one-year professional services agreement with the law firm Florio Kenny Raval, LLP to continue serving as special counsel for tax appeal matters. The contract was increased by $100,000, bringing the total to $450,000, with services billed at $150 per hour including expenses. This renewal follows a series of amendments and renewals to the original 2018 agreement due to ongoing tax appeal litigation. The agreement was awarded through a fair and open process under New Jersey's Pay-to-Play Law and is exempt from public bidding. The contract is contingent on budget appropriations and compliance with affirmative action and pay-to-play regulations. <a href="https://cityofjerseycity.civicweb.net/document/46980/Professional%20Services%20Agreement%20with%20Florio%20Ken.pdf?handle=AA24410CFBAE433F845A69AFD908D5E1">Resolution PDF</a></li>
                  <li>Res 21-285: Resolution 21-285, passed on April 15, 2021, authorized Jersey City to amend its contract with the law firm Florio Kenny Raval, LLP by increasing it by $25,000, bringing the total to $125,000. The increase covers legal services for tax appeal matters, including $14,950 for 2021 work and $10,050 in unpaid 2020 invoices. The firm charges $150 per hour, including expenses. This agreement is exempt from public bidding under New Jersey law and qualifies as a “fair and open” contract under the state’s Pay-to-Play rules. <a href="https://cityofjerseycity.civicweb.net/document/46019/Professional%20Services%20Agreement%20with%20Florio%20Ken.pdf?handle=4134184CAA7B4B62B6347EFAD7B48976">Resolution PDF</a></li>
                  <li>Res 21-138: Resolution 21-138, approved on February 10, 2021, awarded a one-year professional services agreement to the law firm Florio Kenny Raval to serve as defense counsel for worker’s compensation claims filed against Jersey City. The firm will be paid $1,500 per case, with an additional $1,500 available if extended litigation is required, not to exceed a total of $50,000. This contract, awarded through a fair and open process under New Jersey's Pay-to-Play law, is exempt from public bidding due to its classification as a professional service. Funds are initially allocated from the city’s 2021 temporary budget, with the remainder to come from the permanent budget. The resolution requires compliance with affirmative action and pay-to-play ordinances and allows the Mayor or Business Administrator to execute the agreement. <a href="https://cityofjerseycity.civicweb.net/document/40152/FKR%20s_c%20contract%20for%202021.pdf?handle=9C78B917B425448B9E229E1F67DBFB2C">Resolution PDF</a></li>
                  <li>Res 20-746: The Jersey City Municipal Council approved an amendment to its professional services agreement with the law firm Florio Kenny Raval, LLP to continue serving as special counsel in tax appeal litigation. Originally approved in 2018 for $150,000 and renewed in 2019 and 2020 for $75,000 and $50,000 respectively, the contract is now being increased by an additional $50,000, bringing the current total to $100,000. The firm will continue providing legal services at a rate of $150 per hour. The amendment was necessary because previously allocated funds had been fully expended, and the City is still engaged in ongoing tax appeal cases. The required funds are available and certified by the Chief Financial Officer, and the resolution mandates public notice within ten days of adoption. <a href="https://cityofjerseycity.civicweb.net/document/35710/Professional%20Service%20Agreement%20with%20Florio%20Kenn.pdf?handle=4341F1D1B4324EDD95CB9CCBF3E2712F">Resolution PDF</a></li>
                  <li>Res 20-265: The Jersey City Council approved the renewal of a one-year professional services contract with the law firm Florio Kenny Raval, LLP to continue representing the city in tax appeal matters. Originally approved in 2018 and previously renewed in 2019, the contract was extended again in 2020 with an additional $50,000, bringing the total not to exceed $275,000. The firm will continue to be paid at a rate of $150 per hour, including expenses. The contract was awarded through the "fair and open process" under the state’s Pay-to-Play law and is exempt from public bidding as a professional service. The agreement includes compliance with affirmative action laws and funding availability has been certified by the city’s CFO. <a href="https://cityofjerseycity.civicweb.net/document/21169/Professional%20Service%20Contract%20for%20Florio%20Kenny%20.pdf?handle=93DBC1697F0D4862980AF0D2947F90DD">Resolution PDF</a></li>
                  <li>Res 19-961: The Jersey City Council approved a one-year professional services agreement with Florio Kenny Raval LLP, effective January 1, 2020, for an amount not to exceed $50,000. The firm will provide defense counsel services for workers' compensation claim petitions filed against the city, charging $1,500 per case with the possibility of an additional $1,500 for complex litigation. The contract was awarded under the “fair and open” provisions of New Jersey’s Pay-to-Play law and is exempt from public bidding. The firm met compliance requirements under the city’s Pay-to-Play Reform Ordinance and affirmative action laws. The contract is contingent upon the appropriation of funds in the city’s 2020 budgets. <a href="https://cityofjerseycity.civicweb.net/document/16768/FKR%20WC%20Def%20Counsel%20via%20RFQ.pdf?handle=3433651C7EDE45F89E91DF8F7FA9CE3E">Resolution PDF</a></li>
                </ul>
            </ul>
        </ul>
      </div>

      <div style={{ marginTop: "2rem", display: "flex", justifyContent: "space-between", flexWrap: "wrap" }}>
        <a href={`${backendUrl}/download/Bill_O'Dea_combined_contributions.csv`} download className="btn-download">Download Full Contributions CSV</a>
        <a href="/" className="btn-return">Return to Home Page</a>
        <a href="https://www.njelecefilesearch.com/SearchContributionInteractive?eid=454445">View Full ELEC Records</a>
      </div>
    </div>
  );
}
