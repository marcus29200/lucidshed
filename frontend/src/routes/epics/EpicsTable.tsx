import { MenuItem } from '@mui/material';

import { MRT_Row, type MRT_ColumnDef } from 'material-react-table';
import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Epic } from './Epics';
import { ConfirmationDialog } from '../../components/DeleteDialog';

import { format } from 'date-fns';
import { deleteEpic } from '../../api/epics';
import { LinearProgressWithLabel } from '../../components/LinearProgressWithLabel';
import ShedTable, { ColumnStates, TableActions } from '../../components/Table';
import { copyLink } from '../../api/utils';
type EpicDataTableProps = {
	epics: Epic[];
	checkedField: string[]; // Array of field names selected by the user
};
const EpicsTable = ({ epics, checkedField }: EpicDataTableProps) => {
	const [sortingStates, setSortingStates] = useState<ColumnStates>({
		name: true, // Set to true to start with descending order
		progress: true,
		epicId: true,
		startDate: true,
		endDate: true,
	});
	const navigate = useNavigate();

	const [openDialog, setOpenDialog] = useState(false);

	const [rowToDelete, setRowToDelete] = useState<MRT_Row<Epic> | null>(null); // Track which row to delete

	const handleOpenDialog = (row: MRT_Row<Epic>) => {
		setRowToDelete(row); // Set the row that will be deleted
		setOpenDialog(true); // Open the delete confirmation dialog
	};
	const orgId = useParams().orgId as string;

	useEffect(() => {
		// When the component first mounts, set filteredStories to the full list of epics
		setFilteredEpics(epics);
	}, [epics]);
	const handleDelete = () => {
		if (rowToDelete) {
			const epicIdToDelete = rowToDelete.original.epicId;
			deleteEpic({ orgId, epicId: epicIdToDelete }).then(() => {
				setFilteredEpics((prevData) =>
					prevData.filter((epic) => epic.epicId !== epicIdToDelete)
				);
			});

			handleCloseDialog(); // Close the dialog after deletion
		}
	};

	const handleCloseDialog = () => {
		setOpenDialog(false);
		setRowToDelete(null); // Reset the selected row when closing
	};
	// State to hold the filtered stories (including searched stories)
	const [filteredEpics, setFilteredEpics] = useState<Epic[]>(epics);

	const handleSortingChange = (id: keyof Epic) => {
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

	const handleRowClicked = (epic: Epic) => {
		navigate(`./${epic.epicId}`, { relative: 'path' });
	};

	// Filter columns based on the checkedField array
	const columns = useMemo<MRT_ColumnDef<Epic>[]>(() => {
		const allColumns: MRT_ColumnDef<Epic>[] = [
			{
				accessorKey: 'name',
				id: 'name',
				header: 'Epic Name',
				size: 100,
				enableColumnActions: false,
				Header: () => (
					<span
						className="cursor-pointer"
						onClick={() => handleSortingChange('name')}
					>
						Epic Name
					</span>
				),
			},
			{
				accessorKey: 'progress',
				id: 'progress',
				header: 'Progress',
				size: 200,
				enableColumnActions: false,
				Cell: ({ cell }) => {
					const progress = parseFloat(cell.getValue<string>()); // Assuming the progress is a numeric value in percentage
					return <LinearProgressWithLabel value={progress} />;
				},
				Header: () => (
					<span
						className="cursor-pointer"
						onClick={() => handleSortingChange('progress')}
					>
						Progress
					</span>
				),
			},

			{
				accessorKey: 'epicId',
				id: 'epicId',
				header: 'Epic Id',
				size: 200,
				enableColumnActions: false,
				Header: () => (
					<span
						className="cursor-pointer"
						onClick={() => handleSortingChange('epicId')}
					>
						EpicId
					</span>
				),
			},

			{
				accessorKey: 'startDate',
				id: 'startDate',
				header: 'Start Date',
				size: 150,
				enableColumnActions: false,
				Header: () => (
					<span
						className="cursor-pointer"
						onClick={() => handleSortingChange('startDate')}
					>
						Start Date
					</span>
				),
				Cell: ({ cell }) => {
					const formattedCompletionDate =
						cell.getValue<string>() && cell.getValue<string>() !== '-'
							? format(new Date(cell.getValue<string>()), 'MMM dd, yyyy')
							: '-';
					return formattedCompletionDate;
				},
			},
			{
				accessorKey: 'endDate',
				id: 'endDate',
				header: 'Target Date',
				size: 150,
				enableColumnActions: false,
				Header: () => (
					<span
						className="cursor-pointer"
						onClick={() => handleSortingChange('endDate')}
					>
						Target Date
					</span>
				),
				Cell: ({ cell }) => {
					const formattedCompletionDate =
						cell.getValue<string>() && cell.getValue<string>() !== '-'
							? format(new Date(cell.getValue<string>()), 'MMM dd, yyyy')
							: '-';
					return formattedCompletionDate;
				},
			},
		];

		return allColumns.filter((column) =>
			checkedField.includes(column.accessorKey as string)
		);
	}, [checkedField]);

	const actions: TableActions<Epic> = ({ row, closeMenu }) => [
		<MenuItem
			key={`${row.id}-0`}
			onClick={() => {
				closeMenu();
				copyLink(row.original.epicId.toString());
			}}
			sx={{ px: 6, py: 1, fontFamily: 'Poppins, sans-serif' }}
		>
			Copy Link
		</MenuItem>,
		<MenuItem
			key={`${row.id}-3`}
			onClick={() => {
				// Access the epicId from the row data
				const epicId = row.getValue('epicId');
				// Do something with the epicId, e.g., pass it to another component or function
				navigate(`./${epicId}`, { relative: 'path' });
				closeMenu();
			}}
			sx={{ px: 6, py: 1, fontFamily: 'Poppins, sans-serif' }}
		>
			Open Epic
		</MenuItem>,
		<MenuItem
			key={`${row.id}-2`}
			onClick={() => {
				closeMenu();
			}}
			sx={{ px: 6, py: 1, fontFamily: 'Poppins, sans-serif' }}
		>
			Add To Roadmap
		</MenuItem>,
		<MenuItem
			key={`${row.id}-1`}
			onClick={() => {
				closeMenu();
			}}
			sx={{ px: 6, py: 1, fontFamily: 'Poppins, sans-serif' }}
		>
			Duplicate
		</MenuItem>,
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
				onDelete={() => {
					handleDelete();
					closeMenu();
				}}
				children={
					<span className="text-neutral-regular text-base">
						Are you sure you want to delete this Epic? This action cannot be
						undone and will permanently remove all associated Stories, comments,
						relationships, and attachments. Please confirm if you wish to
						proceed.
					</span>
				}
			/>
		</div>,
	];

	return (
		<ShedTable
			columns={columns}
			filteredItems={filteredEpics}
			setSortingStates={setSortingStates}
			actions={actions}
			sortingStates={sortingStates}
			handleRowClicked={handleRowClicked}
		/>
	);
};

export default EpicsTable;
