import { Box, Divider, IconButton, Toolbar, Typography } from '@mui/material';
import UserComponent from './UserComponent';
import { useLoaderData } from 'react-router-dom';
import { Organization } from '../api/organizations';
import { ExpandMore, People } from '@mui/icons-material';

const AppHeader = (props: { children?: React.ReactNode }) => {
	const org = useLoaderData() as Organization;
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
			<div className="flex items-center justify-center gap-4 cursor-pointer hover:text-primary transition-colors duration-300">
				<div className="flex items-center gap-2">
					<People />
					{/* TODO: implement select dropdown */}
					<span>All teams</span>
					<IconButton
						sx={{ zIndex: 10, alignSelf: 'flex-start' }}
						onClick={(e) => e.preventDefault()}
					>
						<ExpandMore />
					</IconButton>
				</div>
			</div>

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
