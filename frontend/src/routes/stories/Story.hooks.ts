import { QueryClient, queryOptions } from '@tanstack/react-query';
import {
	ActionFunctionArgs,
	LoaderFunctionArgs,
	redirect,
} from 'react-router-dom';
import { linkStoryToEpic, Priority } from '../../api/epics';
import { createStory, getStories, getStory } from '../../api/stories';

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
		const story = await createStory({
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
				assigned_to_id: data.assignedTo as string,
			},
		});
		if (data.epic) {
			// assign epic to story using the /links endpoint
			await linkStoryToEpic({
				orgId: params.orgId as string,
				storyId: story.id,
				epicId: +data.epic,
			});
		}
		await queryClient.invalidateQueries(
			{ queryKey: ['stories'] },
			{ throwOnError: true }
		);

		return redirect(`/${params.orgId}/stories`);
	};
};
