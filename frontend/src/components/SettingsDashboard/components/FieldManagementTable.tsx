import { useState, useMemo, useEffect } from 'react';
import {
	MaterialReactTable,
	useMaterialReactTable,
	type MRT_ColumnDef,
} from 'material-react-table';
import { MenuItem, Select } from '@mui/material';
import { useNavigate } from 'react-router-dom';
type Epic = {
	Tag: string;
	Role: string;
};

type FieldManagementTableProps = {
	epics: Epic[];
	checkedField: string[]; // Array of field names selected by the user
	searchBar: string; // Search term from the parent component
};

const FieldManagementTable = ({
	epics,
	checkedField,
	searchBar,
}: FieldManagementTableProps) => {
	const [sortingStates, setSortingStates] = useState<{
		[key: string]: boolean | null;
	}>({
		Tag: true,
		Role: true,
	});
	const navigate = useNavigate();
	const [sortedData, setSortedData] = useState<Epic[]>([]);
	const [activeSortingColumn, setActiveSortingColumn] = useState<string | null>(
		null
	);
	const [allEpics, setAllEpics] = useState<Epic[]>(epics); // Hold all epics, even after delete

	useEffect(() => {
		// When the component first mounts, set filteredStories to the full list of epics
		setFilteredStories(epics);
		setAllEpics(epics);
	}, [epics]);

	// State to hold the filtered stories (including searched stories)
	const [filteredStories, setFilteredStories] = useState<Epic[]>(epics);

	useEffect(() => {
		if (searchBar) {
			const lowerCaseSearch = searchBar.toLowerCase();

			const filtered = allEpics.filter((story) =>
				Object.values(story).some((value) => {
					if (typeof value === 'string') {
						return value.toLowerCase().includes(lowerCaseSearch);
					}
					return false;
				})
			);

			setFilteredStories(filtered);
		} else {
			setFilteredStories(allEpics); // If no search term, show all stories
		}
	}, [searchBar, allEpics]);
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

			setActiveSortingColumn(activeSortingKey);
		} else {
			setSortedData(dataToSort);
			setActiveSortingColumn(null);
		}
	}, [sortingStates, filteredStories]);
	// Handle the search functionality (filter based on search term)

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

	// Filter columns based on the checkedField array
	const columns = useMemo<MRT_ColumnDef<Epic>[]>(() => {
		const allColumns = [
			{
				accessorKey: 'name',
				id: 'name',
				header: 'Name',
				size: 300,
				Cell: ({ row }) => (
					<div style={{ display: 'flex', alignItems: 'center' }}>
						<span>{row.original.name}</span> {/* Display the name */}
					</div>
				),
				Header: () => (
					<span
						className="cursor-pointer"
						onClick={() => handleSortingChange('Tag')}
					>
						Tag
					</span>
				),
			},
			{
				accessorKey: 'role',
				id: 'role',
				header: 'Role',
				size: 200,
				Cell: ({ row }) => (
					<Select
						value={row.original.role[0]} // Default selected value is the first role
						onChange={(e) => {
							// Handle value change if needed
						}}
						sx={{
							'& .MuiOutlinedInput-notchedOutline': {
								border: 'none', // Removes the border
							},
							'&:hover .MuiOutlinedInput-notchedOutline': {
								border: 'none', // Removes the border on hover
							},
							'&.Mui-focused .MuiOutlinedInput-notchedOutline': {
								border: 'none', // Removes the border when focused
							},
						}}
					>
						{row.original.role.map((role: string, index: number) => (
							<MenuItem key={index} value={role}>
								{role}
							</MenuItem>
						))}
					</Select>
				),
				Header: () => (
					<span
						className="cursor-pointer"
						onClick={() => handleSortingChange('Role')}
					>
						Field
					</span>
				),
			},

			{
				accessorKey: 'action',
				id: 'action',
				header: 'Action',
				size: 150,
				Cell: () => {
					return (
						<div
							style={{
								display: 'flex',

								alignItems: 'center',
							}}
						>
							<span></span>
						</div>
					);
				},
				Header: () => (
					<span
						className="cursor-pointer"
						onClick={() => handleSortingChange('action')}
					>
						Action
					</span>
				),
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
		enableGlobalFilter: false,
		enableColumnFilters: false,
		enableBottomToolbar: false,
		enableTopToolbar: false,
		enableRowActions: true,

		muiTableHeadProps: {
			sx: {
				backgroundColor: '#ccc',
				'& th': {
					backgroundColor: '#ccc',
					color: 'black',
				},
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
				key={0}
				onClick={() => {
					closeMenu();
				}}
				sx={{ px: 6, py: 1, fontFamily: 'Poppins, sans-serif' }}
			>
				Copy Link
			</MenuItem>,
			<MenuItem
				key={1}
				onClick={() => {
					closeMenu();
				}}
				sx={{ px: 6, py: 1, fontFamily: 'Poppins, sans-serif' }}
			>
				Duplicate Story
			</MenuItem>,
			<MenuItem
				key={2}
				onClick={() => {
					closeMenu();
				}}
				sx={{ px: 6, py: 1, fontFamily: 'Poppins, sans-serif' }}
			>
				Assign To Epic
			</MenuItem>,
			<MenuItem
				key={3}
				onClick={() => {
					// Access the epicId from the row data
					const epicId = row.getValue('epicId');
					// Do something with the epicId, e.g., pass it to another component or function
					navigate(`/epicInfoDashboard/${epicId}`);
					closeMenu();
				}}
				sx={{ px: 6, py: 1, fontFamily: 'Poppins, sans-serif' }}
			>
				Open Epic
			</MenuItem>,
			<>
				<MenuItem
					key={4}
					onClick={(e) => {
						e.stopPropagation(); // Ensure the menu doesn't close immediately
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
			</>,
		],
	});

	return <MaterialReactTable table={table} />;
};

export default FieldManagementTable;
