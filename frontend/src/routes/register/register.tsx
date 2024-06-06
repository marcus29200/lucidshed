import { FormEvent, useState } from "react";
import { Button, Container, Divider, TextField, Typography } from "@mui/material";
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from "@tanstack/react-query";
import { register } from '../../api/auth'
import LogoHeader from "../../components/LogoHeader";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const beginGoogleOAuth = () => window.location.href = 'http://localhost:9999/api/auth/sso/login?provider=Google&redirectUrl="http://localhost:5173/home'

  const navigate = useNavigate();
  const { mutate } = useMutation({
    mutationFn: register,
    onSuccess: () => {
      // do nothing currently with the data
      // just go to login to finish logging in
      navigate('/login');
    },
    onError: (error) => {
      console.error(error)
    }
  });

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    mutate({ email, password })
  }

  return (
    <>
      <LogoHeader>
        <div style={{ display: 'inline-flex', gap: '6px' }}>
          <Typography variant="body2">Don't have an account?</Typography>
          <Link to="/login">
            <Typography color="primary" variant="body2" sx={{ fontWeight: 'bold' }}>
              Log in here
            </Typography>
          </Link>
          <Typography></Typography>
        </div>
      </LogoHeader>

      <Container maxWidth="sm" sx={{ textAlign: "left" }}>
        <Typography variant="h5">Create a free trial account</Typography>
        <Typography variant="subtitle1" color="neutral.light" sx={{ marginBottom: '16px' }}>15-day free trial, access all features</Typography>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <form style={{ width: '100%' }} onSubmit={onSubmit}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email"
              name="email"
              size="small"
              autoFocus
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              name="password"
              inputProps={{
                minLength: '6',
                // TODO: set up pattern check
              }}
              sx={{ marginTop: '0px', marginBottom: '32px' }}
              size="small"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
            >
              Get started for free
            </Button>

            <Divider sx={{ marginY: '12px' }}>OR</Divider>
            <Button
              fullWidth
              variant="contained"
              color="neutral"
              onClick={beginGoogleOAuth}
              sx={{ bgcolor: "neutral.lighter", color: "black" }}
            >
              Sign up with Google
            </Button>
          </form>
        </div >

      </Container>
    </>
  );
};

export default Register;
