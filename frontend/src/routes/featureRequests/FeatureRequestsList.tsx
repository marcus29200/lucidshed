import { useEffect, useState } from 'react';
import { getStoredSortState } from '../../shared/table.utils';
import { Link, useLoaderData, useParams } from 'react-router-dom';
import { Box, Button } from '@mui/material';
import ShedTable from '../../components/Table';
import { MRT_ColumnDef } from 'material-react-table';
import { Story } from '../stories/Stories';
import CreateFeatureRequest from './CreateFeatureRequest';

const FEATURE_REQUESTS_TABLE_ID = 'feature-requests-table';

const FeatureRequestList = () => {
	const sortStates = {
		title: true, // Set to true to start with descending order
		company: null,
		submittedBy: null,
		submittedDate: null,
		assignedTo: null,
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
	const [isCreateSidebarOpen, setIsCreateSidebarOpen] = useState(false);
	const isNewFeatureRequest = !!useParams().isNew;
	const orgId = useParams().orgId as string;
	const featureRequests = useLoaderData() as Story[];

	useEffect(() => {
		setTimeout(() => {
			setIsCreateSidebarOpen(isNewFeatureRequest);
		});
	}, [isNewFeatureRequest]);

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
		<div className="relative">
			<Box
				sx={{
					paddingBottom: '12px',
					textAlign: 'left',
				}}
			>
				<Link to={`/${orgId}/feature-requests/new`}>
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
				</Link>
			</Box>
			<ShedTable
				tableId={FEATURE_REQUESTS_TABLE_ID}
				columns={columns}
				filteredItems={featureRequests}
				setSortingStates={setSortingStates}
				sortingStates={sortingStates}
				actionsEnabled={false}
			/>
			<CreateFeatureRequest show={isCreateSidebarOpen} />
		</div>
	);
};

export default FeatureRequestList;
