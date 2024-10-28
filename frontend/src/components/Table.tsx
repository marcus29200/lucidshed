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
};

const ShedTable = <T extends MRT_RowData>({
	filteredItems,
	columns,
	actions,
	sortingStates,
	setSortingStates: _setSortingStates,
	handleRowClicked,
	actionsEnabled = true,
}: ShedTableProps<T>) => {
	const [sortedData, setSortedData] = useState<T[]>([]);

	const sortData = (data: T[], sortBy: string, sortOrder: boolean) => {
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
		);

		const dataToSort = filteredItems; // Sort the filtered (searched) stories

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

	const table: MRT_TableInstance<T> = useMaterialReactTable({
		columns,
		data: sortedData,
		manualSorting: true,
		enableBottomToolbar: false,
		enableTopToolbar: false,
		enableRowActions: actionsEnabled,
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
			showColumnFilters: false,
			showGlobalFilter: true,
			columnPinning: {
				left: ['mrt-row-expand', 'mrt-row-select'],
				right: ['mrt-row-actions'],
			},
		},
		enablePagination: false,
		renderRowActionMenuItems: actions,
		muiTableBodyRowProps: ({ row }) => ({
			onClick: () => handleRowClicked && handleRowClicked(row.original),
			sx: { cursor: handleRowClicked ? 'pointer' : 'default' },
		}),
	});

	return (
		<div>
			<MaterialReactTable table={table} />
		</div>
	);
};

export default ShedTable;
