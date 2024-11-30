import { BASE_URL } from '../environment';
import { getAuthHeaders } from './utils';
import dayjs from 'dayjs';
const featureRequestsUrl = 'feature_requests';

const mapFeatureRequestResponse = (response) => ({
	id: response.id,
	title: response.title,
	description: response.description,
	status: response.status,
	requester: response.submitted_by_id,
	submittedDate: dayjs(response.created_at).format('MMM DD, YYYY'),
	assignedTo: response.assigned_to_id,
	company: '-',
});

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
	return page.items.map(mapFeatureRequestResponse);
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
	requestId: number
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

export const updateFeatureRequest = async ({
	orgId,
	requestId,
	data,
}: {
	orgId: string;
	requestId: number;
	data;
}) => {
	const res = await fetch(
		`${BASE_URL}/${orgId}/${featureRequestsUrl}/${requestId}`,
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
