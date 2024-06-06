const USER_API_BASE = "http://localhost:9999/api"

type StandardAuthParams = {
  email: string
  password: string
}

export const login = async ({ email, password }: StandardAuthParams) => {
  const response = await fetch(`${USER_API_BASE}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      password
    })
  })
  if (!response.ok) {
    throw (await response.json());
  }
  return await response.json();

}

export const register = async ({ email, password }: StandardAuthParams) => {
  const response = await fetch(`${USER_API_BASE}/auth/registration`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      password
    })
  })
  if (!response.ok) {
    throw (await response.json());
  }
  return await response.json();
}
