import { Button, Container, TextField, Typography } from "@mui/material"
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import LogoHeader from "../components/LogoHeader"
import { FormEvent, useState } from "react";
import { resetPassword } from "../api/auth";
import { useMutation } from "@tanstack/react-query";

export const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const navigate = useNavigate();
  const [queryParams] = useSearchParams();

  const { mutate } = useMutation({
    mutationFn: resetPassword,
    onSuccess: (data) => {
      console.log(data);
      navigate('/setup/org');
    },
    onError: (error) => {
      console.error(error);
    }
  });

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (password === confirmPassword) {
      mutate({ password, reset_code: queryParams.get("code") as string })
    } else {
      console.error("whoa buddy what the fuck");
    }

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
        <Typography variant="h5" sx={{ marginBottom: '16px' }}>Reset your password</Typography>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <form style={{ width: '100%' }} onSubmit={onSubmit}>
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              name="password"
              inputProps={{
                minLength: '6',
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
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              name="password"
              inputProps={{
                minLength: '6',
              }}
              sx={{ marginTop: '0px', marginBottom: '32px' }}
              size="small"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
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
        </div>
      </Container >
    </>
  )
}
