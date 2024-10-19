import { FormEvent, useState } from 'react';
import { Button, Container, TextField, Typography } from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../api/auth';
import LogoHeader from '../components/LogoHeader';
import { isPermissionsEmpty, mapUser } from '../api/users';
import { AuthContextValue, useAuth } from '../hooks/auth';

const Login = () => {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const navigate = useNavigate();
	const { storeToken } = useAuth() as AuthContextValue;
	// convert to a form action
	const { mutate } = useMutation({
		mutationFn: login,
		onSuccess: (data) => {
			const user = mapUser(data?.user);
			storeToken(data);
			if (isPermissionsEmpty(data?.user?.permissions)) {
				navigate('/setup/org');
			} else {
				if (user?.organizationId) {
					navigate(`/${user?.organizationId}`);
				}
			}
		},
		onError: (error) => {
			console.error(error);
		},
	});

	const onSubmit = (e: FormEvent) => {
		e.preventDefault();
		mutate({ email, password });
	};
	return (
		<>
			<LogoHeader>
				<div style={{ display: 'inline-flex', gap: '6px' }}>
					<Typography variant="body2">Don't have an account?</Typography>
					<Link to="/register">
						<Typography
							color="primary"
							variant="body2"
							sx={{ fontWeight: 'bold' }}
						>
							Get started for free
						</Typography>
					</Link>
				</div>
			</LogoHeader>

			<Container maxWidth="sm" sx={{ textAlign: 'left' }}>
				<Typography variant="h5" sx={{ marginBottom: '16px' }}>
					Sign in to your team space
				</Typography>
				<div
					style={{
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						justifyContent: 'center',
					}}
				>
					<form style={{ width: '100%' }} onSubmit={onSubmit}>
						<TextField
							variant="outlined"
							margin="normal"
							required
							fullWidth
							size="small"
							id="email"
							label="Email"
							name="email"
							autoFocus
							value={email}
							onChange={(e) => setEmail(e.target.value)}
						/>
						<TextField
							variant="outlined"
							margin="normal"
							sx={{ marginTop: '0px', marginBottom: '32px' }}
							required
							fullWidth
							size="small"
							name="password"
							label="Password"
							type="password"
							value={password}
							id="password"
							inputProps={{
								minLength: '6',
								// TODO set up pattern checking
							}}
							autoComplete="current-password"
							onChange={(e) => setPassword(e.target.value)}
						/>
						<Button type="submit" fullWidth variant="contained" color="primary">
							Sign in
						</Button>
					</form>
				</div>
			</Container>
		</>
	);
};

export default Login;
