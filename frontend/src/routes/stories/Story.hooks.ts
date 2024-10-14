import { QueryClient, queryOptions } from '@tanstack/react-query';
import {
	ActionFunctionArgs,
	LoaderFunctionArgs,
	redirect,
} from 'react-router-dom';
import { Priority } from '../../api/epics';
import {
	createStory,
	CreateStoryPayload,
	getStories,
	getStory,
	updateStory,
} from '../../api/stories';

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

export const createStoryAction = (queryClient: QueryClient) => {
	return async ({ request, params }: ActionFunctionArgs) => {
		const formData = await request.formData();

		const data = Object.fromEntries(formData.entries());

		const estimated_completion_date = data.targetDate
			? new Date(data.targetDate.toString()).toISOString()
			: undefined;
		await createStory({
			orgId: params.orgId as string,
			data: {
				title: data.title as string,
				description: data.description as string,
				item_type: 'story',
				iteration_id: data.sprint ? +data.sprint : undefined,
				priority: data.priority as Priority,
				estimate: data.estimate ? +data.estimate : undefined,
				estimated_completion_date,
				status: data.status as string,
				item_sub_type: data.subType as string,
			},
		});
		await queryClient.invalidateQueries(
			{ queryKey: ['stories'] },
			{ throwOnError: true }
		);

		return redirect(`/${params.orgId}/stories`);
	};
};

export const updateStoryAction = (queryClient: QueryClient) => {
	return async ({ request, params }: ActionFunctionArgs) => {
		const formData = await request.formData();
		const data = Object.fromEntries(formData);

		const estimated_completion_date = data?.targetDate
			? new Date(data?.targetDate as string).toISOString()
			: undefined;
		const submissionData: CreateStoryPayload = {
			title: data.title as string,
			description: data.description as string,
			item_type: 'story',
			iteration_id: data.sprint ? +data.sprint : undefined,
			estimated_completion_date,
			status: undefined,
			priority: undefined,
			estimate: undefined,
			item_sub_type: undefined,
		};
		if (data?.status) {
			submissionData.status = data?.status as string;
		}

		if (data?.priority) {
			submissionData.priority = data?.priority as Priority;
		}
		if (data?.estimate) {
			submissionData.estimate = +data?.estimate;
		}
		if (data?.subType) {
			submissionData.item_sub_type = data?.subType as string;
		}

		await updateStory({
			orgId: params.orgId as string,
			storyId: params.storyId as string,
			data: submissionData,
		});
		await queryClient.invalidateQueries(
			{
				queryKey: ['story', params.orgId, params.id],
			},
			{ throwOnError: true }
		);
		return redirect(`/${params.orgId}/stories`);
	};
};
