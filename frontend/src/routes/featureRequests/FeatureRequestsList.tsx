import { useEffect, useState } from 'react';
import { Link, useLoaderData, useNavigate, useParams } from 'react-router-dom';
import { Box, Button } from '@mui/material';
import CreateFeatureRequest from './CreateFeatureRequest';
import FeatureRequest, { FeatureRequestFormProps } from './FeatureRequest';
import { FeatureRequestTable } from './FeatureRequestTable';

const FEATURE_REQUESTS_TABLE_ID = 'feature-requests-table';

const FeatureRequestList = () => {
	const [isCreateSidebarOpen, setIsCreateSidebarOpen] = useState(false);
	const [isEditSidebarOpen, setIsEditSidebarOpen] = useState(false);

	const [selectedRow, setSelectedRow] =
		useState<FeatureRequestFormProps | null>(null);

	const featureRequestId = useParams().featureRequestId as string;

	const isNewFeatureRequest = !!featureRequestId && featureRequestId === 'new';
	const isEditFeatureRequest = !!featureRequestId && featureRequestId !== 'new';
	const orgId = useParams().orgId as string;

	const featureRequests = useLoaderData() as FeatureRequestFormProps[];

	const navigate = useNavigate();

	useEffect(() => {
		setTimeout(() => {
			setIsCreateSidebarOpen(isNewFeatureRequest);
		});
	}, [isNewFeatureRequest]);

	useEffect(() => {
		if (isEditFeatureRequest && !selectedRow) {
			const row = featureRequests.find(
				(featureRequest) => featureRequest.id === featureRequestId
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
			<FeatureRequestTable
				tableId={FEATURE_REQUESTS_TABLE_ID}
				requests={featureRequests}
				handleRowClick={handleRowClick}
			/>
			<CreateFeatureRequest show={isCreateSidebarOpen} />
			<FeatureRequest
				show={isEditSidebarOpen}
				featureRequest={selectedRow}
				basePath="feature-requests"
			/>
		</div>
	);
};

export default FeatureRequestList;
