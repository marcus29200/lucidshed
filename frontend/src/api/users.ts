import { BASE_URL } from "../environment";
import { getAuthHeaders } from "./utils";
import { QueryClient, queryOptions } from '@tanstack/react-query';

export type User = {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  organizationId?: string;
  role?: string; // TODO: make this an enum
  picture?: string;
  disabled: false;
  superAdmin: boolean;
}

export type Permissions = {
  [key: string]: OrganizationPermissions
}

export type OrganizationPermissions = {
  organization_id?: string;
  id: string;
  role: string; // TODO: make this an enum
}

export type EditUserPayload = {
  id: string
  data: {
    first_name?: string;
    last_name?: string;
    bio?: string;
    title?: string;
  }
}

export const meQuery = () => queryOptions({
  queryKey: ['me'],
  queryFn: async () => getMe()
})
export const loader = (queryClient: QueryClient) => {
  return async () => {
    return queryClient.ensureQueryData(meQuery())
  }
}

export class UserNotLoggedIn extends Error { }

export const isPermissionsEmpty = (permissions: Permissions) => {
  return Object.keys(permissions).length === 0
}

// TODO: type the api response
// could be a class to avoid excessive mapping
export const mapUser = (apiUser): User => {
  // TODO: pull the proper org id based on the currently active org
  const permissions = apiUser.permissions ? Object.values(apiUser.permissions)[0] : {} as Permissions
  return {
    id: apiUser.id,
    email: apiUser.email,
    firstName: apiUser.first_name,
    lastName: apiUser.last_name,
    role: permissions?.role,
    organizationId: permissions?.organization_id,
    disabled: apiUser.disabled,
    superAdmin: apiUser.super_admin
  }
}

export const getMe = async (): Promise<User> => {
  const res = await fetch(`${BASE_URL}/users/me`, { headers: getAuthHeaders() })
  if (!res.ok) {
    throw res;
  }
  const user = await res.json();
  console.log("the user: ", user);
  return mapUser(user);
}

// TODO: rename this to be getUserWithinOrganization
export const getUser = async (id: string): Promise<User> => {
  // TODO: this needs to be fixed
  const orgId = localStorage.getItem('orgId');
  const res = await fetch(`${BASE_URL}/${orgId}/users/${id}`, { headers: getAuthHeaders() })
  if (!res.ok) {
    throw (await res.json())
  }
  const user = await res.json();
  console.log("the user: ", user)
  return mapUser(user);
}

export const patchUser = async ({ id, data }: EditUserPayload) => {
  const res = await fetch(`${BASE_URL}/users/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
    body: JSON.stringify(data)
  })

  // TODO: implement error handling

  return await res.json()

}
