import { BASE_URL } from '../environment';
import { getAuthHeaders } from './utils';

const featureRequestsUrl = 'feature_requests';

export const createFeatureRequest = async ({
	orgId,
	data,
}: {
	orgId: string;
	data;
}): Promise<unknown> => {
	const res = await fetch(`${BASE_URL}/${orgId}/${featureRequestsUrl}`, {
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

export const getFeatureRequests = async (
	orgId: string,
	search?: string
): Promise<unknown> => {
	let url = `${BASE_URL}/${orgId}/${featureRequestsUrl}`;
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
	return page.items;
};
export const getFeatureRequestDetail = async (
	orgId: string,
	requestId: string
): Promise<unknown> => {
	const res = await fetch(
		`${BASE_URL}/${orgId}/${featureRequestsUrl}/${requestId}`,
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

export const deleteFeatureRequest = async (
	orgId: string,
	requestId: string
): Promise<unknown> => {
	const res = await fetch(
		`${BASE_URL}/${orgId}/${featureRequestsUrl}/${requestId}`,
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

export const patchFeatureRequest = async (
	orgId: string,
	requestId: string,
	data
): Promise<unknown> => {
	const res = await fetch(
		`${BASE_URL}/${orgId}/${featureRequestsUrl}/${requestId}`,
		{
			method: 'DELETE',
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
