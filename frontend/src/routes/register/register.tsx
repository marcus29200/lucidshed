import { FormEvent, useState } from "react";
import { Button, Container, TextField, Typography } from "@mui/material";
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from "@tanstack/react-query";
import { register } from '../../api/auth'
import LogoHeader from "../../components/LogoHeader";

const Register = () => {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();
  const { mutate } = useMutation({
    mutationFn: register,
    onSuccess: ({ code }) => {
      // do nothing currently with the data
      // just go to login to finish logging in
      navigate(`/reset-password?code=${code}`);
    },
    onError: (error) => {
      console.error(error)
    }
  });

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    mutate(email);
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
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
            >
              Get started for free
            </Button>
          </form>
        </div >

      </Container>
    </>
  );
};

export default Register;
