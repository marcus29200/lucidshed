import { useEffect, useState } from 'react';
import { getStoredSortState } from '../../shared/table.utils';
import { Link, useLoaderData, useNavigate, useParams } from 'react-router-dom';
import { Box, Button } from '@mui/material';
import ShedTable from '../../components/Table';
import { MRT_ColumnDef } from 'material-react-table';
import CreateFeatureList from './CreateFeatureList';
import FeatureList, { FeatureListFormProps } from './FeatureList';

const FEATURE_LISTS_TABLE_ID = 'feature-lists-table';

const FeatureListsList = () => {
	const sortStates = {
		title: true,
		requests: null,
	};
	const initialSorting = getStoredSortState(FEATURE_LISTS_TABLE_ID);
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

	const [selectedRow, setSelectedRow] = useState<FeatureListFormProps | null>(
		null
	);

	const featureListId = useParams().featureListId as string;

	const isNewFeatureList = !!featureListId && featureListId === 'new';
	const isEditFeatureList = !!featureListId && featureListId !== 'new';
	const orgId = useParams().orgId as string;

	const featureLists = useLoaderData() as FeatureListFormProps[];

	const navigate = useNavigate();

	useEffect(() => {
		setTimeout(() => {
			setIsCreateSidebarOpen(isNewFeatureList);
		});
	}, [isNewFeatureList]);

	useEffect(() => {
		if (isEditFeatureList && !selectedRow) {
			const row = featureLists.find(
				(featureList) => featureList.id === +featureListId
			);
			if (row) {
				setSelectedRow(() => row);
				setTimeout(() => {
					setIsEditSidebarOpen(true);
				});
			} else {
				navigate(`/${orgId}/feature-list`);
			}
		} else if (isEditFeatureList && selectedRow) {
			setTimeout(() => {
				setIsEditSidebarOpen(true);
			});
		} else {
			setTimeout(() => {
				setIsEditSidebarOpen(false);
			});
		}
	}, [isEditFeatureList, selectedRow]);

	const handleRowClick = (row) => {
		setSelectedRow(() => row);
		navigate(`/${orgId}/feature-list/${row.id}`);
	};

	const columns: MRT_ColumnDef<FeatureListFormProps>[] = [
		{
			header: 'Feature',
			id: 'title',
			accessorKey: 'title',
			enableColumnActions: false,
			enableColumnFilter: false,
		},
		{
			header: 'Requests',
			id: 'requests',
			accessorKey: 'requests',
			enableColumnActions: false,
			enableColumnFilter: false,
		},
		{
			header: 'Reach',
			id: 'reach',
			accessorKey: 'reach',
			enableColumnActions: false,
			enableColumnFilter: false,
			enableSorting: false,
		},
		{
			header: 'Impact',
			id: 'impact',
			accessorKey: 'impact',
			enableColumnActions: false,
			enableColumnFilter: false,
			enableSorting: false,
		},
		{
			header: 'Confidence',
			id: 'confidence',
			accessorKey: 'confidence',
			enableColumnActions: false,
			enableColumnFilter: false,
			enableSorting: false,
		},
		{
			header: 'Effort',
			id: 'effort',
			accessorKey: 'effort',
			enableColumnActions: false,
			enableColumnFilter: false,
			enableSorting: false,
		},
		{
			header: 'Growth',
			id: 'growth',
			accessorKey: 'growth',
			enableColumnActions: false,
			enableColumnFilter: false,
			enableSorting: false,
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
				<Link to={`/${orgId}/feature-list/new`}>
					<Button
						color="primary"
						variant="contained"
						sx={{
							paddingY: '8px',
							paddingX: '36px',
						}}
					>
						New Feature
					</Button>
				</Link>
			</Box>
			<ShedTable
				tableId={FEATURE_LISTS_TABLE_ID}
				columns={columns}
				filteredItems={featureLists}
				setSortingStates={setSortingStates}
				sortingStates={sortingStates}
				actionsEnabled={false}
				handleRowClicked={handleRowClick}
			/>
			<CreateFeatureList show={isCreateSidebarOpen} />
			<FeatureList show={isEditSidebarOpen} featureList={selectedRow} />
		</div>
	);
};

export default FeatureListsList;
