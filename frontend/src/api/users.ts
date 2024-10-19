import { LoaderFunctionArgs } from 'react-router-dom';
import { BASE_URL } from '../environment';
import { getAuthHeaders } from './utils';
import { QueryClient, queryOptions } from '@tanstack/react-query';

export type User = {
	id: string;
	email: string;
	firstName: string;
	lastName?: string;
	organizationId?: string;
	role?: string; // TODO: make this an enum
	picture?: string;
	disabled: boolean;
	superAdmin: boolean;
	fullName: string;
};
export type Permission = {
	organization_id: string;
	user_id: string;
	disabled: boolean;
	role: string;
	id: string;
	created_at: string;
	created_by_id: string;
	modified_at: string;
	modified_by_id: string;
	deleted_at: string;
	deleted_by_id: string;
};
export type ApiUser = {
	email: string;
	first_name: string;
	last_name: string;
	disabled: boolean;
	permissions: Permissions;
	title: string;
	team: string;
	phone: string;
	location: string;
	timezone: string;
	bio: string;
	picture: string;
	settings: unknown;
	id: string;
	created_at: string;
	created_by_id: string;
	modified_at: string;
	modified_by_id: string;
	deleted_at: string;
	deleted_by_id: string;
	super_admin: boolean;
};
export type Permissions = {
	[key: string]: OrganizationPermissions;
};

export type OrganizationPermissions = {
	organization_id?: string;
	id: string;
	role: string; // TODO: make this an enum
};

export type EditUserPayload = {
	id: string;
	data: {
		first_name?: string;
		last_name?: string;
		bio?: string;
		title?: string;
	};
};

export const meQuery = () =>
	queryOptions({
		queryKey: ['me'],
		queryFn: async () => getMe(),
	});
export const loader = (queryClient: QueryClient) => {
	return async () => {
		return queryClient.ensureQueryData(meQuery());
	};
};

export const isPermissionsEmpty = (permissions: Permissions) => {
	return Object.keys(permissions).length === 0;
};
// TODO: type the api response
// could be a class to avoid excessive mapping
export const mapUser = (apiUser: ApiUser): User | undefined => {
	if (!apiUser) {
		return undefined;
	}
	// TODO: pull the proper org id based on the currently active org
	const permissions = apiUser.permissions
		? Object.values(apiUser.permissions)[0]
		: ({} as Permissions);
	return {
		id: apiUser.id,
		email: apiUser.email,
		firstName: apiUser.first_name,
		lastName: apiUser.last_name,
		role: permissions?.role as string,
		organizationId: permissions?.organization_id as string,
		disabled: apiUser.disabled,
		superAdmin: apiUser.super_admin,
		fullName: `${apiUser.first_name}${
			apiUser.last_name ? ` ${apiUser.last_name}` : ''
		}`,
	};
};

export const getMe = async (): Promise<User | undefined> => {
	const res = await fetch(`${BASE_URL}/users/me`, {
		headers: getAuthHeaders(),
	});
	if (!res.ok) {
		throw res;
	}
	const user = await res.json();
	return mapUser(user);
};

export const getUserWithinOrganization = async (
	id: string
): Promise<User | undefined> => {
	const orgId = localStorage.getItem('orgId');
	const res = await fetch(`${BASE_URL}/${orgId}/users/${id}`, {
		headers: getAuthHeaders(),
	});
	if (!res.ok) {
		throw await res.json();
	}
	const user = await res.json();
	return mapUser(user);
};

export const patchUser = async ({ id, data }: EditUserPayload) => {
	const res = await fetch(`${BASE_URL}/users/${id}`, {
		method: 'PATCH',
		headers: {
			'Content-Type': 'application/json',
			...getAuthHeaders(),
		},
		body: JSON.stringify(data),
	});

	// TODO: implement error handling

	return await res.json();
};

export const getUser = async (id: string): Promise<User | undefined> => {
	const res = await fetch(`${BASE_URL}/users/${id}`, {
		headers: getAuthHeaders(),
	});
	if (!res.ok) {
		throw res;
	}
	const user = await res.json();
	return mapUser(user);
};

export const getUsers = async (orgId: string): Promise<User[]> => {
	const res = await fetch(`${BASE_URL}/${orgId}/users`, {
		headers: getAuthHeaders(),
	});
	if (!res.ok) {
		throw res;
	}
	const usersPage = await res.json();
	return usersPage.items.map(mapUser);
};

export const usersQuery = (id: string) =>
	queryOptions({
		queryKey: ['users'],
		queryFn: async () => getUsers(id),
	});

export const usersLoader = (queryClient: QueryClient) => {
	return async ({ params }: LoaderFunctionArgs) => {
		if (!params.orgId) {
			throw new Error('No orgId in params');
		}
		return queryClient.ensureQueryData(usersQuery(params.orgId));
	};
};
