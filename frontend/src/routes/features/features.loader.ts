import { queryOptions, QueryClient } from '@tanstack/react-query';
import { LoaderFunctionArgs } from 'react-router-dom';
import { getFeatureDetail, getFeatures } from '../../api/features';

export const featureListsQuery = (orgId: string, search?: string) =>
	queryOptions({
		queryKey: ['features', orgId],
		queryFn: async () => getFeatures(orgId, search),
	});

export const featureDetailQuery = (orgId: string, featureListId: string) =>
	queryOptions({
		queryKey: ['features', orgId, featureListId],
		queryFn: async () => getFeatureDetail(orgId, featureListId),
	});

export const featuresLoader = (queryClient: QueryClient) => {
	return async ({ params }: LoaderFunctionArgs) => {
		const { orgId, search } = params;
		if (!orgId) {
			throw new Error('no org id');
		}
		return queryClient.fetchQuery(featureListsQuery(orgId, search));
	};
};

export const featureDetailLoader = (queryClient: QueryClient) => {
	return async ({ params }: LoaderFunctionArgs) => {
		const { orgId, featureId } = params;
		if (!orgId || !featureId) {
			throw new Error('no org id or feature list id');
		}
		return queryClient.fetchQuery(featureDetailQuery(orgId, featureId));
	};
};
