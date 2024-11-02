import { Dialog, DialogContent, DialogTitle } from '@mui/material';
import StoryForm from './StoryForm';
import { CreateStoryPayload } from '../../api/stories';

const MassEditStoriesDialog = ({
	open,
	onClose,
	onConfirm,
	confirmButton = 'Save',
	cancelButton = 'Cancel',
}: {
	open: boolean;
	onClose: () => void;
	onConfirm: (formData?: Omit<CreateStoryPayload, 'item_type'>) => void;
	confirmButton?: string;
	cancelButton?: string;
}) => {
	return (
		<>
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
					Update stories
				</DialogTitle>
				<DialogContent sx={{ fontFamily: 'Poppins, sans-serif' }}>
					<StoryForm
						onConfirm={onConfirm}
						confirmButton={confirmButton}
						cancelButton={cancelButton}
					/>
				</DialogContent>
			</Dialog>
		</>
	);
};

export default MassEditStoriesDialog;
