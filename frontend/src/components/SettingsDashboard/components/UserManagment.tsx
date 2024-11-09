import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
	addUserToOrg,
	CreateUserPayload,
	getUsers,
	User,
} from '../../../api/users';
import { Box, Typography, IconButton } from '@mui/material';
import { SearchIcon } from '../../../icons/icons';
import { Add } from '@mui/icons-material';
import UserManagementTable from './UserManagmentTable';
import CreateUserModal from '../pages/CreateUserModal';

const UserManagement: React.FC = () => {
	const orgId = useParams().orgId as string;
	const [users, setUsers] = useState<User[]>([]);
	const [visibleRows, setVisibleRows] = useState<User[]>([]);
	const [searchTerm, setSearchTerm] = useState('');

	const [openCreateUser, setOpenCreateUser] = useState(false);

	// load data
	useEffect(() => {
		if (orgId) {
			loadUsers();
		}
	}, [orgId]);

	const loadUsers = () => {
		getUsers(orgId).then((users) => {
			setUsers(() => users);
		});
	};

	// trigger filter in search bar
	useMemo(() => {
		if (searchTerm) {
			setVisibleRows(() =>
				[...users].filter((user) =>
					user.fullName.toLowerCase().includes(searchTerm.toLowerCase())
				)
			);
			return;
		}
		setVisibleRows(() => [...users]);
	}, [users, searchTerm]);

	const handleOpenAddUser = (event): void => {
		event.preventDefault();
		setOpenCreateUser(true); // open modal
	};

	const handleAddUser = (user: CreateUserPayload): void => {
		addUserToOrg({ orgId, data: user }).then(loadUsers);
	};

	return (
		<div className="flex flex-col gap-y-5 w-full px-10">
			<Typography variant="h4" className="border-b-2 border-b-green-500 pb-2">
				User management
			</Typography>
			<Box
				sx={{
					display: 'flex',
					justifyContent: 'space-between',
					paddingX: '12px',
					paddingY: '6px',
				}}
			>
				<Box className="flex flex-col gap-2">
					<Box
						sx={{
							display: 'flex',
							gap: '8px',
						}}
					>
						{/* Search Bar */}
						<div className="flex self-baseline flex-row items-center gap-x-2 px-2 py-1 border border-neutral-light rounded-xl">
							<SearchIcon />
							<input
								type="text"
								className="p-1 w-full outline-none"
								placeholder="Search for user"
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								onKeyDown={(e) => {
									// Prevent focus shifting to menu items
									e.stopPropagation();
								}}
							/>
						</div>

						{/* create epic and edit fields button */}
						<div className="grid gap-2">
							{/* Open add user */}
							<IconButton
								sx={{
									background: '#20A224',
									':hover': {
										background: '#20A224',
										filter: 'saturate(1.5)',
									},
									transition: 'all 0.3s ease-in-out',
								}}
								className="rounded-full !w-10 !h-10"
								onClick={handleOpenAddUser}
							>
								<Add htmlColor="white" />
							</IconButton>
						</div>
					</Box>
				</Box>
			</Box>
			<UserManagementTable users={visibleRows} loadUsers={loadUsers} />

			<CreateUserModal
				setOpen={setOpenCreateUser}
				open={openCreateUser}
				addUser={handleAddUser}
			/>
		</div>
	);
};

export default UserManagement;
