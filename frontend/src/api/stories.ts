import { BASE_URL } from '../environment'
import { getAuthHeaders } from './utils'

export type CreateStoryPayload = {
  title: string;
  description?: string;
  estimated_completion_date?: string;
  priority?: 'critical' | 'high' | 'medium' | 'low';
  item_type: 'story';
}

export const createStory = async ({ orgId, data }: { orgId: string, data: CreateStoryPayload }) => {
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
    throw res;
  }
  return await res.json()
}

export const getStories = async (orgId: string, search?: string, iterationId?: string) => {
  let url = `${BASE_URL}/${orgId}/engineering?item_type=story`
  if (search) {
    url += `&search=${search}`
  }

  if (iterationId) {
    url += `&iteration_id=${iterationId}`

  }

  console.log(getAuthHeaders())
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
  return results?.items;
}

export const getStory = async (orgId: string, storyId: string) => {
  const res = await fetch(
    `${BASE_URL}/${orgId}/engineering/${storyId}`,
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


export const updateStory = async ({ orgId, storyId, data }) => {
  const res = await fetch(
    `${BASE_URL}/${orgId}/engineering/${storyId}`,
    {
      method: "PATCH",
      headers: {
        ...getAuthHeaders(),
      },
      body: JSON.stringify(data)
    }
  )
  if (!res.ok) {
    throw await res.json()
  }
  return await res.json();
}

export const deleteStory = async ({ orgId, storyId }) => {
  const res = await fetch(
    `${BASE_URL}/${orgId}/engineering/${storyId}`,
    {
      method: "DELETE",
      headers: {
        ...getAuthHeaders(),
      },
    }
  )
  if (!res.ok) {
    throw await res.json();
  }

  return;
}
