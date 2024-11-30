import { useContext, useEffect, useState } from 'react';
import { getStoredSortState } from '../../shared/table.utils';
import { Link, useLoaderData, useNavigate, useParams } from 'react-router-dom';
import { Box, Button } from '@mui/material';
import ShedTable from '../../components/Table';
import { MRT_ColumnDef } from 'material-react-table';
import CreateFeatureRequest from './CreateFeatureRequest';
import FeatureRequest, { FeatureRequestFormProps } from './FeatureRequest';
import { UsersContext } from '../../hooks/users';

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
	const [isEditSidebarOpen, setIsEditSidebarOpen] = useState(false);

	const [selectedRow, setSelectedRow] =
		useState<FeatureRequestFormProps | null>(null);

	const featureRequestId = useParams().featureRequestId as string;

	const isNewFeatureRequest = !!featureRequestId && featureRequestId === 'new';
	const isEditFeatureRequest = !!featureRequestId && featureRequestId !== 'new';
	const orgId = useParams().orgId as string;
	const users = useContext(UsersContext);

	const addUserName = (
		story: FeatureRequestFormProps
	): FeatureRequestFormProps => ({
		...story,
		submittedBy:
			users.find((user) => user.id === story.requester)?.fullName || '-',
		assignedToName:
			users.find((user) => user.id === story.assignedTo)?.fullName || '-',
	});

	const featureRequests = (useLoaderData() as FeatureRequestFormProps[]).map(
		addUserName
	);

	const navigate = useNavigate();

	useEffect(() => {
		setTimeout(() => {
			setIsCreateSidebarOpen(isNewFeatureRequest);
		});
	}, [isNewFeatureRequest]);

	useEffect(() => {
		if (isEditFeatureRequest && !selectedRow) {
			const row = featureRequests.find(
				(featureRequest) => featureRequest.id === +featureRequestId
			);
			if (row) {
				setSelectedRow(row);
				setTimeout(() => {
					setIsEditSidebarOpen(true);
				});
			} else {
				navigate(`/${orgId}/feature-requests`);
			}
		} else if (isEditFeatureRequest && selectedRow) {
			setTimeout(() => {
				setIsEditSidebarOpen(true);
			});
		} else {
			setTimeout(() => {
				setIsEditSidebarOpen(false);
			});
		}
	}, [isEditFeatureRequest, selectedRow]);

	const handleRowClick = (row) => {
		setSelectedRow(null);
		navigate(`/${orgId}/feature-requests/${row.id}`);
	};

	const columns: MRT_ColumnDef<FeatureRequestFormProps>[] = [
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
			id: 'assignedToName',
			accessorKey: 'assignedToName',
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
				handleRowClicked={handleRowClick}
			/>
			<CreateFeatureRequest show={isCreateSidebarOpen} />
			<FeatureRequest show={isEditSidebarOpen} featureRequest={selectedRow} />
		</div>
	);
};

export default FeatureRequestList;
