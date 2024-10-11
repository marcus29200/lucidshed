import {
	TableContainer,
	TableHead,
	Table,
	TableRow,
	TableBody,
	TableCell,
	Paper,
	styled,
	tableCellClasses,
	Box,
	TableSortLabel,
	Button,
} from '@mui/material';
import PropTypes from 'prop-types';
import { visuallyHidden } from '@mui/utils';
import { useEffect, useState } from 'react';
import { ArrowUpIcon } from '../../icons/icons';
import { Story } from './Stories';

const StyledTableCell = styled(TableCell)(() => ({
	[`&.${tableCellClasses.head}`]: {
		backgroundColor: '#F9FAFC',
		color: '#000000',
	},
}));

function descendingComparator<
	T1 extends { [key: string]: string },
	T2 extends { [key: string]: string }
>(a: T1, b: T2, orderBy: string) {
	if (b[orderBy] < a[orderBy]) {
		return -1;
	}
	if (b[orderBy] > a[orderBy]) {
		return 1;
	}
	return 0;
}

export function getComparator<T1, T2>(order: string, orderBy: string) {
	return order === 'desc'
		? (a: T1, b: T2) => descendingComparator(a, b, orderBy)
		: (a: T1, b: T2) => -descendingComparator(a, b, orderBy);
}

const headCells = [
	{
		id: 'name',
		label: 'Story Name',
	},
	{
		id: 'progress',
		label: 'Progress',
	},
	{
		id: 'storyId',
		label: 'Story ID',
	},
	{
		id: 'startDate',
		label: 'Start Date',
	},
	{
		id: 'targetDate',
		label: 'Target Date',
	},
	{
		id: 'actions',
		withoutSort: true,
		label: '',
	},
];

function EnhancedTableHead(props) {
	const { order, orderBy, onRequestSort, checkedField } = props;
	const createSortHandler = (property) => (event) => {
		onRequestSort(event, property);
	};

	return (
		<TableHead>
			<TableRow>
				{headCells
					.filter((cell) => checkedField.includes(cell.id))
					.map((headCell) => (
						<StyledTableCell
							key={headCell.id}
							sortDirection={orderBy === headCell.id ? order : false}
						>
							{!headCell.withoutSort ? (
								<TableSortLabel
									active={orderBy === headCell.id}
									direction={orderBy === headCell.id ? order : 'asc'}
									onClick={createSortHandler(headCell.id)}
									sx={{ color: 'black' }}
								>
									{headCell.label}
									{orderBy === headCell.id ? (
										<Box component="span" sx={visuallyHidden}>
											{order === 'desc'
												? 'sorted descending'
												: 'sorted ascending'}
										</Box>
									) : null}
								</TableSortLabel>
							) : (
								headCell.label
							)}
						</StyledTableCell>
					))}
			</TableRow>
		</TableHead>
	);
}

EnhancedTableHead.propTypes = {
	onRequestSort: PropTypes.func.isRequired,
	order: PropTypes.oneOf(['asc', 'desc']).isRequired,
	orderBy: PropTypes.string.isRequired,
	checkedField: PropTypes.array.isRequired,
};
type StoryDataTableProps = {
	checkedField: string[]; // Array of field names selected by the user
	orderBy: string;
	order: string;
	children: any;
	handleRequestSort: (event: any, property: any) => void;
};
const StoriesTable = ({
	children,
	handleRequestSort,
	order,
	orderBy,
	checkedField,
}: StoryDataTableProps) => {
	const [lastResetColumn, setLastResetColumn] = useState<string | null>(null);
	const [previousSortingColumn, setPreviousSortingColumn] = useState<{
		name: string;
		order: string;
	} | null>({
		name: 'name',
		order: 'asc',
	});
	const [activeSortingColumn, setActiveSortingColumn] = useState<{
		name: string;
		order: string;
	} | null>({
		name: 'name',
		order: 'asc',
	});
	// Handle sorting logic
	useEffect(() => {
		setPreviousSortingColumn(() => activeSortingColumn);
		setActiveSortingColumn(() => ({
			name: orderBy,
			order,
		}));
	}, [orderBy, order]);

	const handleRemoveSort = (id: keyof Story) => {
		setLastResetColumn(id as string);
	};

	return (
		<>
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
								{previousSortingColumn.name} (
								<span className="capitalize">
									{previousSortingColumn.order}
								</span>
								)
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
									handleRemoveSort(previousSortingColumn.name as keyof Story)
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
								{activeSortingColumn.name} (
								<span className="capitalize">{activeSortingColumn.order}</span>)
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
									handleRemoveSort(activeSortingColumn.name as keyof Story)
								}
							>
								X
							</Button>
						</div>
					</div>
				)}
			</div>
			<TableContainer
				component={Paper}
				sx={{
					borderRadius: '12px',
					border: '1px solid #E9EAEC',
					boxShadow: 'none',
				}}
			>
				<Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
					<EnhancedTableHead
						order={order}
						orderBy={orderBy}
						onRequestSort={handleRequestSort}
						checkedField={checkedField}
					/>
					<TableBody>{children}</TableBody>
				</Table>
			</TableContainer>
		</>
	);
};

export default StoriesTable;
