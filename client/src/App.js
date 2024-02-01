import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import Importproperty from './Components/ImportProperty/importproperty'
import Header from './Components/Header/header';
import Login from './Components/Login/Login'
import NotFound from './Components/NotFound';
import Error from './Components/Errors/Error';


function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <Routes>
          <Route path="/import" element={<Importproperty />} />
          <Route exact path="/" element={<Login />} />
          <Route exact path="/login" element={<Login />} />
          <Route exact path="/errors" element={<Error />} />
          <Route path="/errors/:limit" element={<Error />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div >
    </Router>
  );
}

export default App;
