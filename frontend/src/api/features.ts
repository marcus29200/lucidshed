import { BASE_URL } from '../environment';
import { FeatureListFormProps } from '../routes/features/FeatureDetails';
import { getAuthHeaders } from './utils';
const featuresUrl = 'features';

const mapFeatureResponse = (response) => ({
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
	return page.items.map(mapFeatureResponse);
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
	featureId: number
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

export const updateFeature = async ({
	orgId,
	featureId,
	data,
}: {
	orgId: string;
	featureId: number;
	data;
}) => {
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
