import { queryOptions, QueryClient } from '@tanstack/react-query';
import { LoaderFunctionArgs } from 'react-router-dom';
import { getFeatureRequests } from '../../api/featureRequests';

export const featureRequestsQuery = (orgId: string, search?: string) =>
	queryOptions({
		queryKey: ['featureRequests', orgId],
		queryFn: async () => getFeatureRequests(orgId, search),
	});

export const featureRequestsLoader = (queryClient: QueryClient) => {
	return async ({ params }: LoaderFunctionArgs) => {
		const { orgId, search } = params;
		if (!orgId) {
			throw new Error('no org id');
		}
		return queryClient.fetchQuery(featureRequestsQuery(orgId, search));
	};
};
