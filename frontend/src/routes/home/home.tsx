import { Button, Container } from "@mui/material";
import { Link } from "react-router-dom";

function Home() {
  return (
    <Container style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4rem', gap: '2rem' }}>
      <img src="/public/logo.svg" />
      <Link to="/login">
        <Button color="primary" variant="contained">Log in</Button>
      </Link>
      <Link to="/register">
        <Button color="primary" variant="contained">Sign up</Button>
      </Link>
    </Container>
  );
}

export default Home;
