import { BASE_URL } from '../environment';
import { FeatureRequestFormProps } from '../routes/featureRequests/FeatureRequest';
import { getAuthHeaders } from './utils';
import dayjs from 'dayjs';
const featureRequestsUrl = 'feature_requests';

export const mapFeatureRequestResponse = (response) => ({
	id: response.id,
	title: response.title,
	description: response.description,
	status: response.status,
	requester: response.submitted_by_id,
	submittedBy: response.submitted_by_id,
	submittedDate: dayjs(response.created_at).format('MMM DD, YYYY'),
	assignedTo: response.assigned_to_id,
	companyId: response.company_id,
	company: '-',
	featureAssigned: response.feature_assigned,
	tags: null,
	featureAssignedName: null,
});

export const createFeatureRequest = async ({
	orgId,
	data,
}: {
	orgId: string;
	data;
}): Promise<Omit<FeatureRequestFormProps, 'tags' | 'featureAssignedName'>> => {
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
	const request = await res.json();
	return mapFeatureRequestResponse(request);
};

export const getFeatureRequests = async (
	orgId: string,
	search?: string
): Promise<FeatureRequestFormProps[]> => {
	let url = `${BASE_URL}/${orgId}/${featureRequestsUrl}?sort=id`;
	if (search) {
		url += `?search=${search}`;
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

	return page.items.sort((a, b) => b.id - a.id).map(mapFeatureRequestResponse);
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

export const linkRequestToFeature = async ({
	orgId,
	requestId,
	featureId,
}: {
	orgId: string;
	requestId: number;
	featureId: number;
}) => {
	const res = await fetch(
		`${BASE_URL}/${orgId}/${featureRequestsUrl}/${requestId}/links`,
		{
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				...getAuthHeaders(),
			},
			body: JSON.stringify({
				feature_id: featureId,
			}),
		}
	);
	if (!res.ok) {
		throw await res.json();
	}
	return await res.json();
};

export const removeLinkRequestToFeature = async ({
	orgId,
	requestId,
	featureId,
}: {
	orgId: string;
	requestId: number;
	featureId: number;
}) => {
	const res = await fetch(
		`${BASE_URL}/${orgId}/${featureRequestsUrl}/${requestId}/links`,
		{
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json',
				...getAuthHeaders(),
			},
			body: JSON.stringify({
				feature_id: featureId,
			}),
		}
	);
	if (!res.ok) {
		throw await res.json();
	}
	return await res.json();
};
