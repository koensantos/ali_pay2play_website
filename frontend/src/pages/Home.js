import React from "react";
import { Link } from "react-router-dom";

export default function Home() {
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
        <li>
          <Link to="/MussabAli">Mussab Ali</Link>
        </li>
        <li>
          <Link to="/BillODea">Bill O'Dea</Link>
        </li>
        <li>
          <Link to="/JimMcGreevey">Jim McGreevey</Link>
        </li>
        <li>
          <Link to="/JamesSolomon">James Solomon</Link>
        </li>
        <li>
          <Link to="/JoyceWatterman">Joyce Watterman</Link>
        </li>
      </ul>
    </div>
  );
}
