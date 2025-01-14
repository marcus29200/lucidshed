import { useContext } from 'react';
import { EnabledRoute, EnabledRoutesContext } from './enabledRoutesProvider';

export const useEnabledRoutes = () => {
	return useContext(EnabledRoutesContext) as EnabledRoute;
};
