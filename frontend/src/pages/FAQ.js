import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./FAQ.css";

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
        "The site was created and maintained by Koen Mitchel Santos, a Jersey City resident, as part of a civic technology initiative to make local political finance data accessible and understandable. My contact info is at the bottom of the homepage.",
    },
    {
      question: "Isn’t this site biased because it’s funded by a campaign?",
      answer: 
      "Pay2PlayJC.com was built under Mussab Ali’s Pay2Play pledge to promote transparency. While the site is funded through the campaign (legally disclosed at the bottom of every page), all donation data — including Ali’s — is treated the same way as every other candidate’s. The goal is to make public filings accessible and understandable, not to favor any candidate.",
    },
    {
      question: "How do you determine what counts as a “red flag” donation?",
      answer:
      "donation is flagged if there is strong evidence of a potential conflict of interest, pay-to-play connection, or ties to developers, contractors, or political committees with business before Jersey City. These rules are applied consistently to every candidate."
    },
    {
      question: "How do I know the data is accurate?",
      answer:
      "All data is sourced from official NJ ELEC filings and candidate reports. While the site strives for accuracy, any discrepancies should be reported to NJ ELEC for resolution."
    },
    {
      question: "Is this a smear campaign against other candidates?",
      answer:
      "Absolutely not. The site is designed to increase transparency and accountability, not attack anyone personally. If a donation appears suspicious, that reflects the public record, not the creator’s opinion. Our goal is to give voters easy access to verified information so they can make informed decisions."
    }
  ];

  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="faq-page">
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

      <footer className="footer">
        <p>PAID FOR BY ALI FOR JERSEY CITY PO BOX 8237, JERSEY CITY, NJ 07308</p>
      </footer>
    </div>
  );
}
