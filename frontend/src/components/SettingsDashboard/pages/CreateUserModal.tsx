import {
	Box,
	Button,
	FormControl,
	InputLabel,
	MenuItem,
	Modal,
	Select,
	TextField,
	Typography,
	Checkbox,
} from '@mui/material';
import { useForm, SubmitHandler } from 'react-hook-form';

import { BasicModalProps } from '../settings-dashboard.model';
import { CreateUserPayload } from '../../../api/users';
import { useState } from 'react';

const CreateUserModal = ({
	open,
	setOpen,
	addUser,
}: BasicModalProps & { addUser: (user: CreateUserPayload) => void }) => {
	const [acknowledged, setAcknowledged] = useState(false);
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<CreateUserPayload>();
	const onSubmit: SubmitHandler<CreateUserPayload> = (data) => {
		if (acknowledged) {
			addUser(data);
			setOpen(false);
		}
	};
	return (
		<Modal
			aria-labelledby="add user"
			aria-describedby="add user"
			open={open}
			onClose={() => {
				setOpen(false);
			}}
			sx={{
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
			}}
		>
			<Box
				sx={{
					width: 'min(calc(100% - 128px), 860px)',
					height: 'min(calc(100% - 128px), 682px)',
					borderRadius: '35px',
					boxShadow: '0px 0px 4px 0px #00000040',
					background: 'white',
					padding: '24px',
				}}
			>
				<Typography variant="h4" className="md:px-24 md:pt-4 py-4">
					Create New User
				</Typography>
				<Typography
					variant="body1"
					className="md:px-32 px-8 pb-4 !text-xl text-neutral-regular"
				>
					Fill out the information below to add a new user into your
					environment.
				</Typography>
				<form
					className="flex flex-col gap-4 md:px-32 px-8 pt-4"
					onSubmit={handleSubmit(onSubmit)}
				>
					<div className="grid md:grid-cols-2 gap-4">
						<TextField
							variant="outlined"
							fullWidth
							label="First name"
							id="firstName"
							autoFocus
							required
							{...register('firstName')}
						></TextField>
						<TextField
							variant="outlined"
							fullWidth
							label="Last name"
							id="lastName"
							required
							{...register('lastName')}
						></TextField>
					</div>
					<FormControl>
						<TextField
							variant="outlined"
							fullWidth
							label="Email"
							type="email"
							color={
								errors.email && errors.email.type === 'pattern'
									? 'error'
									: 'primary'
							}
							id="email"
							required
							{...register('email', { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/i })}
						></TextField>
						{errors.email && errors.email.type === 'pattern' && (
							<small role="alert" className="text-red-500">
								Please enter a valid email address
							</small>
						)}
					</FormControl>
					<FormControl>
						<InputLabel size="small" id="role-label">
							Role
						</InputLabel>
						<Select
							variant="outlined"
							fullWidth
							labelId="role-label"
							label="Role"
							defaultValue={'member'}
							id="role"
							required
							{...register('role')}
						>
							<MenuItem value="admin">Admin</MenuItem>
							<MenuItem value="member">Member</MenuItem>
							<MenuItem value="guest">Guest</MenuItem>
						</Select>
					</FormControl>
					<TextField
						variant="outlined"
						fullWidth
						label="Team (Optional)"
						id="team"
						{...register('team')}
					></TextField>
					<div className="flex items-start">
						<Checkbox
							checked={acknowledged}
							onChange={() => setAcknowledged((prev) => !prev)}
						></Checkbox>
						<span className="font-bold text-base text-neutral-regular pt-2">
							I acknowledge that adding this user will require an additional
							user license, and corresponding charges will apply.
						</span>
					</div>
					<Button type="submit" variant="contained">
						Create
					</Button>
					{/* cancel button */}
					<Button
						color="neutral"
						onClick={() => setOpen(false)}
						variant="outlined"
					>
						Cancel
					</Button>
				</form>
			</Box>
		</Modal>
	);
};

export default CreateUserModal;
