import { BASE_URL } from '../environment';
import { getAuthHeaders } from './utils';
const companiesUrl = 'companies';

export type Company = {
	id: string;
	name: string;
	description?: string;
};

export const createCompany = async ({
	orgId,
	data,
}: {
	orgId: string;
	data: Omit<Company, 'id'>;
}): Promise<Company> => {
	const res = await fetch(`${BASE_URL}/${orgId}/${companiesUrl}`, {
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

export const getCompanies = async (
	orgId: string,
	search?: string
): Promise<Company[]> => {
	let url = `${BASE_URL}/${orgId}/${companiesUrl}`;
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
	return page.items ?? [];
};

export const getCompanyDetail = async (
	orgId: string,
	companyId: string
): Promise<Company> => {
	const res = await fetch(`${BASE_URL}/${orgId}/${companiesUrl}/${companyId}`, {
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

export const deleteCompany = async (
	orgId: string,
	companyId: string
): Promise<unknown> => {
	const res = await fetch(`${BASE_URL}/${orgId}/${companiesUrl}/${companyId}`, {
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

export const updateCompany = async ({
	orgId,
	companyId,
	data,
}: {
	orgId: string;
	companyId: string;
	data: Partial<Company>;
}) => {
	const res = await fetch(`${BASE_URL}/${orgId}/${companiesUrl}/${companyId}`, {
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
