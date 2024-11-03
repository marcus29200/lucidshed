import { MoreVert } from '@mui/icons-material';
import {
	FormControlLabel,
	IconButton,
	Menu,
	MenuItem,
	Switch,
	Typography,
} from '@mui/material';
import {
	MaterialReactTable,
	type MRT_Row,
	type MRT_RowData,
	type MRT_TableInstance,
	useMaterialReactTable,
	type MRT_ColumnDef,
	type MRT_Icons,
} from 'material-react-table';
import { useEffect, useState } from 'react';
import { SelectedMenuOption } from '../shared/table.model';
import { DocumentFilterIcon, StatusListIcon } from '../icons/icons';

export type ColumnStates = { [key: string]: boolean | null };
const customIcons: Partial<MRT_Icons> = {
	FilterListIcon: () => <DocumentFilterIcon />,
};
export type TableActions<T extends MRT_RowData> = (props: {
	closeMenu: () => void;
	row: MRT_Row<T>;
	staticRowIndex?: number;
	table: MRT_TableInstance<T>;
}) => React.ReactNode[];

type ShedTableProps<T extends MRT_RowData> = {
	filteredItems: T[];
	columns: MRT_ColumnDef<T>[];
	actions?: TableActions<T>;
	setSortingStates: React.Dispatch<React.SetStateAction<ColumnStates>>;
	sortingStates: ColumnStates;
	handleRowClicked?: (arg: T) => void;
	actionsEnabled?: boolean;
	sortingStateEnabled?: boolean;
	tableId: string;
	columFiltersEnabled?: boolean;
	enableRowSelection?: boolean;
	selectedRowActions?: SelectedMenuOption[];
	setRowSelection?: React.Dispatch<
		React.SetStateAction<{ [key: string]: boolean }>
	>;
	selectedRows?: { [key: string]: boolean };
};

const ShedTable = <T extends MRT_RowData>({
	filteredItems,
	columns,
	actions,
	sortingStates,
	setSortingStates: _setSortingStates,
	handleRowClicked,
	actionsEnabled = true,
	tableId,
	columFiltersEnabled = false,
	enableRowSelection = false,
	selectedRowActions,
}: ShedTableProps<T>) => {
	const [sortedData, setSortedData] = useState<T[]>([]);

	// sortOrder: true === 'desc', false === 'asc
	const sortData = (data: T[], sortBy: string, sortOrder: boolean) => {
		return [...data].sort((a, b) => {
			if (typeof a[sortBy] === 'number' && typeof b[sortBy] === 'number') {
				return (sortOrder ? 1 : -1) * (a[sortBy] - b[sortBy]);
			}
			const valueA = a[sortBy] ? String(a[sortBy]) : '';
			const valueB = b[sortBy] ? String(b[sortBy]) : '';
			if (valueA < valueB) return sortOrder ? 1 : -1;
			if (valueA > valueB) return sortOrder ? -1 : 1;
			return 0;
		});
	};

	const initialActiveSorting = Object.keys(sortingStates)
		.filter((key) => sortingStates[key] !== null)
		.map((key) => ({ id: key, desc: sortingStates[key] as boolean }))
		.slice(0, 1);
	const [sorting, setSorting] = useState(initialActiveSorting);
	const [rowSelection, setRowSelection] = useState({});
	const [selectedRows, setSelectedRows] = useState<string[]>([]);
	const [anchorSelectedMenuEl, setAnchorSelectedMenuEl] =
		useState<null | HTMLElement>(null);
	const [anchorVisibleColsMenuEl, setAnchorVisibleColsMenuEl] =
		useState<null | HTMLElement>(null);

	const handleClickSelectedMenu = (
		event: React.MouseEvent<HTMLButtonElement>
	) => {
		setAnchorSelectedMenuEl(event.currentTarget);
	};

	const handleCloseSelectedMenu = () => {
		setAnchorSelectedMenuEl(null);
	};

	const handleClickVisibleColsMenu = (
		event: React.MouseEvent<HTMLButtonElement>
	) => {
		setAnchorVisibleColsMenuEl(event.currentTarget);
	};

	const handleCloseVisibleColsMenu = () => {
		setAnchorVisibleColsMenuEl(null);
	};

	useEffect(() => {
		const activeSortingKey = Object.keys(sortingStates).find(
			(key) => sortingStates[key] !== null
		);

		const dataToSort = filteredItems.slice(0); // Sort the filtered (searched) stories

		if (activeSortingKey) {
			const sorted = sortData(
				dataToSort,
				activeSortingKey,
				sortingStates[activeSortingKey] as boolean
			);

			setSortedData(sorted);
		} else {
			setSortedData(dataToSort);
		}
	}, [sortingStates, filteredItems]);

	useEffect(() => {
		if (sorting.length) {
			localStorage.setItem(`${tableId}_sortKey`, sorting[0].id);
			localStorage.setItem(
				`${tableId}_sortOrder`,
				!sorting[0].desc ? 'asc' : 'desc'
			);
		} else {
			localStorage.removeItem(`${tableId}_sortKey`);
		}
	}, [sorting]);

	const table: MRT_TableInstance<T> = useMaterialReactTable({
		columns,
		data: sortedData,
		onSortingChange: setSorting,
		enableBottomToolbar: false,
		enableTopToolbar: false,
		enableRowActions: actionsEnabled,
		enableRowSelection,
		enableBatchRowSelection: false,
		muiTableHeadProps: {
			sx: {
				backgroundColor: '#F9FAFC',
				'& th': {
					backgroundColor: '#F9FAFC',
					color: 'black',
				},
			},
		},
		displayColumnDefOptions: {
			'mrt-row-actions': {
				header: '', //change header text
				size: 40, //make actions column smaller
				grow: false,
				Header: ({ table: tab }) => {
					const visibleCols = tab
						.getVisibleFlatColumns()
						.filter((col) => !!col.accessorFn)
						.reduce((visible, col) => {
							return { ...visible, [col.id]: true };
						}, {});
					const columns = tab
						.getAllColumns()
						.filter((col) => !!col.accessorFn)
						.map((col) => ({
							id: col.id,
							label: col.columnDef.header as string,
						}));
					columns.forEach((col) => {
						if (!visibleCols[col.id]) {
							visibleCols[col.id] = false;
						}
					});
					return (
						<>
							<IconButton onClick={handleClickVisibleColsMenu}>
								<StatusListIcon />
							</IconButton>
							<Menu
								anchorEl={anchorVisibleColsMenuEl}
								open={Boolean(anchorVisibleColsMenuEl)}
								onClose={handleCloseVisibleColsMenu}
								slotProps={{
									paper: {
										sx: {
											'& .MuiList-root': {
												minWidth: 200,
												paddingInline: '16px',
												display: 'flex',
												flexDirection: 'column',
												alignItems: 'flex-start',
												borderRadius: 1,
											},
										},
									},
								}}
							>
								<Typography variant="body2">Displayed fields</Typography>
								{columns.map((option) => (
									<FormControlLabel
										key={option.id}
										control={
											<Switch
												checked={tab.getColumn(option.id).getIsVisible()}
												onChange={() => {
													tab.setColumnVisibility({
														...visibleCols,
														[option.id]: !tab
															.getColumn(option.id)
															.getIsVisible(),
													});
												}}
											/>
										}
										label={option.label}
									/>
								))}
							</Menu>
						</>
					);
				},
			},
		},
		muiTablePaperProps: {
			elevation: 0, //remove boxshadow
			//customize paper styles
			sx: {
				border: '1px solid #E9EAEC',
				borderRadius: '12px',
			},
		},

		initialState: {
			showColumnFilters: columFiltersEnabled,
			columnPinning: {
				left: ['mrt-row-expand', 'mrt-row-select'],
				right: ['mrt-row-actions'],
			},
			sorting: initialActiveSorting,
		},
		state: { sorting, rowSelection },
		onRowSelectionChange: setRowSelection,
		enablePagination: false,
		renderRowActionMenuItems: actions,
		muiTableBodyRowProps: ({ row }) => ({
			onClick: () => handleRowClicked && handleRowClicked(row.original),
			sx: {
				cursor: handleRowClicked ? 'pointer' : 'default',
				'&.Mui-selected': {
					'& td::after': {
						background: '#f2fff2  !important',
					},
					'&:hover td::after': {
						filter: 'saturate(1.75)',
					},
				},
				'&:hover td::after': {
					background: '#f7f7f7  !important',
				},
			},
		}),
		getRowId: (originalRow) => originalRow.id,
		columnFilterDisplayMode: 'popover',
		muiFilterTextFieldProps: {
			className: 'table-filter',
		},
		icons: customIcons,
	});

	useEffect(() => {
		setSelectedRows(Object.keys(rowSelection).filter((key) => key));
	}, [rowSelection]);

	return (
		<div>
			{!!selectedRows.length && (
				<div
					className={`flex gap-4 items-center bg-primary-lightest px-3 py-1 w-max rounded-lg shadow-sm saturate-200 mb-2${
						selectedRowActions && selectedRowActions.length > 1 ? ' pr-1' : ''
					}${
						selectedRowActions && selectedRowActions.length === 1
							? ' cursor-pointer'
							: ''
					}`}
					onClick={() => {
						if (selectedRowActions?.length === 1) {
							selectedRowActions[0].onClick(selectedRows);
						}
					}}
				>
					<Typography variant="body1" textAlign="left">
						{`Edit ${selectedRows.length} stories`}
					</Typography>
					{/* display dropdown with available options */}
					{/* options are managed in the parent component */}
					{selectedRowActions && selectedRowActions.length > 1 && (
						<>
							<IconButton onClick={handleClickSelectedMenu}>
								<MoreVert />
							</IconButton>
							<Menu
								anchorEl={anchorSelectedMenuEl}
								open={Boolean(anchorSelectedMenuEl)}
								onClose={handleCloseSelectedMenu}
							>
								{selectedRowActions.map((action) => (
									<MenuItem
										key={action.label}
										sx={{
											px: 2,
											pt: 1,
											color: !action.isDestructive ? '#000' : 'red',
											fontFamily: 'Poppins, sans-serif',
											display: 'flex',
											alignItems: 'center',
											gap: 1,
										}}
										onClick={() => {
											action.onClick(selectedRows);
											handleCloseSelectedMenu();
										}}
									>
										{action.icon && action.icon()}
										{action.label}
									</MenuItem>
								))}
							</Menu>
						</>
					)}
				</div>
			)}
			<MaterialReactTable table={table} />
		</div>
	);
};

export default ShedTable;
