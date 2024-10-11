import { Box, Divider, Toolbar, Typography } from '@mui/material';
import UserComponent from './UserComponent';
import { useLoaderData } from 'react-router-dom';

const AppHeader = (props: { children?: React.ReactNode }) => {
	const org = useLoaderData();
	return (
		<Toolbar
			sx={{
				height: '80px',
				minHeight: '80px !important',
				display: 'flex',
				backgroundColor: 'white',
				justifyContent: 'space-between',
				alignItems: 'center',
				borderBottom: '1px solid rgba(0,0,0,0.12)',
			}}
		>
			<Typography variant="h6" component="div">
				{org.title}
			</Typography>

			<Box sx={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
				{/* In theory the children here would be the action buttons to create a given
      object for each page this is used on */}
				{props.children}
				<Divider orientation="vertical" flexItem />
				<UserComponent />
			</Box>
		</Toolbar>
	);
};

export default AppHeader;
