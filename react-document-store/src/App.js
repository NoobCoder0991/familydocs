
import "./App.css";
import Master from "./components/Master";
import LoginPage from "./components/LoginPage";
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';




function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Master />} />
                <Route path="/login" element={<LoginPage />} />
            </Routes>
        </Router>
    )
}

export default App;
