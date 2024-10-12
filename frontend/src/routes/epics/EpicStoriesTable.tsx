import { Button, MenuItem } from '@mui/material';

import {
	MaterialReactTable,
	MRT_Row,
	useMaterialReactTable,
	type MRT_ColumnDef,
} from 'material-react-table';
import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ConfirmationDialog } from '../../components/DeleteDialog';
import { ArrowUpIcon } from '../../icons/icons';

import { format } from 'date-fns';
import { deleteEpic } from '../../api/epics';
import { LinearProgressWithLabel } from '../../components/LinearProgressWithLabel';
type StoryDataTableProps = {
	stories: any[]; // todo: replace any with proper type
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
	const [sortedData, setSortedData] = useState<any[]>([]);
	const [lastResetColumn, setLastResetColumn] = useState<string | null>(null);
	const [previousSortingColumn, setPreviousSortingColumn] = useState<
		string | null
	>(null);
	const [activeSortingColumn, setActiveSortingColumn] = useState<string | null>(
		null
	);
	const [openDialog, setOpenDialog] = useState(false);

	const [rowToDelete, setRowToDelete] = useState<MRT_Row<any> | null>(null); // Track which row to delete

	const handleOpenDialog = (row: MRT_Row<any>) => {
		setRowToDelete(row); // Set the row that will be deleted
		setOpenDialog(true); // Open the delete confirmation dialog
	};
	const orgId = useParams().orgId;

	useEffect(() => {
		// When the component first mounts, set filteredStories to the full list of epics
		setFilteredStories(stories);
	}, [stories]);
	const handleDelete = () => {
		if (rowToDelete) {
			const epicIdToDelete = rowToDelete.original.epicId;
			deleteEpic({ orgId, epicId: epicIdToDelete }).then(() => {
				setFilteredStories((prevData) =>
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
	const [filteredStories, setFilteredStories] = useState<any[]>(stories);

	const sortData = (data: any[], sortBy: any, sortOrder: boolean) => {
		return [...data].sort((a, b) => {
			const valueA = a[sortBy] ? String(a[sortBy]) : '';
			const valueB = b[sortBy] ? String(b[sortBy]) : '';
			if (valueA < valueB) return sortOrder ? 1 : -1;
			if (valueA > valueB) return sortOrder ? -1 : 1;
			return 0;
		});
	};

	// Handle sorting logic
	useEffect(() => {
		const activeSortingKey = Object.keys(sortingStates).find(
			(key) => sortingStates[key] !== null
		) as any;

		const dataToSort = filteredStories; // Sort the filtered (searched) stories

		if (activeSortingKey) {
			const sorted = sortData(
				dataToSort,
				activeSortingKey,
				sortingStates[activeSortingKey] as boolean
			);
			setSortedData(sorted);
			setPreviousSortingColumn((prev) =>
				prev === activeSortingKey ? prev : activeSortingColumn
			);
			setActiveSortingColumn(activeSortingKey);
		} else {
			setSortedData(dataToSort);
			setActiveSortingColumn(null);
			setPreviousSortingColumn(null);
		}
	}, [sortingStates, filteredStories]);

	const handleSortingChange = (id: any) => {
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

	const handleRemoveSort = (id: any) => {
		setLastResetColumn(id as string);
		setSortingStates((prev) => ({
			...prev,
			[id]: null,
		}));
	};

	// Filter columns based on the checkedField array
	const columns = useMemo<MRT_ColumnDef<any>[]>(() => {
		const allColumns: MRT_ColumnDef<any>[] = [
			{
				accessorKey: 'storyName',
				id: 'storyName',
				header: 'Epic Name',
				size: 100,
				enableColumnActions: false,
				Header: () => (
					<span
						className="cursor-pointer"
						onClick={() => handleSortingChange('storyName')}
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
				accessorKey: 'ticketNumber',
				id: 'ticketNumber',
				header: 'Epic Id',
				size: 200,
				enableColumnActions: false,
				Header: () => (
					<span
						className="cursor-pointer"
						onClick={() => handleSortingChange('ticketNumber')}
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
	const table = useMaterialReactTable({
		columns,
		data: sortedData,
		manualSorting: true,
		enableBottomToolbar: false,
		enableTopToolbar: false,
		enableRowActions: true,
		muiTableHeadProps: {
			sx: {
				backgroundColor: '#F9FAFC',
				'& th': {
					backgroundColor: '#F9FAFC',
					color: 'black',
				},
			},
		},

		muiTablePaperProps: {
			elevation: 0, //change the mui box shadow
			//customize paper styles
			sx: {
				border: '1px solid #E9EAEC',
				borderRadius: '12px',
			},
		},
		initialState: {
			showColumnFilters: false,
			showGlobalFilter: true,
			columnPinning: {
				left: ['mrt-row-expand', 'mrt-row-select'],
				right: ['mrt-row-actions'],
			},
		},
		renderRowActionMenuItems: ({ row, closeMenu }) => [
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
		],
	});

	return (
		<div>
			<div className="flex gap-x-2 justify-start pl-5 w-full items-center mb-4">
				{lastResetColumn && (
					<div className="flex items-center justify-center border border-gray-400 text-gray-400 px-2.5 py-0.5 rounded-full gap-x-2.5">
						<ArrowUpIcon />
						<span className="flex-grow text-center text-sm">
							Reset: {lastResetColumn}
						</span>
						<Button
							variant="outlined"
							className="hover:!outline-none hover:!border-none"
							sx={{
								paddingX: '8px',
								borderRadius: '50px',
								minWidth: '44px',
								outline: 'none',
								border: 'none',
							}}
							onClick={() => setLastResetColumn(null)}
						>
							X
						</Button>
					</div>
				)}

				{previousSortingColumn && (
					<div className="flex flex-row justify-center items-center gap-x-3">
						<p className="text-black font-poppins">Sort By :</p>
						<div className="flex items-center justify-center border border-gray-400 text-gray-400 rounded-full h-9">
							<div className="px-2">
								<ArrowUpIcon className="!h-4" />
							</div>
							<div className="flex items-center h-full px-3 border-r-2 border-l-neutral-regular">
								{previousSortingColumn} (
								{sortingStates[previousSortingColumn] ? 'Desc' : 'Asc'} )
							</div>
							<Button
								variant="outlined"
								className="hover:!outline-none hover:!border-none"
								sx={{
									paddingX: '8px',
									borderRadius: '50px',
									minWidth: '44px',
									outline: 'none',
									border: 'none',
								}}
								onClick={() => handleRemoveSort(previousSortingColumn as any)}
							>
								X
							</Button>
						</div>
					</div>
				)}

				{activeSortingColumn && (
					<div className="flex flex-row justify-center items-center gap-x-3">
						<p className="text-black font-poppins">Then By :</p>
						<div className="flex items-center justify-center border border-gray-400 text-gray-400 rounded-full h-9">
							<div className="px-2">
								<ArrowUpIcon className="!h-4" />
							</div>
							<div className="flex items-center h-full px-3 border-r-2 border-l-neutral-regular">
								{activeSortingColumn} (
								{sortingStates[activeSortingColumn] ? 'Desc' : 'Asc'} )
							</div>
							<Button
								variant="outlined"
								className="hover:!outline-none hover:!border-none"
								sx={{
									paddingX: '8px',
									borderRadius: '50px',
									minWidth: '44px',
									outline: 'none',
									border: 'none',
								}}
								onClick={() => handleRemoveSort(activeSortingColumn as any)}
							>
								X
							</Button>
						</div>
					</div>
				)}
			</div>
			<MaterialReactTable table={table} />
		</div>
	);
};

export default EpicStoriesTable;
