import { BASE_URL } from '../environment'
import { getAuthHeaders } from './utils';

// TODO: replace environment BASE_URL with .env file

export type CreateOrganizationParams = {
  id: string;
  title: string;
}

export type Organization = {
  id: string;
  title: string;
  disabled: boolean;
  createdAt: string;
  deletedAt: string;
  modifiedAt: string;
}

const mapApiOrgToOrganization = (org) => {
  return {
    id: org.id,
    title: org.title,
    disabled: org.disabled,
    createdAt: org.created_at,
    modifiedAt: org.modified_at,
    deletedAt: org.deleted_at
  }
}

export const createOrganization = async ({ id, title }: CreateOrganizationParams): Promise<Organization> => {
  const response = await fetch(`${BASE_URL}/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
    body: JSON.stringify({
      id,
      title
    })
  })
  if (!response.ok) {
    throw (await response.json());
  }
  return mapApiOrgToOrganization(await response.json());

}

export const getOrganization = async (organizationId?: string): Promise<Organization> => {
  if (!organizationId) {
    throw "No organizationId present"
  }
  const response = await fetch(`${BASE_URL}/${organizationId}`, { headers: getAuthHeaders() })

  if (!response.ok) {
    throw (await response.json());
  }

  return mapApiOrgToOrganization(await response.json());
}
