import { queryOptions, QueryClient } from '@tanstack/react-query';
import { LoaderFunctionArgs } from 'react-router-dom';
import { getFeatureLists } from '../../api/featureLists';

export const featureListsQuery = (orgId: string, search?: string) =>
	queryOptions({
		queryKey: ['featureLists', orgId],
		queryFn: async () => getFeatureLists(orgId, search),
	});

export const featureListsLoader = (queryClient: QueryClient) => {
	return async ({ params }: LoaderFunctionArgs) => {
		const { orgId, search } = params;
		if (!orgId) {
			throw new Error('no org id');
		}
		return queryClient.fetchQuery(featureListsQuery(orgId, search));
	};
};
