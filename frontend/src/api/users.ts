import { BASE_URL } from "../environment";
import { getAuthHeaders } from "./utils";

export type User = {
  email: string;
  firstName?: string;
  lastName?: string;
  permissions?: UserPermissions; // if no permissions, they don't have an org
  picture?: string;
  disabled: false;
  super_admin: boolean;
}

export type UserPermissions = {
  organizationId?: string;
  id: string;
  role: string; // TODO: make this an enum
}

export const getUser = async (id: string): Promise<User> => {
  const res = await fetch(`${BASE_URL}/users/${id}`, { headers: getAuthHeaders() })
  if (!res.ok) {
    throw (await res.json())
  }

}
