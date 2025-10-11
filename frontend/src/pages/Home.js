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
  { name: "Joyce Watterman", path: "/JoyceWatterman", image: wattermanImg}
];

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="homepage">

      {/* Fixed Mobile Header */}
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
        <h1>Pay2Play: Follow the money in Jersey City politics</h1>

        {/* Quick Donation Comparison link at top */}
        <div className="quick-comparison">
          <Link to="/comparison">Transparency Dashboard</Link>
        </div>

        <p className="intro">
    This platform is dedicated to promoting transparency in Jersey City’s 2025 mayoral race. As part of Mussab Ali’s pay to play pledge we want to to help voters understand the financial influences shaping each campaign by breaking down donation trends, highlighting potential pay-to-play patterns, and showcasing top donors. The totals shown for each candidate include personal contributions, pay-to-play contributions from the New Jersey ELEC database, and joint committee contributions. We encourage Jersey City residents to explore the site and share it widely to promote informed voting and civic engagement.
  </p>
  <p className = "intro"> All donations are up to date as of 2025 Q2 filing deadline </p>
  <p className="credit">
    <strong>Created and maintained by Koen Mitchel Santos, Jersey City resident.</strong>
  </p>
  <p className="disclaimer">
    <strong>Disclaimer:</strong> This site is continually updated using publicly available 
    campaign finance data. As new candidates enter the race or additional donations are reported, 
    our information will be revised accordingly. While we strive to present the data in a clear 
    and accessible way, we encourage users to conduct their own research and consult official 
    NJ ELEC records for complete accuracy.
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

      <div className="faq-button-container">
        <Link to="/faq" className="faq-button">
          View Frequently Asked Questions
        </Link>
      </div>

      <div
      className="contact-section"
      style={{
        maxWidth: "600px",
        margin: "0 auto",
        padding: "20px",
        textAlign: "center",
      }}
    >
      <h2>Contact</h2>
      <p>If you’d like to reach out, you can contact me through any of the following:</p>
      
      <ul style={{ listStyle: "none", padding: 0, fontSize: "16px" }}>
        <li>Email: <a href="kms226655@gmail.com">kms226655@gmail.com</a></li>
        <li>Instagram: <a href="https://www.instagram.com/_koensantos_" target="_blank" rel="noopener noreferrer">@_koensantos_</a></li>
        <li>LinkedIn: <a href="https://www.linkedin.com/in/koen-mitchel-santos-306476278" target="_blank" rel="noopener noreferrer">Koen Mitchel Santos - LinkedIn</a></li>
        <li>Twitter/X: <a href="https://twitter.com/yourhandle" target="_blank" rel="noopener noreferrer">@yourhandle</a></li>
        {/* Add more links here as needed */}
      </ul>
    </div>



     <footer className="footer">
  <p>PAID FOR BY ALI FOR JERSEY CITY PO BOX 8237, JERSEY CITY, NJ 07308</p>
</footer>

    </div>
  );
}
