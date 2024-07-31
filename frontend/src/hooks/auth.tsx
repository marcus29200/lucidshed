import { createContext, useContext, useState } from "react";
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
  user: any;
  storeUser(userPayload: { token: string, refreshToken: string, username: string }): void;
  getUser(): void;
  clearUser(): void;
}

export const AuthContext = createContext<AuthContextValue | null>(null)

// I need a (me) route
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(getUser())
  // attempt to set user on startup


  // TODO: put these into types yo
  // TODO: better solution than local storage?
  function storeUser({ token, user }: { token: any, user: any }) {
    console.log(jwtDecode(token.access_token))
    localStorage.setItem('token', token?.access_token)
    localStorage.setItem('userId', user.id)
    setUser(user);
  }

  function clearUser() {
    localStorage.removeItem('token')
    localStorage.removeItem('username')
  }

  function updateUserPermissionsBlock(permissions) {
    setUser({ ...user, permissions })
  }

  // how to get user from the 
  function getUser() {
    const userToken = localStorage.getItem("token")
    if (!userToken) {
      return null
    }

    return jwtDecode(userToken)
  }

  const value = {
    user,
    storeUser,
    getUser,
    clearUser,
    updateUserPermissionsBlock
  };

  return <AuthContext.Provider value={value}> {children} </AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};



