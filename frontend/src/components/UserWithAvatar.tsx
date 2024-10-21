import { useEffect, useState } from 'react';
import { getUser, User } from '../api/users';
import { Avatar, Box, Typography } from '@mui/material';
import { useRouteLoaderData } from 'react-router-dom';

const UserWithAvatar = ({ userId }: { userId: string }) => {
	const currentUser: User = useRouteLoaderData('user') as User;
	const [user, setUser] = useState<User | null>(null);
	const [initials, setInitials] = useState<string>('');

	useEffect(() => {
		getUser(userId).then((user) => {
			if (user?.firstName && user?.lastName) {
				setInitials(`${user.firstName.charAt(0)}${user.lastName.charAt(0)}`);
			}
			setUser(() => user ?? null);
		});
	}, [userId]);

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
				<p>Loading...</p>
			)}
		</>
	);
};

export default UserWithAvatar;
