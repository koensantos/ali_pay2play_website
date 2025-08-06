import React from "react";
import { Link } from "react-router-dom";
import "./Home.css";

// Candidate image imports (replace with correct image paths)
import mussabImg from "./img/mussab.jpg";
import odeaImg from "./img/odea.jpg";
import mcgreeveyImg from "./img/mcgreevey1.jpg";
import solomonImg from "./img/solomon.jpg";
import wattermanImg from "./img/watterman.jpg";

const candidates = [
  { name: "Mussab Ali", path: "/MussabAli", image: mussabImg },
  { name: "Bill O'Dea", path: "/BillODea", image: odeaImg },
  { name: "Jim McGreevey", path: "/JimMcGreevey", image: mcgreeveyImg },
  { name: "James Solomon", path: "/JamesSolomon", image: solomonImg },
  { name: "Joyce Watterman", path: "/JoyceWatterman", image: wattermanImg },
];

export default function Home() {
  return (
    <div className="homepage">
      <header>
        <h1>Pay2Play: Follow the money in Jersey City politics</h1>
        <p className="intro">
          This platform promotes transparency around campaign contributions to Jersey City's 2025 mayoral candidates.
          We break down donation trends, pay-to-play patterns, and top donors—giving voters a clearer picture of the financial forces behind each campaign.
        </p>
        <p className="disclaimer">
          <strong>Disclaimer:</strong> This site is continually updated based on publicly available campaign finance data. If new candidates enter the race or more donations are reported, those changes will be reflected here. While we aim to make the data digestible and transparent, we encourage users to do their own research and consult official NJ ELEC records for complete accuracy.
        </p>
      </header>

      <section className="candidate-section">
        <h2>Explore Candidate Data</h2>
        <div className="candidate-grid">
          {candidates.map((candidate) => (
            <Link to={candidate.path} key={candidate.name} className="candidate-card">
              <img src={candidate.image} alt={candidate.name} />
              <span>{candidate.name}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
