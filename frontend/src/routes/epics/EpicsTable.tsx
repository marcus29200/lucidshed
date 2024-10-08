import { Button, IconButton, Menu, MenuItem } from '@mui/material';

import {
	MaterialReactTable,
	MRT_Cell,
	MRT_Row,
	useMaterialReactTable,
	type MRT_ColumnDef,
} from 'material-react-table';
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Epic } from './Epics';
import { DeleteDialog } from '../../components/DeleteDialog';
import { ArrowUpIcon } from '../../icons/icons';
import { MoreHoriz } from '@mui/icons-material';
import { format } from 'date-fns';
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
	const [actionsAnchor, setActionsAnchor] = useState<null | HTMLElement>(null);

	const navigate = useNavigate();
	const [lastResetColumn, setLastResetColumn] = useState<string | null>(null);
	const [previousSortingColumn, setPreviousSortingColumn] = useState<
		string | null
	>('name');
	const [activeSortingColumn, setActiveSortingColumn] = useState<string | null>(
		'name'
	);
	const [openDialog, setOpenDialog] = useState(false);

	const sortData = (
		a: MRT_Row<Epic>,
		b: MRT_Row<Epic>,
		sortBy: keyof Epic,
		sortOrder: boolean
	): number => {
		setPreviousSortingColumn((prev) =>
			prev === sortBy ? prev : activeSortingColumn
		);
		setActiveSortingColumn(sortBy);
		handleSortingChange(sortBy);

		setActiveSortingColumn(sortBy);
		const valueA = a.original[sortBy] ? String(a.original[sortBy]) : '';
		const valueB = b.original[sortBy] ? String(b.original[sortBy]) : '';
		if (valueA < valueB) return sortOrder ? 1 : -1;
		if (valueA > valueB) return sortOrder ? -1 : 1;
		return 0;
	};

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
	const columns = useMemo<MRT_ColumnDef<Epic>[]>(() => {
		const allColumns: MRT_ColumnDef<Epic, unknown>[] = [
			{
				accessorKey: 'name',
				id: '1',
				header: 'Epic Name',
				size: 100,
				sortingFn: (a, b) => {
					return sortData(
						a as MRT_Row<Epic>,
						b as MRT_Row<Epic>,
						'name' as keyof Epic,
						true
					);
				},
				enableColumnActions: false,
			},
			{
				accessorKey: 'progress',
				id: '2',
				header: 'Progress',
				size: 200,
				sortingFn: (a, b) => {
					return sortData(
						a as MRT_Row<Epic>,
						b as MRT_Row<Epic>,
						'progress' as keyof Epic,
						true
					);
				},
				enableColumnActions: false,
				Cell: ({ cell }: { cell: MRT_Cell<Epic> }) => {
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
			},
			{
				accessorKey: 'epicId',
				id: '3',
				header: 'Epic Id',
				size: 200,
				sortingFn: (a, b) => {
					return sortData(
						a as MRT_Row<Epic>,
						b as MRT_Row<Epic>,
						'epicId' as keyof Epic,
						true
					);
				},
				enableColumnActions: false,
			},
			{
				accessorKey: 'startDate',
				id: '4',
				header: 'Start Date',
				size: 150,
				sortingFn: (a, b) => {
					return sortData(
						a as MRT_Row<Epic>,
						b as MRT_Row<Epic>,
						'startDate' as keyof Epic,
						true
					);
				},
				enableColumnActions: false,
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
				id: '5',
				header: 'Target Date',
				size: 150,
				sortingFn: (a, b) => {
					return sortData(
						a as MRT_Row<Epic>,
						b as MRT_Row<Epic>,
						'endDate' as keyof Epic,
						true
					);
				},
				Cell: ({ cell }) => {
					const formattedCompletionDate =
						cell.getValue<string>() && cell.getValue<string>() !== '-'
							? format(new Date(cell.getValue<string>()), 'MMM dd, yyyy')
							: null;
					return formattedCompletionDate;
				},

				enableColumnActions: false,
			},
			{
				accessorKey: 'actions',

				id: '6', // id for the actions column
				header: 'z', // custom header text
				size: 40,
				Cell: ({ row }) => {
					return (
						<>
							<IconButton
								onClick={(event) => setActionsAnchor(event.currentTarget)}
							>
								<MoreHoriz />
							</IconButton>
							<Menu
								anchorEl={actionsAnchor}
								open={Boolean(actionsAnchor)}
								onClose={() => setActionsAnchor(null)}
								slotProps={{
									paper: {
										style: {
											borderRadius: '12px',
											width: '208px',
											paddingBottom: '90px !important',
											paddingTop: '90px !important',
										},
										className: '!shadow-sm',
									},
								}}
							>
								<MenuItem
									key={`${row.original.epicId}-0`}
									onClick={(event) => {
										event.stopPropagation();
										setActionsAnchor(null);
									}}
									sx={{ px: 6, py: 1, fontFamily: 'Poppins, sans-serif' }}
								>
									Copy Link
								</MenuItem>
								<MenuItem
									key={`${row.original.epicId}-1`}
									onClick={(event) => {
										event.stopPropagation();
										setActionsAnchor(null);
									}}
									sx={{ px: 6, py: 1, fontFamily: 'Poppins, sans-serif' }}
								>
									Duplicate Story
								</MenuItem>
								<MenuItem
									key={`${row.original.epicId}-2`}
									onClick={(event) => {
										event.stopPropagation();
										setActionsAnchor(null);
									}}
									sx={{ px: 6, py: 1, fontFamily: 'Poppins, sans-serif' }}
								>
									Assign To Epic
								</MenuItem>
								<MenuItem
									key={`${row.original.epicId}-3`}
									onClick={(event) => {
										// Access the epicId from the row data
										const epicId = row.getValue('epicId');

										// Do something with the epicId, e.g., pass it to another component or function
										navigate(`./${epicId}`, { relative: 'path' });
										event.stopPropagation();
										setActionsAnchor(null);
									}}
									sx={{ px: 6, py: 1, fontFamily: 'Poppins, sans-serif' }}
								>
									Open Epic
								</MenuItem>

								<MenuItem
									key={4}
									onClick={(e) => {
										e.stopPropagation(); // Ensure the menu doesn't close immediately
										setOpenDialog(true);
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
									{/* Dialog box */}
								</MenuItem>
								<DeleteDialog
									open={openDialog}
									onClose={() => {
										setOpenDialog(false);
									}}
									onDelete={() => {
										console.log(row);

										setOpenDialog(false);
										setActionsAnchor(null);
									}}
									description={`Are you sure you want to delete this epic? This action cannot be undone and will permanently remove all associated tasks, comments, and attachments. Please confirm if you wish to proceed.`}
								/>
							</Menu>
						</>
					);
				},
				enableSorting: false,
				enableColumnActions: false,
			},
		];
		return allColumns.filter((column) =>
			checkedField.includes(column.accessorKey as string)
		);
	}, [actionsAnchor, openDialog, navigate, checkedField]);

	const table = useMaterialReactTable({
		columns,
		enableBottomToolbar: false,
		enableTopToolbar: false,
		muiTableHeadProps: {
			sx: {
				backgroundColor: '#F9FAFC',
				'& th': {
					backgroundColor: '#F9FAFC',
					color: 'black',
				},
			},
		},
		muiTableBodyRowProps: {
			sx: {
				backgroundColor: '#F9FAFC !important',
				':hover': {
					backgroundColor: '#F9FAFC !important',
					'& td': {
						backgroundColor: '#F9FAFC !important',
						color: 'black',
					},
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
		enableRowActions: false,
		initialState: {
			showColumnFilters: false,
			showGlobalFilter: true,
			columnPinning: {
				left: ['mrt-row-expand', 'mrt-row-select'],
				right: ['mrt-row-actions'],
			},
		},

		data: epics,
	});

	return (
		<>
			<div className="flex gap-x-2 justify-start pl-5 w-full items-center mb-4">
				{lastResetColumn && (
					<div className="flex items-center justify-center border border-gray-400 text-gray-400 px-2.5 py-0.5 rounded-full gap-x-2.5">
						<ArrowUpIcon />
						<span className="flex-grow text-center text-sm">
							Reset: {lastResetColumn}
						</span>
						<button
							className="text-gray-400 border-l border-l-gray-400 pl-2 h-full"
							onClick={() => setLastResetColumn(null)}
						>
							X
						</button>
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
		</>
	);
};

export default EpicsTable;
