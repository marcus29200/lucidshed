import { BASE_URL } from '../environment'
import { getAuthHeaders } from './utils'

export type CreateEpicPayload = {
  title: string;
  description?: string;
  estimated_completion_date?: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  item_type: 'epic';
}

export const createEpic = async ({ orgId, data }: { orgId: string, data: CreateEpicPayload }) => {
  const res = await fetch(`${BASE_URL}/${orgId}/engineering`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
    body: JSON.stringify(
      data
    )
  })
  if (!res.ok) {
    console.log(await res.json());
  }
  // TODO: add error handling of some kind here...
  return await res.json()

}

export const getEpics = async (orgId: string, search?: string) => {
  let url = `${BASE_URL}/${orgId}/engineering?item_type=epic`
  if (search) {
    url += `&search=${search}`
  }

  const res = await fetch(
    url,
    {
      headers: {
        ...getAuthHeaders(),
      }
    }
  )
  if (!res.ok) {
    throw await res.json()
  }

  const results = await res.json();
  // TODO: handle pagination, return cursor
  return results.items;
}

export const getEpic = async ({ orgId, epicId }) => {
  const res = await fetch(
    `${BASE_URL}/${orgId}/engineering/${epicId}`,
    {
      headers: {
        ...getAuthHeaders(),
      }
    }
  )
  if (!res.ok) {
    throw await res.json()
  }

  return await res.json();
}

