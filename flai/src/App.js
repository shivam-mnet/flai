import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import NavigationBar from './Components/NavigationBar';
import Context from './Components/Context';
import Interact from './Components/Interact';

function App() {
  return (
    <Router>
      <NavigationBar />
      <Container className="mt-3">
        <Routes>
          <Route path="/" element={<Context />} />
          <Route path="/context" element={<Context />} />
          <Route path="/query" element={<Interact />} />
        </Routes>
      </Container>
    </Router>
  );
}

export default App;