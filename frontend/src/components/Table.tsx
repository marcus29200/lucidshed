import { MoreVert } from '@mui/icons-material';
import { Button, IconButton, Menu, Typography } from '@mui/material';
import {
	MaterialReactTable,
	MRT_Row,
	MRT_RowData,
	MRT_TableInstance,
	useMaterialReactTable,
	type MRT_ColumnDef,
} from 'material-react-table';
import { useEffect, useState } from 'react';

export type ColumnStates = { [key: string]: boolean | null };

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
	handleClickUpdateSelected?: (rows: string[]) => void;
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
	handleClickUpdateSelected,
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
	});

	useEffect(() => {
		setSelectedRows(Object.keys(rowSelection).filter((key) => key));
	}, [rowSelection]);

	return (
		<div>
			{!!selectedRows.length && (
				<>
					<Typography variant="body1" textAlign="left">
						{`${selectedRows.length} selected`}
					</Typography>
					{/* display dropdown with available options */}
					{/* options are managed in the parent component */}
					<IconButton>
						<MoreVert />
					</IconButton>
					<Menu open={false}></Menu>
					<Button
						onClick={() => {
							handleClickUpdateSelected &&
								handleClickUpdateSelected(selectedRows);
						}}
					>
						Update selected rows
					</Button>
				</>
			)}
			<MaterialReactTable table={table} />
		</div>
	);
};

export default ShedTable;
