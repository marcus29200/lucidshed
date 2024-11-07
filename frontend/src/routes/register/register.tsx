import { FormEvent, useState } from 'react';
import { Button, Container, TextField, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { register } from '../../api/auth';
import LogoHeader from '../../components/LogoHeader';

const Register = () => {
	const [email, setEmail] = useState('');
	const [registerStatus, setRegisterStatus] = useState<
		'successfully' | 'failed' | null
	>(null);
	const { mutate } = useMutation({
		mutationFn: register,
		onSuccess: () => {
			setRegisterStatus('successfully');
		},
		onError: (error) => {
			console.error(error);
			setRegisterStatus(null);
		},
	});

	const onSubmit = (e: FormEvent) => {
		e.preventDefault();
		mutate(email);
	};

	return (
		<>
			<LogoHeader>
				<div style={{ display: 'inline-flex', gap: '6px' }}>
					<Typography variant="body2">Already have an account?</Typography>
					<Link to="/login">
						<Typography
							color="primary"
							variant="body2"
							sx={{ fontWeight: 'bold' }}
						>
							Log in here
						</Typography>
					</Link>
					<Typography></Typography>
				</div>
			</LogoHeader>

			<Container maxWidth="sm" sx={{ textAlign: 'left' }}>
				<Typography variant="h5">Create a free trial account</Typography>
				<Typography
					variant="subtitle1"
					color="neutral.light"
					sx={{ marginBottom: '16px' }}
				>
					15-day free trial, access all features
				</Typography>
				{!registerStatus ? (
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
								margin="normal"
								required
								fullWidth
								id="email"
								label="Email"
								name="email"
								size="small"
								autoFocus
								value={email}
								onChange={(e) => setEmail(e.target.value)}
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
				) : (
					<>
						<Typography variant="h6">
							Thank you for registering to Lucidshed!
						</Typography>
						<br />
						<Typography variant="body1">
							To activate your account, please verify your email address by
							clicking on the link we sent to{' '}
							<span className="text-primary">{email}</span>. If you did not
							receive the email, please check your spam folder.
						</Typography>
						<Typography variant="body1">
							Please note that this confirmation step is required to complete
							your registration and access your account.
						</Typography>
					</>
				)}
			</Container>
		</>
	);
};

export default Register;
