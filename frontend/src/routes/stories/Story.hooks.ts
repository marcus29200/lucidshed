import { QueryClient, queryOptions } from '@tanstack/react-query';
import { LoaderFunctionArgs } from 'react-router-dom';
import { getStories, getStory } from '../../api/stories';

export const storyQuery = (orgId: string, storyId: string) =>
	queryOptions({
		queryKey: ['story', orgId, storyId],
		queryFn: async () => getStory(orgId, storyId),
	});

export const storyLoader = (queryClient: QueryClient) => {
	return async ({ params }: LoaderFunctionArgs) => {
		const { orgId, storyId } = params;
		if (!orgId || !storyId) {
			throw new Error('Missing orgId or story id');
		}
		return queryClient.fetchQuery(storyQuery(orgId, storyId));
	};
};
export const storiesQuery = (orgId: string, search?: string) =>
	queryOptions({
		queryKey: ['stories', orgId, search],
		queryFn: async () => getStories(orgId, search),
	});

export const storiesLoader = (queryClient: QueryClient) => {
	return async ({ params }: LoaderFunctionArgs) => {
		const { orgId, search } = params;
		if (!orgId) {
			throw new Error('no org id');
		}
		return queryClient.fetchQuery(storiesQuery(orgId, search));
	};
};
