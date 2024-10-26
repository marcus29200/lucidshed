import { useContext } from 'react';
import { User } from '../api/users';
import { Avatar, Box, Typography } from '@mui/material';
import { useRouteLoaderData } from 'react-router-dom';
import { UsersContext } from '../hooks/users';

const UserWithAvatar = ({ userId }: { userId: string }) => {
	const currentUser: User = useRouteLoaderData('user') as User;
	const users = useContext(UsersContext);
	const user = users.find((u) => u.id === userId);
	const initials = `${user?.firstName?.charAt(0)}${user?.lastName?.charAt(0)}`;

	return (
		<>
			{user ? (
				<Box sx={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
					<Avatar
						variant="circular"
						sx={{ width: '32px', height: '32px', fontSize: '16px' }}
					>
						{initials}
					</Avatar>

					<Typography variant="body1" align="left">
						{user.firstName} {user.lastName}{' '}
						{userId === currentUser.id && (
							<span className="text-neutral-regular font-semibold text-xs">
								(You)
							</span>
						)}
					</Typography>
				</Box>
			) : (
				<p>&nbsp;</p>
			)}
		</>
	);
};

export default UserWithAvatar;
