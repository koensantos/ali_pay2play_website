import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import MussabAli from "./pages/MussabAli";
import Draft from "./pages/Draft"; // 👈 Make sure Draft.js is created in ./pages/

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/candidate/MussabAli" element={<MussabAli />} />
        <Route path="/draft" element={<Draft />} /> {/* 👈 New route added */}
      </Routes>
    </Router>
  );
}

export default App;
