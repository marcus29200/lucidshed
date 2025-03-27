import { BASE_URL } from '../environment';
import { FeatureRequestFormProps } from '../routes/featureRequests/FeatureRequest';
import { FeatureListFormProps } from '../routes/features/FeatureDetails';
import { mapFeatureRequestResponse } from './featureRequests';
import { getAuthHeaders } from './utils';

const featuresUrl = 'features';

const mapFeatureResponse = async (response, orgId: string) => ({
	id: response.id,
	title: response.title,
	description: response.description,
	requests: response.requests,
	requestsCount: await getFeatureRequestsCount(orgId, response.id),
	reach: response.reach,
	impact: response.impact,
	confidence: response.confidence,
	effort: response.effort,
	growth: response.growth,
	priority: response.priority,
});

export const createFeature = async ({
	orgId,
	data,
}: {
	orgId: string;
	data;
}): Promise<unknown> => {
	const res = await fetch(`${BASE_URL}/${orgId}/${featuresUrl}`, {
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

export const getFeatures = async (
	orgId: string,
	search?: string
): Promise<FeatureListFormProps[]> => {
	let url = `${BASE_URL}/${orgId}/${featuresUrl}`;
	if (search) {
		url += `&search=${search}`;
	}
	const res = await fetch(url, {
		method: 'GET',
		headers: {
			...getAuthHeaders(),
		},
	});
	if (res.status === 404) {
		return [];
	}
	if (!res.ok) {
		throw res;
	}
	const page = await res.json();
	const promises = await Promise.all(
		page.items.map((item) => mapFeatureResponse(item, orgId))
	);
	return promises;
};

export const getFeatureDetail = async (
	orgId: string,
	featureId: string
): Promise<unknown> => {
	const res = await fetch(`${BASE_URL}/${orgId}/${featuresUrl}/${featureId}`, {
		method: 'GET',
		headers: {
			...getAuthHeaders(),
		},
	});
	if (!res.ok) {
		throw res;
	}
	return await res.json();
};

export const deleteFeature = async (
	orgId: string,
	featureId: string
): Promise<unknown> => {
	const res = await fetch(`${BASE_URL}/${orgId}/${featuresUrl}/${featureId}`, {
		method: 'DELETE',
		headers: {
			...getAuthHeaders(),
		},
	});
	if (!res.ok) {
		throw res;
	}
	return await res.json();
};

export const updateFeature = async ({ orgId, featureId, data }) => {
	const res = await fetch(`${BASE_URL}/${orgId}/${featuresUrl}/${featureId}`, {
		method: 'PATCH',
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

export const getAssignedRequestsToFeature = async (
	orgId: string,
	featureId: string
): Promise<Array<FeatureRequestFormProps>> => {
	const res = await fetch(
		`${BASE_URL}/${orgId}/${featuresUrl}/${featureId}/assigned-requests`,
		{
			method: 'GET',
			headers: {
				...getAuthHeaders(),
			},
		}
	);
	if (!res.ok) {
		console.error(res);
		return [];
	}
	if (res.status === 404) {
		return [];
	}
	const data: { items: unknown[] } = await res.json();
	return data.items.map(mapFeatureRequestResponse);
};

export const getFeatureRequestsCount = async (
	orgId: string,
	featureId: string
): Promise<number> => {
	const res = await fetch(
		`${BASE_URL}/${orgId}/${featuresUrl}/${featureId}/request-count`,
		{
			method: 'GET',
			headers: {
				...getAuthHeaders(),
			},
		}
	);
	if (!res.ok) {
		console.error(res);
		return 0;
	}
	if (res.status === 404) {
		return 0;
	}
	const { count } = await res.json();
	return count;
};
