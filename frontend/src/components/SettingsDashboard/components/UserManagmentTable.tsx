import { useState, useEffect } from 'react';
import { MRT_Row, type MRT_ColumnDef } from 'material-react-table';
import { MenuItem } from '@mui/material';
import { useParams, useRouteLoaderData } from 'react-router-dom';
import { User } from '../../../api/users';
import dayjs from 'dayjs';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ConfirmationDialog } from '../../DeleteDialog';
import ShedTable, { TableActions } from '../../Table';

type UsersDataTableProps = {
	users: User[];
};

const UserManagementTable = ({ users }: UsersDataTableProps) => {
	const [sortingStates, setSortingStates] = useState<{
		[key: string]: boolean | null;
	}>({
		name: true, // Set to true to start with descending order
		userId: true,
		startDate: true,
		progress: true,
		targetDate: true,
	});
	const currentUser: User = useRouteLoaderData('user') as User;
	const [openDialog, setOpenDialog] = useState(false);

	const [rowToDelete, setRowToDelete] = useState<MRT_Row<User> | null>(null); // Track which row to delete

	const handleOpenDialog = (row: MRT_Row<User>) => {
		setRowToDelete(row); // Set the row that will be deleted
		setOpenDialog(true); // Open the delete confirmation dialog
	};
	// const orgId = useParams().orgId;

	useEffect(() => {
		// When the component first mounts, set filteredUsers to the full list of epics
		setFilteredUsers(users);
	}, [users]);
	// const queryClient = useQueryClient();
	// const { mutate: removeUser } = useMutation({
	// 	mutationFn: deleteUser,
	// 	onError: () => {
	// 		console.error('wuhh');
	// 	},
	// 	onSuccess: async () => {
	// 		await queryClient.invalidateQueries({ queryKey: ['users'] });
	// 		navigate(`/${orgId}/users`);
	// 	},
	// });
	const handleDelete = () => {
		if (rowToDelete) {
			// removeUser({ orgId: orgId, userId: rowToDelete.original.userId });
		}
	};

	const handleCloseDialog = () => {
		setOpenDialog(false);
		setRowToDelete(null); // Reset the selected row when closing
	};
	// State to hold the filtered users (including searched users)
	const [filteredUsers, setFilteredUsers] = useState<User[]>(users);

	const handleSortingChange = (id: string) => {
		setSortingStates((prev) => {
			const currentOrder = prev[id];

			const newSortingState = Object.keys(prev).reduce((acc, key) => {
				if (key === id) {
					acc[key] =
						currentOrder === null || currentOrder === false ? true : false;
				} else {
					acc[key] = null;
				}
				return acc;
			}, {} as typeof sortingStates);

			return newSortingState;
		});
	};

	const columns: MRT_ColumnDef<User>[] = [
		{
			accessorKey: 'fullName',
			id: 'fullName',
			header: 'Name',
			size: 100,
			enableColumnActions: false,
			Header: () => (
				<span
					className="cursor-pointer"
					onClick={() => handleSortingChange('fullName')}
				>
					Name
				</span>
			),
		},
		{
			accessorKey: 'email',
			id: 'email',
			header: 'Email',
			size: 200,
			enableColumnActions: false,
			Header: () => (
				<span
					className="cursor-pointer"
					onClick={() => handleSortingChange('email')}
				>
					Email
				</span>
			),
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
			Header: () => (
				<span
					className="cursor-pointer"
					onClick={() => handleSortingChange('createdAt')}
				>
					Created Date
				</span>
			),
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
			Header: () => (
				<span
					className="cursor-pointer"
					onClick={() => handleSortingChange('role')}
				>
					Role
				</span>
			),
			Cell: ({ cell }) => {
				// TODO: add dropdown and update user on change
				return cell.getValue<string>();
			},
		},
		{
			accessorKey: 'team',
			id: 'team',
			header: 'Team',
			size: 150,
			enableColumnActions: false,
			Header: () => (
				<span
					className="cursor-pointer"
					onClick={() => handleSortingChange('team')}
				>
					Team
				</span>
			),
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
							onDelete={handleDelete}
							children={
								<span className="text-neutral-regular text-base">
									Are you sure you want to delete this user? This action cannot
									be undone.
								</span>
							}
						/>
					</div>,
			  ]
			: [];

	return (
		<ShedTable
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
