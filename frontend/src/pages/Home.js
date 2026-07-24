import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Home.css";

import mussabImg from "./img/mussab.jpg";
import odeaImg from "./img/odea.jpg";
import mcgreeveyImg from "./img/mcgreevey1.jpg";
import solomonImg from "./img/solomon.jpg";
import wattermanImg from "./img/watterman.jpg";

const candidates = [
  { name: "James Solomon", path: "/JamesSolomon", image: solomonImg },
  { name: "Bill O'Dea", path: "/BillODea", image: odeaImg },
  { name: "Jim McGreevey", path: "/JimMcGreevey", image: mcgreeveyImg },
  { name: "Mussab Ali", path: "/MussabAli", image: mussabImg },
  { name: "Joyce Watterman", path: "/JoyceWatterman", image: wattermanImg }
];

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="homepage">

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
            {candidates.map((candidate) => (
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


      <header>
        <h1>
          Pay2PlayJC: Campaign Finance Transparency Dashboard
        </h1>

        <div className="quick-comparison">
          <Link to="/comparison">
            Transparency Dashboard
          </Link>
        </div>


        <p className="intro">
          This platform visualizes publicly available campaign finance
          records from the Jersey City 2025 mayoral election. It was created
          to help users explore donation patterns, contribution trends,
          and financial relationships between campaigns and donors.
        </p>


        <p className="intro">
          This project is an archived portfolio application. The data shown
          represents historical campaign finance filings and is no longer
          actively updated.
        </p>


        <p className="credit">
          <strong>
            Created and maintained by Koen Mitchel Santos.
          </strong>
        </p>


        <p className="disclaimer">
          <strong>Disclaimer:</strong> This project uses publicly available
          campaign finance records. Users should consult official NJ ELEC
          records for the most complete and current information.
        </p>

      </header>


      <section className="instagram-highlight">
        <h2> Project Archive</h2>

        <p className="instagram-text">
          Originally developed as a civic transparency platform,
          this application demonstrates full-stack development,
          data visualization, and public dataset analysis.
        </p>

      </section>



      <section className="updates-section">

        <h2>Project Information</h2>

        <div className="update-card">

          <h3>
            Campaign Finance Visualization Platform
          </h3>

          <ul>
            <li>
              Interactive candidate contribution dashboards
            </li>

            <li>
              Donor and employer analysis
            </li>

            <li>
              Data visualization using charts and graphs
            </li>

            <li>
              Searchable contribution records
            </li>
          </ul>

        </div>

      </section>



      <section className="candidate-section">

        <h2>
          Explore Candidate Data
        </h2>

        <div className="candidate-grid">

          {candidates.map((candidate) => (

            <Link
              to={candidate.path}
              key={candidate.name}
              className="candidate-card"
            >

              <img
                src={candidate.image}
                alt={candidate.name}
              />

              <span>
                {candidate.name}
              </span>

            </Link>

          ))}

        </div>

      </section>



      <div className="faq-button-container">

        <Link
          to="/faq"
          className="faq-button"
        >
          View Frequently Asked Questions
        </Link>

      </div>



      <div
        className="contact-section"
        style={{
          maxWidth: "600px",
          margin: "0 auto",
          padding: "20px",
          textAlign: "center"
        }}
      >

        <h2>
          Contact
        </h2>

        <p>
          If you would like to learn more about this project:
        </p>


        <ul
          style={{
            listStyle: "none",
            padding: 0,
            fontSize: "16px"
          }}
        >

          <li>
            Email:{" "}
            <a href="mailto:kms226655@gmail.com">
              kms226655@gmail.com
            </a>
          </li>


          <li>
            LinkedIn:{" "}
            <a
              href="https://www.linkedin.com/in/koen-mitchel-santos-306476278"
              target="_blank"
              rel="noopener noreferrer"
            >
              Koen Mitchel Santos
            </a>
          </li>

        </ul>

      </div>



      <footer className="footer">

        <p>
          Archived portfolio project. Campaign finance data sourced from
          publicly available records.
        </p>

      </footer>


    </div>
  );
}