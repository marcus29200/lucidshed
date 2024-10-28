import { BASE_URL } from '../environment';
import { ApiEpic, Epic } from '../routes/epics/Epics';
import { Story } from '../routes/stories/Stories';
import { mapRawStory } from './stories';
import { getAuthHeaders } from './utils';
// TODO: place this type in a shared model
export type Priority = 'critical' | 'high' | 'medium' | 'low';

export const ENGINEERING_ITEM_LINK = {
	subtask: 'subtask',
	related: 'related',
	blocked: 'blocked',
	blocking: 'blocking',
} as const;

export type EngineeringItemLinkType =
	(typeof ENGINEERING_ITEM_LINK)[keyof typeof ENGINEERING_ITEM_LINK];

export type CreateEpicPayload = {
	title: string;
	description?: string;
	estimated_completion_date?: string;
	priority: Priority;
	item_type: 'epic';
};
export type GetEpicPayload = { orgId: string; epicId: number };
export const mapEpic = (epic: ApiEpic): Epic => {
	return {
		name: epic.title,
		progress: 0,
		epicId: epic.id,
		startDate: epic.start_date || '-',
		endDate: epic.estimated_completion_date,
		priority: epic.priority,
		description: epic.description,
	};
};

export const createEpic = async ({
	orgId,
	data,
}: {
	orgId: string;
	data: CreateEpicPayload;
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
		throw await res.json();
	}
	return await res.json();
};

export const getEpics = async (
	orgId: string,
	search?: string
): Promise<Epic[]> => {
	let url = `${BASE_URL}/${orgId}/engineering?item_type=epic`;
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
	// TODO: handle pagination, return cursor
	return results.items.map(mapEpic);
};

export const getEpic = async ({
	orgId,
	epicId,
}: GetEpicPayload): Promise<Epic> => {
	const res = await fetch(`${BASE_URL}/${orgId}/engineering/${epicId}`, {
		headers: {
			...getAuthHeaders(),
		},
	});
	if (!res.ok) {
		throw await res.json();
	}
	const epic = await res.json();
	return mapEpic(epic);
};

export const deleteEpic = async ({ orgId, epicId }: GetEpicPayload) => {
	const res = await fetch(`${BASE_URL}/${orgId}/engineering/${epicId}`, {
		headers: {
			...getAuthHeaders(),
		},
		method: 'DELETE',
	});
	if (!res.ok) {
		throw await res.json();
	}

	return await res.json();
};

export const linkStoryToEpic = async ({
	orgId,
	epicId,
	storyId,
}: {
	orgId: string;
	epicId: number;
	storyId: number;
}) => {
	const res = await fetch(`${BASE_URL}/${orgId}/engineering/${epicId}/links`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			...getAuthHeaders(),
		},
		body: JSON.stringify({
			item_id: storyId,
			link_type: ENGINEERING_ITEM_LINK.subtask,
		}),
	});
	if (!res.ok) {
		throw await res.json();
	}
	return await res.json();
};

export const removeLinkStoryToEpic = async ({
	orgId,
	epicId,
	storyId,
}: {
	orgId: string;
	epicId: number;
	storyId: number;
}) => {
	const res = await fetch(`${BASE_URL}/${orgId}/engineering/${epicId}/links`, {
		method: 'DELETE',
		headers: {
			'Content-Type': 'application/json',
			...getAuthHeaders(),
		},
		body: JSON.stringify({
			item_id: storyId,
		}),
	});
	if (!res.ok) {
		throw await res.json();
	}
	return await res.json();
};

export const getRelatedStories = async (
	orgId: string,
	epicId: number
): Promise<Story[]> => {
	const url = `${BASE_URL}/${orgId}/engineering?item_type=story&related_item_id=${epicId}`;

	const res = await fetch(url, {
		headers: {
			...getAuthHeaders(),
		},
	});
	if (!res.ok) {
		throw await res.json();
	}

	const results = await res.json();
	return results.items.map(mapRawStory);
};
