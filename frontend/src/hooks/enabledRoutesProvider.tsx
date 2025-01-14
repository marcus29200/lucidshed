import { createContext, useState } from 'react';
export type EnabledRoute = {
	enabledRoutes: string[];
	updatePaths: (paths: string[]) => void;
};
export const EnabledRoutesContext = createContext<EnabledRoute | null>(null);

export const EnabledRoutesProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const [enabledRoutes, setEnabledRoutes] = useState<string[]>([]);

	const updatePaths = (paths: string[]): void => {
		setEnabledRoutes(() => paths);
	};

	const value: EnabledRoute = {
		enabledRoutes,
		updatePaths,
	};

	return (
		<EnabledRoutesContext.Provider value={value}>
			{children}
		</EnabledRoutesContext.Provider>
	);
};
