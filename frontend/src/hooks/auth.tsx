import { createContext, useContext, useState } from 'react';
import {
	ApiUser,
	getUserWithinOrganization as getUserFromApi,
} from '../api/users';

// just a subset of fields on the JWT right now
export type User = {
	sub: string;
	email: string;
	organizationIds: string[];
	organizationSlugs: string[];
	teamIds: string[];
	teamSlugs: string[];
};

export type AuthContextValue = {
	user;
	storeUser(userPayload: {
		// refreshToken: string;
		token: { access_token: string };
		user: ApiUser;
	}): void;
	getUser(): void;
	clearUser(): void;
	updateUser(user): void;
	storeToken(args: { token: { access_token: string } }): void;
	updateUserPermissionsBlock(permissions): void;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

// I need a (me) route
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const [user, setUser] = useState<ApiUser>();
	// attempt to set user on startup

	function storeToken({ token }) {
		localStorage.setItem('token', token?.access_token);
	}
	// TODO: put these into types yo
	// TODO: better solution than local storage?
	function storeUserAndToken({
		token,
		user,
	}: {
		token: { access_token: string };
		user: ApiUser;
	}) {
		localStorage.setItem('token', token?.access_token);
		setUser(user);
	}

	function updateUser(user) {
		setUser(user);
	}

	function clearUser() {
		localStorage.removeItem('token');
	}

	function updateUserPermissionsBlock(permissions) {
		setUser({ ...(user as ApiUser), permissions });
	}

	// how to get user from the
	async function getUser() {
		const userId = localStorage.getItem('userId');
		if (!userId) {
			return null;
		}
		return getUserFromApi(userId as string);
	}

	const value: AuthContextValue = {
		user,
		storeUser: storeUserAndToken,
		storeToken,
		updateUser,
		getUser,
		clearUser,
		updateUserPermissionsBlock,
	};

	return (
		<AuthContext.Provider value={value}> {children} </AuthContext.Provider>
	);
};

export const useAuth = () => {
	return useContext(AuthContext);
};
