import { createContext, useContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

// just a subset of fields on the JWT right now
export type User = {
  sub: string,
  email: string,
  organizationIds: string[],
  organizationSlugs: string[],
  teamIds: string[],
  teamSlugs: string[],
}

type AuthContextValue = {
  user: User | null;
  storeUser(userPayload: { token: string, refreshToken: string, username: string }): void;
  getUser(): void;
  clearUser(): void;

}

export const AuthContext = createContext<AuthContextValue | null>(null)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(getUser())
  // attempt to set user on startup


  // TODO: better solution than local storage?
  function storeUser({ token, refreshToken, username }: { token: string, refreshToken: string, username: string }) {
    localStorage.setItem('token', token)
    localStorage.setItem('refreshToken', refreshToken)
    localStorage.setItem('username', username)
    setUser(jwtDecode(token))
  }

  function clearUser() {
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('username')
  }

  function getUser() {
    const userToken = localStorage.getItem("token")
    if (!userToken) {
      return null
    }

    return jwtDecode(userToken) as User
  }

  const value = {
    user,
    storeUser,
    getUser,
    clearUser,
  };

  return <AuthContext.Provider value={value}> {children} </AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};



