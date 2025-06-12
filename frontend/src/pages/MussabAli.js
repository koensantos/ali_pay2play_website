import React, { useEffect, useState } from "react";


export default function MussabAli() {
  const [donors, setDonors] = useState([]);
  const [employers, setEmployers] = useState([]);
  const [occupations, setOccupations] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/top_donors/MussabAli")
      .then((res) => res.json())
      .then((data) => Array.isArray(data) ? setDonors(data) : console.warn("Donor data not array:", data));

    fetch("http://localhost:5000/api/top_employers/MussabAli")
      .then((res) => res.json())
      .then((data) => Array.isArray(data) ? setEmployers(data) : console.warn("Employer data not array:", data));

    fetch("http://localhost:5000/api/top_occupations/MussabAli")
      .then((res) => res.json())
      .then((data) => Array.isArray(data) ? setOccupations(data) : console.warn("Occupation data not array:", data));
  }, []);

  const renderTable = (title, data) => (
    <div>
      <h4>{title}</h4>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {data.map((entry, i) => (
            <tr key={i}>
              <td>{entry.name}</td>
              <td>${entry.amount.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="candidate-page">
      <div className="left">
        <h2>Mussab Ali</h2>
        <p>
          Mussab Ali is a former Jersey City Board of Education member and a passionate advocate for youth education
          and equity. He gained recognition for becoming one of the youngest elected officials in Jersey City’s
          history and for championing student-led initiatives. As a Rutgers graduate and a Rhodes Scholar, Ali brings
          academic distinction and community experience to the mayoral race.
        </p>
        <p>
          His policy platform emphasizes affordable housing, educational investment, and community-led public safety.
          Ali supports increasing transparency in city budgets, expanding mental health resources, and protecting
          renters' rights. He also proposes innovative reforms to address food insecurity and environmental sustainability
          across all neighborhoods.
        </p>
        <p>
          Personally, Mussab is known for his resilience—having battled cancer during his Rhodes candidacy—and for
          using that experience to advocate for healthcare equity. He has deep roots in Jersey City’s South Asian
          community and often speaks about the need for inclusive leadership. As a candidate, he balances youthful
          energy with a grounded commitment to grassroots governance and civic innovation.
        </p>
      </div>
      <div className="right">
        <img
          src="http://localhost:5000/api/charts/Mussab_Ali_contributions_pie.png"
          alt="Mussab Ali Donation Breakdown"
          style={{ width: "100%", maxWidth: "400px" }}
        />
        {renderTable("Top Donors", donors)}
        {renderTable("Top Employers", employers)}
        {renderTable("Top Occupations", occupations)}
      </div>
    </div>
  );
}
