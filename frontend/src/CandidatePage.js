import React from "react";
import { useParams } from "react-router-dom";

export default function CandidatePage() {
  const { name } = useParams();
  const downloadUrl = `http://localhost:5000/api/download/${name}Contributions`;

  return (
    <div>
      <h2>{name} - 2025 Contributions</h2>
      <p>Download their CSV data below:</p>
      <a href={downloadUrl} target="_blank" rel="noopener noreferrer">
        Download {name}'s Data
      </a>
    </div>
  );
}
