import { Button, MenuItem } from '@mui/material';

import {
	MaterialReactTable,
	MRT_Row,
	useMaterialReactTable,
	type MRT_ColumnDef,
} from 'material-react-table';
import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Epic } from './Epics';
import { ConfirmationDialog } from '../../components/DeleteDialog';
import { ArrowUpIcon } from '../../icons/icons';

import { format } from 'date-fns';
import { deleteEpic } from '../../api/epics';
type EpicDataTableProps = {
	epics: Epic[];
	checkedField: string[]; // Array of field names selected by the user
};
const EpicsTable = ({ epics, checkedField }: EpicDataTableProps) => {
	const [sortingStates, setSortingStates] = useState<{
		[key: string]: boolean | null;
	}>({
		name: true, // Set to true to start with descending order
		progress: true,
		epicId: true,
		startDate: true,
		endDate: true,
	});
	const navigate = useNavigate();
	const [sortedData, setSortedData] = useState<Epic[]>([]);
	const [lastResetColumn, setLastResetColumn] = useState<string | null>(null);
	const [previousSortingColumn, setPreviousSortingColumn] = useState<
		string | null
	>(null);
	const [activeSortingColumn, setActiveSortingColumn] = useState<string | null>(
		null
	);
	const [openDialog, setOpenDialog] = useState(false);

	const [rowToDelete, setRowToDelete] = useState<MRT_Row<Epic> | null>(null); // Track which row to delete

	const handleOpenDialog = (row: MRT_Row<Epic>) => {
		setRowToDelete(row); // Set the row that will be deleted
		setOpenDialog(true); // Open the delete confirmation dialog
	};
	const orgId = useParams().orgId;

	useEffect(() => {
		// When the component first mounts, set filteredStories to the full list of epics
		setFilteredStories(epics);
	}, [epics]);
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
	const [filteredStories, setFilteredStories] = useState<Epic[]>(epics);

	const sortData = (data: Epic[], sortBy: keyof Epic, sortOrder: boolean) => {
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
		) as keyof Epic | undefined;

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

	const handleRemoveSort = (id: keyof Epic) => {
		setLastResetColumn(id as string);
		setSortingStates((prev) => ({
			...prev,
			[id]: null,
		}));
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
					let progressColor = '';

					if (progress === 100) {
						progressColor = '#20A224'; // Green for 100% completion
					} else if (progress > 70) {
						progressColor = '#8bc34a'; // Light green for progress > 70%
					} else if (progress > 40) {
						progressColor = '#E5B710'; // Yellow for progress between 40% and 70%
					} else {
						progressColor = '#FCD9E0'; // Red for progress < 40%
					}

					return (
						<div
							style={{
								display: 'flex',
								flexDirection: 'column',
							}}
						>
							<div
								style={{
									height: '8px', // thinner height
									width: '65%',
									backgroundColor: '#e0e0e0', // Light grey for the background bar
									borderRadius: '20px',

									overflow: 'hidden',
									marginRight: '8px', // Spacing between the bar and the percentage
								}}
							>
								<div
									style={{
										width: `${progress}%`,
										backgroundColor: progressColor,
										height: '100%',
									}}
								></div>
							</div>
							<span
								className=" w-[60%] text-end"
								style={{ color: '#9e9e9e', fontSize: '0.875rem' }}
							>
								{progress}%
							</span>
						</div>
					);
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
							Are you sure you want to delete this Epic? This action cannot be
							undone and will permanently remove all associated Stories,
							comments, relationships, and attachments. Please confirm if you
							wish to proceed.
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
								onClick={() =>
									handleRemoveSort(previousSortingColumn as keyof Epic)
								}
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
								onClick={() =>
									handleRemoveSort(activeSortingColumn as keyof Epic)
								}
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

export default EpicsTable;
