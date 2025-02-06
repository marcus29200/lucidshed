import { useRouteLoaderData } from 'react-router-dom';
import { Box, Avatar, Typography } from '@mui/material';
import { mapUser, User } from '../api/users';
import { useAuth, AuthContextValue } from '../hooks/auth';

const UserComponent = () => {
	const { user: localApiUser } = useAuth() as AuthContextValue;
	const localUser = mapUser(localApiUser);

	let user: User = useRouteLoaderData('user') as User;
	user = user && user.id === localUser?.id ? localUser || user : user;
	const initials = `${user?.firstName?.[0] ?? ''}${user?.lastName?.[0] ?? ''}`;
	// TODO: add get user info here
	return (
		<>
			<Avatar>{initials}</Avatar>
			<Box>
				<Typography variant="body1" align="left">
					{user.firstName} {user.lastName}
				</Typography>
				<Typography variant="body2" align="left">
					{user?.role ? user.role[0].toUpperCase() + user.role.slice(1) : ''}
				</Typography>
			</Box>
		</>
	);
};

export default UserComponent;
