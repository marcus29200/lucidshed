import { Chip } from '@mui/material';
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
}: ShedTableProps<T>) => {
	const initialActiveSorting = Object.keys(sortingStates)
		.filter((key) => sortingStates[key] !== null)
		.map((key) => ({ id: key, desc: sortingStates[key] as boolean }))
		.slice(0, 1);
	const [sorting, setSorting] = useState(initialActiveSorting);
	const [grouping, setGrouping] = useState(['progress']);

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
	console.log(filteredItems);

	const table: MRT_TableInstance<T> = useMaterialReactTable({
		columns,
		data: filteredItems,
		onSortingChange: setSorting,
		enableBottomToolbar: false,
		enableTopToolbar: false,
		enableColumnDragging: false,
		enableColumnOrdering: false,
		enableColumnFilterModes: false,
		enableGlobalFilter: false,
		enableHiding: false,
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
		enableGrouping: true,
		initialState: {
			sorting: initialActiveSorting,
			grouping: grouping,
		},
		state: { sorting, grouping },
		enablePagination: false,
		renderRowActionMenuItems: actions,
		muiTableBodyRowProps: ({ row }) => ({
			onClick: () => handleRowClicked && handleRowClicked(row.original),
			sx: { cursor: handleRowClicked ? 'pointer' : 'default' },
		}),
	});

	return (
		<div>
			<Chip />
			<MaterialReactTable table={table} />
		</div>
	);
};

export default ShedTable;
