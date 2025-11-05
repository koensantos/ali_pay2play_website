import React from "react";
import "./Home.css";

export default function Home() {
  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        background: "linear-gradient(180deg, #0f1724, #071020)",
        color: "#e6eef8",
        fontFamily:
          'Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial',
        textAlign: "center",
        padding: "20px",
      }}
    >
      <h1
        style={{
          fontSize: "clamp(1.8rem, 4vw, 3rem)",
          letterSpacing: "-0.02em",
          marginBottom: "12px",
        }}
      >
        In maintenance mode
      </h1>
      <p
        style={{
          fontSize: "clamp(1rem, 2.5vw, 1.4rem)",
          color: "rgba(230,238,248,0.85)",
          maxWidth: "600px",
        }}
      >
        Prepping for 2026 and beyond.
      </p>
    </div>
  );
}