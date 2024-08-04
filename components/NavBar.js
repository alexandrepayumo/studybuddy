// components/NavBar.js
import styled from 'styled-components';

const Nav = styled.nav`
  width: 100%;
  background-color: #333;
  padding: 1rem;
  display: flex;
  justify-content: center;
`;

const NavLink = styled.a`
  margin: 0 1rem;
  color: white;
  text-decoration: none;
  font-size: 1.25rem;

  &:hover {
    text-decoration: underline;
  }
`;

const NavBar = () => {
  return (
    <Nav>
      <NavLink href="/">Home</NavLink>
      <NavLink href="/dashboard">Dashboard</NavLink>
      <NavLink href="/api/auth/logout">Logout</NavLink>
    </Nav>
  );
};

export default NavBar;
