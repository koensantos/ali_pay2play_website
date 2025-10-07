import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./FAQ.css";

const otherCandidates = [
    { name: "Mussab Ali", path: "/MussabAli" },
    { name: "Bill O'Dea", path: "/BillODea" },
    { name: "Jim McGreevey", path: "/JimMcGreevey" },
    { name: "James Solomon", path: "/JamesSolomon" },
    { name: "Joyce Watterman", path: "/JoyceWatterman" },
    { name: "Transparency Dashboard", path: "/comparison" },
    { name: "Frequently Asked Questions", path: "/faq" }
  ];

const [menuOpen, setMenuOpen] = useState(false);
  

export default function FAQ() {
  const faqs = [
    {
      question: "What is Pay2Play?",
      answer:
        "Pay2Play is a transparency project tracking campaign donations in Jersey City's 2025 mayoral election. It helps voters see where candidates' funding comes from and identify potential pay-to-play patterns.",
    },
    {
      question: "Is this site affiliated with any campaign?",
      answer:
        "Yes. The site was created as part of Mussab Ali’s Pay-to-Play pledge campaign. However, all data visualizations and comparisons are presented neutrally to promote transparency across all candidates.",
    },
    {
      question: "Where does the data come from?",
      answer:
        "All contribution data comes from publicly available records from the New Jersey Election Law Enforcement Commission (NJ ELEC), as well as reported filings by the candidates and joint committees.",
    },
    {
      question: "How often is the data updated?",
      answer:
        "The data is updated after each NJ ELEC quarterly filing deadline. Updates may also occur sooner if new candidates enter the race or amended reports are released.",
    },
    {
      question: "Can I download the full dataset?",
      answer:
        "Yes. Each candidate page includes a link to download their combined contribution CSV file. These contain all processed contributions used in the charts and analysis.",
    },
    {
      question: "Who built this project?",
      answer:
        "The site was created and maintained by Koen Mitchel Santos, a Jersey City resident and Software Development Intern, as part of a civic technology initiative to make local political finance data accessible and understandable.",
    },
    {
      question: "This website is part of the Ali2025 Pay2Play Pledge. Why should I trust it?",
      answer:
        "The Pay2Play pledge commits Mussab Ali to refuse donations from developers and entities with pending or recent business before the city. This website aims to promote transparency for all candidates, encouraging accountability and informed voting. All data is sourced from official NJ ELEC records, and is free to download under each candidate's page.",
    },
  ];

  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="faq-page">
        <div className="sticky-label">
            <p><a href="https://www.ali2025.com/paytoplay">This website is part of the Ali2025 Pay2Play Pledge</a></p>
        </div>

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
      <header className="faq-header">
        <h1>Frequently Asked Questions</h1>
        <p>
          Learn more about the mission, data sources, and purpose of the Pay2Play transparency project.
        </p>
        <Link to="/" className="back-home">
          ← Back to Home
        </Link>
      </header>

      <section className="faq-section">
        {faqs.map((faq, index) => (
          <div key={index} className="faq-item">
            <button
              className={`faq-question ${openIndex === index ? "active" : ""}`}
              onClick={() => toggleFAQ(index)}
            >
              {faq.question}
              <span className="faq-icon">{openIndex === index ? "−" : "+"}</span>
            </button>
            {openIndex === index && (
              <div className="faq-answer">
                <p>{faq.answer}</p>
              </div>
            )}
          </div>
        ))}
      </section>

      <div className="other-candidates-section">
            <h2>Other Candidates</h2>
            <ul className="other-candidates-list">
              {otherCandidates
                .filter(c => c.name !== "Frequently Asked Questions") // exclude current candidate
                .map(c => (
                  <li key={c.name}>
                    <Link to={c.path}>{c.name}</Link>
                  </li>
              ))}
            </ul>
        </div>

      <footer className="footer">
        <p>PAID FOR BY ALI FOR JERSEY CITY PO BOX 8237, JERSEY CITY, NJ 07308</p>
      </footer>
    </div>
  );
}
