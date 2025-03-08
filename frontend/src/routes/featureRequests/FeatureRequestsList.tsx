import { useContext, useEffect, useState } from 'react';
import { getStoredSortState } from '../../shared/table.utils';
import { Link, useLoaderData, useNavigate, useParams } from 'react-router-dom';
import { Box, Button } from '@mui/material';
import ShedTable from '../../components/Table';
import { MRT_ColumnDef } from 'material-react-table';
import CreateFeatureRequest from './CreateFeatureRequest';
import FeatureRequest, { FeatureRequestFormProps } from './FeatureRequest';
import { UsersContext } from '../../hooks/users';
import { useQuery } from '@tanstack/react-query';
import { getFeatures } from '../../api/features';
import { FeatureListFormProps } from '../features/FeatureDetails';

const FEATURE_REQUESTS_TABLE_ID = 'feature-requests-table';

const FeatureRequestList = () => {
	const sortStates = {
		title: true, // Set to true to start with descending order
		submittedBy: null,
		submittedDate: null,
		featureAssignedName: null,
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

	const { data: featuresData } = useQuery({
		queryKey: ['featureLists'],
		queryFn: async () => getFeatures(orgId),
	});
	const features: FeatureListFormProps[] = featuresData ?? [];

	const addUserNameAndCompany = (
		featureRequest: FeatureRequestFormProps
	): FeatureRequestFormProps => ({
		...featureRequest,
		submittedBy:
			users.find((user) => user.id === featureRequest.requester)?.fullName ||
			'-',
		featureAssignedName:
			features.find(
				(feature) => feature.id + '' === featureRequest.featureAssigned
			)?.title || '-',
	});

	const featureRequests = (useLoaderData() as FeatureRequestFormProps[]).map(
		addUserNameAndCompany
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
				setSelectedRow(() => row);
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
		setSelectedRow(() => row);
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
			id: 'featureAssignedName',
			accessorKey: 'featureAssignedName',
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
