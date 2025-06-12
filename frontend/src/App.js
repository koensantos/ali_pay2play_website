import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import MussabAli from "./pages/MussabAli";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/candidate/MussabAli" element={<MussabAli />} />
      </Routes>
    </Router>
  );
}

export default App;
