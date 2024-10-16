import { Box } from '@mui/material';

const FullHeightSection = ({ children, style = {}, className = '' }) => (
	<Box
		sx={{
			minHeight: '100%',
			backgroundColor: 'white',
			borderRadius: '4px',
			...style,
		}}
		className={`${className}`}
	>
		{children}
	</Box>
);

export default FullHeightSection;
