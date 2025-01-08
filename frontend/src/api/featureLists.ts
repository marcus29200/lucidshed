import { BASE_URL } from '../environment';
import { getAuthHeaders } from './utils';
const featureListsUrl = 'feature_lists';

const mapFeatureListResponse = (response) => ({
	id: response.id,
	title: response.title,
	description: response.description,
	requests: response.requests,
	reach: response.reach,
	impact: response.impact,
	confidence: response.confidence,
	effort: response.effort,
	growth: response.growth,
	priority: response.priority,
});

export const createFeatureList = async ({
	orgId,
	data,
}: {
	orgId: string;
	data;
}): Promise<unknown> => {
	const res = await fetch(`${BASE_URL}/${orgId}/${featureListsUrl}`, {
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

export const getFeatureLists = async (
	orgId: string,
	search?: string
): Promise<unknown> => {
	let url = `${BASE_URL}/${orgId}/${featureListsUrl}`;
	if (search) {
		url += `&search=${search}`;
	}
	const res = await fetch(url, {
		method: 'GET',
		headers: {
			...getAuthHeaders(),
		},
	});
	if (!res.ok) {
		throw res;
	}
	const page = await res.json();
	return page.items.map(mapFeatureListResponse);
};

export const getFeatureListDetail = async (
	orgId: string,
	featureId: string
): Promise<unknown> => {
	const res = await fetch(
		`${BASE_URL}/${orgId}/${featureListsUrl}/${featureId}`,
		{
			method: 'GET',
			headers: {
				...getAuthHeaders(),
			},
		}
	);
	if (!res.ok) {
		throw res;
	}
	return await res.json();
};

export const deleteFeatureList = async (
	orgId: string,
	featureId: number
): Promise<unknown> => {
	const res = await fetch(
		`${BASE_URL}/${orgId}/${featureListsUrl}/${featureId}`,
		{
			method: 'DELETE',
			headers: {
				...getAuthHeaders(),
			},
		}
	);
	if (!res.ok) {
		throw res;
	}
	return await res.json();
};

export const updateFeatureList = async ({
	orgId,
	featureId,
	data,
}: {
	orgId: string;
	featureId: number;
	data;
}) => {
	const res = await fetch(
		`${BASE_URL}/${orgId}/${featureListsUrl}/${featureId}`,
		{
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json',
				...getAuthHeaders(),
			},
			body: JSON.stringify(data),
		}
	);
	if (!res.ok) {
		throw res;
	}
	return await res.json();
};
