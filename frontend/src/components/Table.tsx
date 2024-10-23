import { Button } from '@mui/material';

import {
	MaterialReactTable,
	MRT_Row,
	MRT_RowData,
	MRT_TableInstance,
	useMaterialReactTable,
	type MRT_ColumnDef,
} from 'material-react-table';
import { ArrowUpIcon } from '../icons/icons';
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
	setSortingStates,
	handleRowClicked,
	actionsEnabled = true,
	sortingStateEnabled = true,
}: ShedTableProps<T>) => {
	const [sortedData, setSortedData] = useState<T[]>([]);
	const [lastResetColumn, setLastResetColumn] = useState<string | null>(null);
	const [previousSortingColumn, setPreviousSortingColumn] = useState<
		string | null
	>(null);
	const [activeSortingColumn, setActiveSortingColumn] = useState<string | null>(
		null
	);

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
			setPreviousSortingColumn((prev) =>
				prev === activeSortingKey ? prev : activeSortingColumn
			);
			setActiveSortingColumn(activeSortingKey);
		} else {
			setSortedData(dataToSort);
			setActiveSortingColumn(null);
			setPreviousSortingColumn(null);
		}
	}, [sortingStates, filteredItems]);

	const handleRemoveSort = (id: string) => {
		setLastResetColumn(id);
		setSortingStates((prev) => ({
			...prev,
			[id]: null,
		}));
	};

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
		renderRowActionMenuItems: actions,
		muiTableBodyRowProps: ({ row }) => ({
			onClick: () => handleRowClicked && handleRowClicked(row.original),
			sx: { cursor: handleRowClicked ? 'pointer' : 'default' },
		}),
	});

	return (
		<div>
			<div className="flex gap-x-2 justify-start pl-5 w-full items-center mb-4">
				{lastResetColumn && sortingStateEnabled && (
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

				{previousSortingColumn && sortingStateEnabled && (
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
								onClick={() => handleRemoveSort(previousSortingColumn)}
							>
								X
							</Button>
						</div>
					</div>
				)}

				{activeSortingColumn && sortingStateEnabled && (
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
								onClick={() => handleRemoveSort(activeSortingColumn)}
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

export default ShedTable;
