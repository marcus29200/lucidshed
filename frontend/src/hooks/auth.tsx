import { createContext, useContext, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { getUserWithinOrganization as getUserFromApi } from "../api/users";

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
  user: any;
  storeUser(userPayload: { token: string, refreshToken: string, username: string }): void;
  getUser(): void;
  clearUser(): void;
}

export const AuthContext = createContext<AuthContextValue | null>(null)

// I need a (me) route
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>()
  // attempt to set user on startup


  // TODO: put these into types yo
  // TODO: better solution than local storage?
  function storeUserAndToken({ token, user }: { token: any, user: any }) {
    localStorage.setItem('token', token?.access_token)
    setUser(user);
  }

  function updateUser(user) {
    setUser(user)
  }

  function clearUser() {
    localStorage.removeItem('token')
  }

  function updateUserPermissionsBlock(permissions) {
    setUser({ ...user, permissions })
  }

  // how to get user from the 
  async function getUser() {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      return null
    }
    return getUserFromApi(userId as string)
  }

  const value = {
    user,
    storeUser: storeUserAndToken,
    updateUser,
    getUser,
    clearUser,
    updateUserPermissionsBlock
  };

  return <AuthContext.Provider value={value}> {children} </AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};



