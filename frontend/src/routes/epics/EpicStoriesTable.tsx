import { MenuItem } from '@mui/material';

import { MRT_Row, type MRT_ColumnDef } from 'material-react-table';
import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ConfirmationDialog } from '../../components/DeleteDialog';
import { format } from 'date-fns';
import { LinearProgressWithLabel } from '../../components/LinearProgressWithLabel';
import ShedTable, { TableActions } from '../../components/Table';
import { Story } from '../stories/Stories';
type StoryDataTableProps = {
	stories: Story[]; // todo: replace any with proper type
	checkedField: string[]; // Array of field names selected by the user
};
const EpicStoriesTable = ({ stories, checkedField }: StoryDataTableProps) => {
	const [sortingStates, setSortingStates] = useState<{
		[key: string]: boolean | null;
	}>({
		storyName: true, // Set to true to start with descending order
		ticketNumber: true,
		createdDate: true,
		progress: true,
		modifiedDate: true,
	});
	const navigate = useNavigate();

	const [openDialog, setOpenDialog] = useState(false);

	const [rowToDelete, setRowToDelete] = useState<MRT_Row<Story> | null>(null); // Track which row to delete

	const handleOpenDialog = (row: MRT_Row<Story>) => {
		setRowToDelete(row); // Set the row that will be deleted
		setOpenDialog(true); // Open the delete confirmation dialog
	};
	// const orgId = useParams().orgId;

	useEffect(() => {
		// When the component first mounts, set filteredStories to the full list of epics
		setFilteredStories(stories);
	}, [stories]);
	const handleDelete = () => {
		if (rowToDelete) {
			// const epicIdToDelete = rowToDelete.original.epicId;
			// deleteEpic({ orgId, epicId: epicIdToDelete }).then(() => {
			// 	setFilteredStories((prevData) =>
			// 		prevData.filter((epic) => epic.epicId !== epicIdToDelete)
			// 	);
			// });

			handleCloseDialog(); // Close the dialog after deletion
		}
	};

	const handleCloseDialog = () => {
		setOpenDialog(false);
		setRowToDelete(null); // Reset the selected row when closing
	};
	// State to hold the filtered stories (including searched stories)
	const [filteredStories, setFilteredStories] = useState<Story[]>(stories);

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

	// Filter columns based on the checkedField array
	const columns = useMemo<MRT_ColumnDef<Story>[]>(() => {
		const allColumns: MRT_ColumnDef<Story>[] = [
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
						Story Name
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
				accessorKey: 'storyId',
				id: 'storyId',
				header: 'Story Id',
				size: 200,
				enableColumnActions: false,
				Header: () => (
					<span
						className="cursor-pointer"
						onClick={() => handleSortingChange('storyId')}
					>
						Ticket Number
					</span>
				),
			},

			{
				accessorKey: 'createdDate',
				id: 'createdDate',
				header: 'Created Date',
				size: 150,
				enableColumnActions: false,
				Header: () => (
					<span
						className="cursor-pointer"
						onClick={() => handleSortingChange('createdDate')}
					>
						Created Date
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
				accessorKey: 'modifiedDate',
				id: 'modifiedDate',
				header: 'Modified Date',
				size: 150,
				enableColumnActions: false,
				Header: () => (
					<span
						className="cursor-pointer"
						onClick={() => handleSortingChange('modifiedDate')}
					>
						Modified Date
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
	const actions: TableActions<Story> = ({ row, closeMenu }) => [
		<MenuItem
			key={`${row.id}-0`}
			onClick={() => {
				closeMenu();
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
				onDelete={handleDelete}
				children={
					<span className="text-neutral-regular text-base">
						Are you sure you want to delete this story? This action cannot be
						undone and will permanently remove all associated tasks, comments,
						and attachments. Please confirm if you wish to proceed.
					</span>
				}
			/>
		</div>,
	];

	return (
		<ShedTable
			columns={columns}
			filteredItems={filteredStories}
			setSortingStates={setSortingStates}
			actionsEnabled={false}
			actions={actions}
			sortingStates={sortingStates}
		/>
	);
};

export default EpicStoriesTable;
