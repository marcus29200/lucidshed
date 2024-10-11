import { TableRow, TableCell } from '@mui/material';
const EmptyRows = () => {
	return (
		<TableRow
			sx={{
				height: '90px',
			}}
			hover={false}
		>
			<TableCell
				colSpan={6}
				sx={{
					textAlign: 'center',
					fontSize: '1rem',
					lineHeight: '1.5',
					color: 'rgba(0, 0, 0, 0.6)',
				}}
			>
				No records to display
			</TableCell>
		</TableRow>
	);
};

export default EmptyRows;
