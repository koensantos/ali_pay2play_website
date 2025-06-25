import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import MussabAli from "./pages/MussabAli";
import JimMcGreevey from "./pages/JimMcGreevey"; 
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/candidate/MussabAli" element={<MussabAli />} />
        <Route path="/JimMcGreevey" element={<JimMcGreevey />} /> 
      </Routes>
    </Router>
  );
}

export default App;
