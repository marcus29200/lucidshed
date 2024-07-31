import { BASE_URL } from '../environment'
import { getAuthHeaders } from './utils'


export const createEpic = async ({ orgId, data }) => {
  const res = await fetch(`${BASE_URL}/${data.orgId}/engineering`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
    body: JSON.stringify(
      data
    )
  })
  // TODO: add error handling of some kind here...
  return await res.json()

}

export const getEpics = async ({ orgId, search }) => {
  let url = `${BASE_URL}/${orgId}/engineering`
  if (search) {
    url += `?search=${search}`
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
  return results.res.json();
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

