import { BASE_URL } from '../environment'

type StandardAuthParams = {
  email: string
  password: string
}

export const login = async ({ email, password }: StandardAuthParams) => {
  const response = await fetch(`${BASE_URL}/users/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username: email,
      password
    })
  })
  if (!response.ok) {
    throw (await response.json());
  }
  return await response.json();

}

export const register = async (email: string) => {
  const response = await fetch(`${BASE_URL}/users/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
    })
  })
  if (!response.ok) {
    throw (await response.json());
  }
  return await response.json();
}

export const resetPassword = async (data: { password: string, reset_code: string }) => {
  const response = await fetch(`${BASE_URL}/users/reset-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      password: data.password,
      reset_code: data.reset_code
    })
  })
  if (!response.ok) {
    throw (await response.json());
  }
  return await response.json();

}
