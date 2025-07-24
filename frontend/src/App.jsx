// frontend/src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import StockChartPage from "./components/StockChartPage"; // updated path

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<StockChartPage />} />
      </Routes>
    </Router>
  );
};

export default App;
