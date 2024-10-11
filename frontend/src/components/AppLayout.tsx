import { Box } from '@mui/material';
import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom';
import AppHeader from './AppHeader';

const AppLayout = () => {
	return (
		<Box sx={{ display: 'flex', height: '100vh' }}>
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
					<AppHeader></AppHeader>
					<Box sx={{ padding: '1rem', overflowY: 'auto' }}>
						<Outlet />
					</Box>
				</Box>
			</Box>
		</Box>
	);
};

export default AppLayout;
