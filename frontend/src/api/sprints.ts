import { BASE_URL } from '../environment';
import { getAuthHeaders } from './utils';


export type CreateSprintPayload = {
  title: string;
  description: string;
  status: string;
  start_date: string;
  end_date: string;
}

export type RawSprint = {
  title: string;
  description: string;
  status: string;
  start_date: string;
  end_date: string;
  organization_id: string;
}

export type Sprint = {
  title: string;
  description: string;
  status: string;
  startDate: string;
  endDate: string;
  organizationId: string;
}

export const mapPayloadToSprint = (rawSprint: RawSprint) => {
  return {
    title: rawSprint.title,
    description: rawSprint.description,
    status: rawSprint.status,
    startDate: rawSprint.start_date,
    endDate: rawSprint.end_date,
    organizationId: rawSprint.organization_id,
  }

}
export const createSprint = async ({ orgId, data }) => {
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
  return mapPayloadToSprint(iter);
}

export const getSprints = async (orgId: string) => {
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
  return payload.items.map((iter: RawSprint) => mapPayloadToSprint(iter));
}

export const getSprint = async (orgId: string, iterId: string) => {
  const res = await fetch(`${BASE_URL}/${orgId}/iterations/${iterId}`, {
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
  })
  const payload = await res.json();
  return payload.items.map((iter: RawSprint) => mapPayloadToSprint(iter));
}


export const patchSprint = async ({ orgId, sprintId, data }) => {
  const res = await fetch(`${BASE_URL}/${orgId}/iterations/${sprintId}`, {
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
  return mapPayloadToSprint(iter);
}

export const deleteSprint = async ({ orgId, sprintId }) => {
  const res = await fetch(`${BASE_URL}/${orgId}/iterations/${sprintId}`, {
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



