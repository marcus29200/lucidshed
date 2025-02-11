import { useContext, useState } from 'react';
import { getStoredSortState } from '../../shared/table.utils';
import ShedTable from '../../components/Table';
import { useParams } from 'react-router-dom';
import { UsersContext } from '../../hooks/users';
import { useQuery } from '@tanstack/react-query';
import { getCompanies } from '../../api/companies';
import { FeatureRequestFormProps } from '../featureRequests/FeatureRequest';
import { MRT_ColumnDef } from 'material-react-table';
import { getFeatureRequests } from '../../api/featureRequests';
import { DashboardItemIcon } from '../../icons/icons';

const FEATURE_REQUESTS_TABLE_ID = 'new-feature-requests-table';

export const NewFeatureRequests = () => {
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

	const orgId = useParams().orgId as string;
	const users = useContext(UsersContext);
	const { data: requests } = useQuery({
		queryKey: ['featureRequests', orgId],
		queryFn: async () => getFeatureRequests(orgId),
	});

	const { data } = useQuery({
		queryKey: ['companies'],
		queryFn: async () => getCompanies(orgId),
	});

	const companies = data ?? [];

	const addUserNameAndCompany = (
		feature: FeatureRequestFormProps
	): FeatureRequestFormProps => ({
		...feature,
		submittedBy:
			users.find((user) => user.id === feature.requester)?.fullName || '-',
		assignedToName:
			users.find((user) => user.id === feature.assignedTo)?.fullName || '-',
		company: companies.find((c) => c.id === feature.companyId)?.name || '-',
	});

	const featureRequests = (requests ?? [])
		.slice(0, 5)
		.map(addUserNameAndCompany);

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
		<div className="p-6 bg-white font-poppins h-full w-full">
			<div className="flex flex-col gap-y-1.5 pb-2">
				<div className="flex flex-row gap-x-2 ">
					<DashboardItemIcon />
					<h2 className="text-lg font-bold font-poppins truncate">
						New Feature Requests
					</h2>
				</div>
			</div>
			<ShedTable
				tableId={FEATURE_REQUESTS_TABLE_ID}
				columns={columns}
				filteredItems={featureRequests}
				setSortingStates={setSortingStates}
				sortingStates={sortingStates}
				actionsEnabled={false}
			/>
		</div>
	);
};
