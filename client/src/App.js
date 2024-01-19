import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import Importproperty from './Components/ImportProperty/importproperty'
import Header from './Components/Header/header';

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <Routes>
          <Route exact path="/" element={<Importproperty />} />
        </Routes>
      </div >
    </Router>
  );
}

export default App;
