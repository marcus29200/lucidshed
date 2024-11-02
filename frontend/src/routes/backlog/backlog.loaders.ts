import { queryOptions, QueryClient } from '@tanstack/react-query';
import { LoaderFunctionArgs } from 'react-router-dom';
import { getStoriesWithoutIteration } from '../../api/stories';

export const backlogQuery = (orgId: string, search?: string) =>
	queryOptions({
		queryKey: ['backlog', orgId, search],
		queryFn: async () => getStoriesWithoutIteration(orgId, search),
	});

export const backlogLoader = (queryClient: QueryClient) => {
	return async ({ params }: LoaderFunctionArgs) => {
		const { orgId, search } = params;
		if (!orgId) {
			throw new Error('no org id');
		}
		return queryClient.fetchQuery(backlogQuery(orgId, search));
	};
};
