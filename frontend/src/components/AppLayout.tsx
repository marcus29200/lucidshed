import { Box } from '@mui/material';
import Sidebar from './Sidebar';
import { Outlet, useParams } from 'react-router-dom';
import AppHeader from './AppHeader';
import { UsersContext } from '../hooks/users';
import { useQuery } from '@tanstack/react-query';
import { getUsers } from '../api/users';
import TopBarNavigation from './TopBarNavigation';
import { EnabledRoutesProvider } from '../hooks/enabledRoutesProvider';

const AppLayout = () => {
	const params = useParams();
	const { data } = useQuery({
		queryKey: ['users'],
		queryFn: async () => getUsers(params.orgId as string),
	});
	return (
		<Box sx={{ display: 'flex', height: '100vh' }}>
			<EnabledRoutesProvider>
				<Sidebar />
				<Box sx={{ flexGrow: 1, backgroundColor: '#E9EAEC' }}>
					<Box
						sx={{
							display: 'flex',
							flexDirection: 'column',
							height: '100%',
							width: '100%',
						}}
					>
						<AppHeader />
						<Box
							sx={{
								padding: '1rem',
								overflowY: 'auto',
								overflowX: 'hidden',
								height: '100%',
							}}
						>
							<UsersContext.Provider value={data ?? []}>
								<TopBarNavigation />
								<Outlet />
							</UsersContext.Provider>
						</Box>
					</Box>
				</Box>
			</EnabledRoutesProvider>
		</Box>
	);
};

export default AppLayout;
