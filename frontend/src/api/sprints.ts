import { BASE_URL } from '../environment';
import { Story } from '../routes/stories/Stories';
import { mapRawStory, StoryAPI } from './stories';
import { getAuthHeaders } from './utils';

export type CreateSprintPayload = {
	title: string;
	description: string;
	status: string;
	start_date: string;
	end_date: string;
};

export type RawSprint = {
	title: string;
	description: string;
	status: null;
	start_date: Date;
	end_date: Date;
	created_by_id: string;
	modified_by_id: string;
	id: string;
	created_at: Date;
	modified_at: Date;
	deleted_at: null;
	deleted_by_id: null;
	organization_id: string;
};
export type Sprint = {
	id: string;
	title: string;
	description: string;
	status: string;
	startDate: string;
	endDate: string;
};

export const mapPayloadToSprint = (
	rawSprint: RawSprint | null
): Sprint | null => {
	if (!rawSprint) return null;
	return {
		id: rawSprint.id,
		title: rawSprint.title,
		description: rawSprint.description,
		status: rawSprint.status ?? '',
		startDate: rawSprint.start_date.toString(),
		endDate: rawSprint.end_date.toString(),
	};
};
export const createSprint = async ({ orgId, data }) => {
	const res = await fetch(`${BASE_URL}/${orgId}/iterations`, {
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
	const iter = await res.json();
	return mapPayloadToSprint(iter);
};

export const getSprints = async (orgId: string): Promise<Sprint[]> => {
	const res = await fetch(`${BASE_URL}/${orgId}/iterations`, {
		headers: {
			'Content-Type': 'application/json',
			...getAuthHeaders(),
		},
	});
	if (!res.ok) {
		throw res;
	}
	if (res.status === 404) {
		return [];
	}
	const payload = await res.json();
	return payload.items
		.map((iter: RawSprint) => mapPayloadToSprint(iter))
		.sort((a, b) => a.title.localeCompare(b.title));
};

export const getSprint = async (orgId: string, iterId: string) => {
	const res = await fetch(`${BASE_URL}/${orgId}/iterations/${iterId}`, {
		headers: {
			'Content-Type': 'application/json',
			...getAuthHeaders(),
		},
	});
	const payload = await res.json();
	return mapPayloadToSprint(payload);
};

export const patchSprint = async ({ orgId, sprintId, data }) => {
	const res = await fetch(`${BASE_URL}/${orgId}/iterations/${sprintId}`, {
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

	const iter = await res.json();
	return mapPayloadToSprint(iter);
};

export const deleteSprint = async ({ orgId, sprintId }) => {
	const res = await fetch(`${BASE_URL}/${orgId}/iterations/${sprintId}`, {
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

export const getStoriesForSprint = async ({
	orgId,
	sprintId,
}): Promise<Story[]> => {
	const res = await fetch(
		`${BASE_URL}/${orgId}/engineering?iteration_id=${sprintId}`,
		{
			method: 'GET',
			headers: {
				...getAuthHeaders(),
			},
		}
	);
	if (!res.ok) {
		throw await res.json();
	}
	const storiesPage: { items: StoryAPI[] } = await res.json();
	return storiesPage.items.map(mapRawStory);
};
