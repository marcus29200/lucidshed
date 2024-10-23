import { Button, Container, TextField, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import LogoHeader from '../components/LogoHeader';
import { useMutation } from '@tanstack/react-query';
import { createOrganization } from '../api/organizations';

export const CreateOrganization = () => {
	const navigate = useNavigate();

	const { mutate } = useMutation({
		mutationFn: createOrganization,
		onSuccess: (data) => {
			localStorage.setItem('orgId', data.id);
			navigate(`/setup/user`);
		},
		onError: (error) => {
			console.error(error);
		},
	});

	const onSubmit = (e) => {
		e.preventDefault();
		const form = e.target;
		const id = form.elements['id'].value;
		const title = form.elements['title'].value;
		mutate({ id, title });
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
						<TextField
							variant="outlined"
							margin="normal"
							required
							fullWidth
							name="id"
							inputProps={{
								minLength: '4',
							}}
							sx={{ marginTop: '0px', marginBottom: '32px' }}
							size="small"
							label="lucidshed"
							id="id"
						/>

						<Button type="submit" fullWidth variant="contained" color="primary">
							Next
						</Button>
					</form>
				</div>
			</Container>
		</>
	);
};
