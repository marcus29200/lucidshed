import { MenuItem } from '@mui/material';

import { MRT_Row, type MRT_ColumnDef } from 'material-react-table';
import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Epic } from './Epics';
import { ConfirmationDialog } from '../../components/ConfirmationDialog';

import { deleteEpic } from '../../api/epics';
import { LinearProgressWithLabel } from '../../components/LinearProgressWithLabel';
import ShedTable, { ColumnStates, TableActions } from '../../components/Table';
import { copyLink } from '../../api/utils';
import { getStoredSortState } from '../../shared/table.utils';
import dayjs from 'dayjs';
type EpicDataTableProps = {
	epics: Epic[];
	checkedField: string[]; // Array of field names selected by the user
};
const EPICS_TABLE_ID = 'epics-table';
const EpicsTable = ({ epics, checkedField }: EpicDataTableProps) => {
	const sortStates = {
		name: true, // Set to true to start with descending order
		progress: null,
		id: null,
		startDate: null,
		endDate: null,
	};
	const initialSorting = getStoredSortState(EPICS_TABLE_ID);
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
	const [sortingStates, setSortingStates] = useState<ColumnStates>(sortStates);
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
			const epicIdToDelete = rowToDelete.original.id;
			deleteEpic({ orgId, epicId: epicIdToDelete }).then(() => {
				setFilteredEpics((prevData) =>
					prevData.filter((epic) => epic.id !== epicIdToDelete)
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

	const handleRowClicked = (epic: Epic) => {
		navigate(`/${orgId}/epics/${epic.id}`, { relative: 'path' });
	};

	// Filter columns based on the checkedField array
	const columns = useMemo<MRT_ColumnDef<Epic>[]>(() => {
		const allColumns: MRT_ColumnDef<Epic>[] = [
			{
				accessorKey: 'name',
				id: 'name',
				header: 'Epic Name',
				size: 200,
				enableColumnActions: false,
				Header: () => <span className="cursor-pointer">Epic Name</span>,
			},
			{
				accessorKey: 'progress',
				id: 'progress',
				header: 'Progress',
				size: 100,
				enableColumnActions: false,
				Cell: ({ cell }) => {
					const progress = parseFloat(cell.getValue<string>()); // Assuming the progress is a numeric value in percentage
					return <LinearProgressWithLabel value={progress} />;
				},
				Header: () => <span className="cursor-pointer">Progress</span>,
			},

			{
				accessorKey: 'id',
				id: 'id',
				header: 'Epic Id',
				size: 60,
				enableColumnActions: false,
				Header: () => <span className="cursor-pointer">EpicId</span>,
			},

			{
				accessorKey: 'startDate',
				id: 'startDate',
				header: 'Start Date',
				size: 80,
				enableColumnActions: false,
				Header: () => <span className="cursor-pointer">Start Date</span>,
				Cell: ({ cell }) => {
					const formattedCompletionDate =
						cell.getValue<string>() && cell.getValue<string>() !== '-'
							? dayjs(new Date(cell.getValue<string>())).format('MMM DD, YYYY')
							: '-';
					return formattedCompletionDate;
				},
			},
			{
				accessorKey: 'endDate',
				id: 'endDate',
				header: 'Target Date',
				size: 80,
				enableColumnActions: false,
				Header: () => <span className="cursor-pointer">Target Date</span>,
				Cell: ({ cell }) => {
					const formattedCompletionDate =
						cell.getValue<string>() && cell.getValue<string>() !== '-'
							? dayjs(new Date(cell.getValue<string>())).format('MMM DD, YYYY')
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
				copyLink(row.original.id.toString());
			}}
			sx={{ px: 6, py: 1, fontFamily: 'Poppins, sans-serif' }}
		>
			Copy Link
		</MenuItem>,
		<MenuItem
			key={`${row.id}-3`}
			onClick={() => {
				// Access the epicId from the row data
				const epicId = row.getValue('id');
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
				onConfirm={() => {
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
			tableId={EPICS_TABLE_ID}
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
