import { useState } from 'react';
import { getStoredSortState } from '../../shared/table.utils';
import { useLoaderData } from 'react-router-dom';
import { Box, Button } from '@mui/material';
import ShedTable from '../../components/Table';
import { MRT_ColumnDef } from 'material-react-table';
import { Story } from '../stories/Stories';

const FEATURE_REQUESTS_TABLE_ID = 'feature-requests-table';

const FeatureRequestList = () => {
	const sortStates = {
		name: true, // Set to true to start with descending order
		id: null,
		startDate: null,
		progress: null,
		targetDate: null,
		priority: null,
		status: null,
	};
	const initialSorting = getStoredSortState(FEATURE_REQUESTS_TABLE_ID);
	if (Object.keys(initialSorting).length) {
		for (const key in sortStates) {
			if (Object.prototype.hasOwnProperty.call(sortStates, key)) {
				if (initialSorting[key] !== undefined) {
					sortStates[key] = initialSorting[key];
				} else {
					sortStates[key] = null;
				}
			}
		}
	}
	const [sortingStates, setSortingStates] = useState<{
		[key: string]: boolean | null;
	}>(sortStates);
	const featureRequests = (useLoaderData() as Story[]) ?? [];
	console.log(featureRequests);

	const columns: MRT_ColumnDef<Story>[] = [
		{
			header: 'Title',
			id: 'title',
			accessorKey: 'title',
			enableColumnActions: false,
			enableColumnFilter: false,
		},
		{
			header: 'Company',
			id: 'company',
			accessorKey: 'company',
			enableColumnActions: false,
			enableColumnFilter: false,
		},
		{
			header: 'Submitted by',
			id: 'submittedBy',
			accessorKey: 'submittedBy',
			enableColumnActions: false,
			enableColumnFilter: false,
		},
		{
			header: 'Submitted date',
			id: 'submittedDate',
			accessorKey: 'submittedDate',
			enableColumnActions: false,
			enableColumnFilter: false,
		},
		{
			header: 'Feature assigned',
			id: 'assignedTo',
			accessorKey: 'assignedTo',
			enableColumnActions: false,
			enableColumnFilter: false,
		},
	];
	return (
		<>
			<Box
				sx={{
					paddingBottom: '12px',
					textAlign: 'left',
				}}
			>
				<Button
					color="primary"
					variant="contained"
					sx={{
						paddingY: '8px',
						paddingX: '36px',
					}}
				>
					New Request
				</Button>
			</Box>
			<ShedTable
				tableId={FEATURE_REQUESTS_TABLE_ID}
				columns={columns}
				filteredItems={featureRequests}
				setSortingStates={setSortingStates}
				sortingStates={sortingStates}
				actionsEnabled={false}
			/>
		</>
	);
};

export default FeatureRequestList;
