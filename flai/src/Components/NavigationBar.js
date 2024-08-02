import React from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import logo from '../logo.png';
import 'bootstrap/dist/css/bootstrap.min.css';

function NavigationBar() {
  return (
    <Navbar bg="light" expand="lg" style = {{height: '70px', backgroundColor: '#d0f2bd'}}>
      <Container>
        <LinkContainer to="/">
          <Navbar.Brand><img
              src={logo}
              height="60"
              className="d-inline-block align-top"
              alt="My App Logo"
            /></Navbar.Brand>
        </LinkContainer>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <LinkContainer to="/context">
              <Nav.Link>Context</Nav.Link>
            </LinkContainer>
            {/* <LinkContainer to="/analysis">
              <Nav.Link>Analysis</Nav.Link>
            </LinkContainer> */}
            <LinkContainer to="/query">
              <Nav.Link>Query</Nav.Link>
            </LinkContainer>
          </Nav>
          <Nav className="ms-auto">
            <Nav.Link>FLAI - Your Flock AI Companion</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavigationBar;