import { BASE_URL } from '../environment';
import { Story } from '../routes/stories/Stories';
import { Priority } from './epics';
import { RawSprint } from './sprints';
import { ApiUser } from './users';
import { getAuthHeaders } from './utils';

export type CreateStoryPayload = {
	title: string;
	description?: string;
	estimated_completion_date?: string;
	priority?: Priority;
	item_type: 'story';
	estimate?: number;
	iteration_id?: number;
	status?: string; // TODO: Enum of statuses
	item_sub_type?: string;
	assigned_to_id?: string;
};

export type StoryAPI = {
	title: string;
	description: string;
	status: string;
	priority: string;
	estimated_completion_date: Date;
	checkin_frequency: string | null;
	starred: boolean;
	created_by_id: string;
	modified_by_id: string;
	assigned_to_id?: string;
	assigned_to?: ApiUser;
	archived_at: number | null;
	completed_at: number | null;
	item_type: string;
	item_sub_type: string;
	estimate: number;
	start_date: Date | null;
	due_date: Date | null;
	acceptance_criteria: string[];
	iteration_id: number;
	iteration: RawSprint;
	id: number;
	created_at: Date;
	modified_at: Date;
	deleted_at: number | null;
	organization_id: string;
};

export const mapRawStory = (rawStory: StoryAPI): Story => {
	return {
		targetDate: rawStory.estimated_completion_date,
		storyId: rawStory.id,
		name: rawStory.title,
		progress: 0,
		startDate: rawStory.start_date,
		assignedToId: rawStory.assigned_to_id,
		status: rawStory.status,
		orgId: rawStory.organization_id,
	};
};

export const createStory = async ({
	orgId,
	data,
}: {
	orgId: string;
	data: CreateStoryPayload;
}) => {
	const res = await fetch(`${BASE_URL}/${orgId}/engineering`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			...getAuthHeaders(),
		},
		body: JSON.stringify(data),
	});
	if (!res.ok) {
		throw res;
	}
	return await res.json();
};

export const getStories = async (
	orgId: string,
	search?: string,
	iterationId?: string
): Promise<StoryAPI[]> => {
	let url = `${BASE_URL}/${orgId}/engineering?item_type=story`;
	if (search) {
		url += `&search=${search}`;
	}

	if (iterationId) {
		url += `&iteration_id=${iterationId}`;
	}

	const res = await fetch(url, {
		headers: {
			...getAuthHeaders(),
		},
	});
	if (!res.ok) {
		throw await res.json();
	}

	const results = await res.json();
	return results?.items;
};

export const getStory = async (orgId: string, storyId: string) => {
	const res = await fetch(`${BASE_URL}/${orgId}/engineering/${storyId}`, {
		headers: {
			...getAuthHeaders(),
		},
	});
	if (!res.ok) {
		throw await res.json();
	}

	return await res.json();
};

export const updateStory = async ({
	orgId,
	storyId,
	data,
}: {
	orgId: string;
	storyId: number;
	data: Partial<CreateStoryPayload>;
}) => {
	const res = await fetch(`${BASE_URL}/${orgId}/engineering/${storyId}`, {
		method: 'PATCH',
		headers: {
			'Content-Type': 'application/json',
			...getAuthHeaders(),
		},
		body: JSON.stringify(data),
	});
	if (!res.ok) {
		throw await res.json();
	}
	return await res.json();
};

export const deleteStory = async ({ orgId, storyId }) => {
	const res = await fetch(`${BASE_URL}/${orgId}/engineering/${storyId}`, {
		method: 'DELETE',
		headers: {
			...getAuthHeaders(),
		},
	});
	if (!res.ok) {
		throw await res.json();
	}

	return;
};

export const getStoriesAssignedToMe = async (
	orgId: string,
	userId: string,
	search?: string
): Promise<Story[]> => {
	let url = `${BASE_URL}/${orgId}/engineering?item_type=story&assigned_to_id=${userId}`;
	if (search) {
		url += `&search=${search}`;
	}

	const res = await fetch(url, {
		headers: {
			...getAuthHeaders(),
		},
	});
	if (!res.ok) {
		throw await res.json();
	}

	const results = await res.json();
	return results?.items.map(mapRawStory);
};
