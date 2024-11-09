import { useState, useEffect } from 'react';
import { MRT_Row, type MRT_ColumnDef } from 'material-react-table';
import { IconButton, Menu, MenuItem } from '@mui/material';
import { useParams, useRouteLoaderData } from 'react-router-dom';
import {
	deleteUserInOrg,
	updateUserRole,
	User,
	UserRole,
} from '../../../api/users';
import dayjs from 'dayjs';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ConfirmationDialog } from '../../ConfirmationDialog';
import ShedTable, { TableActions } from '../../Table';
import { ExpandMore } from '@mui/icons-material';
import { getStoredSortState } from '../../../shared/table.utils';

type UsersDataTableProps = {
	users: User[];
	loadUsers: () => void;
};

const USER_MANAGEMENT_TABLE_ID = 'user-management-table';

const UserManagementTable = ({ users, loadUsers }: UsersDataTableProps) => {
	const sortStates = {
		fullName: true, // Set to true to start with descending order
		id: null,
		email: null,
		createdAt: null,
		role: null,
		team: null,
	};
	const initialSorting = getStoredSortState(USER_MANAGEMENT_TABLE_ID);
	if (Object.keys(initialSorting).length) {
		for (const key in sortStates) {
			if (Object.prototype.hasOwnProperty.call(sortStates, key)) {
				if (initialSorting[key] !== undefined) {
					sortStates[key] = initialSorting[key];
				} else {
					sortStates[key] = null;
				}
			}
		}
	}
	const [sortingStates, setSortingStates] = useState<{
		[key: string]: boolean | null;
	}>(sortStates);
	const currentUser: User = useRouteLoaderData('user') as User;
	const [openDialog, setOpenDialog] = useState(false);

	const [rowToDelete, setRowToDelete] = useState<MRT_Row<User> | null>(null); // Track which row to delete
	const [rowToUpdate, setRowToUpdate] = useState<MRT_Row<User> | null>(null); // Track which row to update

	const [anchorRoleEl, setAnchorRoleEl3] = useState<null | HTMLElement>(null);

	// State to hold the filtered users (including searched users)
	const [filteredUsers, setFilteredUsers] = useState<User[]>(users);

	const handleOpenRoleMenuClick = (
		event: React.MouseEvent<HTMLButtonElement>
	) => {
		setAnchorRoleEl3(event.currentTarget);
	};

	const handleCloseRoleMenu = () => {
		setAnchorRoleEl3(null);
		setRowToUpdate(null);
	};

	const handleOpenDialog = (row: MRT_Row<User>) => {
		setRowToDelete(row); // Set the row that will be deleted
		setOpenDialog(true); // Open the delete confirmation dialog
	};
	const orgId = useParams().orgId as string;

	useEffect(() => {
		// When the component first mounts, set filteredUsers to the full list of epics
		setFilteredUsers(users);
	}, [users]);

	const queryClient = useQueryClient();
	const { mutate: updateUser } = useMutation({
		mutationFn: updateUserRole,
		onError: () => {
			console.error('wuhh');
		},
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ['users'] });
			loadUsers();
			setAnchorRoleEl3(null);
		},
	});
	const { mutate: removeUser } = useMutation({
		mutationFn: deleteUserInOrg,
		onError: () => {
			console.error('wuhh');
		},
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: ['users'] });
			loadUsers();
			setAnchorRoleEl3(null);
			setRowToUpdate(null);
		},
	});

	const handleUpdateUserRole = (newRole: UserRole) => {
		if (rowToUpdate) {
			updateUser({
				userId: rowToUpdate.original.id,
				orgId,
				newRole,
			});
		}
	};
	const handleDelete = () => {
		if (rowToDelete) {
			removeUser({ orgId, userId: rowToDelete.original.id });
		}
	};
	const handleCloseDialog = () => {
		setOpenDialog(false);
		setRowToDelete(null); // Reset the selected row when closing
	};

	const columns: MRT_ColumnDef<User>[] = [
		{
			accessorKey: 'fullName',
			id: 'fullName',
			header: 'Name',
			size: 100,
			enableColumnActions: false,
			Header: () => <span className="cursor-pointer">Name</span>,
		},
		{
			accessorKey: 'email',
			id: 'email',
			header: 'Email',
			size: 200,
			enableColumnActions: false,
			Header: () => <span className="cursor-pointer">Email</span>,
			Cell: ({ cell }) => {
				return <span className="text-blue-500">{cell.getValue<string>()}</span>;
			},
		},

		{
			accessorKey: 'createdAt',
			id: 'createdAt',
			header: 'Created Date',
			size: 150,
			enableColumnActions: false,
			Header: () => <span className="cursor-pointer">Created Date</span>,
			Cell: ({ cell }) => {
				const formattedCompletionDate =
					cell.getValue<string>() && cell.getValue<string>() !== '-'
						? dayjs(new Date(cell.getValue<string>())).format('MMM DD, YYYY')
						: '-';
				return formattedCompletionDate;
			},
		},
		{
			accessorKey: 'role',
			id: 'role',
			header: 'Role',
			size: 150,
			enableColumnActions: false,
			Header: () => <span className="cursor-pointer">Role</span>,
			Cell: ({ cell, row }) => {
				const value = cell.getValue<string>();

				return (
					<>
						{row.original.id !== currentUser.id && (
							<IconButton
								key={row.original.id + '-button'}
								onClick={(e) => {
									setRowToUpdate(row);
									handleOpenRoleMenuClick(e);
								}}
							>
								<ExpandMore />
							</IconButton>
						)}
						<span className="capitalize">{value ?? '-'}</span>
						<Menu
							key={row.original.id + '-menu'}
							anchorEl={anchorRoleEl}
							open={Boolean(anchorRoleEl)}
							onClose={handleCloseRoleMenu}
							slotProps={{
								paper: {
									style: {
										width: '290px',
										padding: '10px',
									},
								},
							}}
						>
							<MenuItem
								key={row.original.id + '-menu-item1'}
								onClick={() => {
									handleUpdateUserRole('admin');
								}}
								value="admin"
							>
								Admin
							</MenuItem>
							<MenuItem
								key={row.original.id + '-menu-item2'}
								onClick={() => {
									handleUpdateUserRole('member');
								}}
								value="member"
							>
								Member
							</MenuItem>
							<MenuItem
								key={row.original.id + '-menu-item3'}
								onClick={() => {
									handleUpdateUserRole('guest');
								}}
								value="guest"
							>
								Guest
							</MenuItem>
						</Menu>
					</>
				);
			},
		},
		{
			accessorKey: 'team',
			id: 'team',
			header: 'Team',
			size: 150,
			enableColumnActions: false,
			Header: () => <span className="cursor-pointer">Team</span>,
			Cell: ({ cell }) => {
				// TODO: add dropdown and update user on change
				const currentTeam = cell.getValue<string>();
				return currentTeam ? currentTeam : '-';
			},
		},
	];

	const actions: TableActions<User> = ({ row }) =>
		row.original.id !== currentUser.id
			? [
					<div key={`${row.id}-4`}>
						<MenuItem
							onClick={(e) => {
								e.stopPropagation(); // Ensure the menu doesn't close immediately
								handleOpenDialog(row); // Open the dialog
							}}
							sx={{
								px: 6,
								pt: 1,
								borderTop: '1px solid #E3E7EB',
								color: 'red ',
								fontFamily: 'Poppins, sans-serif',
							}}
						>
							Delete
						</MenuItem>
						{/* Dialog box */}
						<ConfirmationDialog
							open={openDialog}
							onClose={handleCloseDialog}
							onConfirm={handleDelete}
							children={
								<span className="text-neutral-regular text-base">
									Are you sure you want to delete this user? This action cannot
									be undone.
								</span>
							}
						/>
					</div>,
					// eslint-disable-next-line no-mixed-spaces-and-tabs
			  ]
			: [];

	return (
		<ShedTable
			tableId={USER_MANAGEMENT_TABLE_ID}
			columns={columns}
			filteredItems={filteredUsers}
			setSortingStates={setSortingStates}
			actions={actions}
			sortingStates={sortingStates}
			sortingStateEnabled={false}
		/>
	);
};

export default UserManagementTable;
