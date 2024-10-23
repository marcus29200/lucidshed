import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { addUser, getUsers, User } from '../../../api/users';
import { Box, Typography, IconButton } from '@mui/material';
import { SearchIcon } from '../../../icons/icons';
import TableFiltersButton from '../../TableFiltersButton';
import { Add } from '@mui/icons-material';
import UserManagementTable from './UserManagmentTable';
import { register } from '../../../api/auth';

const UserManagement: React.FC = () => {
	const orgId = useParams().orgId as string;
	const [users, setUsers] = useState<User[]>([]);
	const [visibleRows, setVisibleRows] = useState<User[]>([]);
	const [searchTerm, setSearchTerm] = useState('');
	const [filterCheckedItems, setFilterCheckedItems] = useState<string[]>([]);
	const [filterItems, setFilterItems] = useState<string[]>([]);

	// load initial data
	useEffect(() => {
		if (orgId) {
			getUsers(orgId).then((users) => {
				setUsers(() => users);
				setFilterItems(() => [
					'Select All',
					...users.map((story) => story.fullName),
				]);
			});
		}
	}, [orgId]);

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

	const handleAddUser = (event): void => {
		event.preventDefault();
		// TODO: open add user modal
		// register('jarjarmex@gmail.com').then(() => {

		// })
		// addUser({
		// 	orgId,
		// 	data: {
		// 		email: 'jarjarmex@gmail.com',
		// 		first_name: 'ricardo2',
		// 		last_name: 'jimenez2',
		// 	},
		// }).then((ok) => console.log(ok));
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
						<div className="flex self-baseline flex-row items-center gap-x-2 px-2 py-2.5 border border-neutral-light rounded-xl">
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
						{/* filters  */}
						<TableFiltersButton
							filterItems={filterItems}
							filterCheckedItems={filterCheckedItems}
							setFilterCheckedItems={setFilterCheckedItems}
						/>
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
								}}
								className="rounded-full !w-9 !h-9"
								onClick={handleAddUser}
							>
								<Add htmlColor="white" />
							</IconButton>
						</div>
					</Box>
				</Box>
			</Box>
			<UserManagementTable users={visibleRows} />
		</div>
	);
};

export default UserManagement;
