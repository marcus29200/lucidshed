import { useQuery } from '@tanstack/react-query';
import { getFeatures } from '../../api/features';
import { FeatureListFormProps } from '../features/FeatureDetails';
import { FeatureRequestFormProps } from './FeatureRequest';
import { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { UsersContext } from '../../hooks/users';
import ShedTable from '../../components/Table';
import { getStoredSortState } from '../../shared/table.utils';
import { MRT_ColumnDef } from 'material-react-table';

type Props = {
	requests: FeatureRequestFormProps[];
	handleRowClick: (row: FeatureRequestFormProps) => void;
	tableId: string;
	enabledColumns?: MRT_ColumnDef<FeatureRequestFormProps>[];
};
export const FeatureRequestTable = ({
	requests,
	handleRowClick,
	tableId,
	enabledColumns,
}: Props) => {
	const sortStates = {
		title: true, // Set to true to start with descending order
		submittedBy: null,
		submittedDate: null,
		featureAssignedName: null,
	};
	const orgId = useParams().orgId as string;
	const users = useContext(UsersContext);

	const initialSorting = getStoredSortState(tableId);
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

	const [featureRequests, setFeatureRequests] = useState<
		FeatureRequestFormProps[]
	>(() => requests.map(addUserNameAndCompany));

	useEffect(() => {
		setFeatureRequests(requests.map(addUserNameAndCompany));
	}, [requests]);

	const [columns] = useState<MRT_ColumnDef<FeatureRequestFormProps>[]>(
		() =>
			enabledColumns ?? [
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
			]
	);

	return (
		<ShedTable
			tableId={tableId}
			columns={columns}
			filteredItems={featureRequests}
			setSortingStates={setSortingStates}
			sortingStates={sortingStates}
			actionsEnabled={false}
			handleRowClicked={handleRowClick}
		/>
	);
};
