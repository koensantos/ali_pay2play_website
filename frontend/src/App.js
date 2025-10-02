import React, { useEffect } from "react";
import { HashRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import Home from "./pages/Home";
import JimMcGreevey from "./pages/JimMcGreevey";
import MussabAli from "./pages/MussabAli";
import BillODea from "./pages/BillODea";
import JoyceWatterman from "./pages/JoyceWatterman";
import JamesSolomon from "./pages/JamesSolomon";
import AllCandidatesComparison from "./pages/AllCandidatesComparison";

// SPA pageview tracking for React Router
function AnalyticsTracker() {
  const location = useLocation();

  useEffect(() => {
    if (window.__VERCEL_ANALYTICS__) {
      window.__VERCEL_ANALYTICS__.page();
    }
  }, [location]);

  return null; // this component renders nothing
}

export default function App() {
  return (
    <>
      <Router>
        {/* Track SPA route changes */}
        <AnalyticsTracker />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/JimMcGreevey" element={<JimMcGreevey />} />
          <Route path="/MussabAli" element={<MussabAli />} />
          <Route path="/BillODea" element={<BillODea />} />
          <Route path="/JoyceWatterman" element={<JoyceWatterman />} />
          <Route path="/JamesSolomon" element={<JamesSolomon />} />
          <Route path="/comparison" element={<AllCandidatesComparison />} />
        </Routes>

        {/* Vercel Analytics component */}
        <Analytics />
      </Router>
    </>
  );
}


