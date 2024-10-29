import {
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Button,
} from '@mui/material';

export const ConfirmationDialog = ({
	children,
	open,
	onClose,
	onConfirm,
	title = 'Confirm Deletion',
	confirmButton = 'Delete',
	cancelButton = 'Cancel',
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
			<DialogContent sx={{ fontFamily: 'Poppins, sans-serif' }}>
				{children}
			</DialogContent>
			<DialogActions
				sx={{
					paddingX: '20px',
					fontFamily: 'Poppins, sans-serif',
				}}
			>
				<Button
					onClick={onConfirm}
					variant="contained"
					color="success"
					sx={{
						width: '100px',
						height: '40px',
						borderRadius: '10px',
						fontFamily: 'Poppins, sans-serif',
					}}
				>
					{confirmButton}
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
					{cancelButton}
				</Button>
			</DialogActions>
		</Dialog>
	);
};
