import { QueryClient, queryOptions } from '@tanstack/react-query';
import { BASE_URL } from '../environment';
import { getAuthHeaders } from './utils';
import { LoaderFunctionArgs } from 'react-router-dom';
import { StoryAPI } from './stories';
// TODO: replace environment BASE_URL with .env file

export type CreateOrganizationParams = {
	id: string;
	title: string;
};

export type Organization = {
	id: string;
	title: string;
	disabled: boolean;
	createdAt: string;
	deletedAt: string;
	modifiedAt: string;
};

const mapApiOrgToOrganization = (org) => {
	return {
		id: org.id,
		title: org.title,
		disabled: org.disabled,
		createdAt: org.created_at,
		modifiedAt: org.modified_at,
		deletedAt: org.deleted_at,
	};
};

export const organizationQuery = (id: string) =>
	queryOptions({
		queryKey: ['org'],
		queryFn: async () => getOrganization(id),
	});

export const organizationLoader = (queryClient: QueryClient) => {
	return async ({ params }: LoaderFunctionArgs) => {
		if (!params.orgId) {
			throw new Error('No orgId in params');
		}
		return queryClient.ensureQueryData(organizationQuery(params.orgId));
	};
};

export const createOrganization = async ({
	id,
	title,
}: CreateOrganizationParams): Promise<Organization> => {
	const response = await fetch(`${BASE_URL}/`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			...getAuthHeaders(),
		},
		body: JSON.stringify({
			id,
			title,
		}),
	});
	if (!response.ok) {
		throw await response.json();
	}
	return mapApiOrgToOrganization(await response.json());
};

export const getOrganization = async (
	organizationId?: string
): Promise<Organization> => {
	if (!organizationId) {
		throw 'No organizationId present';
	}
	const res = await fetch(`${BASE_URL}/${organizationId}`, {
		headers: getAuthHeaders(),
	});

	if (!res.ok) {
		throw res;
	}

	return mapApiOrgToOrganization(await res.json());
};

export const askLucidAI = async (
	organizationId: string,
	query: string
): Promise<{ summary?: string; related_items: StoryAPI[] }> => {
	const res = await fetch(
		`${BASE_URL}/${organizationId}/engineering/ask-lucid`,
		{
			headers: {
				'Content-Type': 'application/json',
				...getAuthHeaders(),
			},
			method: 'POST',
			body: JSON.stringify({
				query,
			}),
		}
	);

	if (!res.ok) {
		throw res;
	}

	return await res.json();
};
