import { BASE_URL } from '../environment';
import { Epic } from '../routes/epics/Epics';
import { Story } from '../routes/stories/Stories';
import {
	STORY_PRIORITY,
	STORY_PRIORITY_VALUE,
	STORY_STATUS,
	STORY_STATUS_PROGRESS,
	StoryStatus,
} from '../routes/stories/stories.model';
import { mapEpic, Priority } from './epics';
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
	iteration_id?: string | null;
	status?: string; // TODO: Enum of statuses
	item_sub_type?: string;
	assigned_to_id?: string | null;
	start_date?: string | null;
	completed_at?: string | null;
	epicId?: string | null;
};

export type StoryAPI = {
	title: string;
	description: string;
	status: StoryStatus;
	priority: Priority;
	estimated_completion_date?: Date;
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
	iteration_id: string;
	iteration: RawSprint;
	id: string;
	created_at: Date;
	modified_at: Date;
	deleted_at: number | null;
	organization_id: string;
};

export const mapRawStory = (rawStory: StoryAPI): Story => {
	return {
		targetDate: rawStory.estimated_completion_date
			? new Date(rawStory.estimated_completion_date)
			: undefined,
		id: rawStory.id,
		name: rawStory.title,
		progress: STORY_STATUS_PROGRESS[rawStory.status] ?? 0,
		startDate: rawStory.start_date,
		assignedToId: rawStory.assigned_to_id,
		assignedToName: rawStory.assigned_to_id,
		iterationId: rawStory.iteration_id,
		iterationTitle: rawStory.iteration?.title,
		status: rawStory.status,
		statusLabel: STORY_STATUS[rawStory.status],
		priority: STORY_PRIORITY_VALUE[rawStory.priority ?? 'low'],
		createdDate: rawStory.created_at,
		modifiedDate: rawStory.modified_at,
		priorityLabel: STORY_PRIORITY[rawStory.priority] ?? 'Small',
	};
};

export const createStory = async ({
	orgId,
	data,
}: {
	orgId: string;
	data: CreateStoryPayload;
}): Promise<StoryAPI> => {
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
	storyId: string;
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
	if (res.status === 404) {
		return [];
	}

	const results = await res.json();
	const items = results?.items.map(mapRawStory);

	return items;
};

export const getRelatedEpic = async (
	orgId: string,
	storyId: string
): Promise<Epic | null> => {
	const url = `${BASE_URL}/${orgId}/engineering?item_type=epic&related_item_id=${storyId}`;

	const res = await fetch(url, {
		headers: {
			...getAuthHeaders(),
		},
	});
	if (!res.ok) {
		throw await res.json();
	}

	const results = await res.json();
	const epic = results?.items[0];
	return epic ? mapEpic(epic) : null;
};

export const getStoriesWithoutIteration = async (
	orgId: string,
	search?: string
): Promise<Story[]> => {
	let url = `${BASE_URL}/${orgId}/engineering?item_type=story&iteration_id=-1`;
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
