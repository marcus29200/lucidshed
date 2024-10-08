import {
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	Button,
} from '@mui/material';

export const DeleteDialog = ({
	open,
	onClose,
	onDelete,
	title = 'Confirm Deletion',
	description,
}) => {
	return (
		<Dialog
			open={open}
			onClose={onClose}
			PaperProps={{
				sx: {
					borderRadius: '12px',
					boxShadow:
						'0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
				},
			}}
			className="shadow-md"
		>
			<DialogTitle sx={{ fontFamily: 'Poppins, sans-serif' }}>
				{title}
			</DialogTitle>
			<DialogContent>
				<DialogContentText sx={{ fontFamily: 'Poppins, sans-serif' }}>
					{description}
				</DialogContentText>
			</DialogContent>
			<DialogActions
				sx={{
					paddingX: '20px',
					fontFamily: 'Poppins, sans-serif',
				}}
			>
				<Button
					onClick={onDelete}
					variant="contained"
					color="success"
					sx={{
						width: '100px',
						height: '40px',
						borderRadius: '10px',
						fontFamily: 'Poppins, sans-serif',
					}}
				>
					Delete
				</Button>
				<Button
					onClick={onClose}
					variant="outlined"
					sx={{
						width: '100px',
						height: '40px',
						borderRadius: '10px',
						fontFamily: 'Poppins, sans-serif',
					}}
				>
					Cancel
				</Button>
			</DialogActions>
		</Dialog>
	);
};
