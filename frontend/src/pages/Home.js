import React from "react";
import { Link } from "react-router-dom";

export default function Home() {
  const candidates = [
    "MussabAli",
    "JoyceWatterman",
    "JimMcGreevey",
    "JamesSolomon",
    "BillODea"
  ];

  return (
    <div className="homepage">
      <h1>Pay2Play: Follow the money in Jersey City politics.</h1>
      <h2>About the project</h2>
      <p>
        This project promotes transparency around donations given to Jersey City mayoral candidates.
        Our data covers 2025 campaign contributions, including any pay-to-play donations starting from 2020.
        Pay2Play exists to empower voters with accessible donation records and to support informed decision-making.
        We do not endorse any candidate—our goal is to let the data speak for itself.
      </p>

      <h3>Explore Candidate Data</h3>
      <ul>
        {candidates.map((name) => (
          <li key={name}>
            <Link to={`/candidate/${name}`}>View data for {name}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
