import React from "react";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import JimMcGreevey from "./pages/JimMcGreevey";
import MussabAli from "./pages/MussabAli";
import BillODea from "./pages/BillODea";
import JoyceWatterman from "./pages/JoyceWatterman";
import JamesSolomon from "./pages/JamesSolomon";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/JimMcGreevey" element={<JimMcGreevey />} />
        <Route path="/MussabAli" element={<MussabAli />} />
        <Route path="/BillODea" element={<BillODea />} />
        <Route path="/JoyceWatterman" element={<JoyceWatterman />} />
        <Route path="/JamesSolomon" element={<JamesSolomon />} />
      </Routes>
    </Router>
  );
}


