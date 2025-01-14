import { useLocation, useNavigate } from 'react-router-dom';
import { useEnabledRoutes } from '../hooks/enabledRoutes';

const TopBarNavigation: React.FC = () => {
	const { enabledRoutes: items } = useEnabledRoutes();
	const location = useLocation();
	const navigate = useNavigate();

	const isActive = (route: string) => {
		return location.pathname.includes(route);
	};

	const handleNavigation = (route: string) => {
		navigate(route);
	};

	const normalizeRouteLabel = (route: string): string => {
		return route.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
	};

	const navigationHidden = !items.length || items.includes('dashboard');
	if (navigationHidden) {
		return null;
	}
	return (
		<nav className={`pb-4 rounded-md`}>
			<ul className="flex gap-4 p-4 bg-white rounded-md">
				{items.map((item) => (
					<li
						key={item}
						onClick={() => handleNavigation(item)}
						className={`transition-colors duration-200 px-3 text-neutral-900 py-1 rounded-md cursor-pointer ${
							isActive(item) && 'bg-primary/10 font-semibold !text-primary'
						}`}
					>
						<span className="capitalize">{normalizeRouteLabel(item)}</span>
					</li>
				))}
			</ul>
		</nav>
	);
};
export default TopBarNavigation;
