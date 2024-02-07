import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import Importproperty from './Components/ImportProperty/importproperty'
import Header from './Components/Header/header';
import Login from './Components/Login/Login'
import NotFound from './Components/NotFound';
import Error from './Components/Errors/Error';
import Front from './Components/Front/Front';
import Config from './Components/Config/Config';
import ErrorFiles from './Components/Errors/ErrorFiles';
import Uploads from './Components/Datatable/Uploads';
import Imports from './Components/Datatable/Imports';
import Records from './Components/Datatable/Records';
import Plots from './Components/Plots/Plots';

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <Routes>
          <Route path="/import" element={<Importproperty />} />
          <Route exact path="/" element={<Front />} />
          <Route exact path="/login" element={<Login />} />
          <Route exact path="/errors" element={<Error />} />
          <Route path="/errors/:limit" element={<Error />} />
          <Route path="/errorFiles" element={<ErrorFiles />} />
          <Route path="/errorFiles/:limit" element={<ErrorFiles />} />
          <Route path="/uploads" element={<Uploads />} />
          <Route path="/uploads/:limit" element={<Uploads />} />
          <Route path="/imports/" element={<Imports />} />
          <Route path="/imports/:limit" element={<Imports />} />
          <Route path="/Records/" element={<Records />} />
          <Route path="/Records/:limit" element={<Records />} />
          <Route path="/config" element={<Config />} />
          <Route path="/plots" element={<Plots />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div >
    </Router>
  );
}

export default App;
