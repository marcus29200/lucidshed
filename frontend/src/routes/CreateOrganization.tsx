import { Button, Container, TextField, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import LogoHeader from '../components/LogoHeader';
import { useMutation } from '@tanstack/react-query';
import { createOrganization } from '../api/organizations';
import { useState } from 'react';

export const CreateOrganization = () => {
	const navigate = useNavigate();
	const [orgId, setOrgId] = useState('');
	const [apiErrorMessage, setApiErrorMessage] = useState('');

	const [isOrgIdValid, setIsOrgIdValid] = useState(true);

	const { mutate } = useMutation({
		mutationFn: createOrganization,
		onSuccess: (data) => {
			localStorage.setItem('orgId', data.id);
			navigate(`/setup/user`);
		},
		onError: (error: Error & { status?: number; detail?: string }) => {
			console.error(error);
			if (error.status === 412) {
				setApiErrorMessage(error.detail ?? '');
			}
		},
	});

	const onSubmit = (e) => {
		e.preventDefault();
		if (!isOrgIdValid) {
			return;
		}
		const form = e.target;
		const id = form.elements['id'].value;
		const title = form.elements['title'].value;
		mutate({ id, title });
	};
	const isOrgIdNameValid = (value: string) => !value || /^[a-z_]+$/.test(value);
	const handleChangeOrgId = (value: string): void => {
		setOrgId(value);
		setIsOrgIdValid(isOrgIdNameValid(value));
	};

	return (
		<>
			<LogoHeader children={undefined} />
			<Container maxWidth="sm" sx={{ textAlign: 'left' }}>
				<Typography variant="h5" sx={{ marginBottom: '16px' }}>
					Create your team
				</Typography>
				<Typography variant="h6" sx={{ marginBottom: '16px' }}>
					The place where everybody will be in sync
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
							name="title"
							inputProps={{
								minLength: '4',
							}}
							sx={{ marginTop: '0px', marginBottom: '32px' }}
							size="small"
							label="Organization title"
							id="title"
						/>
						<div className="mb-8">
							<TextField
								variant="outlined"
								margin="normal"
								required
								fullWidth
								value={orgId}
								onChange={(e) => handleChangeOrgId(e.target.value)}
								error={!isOrgIdValid}
								name="id"
								inputProps={{
									minLength: '4',
								}}
								sx={{ margin: 0 }}
								size="small"
								label={!orgId ? 'lucidshed' : orgId}
								id="id"
							/>
							{!isOrgIdValid && (
								<small className="text-error">
									Enter lowercase letters and underscores only
								</small>
							)}
						</div>

						<Button type="submit" fullWidth variant="contained" color="primary">
							Next
						</Button>
						{apiErrorMessage && (
							<span className="text-error">{apiErrorMessage}</span>
						)}
					</form>
				</div>
			</Container>
		</>
	);
};
