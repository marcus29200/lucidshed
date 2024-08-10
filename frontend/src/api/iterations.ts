import { BASE_URL } from '../environment';
import { getAuthHeaders } from './utils';


export type CreateIterationPayload = {
  title: string;
  description: string;
  status: string;
  start_date: string;
  end_date: string;
}

export type RawIteration = {
  title: string;
  description: string;
  status: string;
  start_date: string;
  end_date: string;
  organization_id: string;
}

export type Iteration = {
  title: string;
  description: string;
  status: string;
  startDate: string;
  endDate: string;
  organizationId: string;
}

export const mapPayloadToIteration = (rawIteration: RawIteration) => {
  return {
    title: rawIteration.title,
    description: rawIteration.description,
    status: rawIteration.status,
    startDate: rawIteration.start_date,
    endDate: rawIteration.end_date,
    organizationId: rawIteration.organization_id,
  }

}
export const createIteration = async ({ orgId, data }) => {
  const res = await fetch(`${BASE_URL}/${orgId}/iterations`, {
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
  const iter = await res.json();
  return mapPayloadToIteration(iter);
}

export const getIterations = async (orgId: string) => {
  const res = await fetch(`${BASE_URL}/${orgId}/iterations`, {
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
  })
  if (!res.ok) {
    throw res;
  }
  const payload = await res.json();
  return payload.items.map((iter: RawIteration) => mapPayloadToIteration(iter));
}

export const getIteration = async (orgId: string, iterId: string) => {
  const res = await fetch(`${BASE_URL}/${orgId}/iterations/${iterId}`, {
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
  })
  const payload = await res.json();
  return payload.items.map((iter: RawIteration) => mapPayloadToIteration(iter));
}


export const patchIteration = async ({ orgId, iterationId, data }) => {
  const res = await fetch(`${BASE_URL}/${orgId}/iterations/${iterationId}`, {
    method: "PATCH",
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
    body: JSON.stringify(data)
  })
  if (!res.ok) {
    throw await res.json();
  }

  const iter = await res.json();
  return mapPayloadToIteration(iter);
}

export const deleteIteration = async ({ orgId, iterationId }) => {
  const res = await fetch(`${BASE_URL}/${orgId}/iterations/${iterationId}`, {
    method: "DELETE",
    headers: {
      ...getAuthHeaders()
    },
  })
  if (!res.ok) {
    throw await res.json();
  }

  return;
}



