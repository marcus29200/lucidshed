import { BASE_URL } from "../environment";
import { getAuthHeaders } from "./utils";

export type User = {
  email: string;
  firstName?: string;
  lastName?: string;
  organizationId?: string;
  role?: string; // TODO: make this an enum bruv
  // permissions?: UserPermissions; // if no permissions, they don't have an org
  picture?: string;
  disabled: false;
  superAdmin: boolean;
}

export type UserPermissions = {
  organizationId?: string;
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

// TODO: type the api response
export const mapUser = (apiUser): User => {
  return {
    email: apiUser.email,
    firstName: apiUser.first_name,
    lastName: apiUser.last_name,
    role: apiUser?.permissions?.role,
    organizationId: apiUser?.permissions?.organizationId,
    disabled: apiUser.disabled,
    superAdmin: apiUser.super_admin
  }
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
