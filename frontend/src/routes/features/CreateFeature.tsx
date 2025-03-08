import { Grid, FormControl, TextField, Box, Button } from '@mui/material';
import { memo } from 'react';
import { useForm, useController, SubmitHandler } from 'react-hook-form';
import DescriptionRichEditor from '../../components/DescriptionRichEditor';

import { useNavigate, useParams } from 'react-router-dom';
import { createFeature } from '../../api/features';

type FeatureListFormProps = {
	title: string;
	description?: string;
	requests: number;
};

const CreateFeature = memo(({ show }: { show: boolean }) => {
	const orgId = useParams().orgId as string;

	const { register, reset, handleSubmit, control } =
		useForm<FeatureListFormProps>();

	const descriptionField = useController({
		control,
		name: 'description',
		defaultValue: '',
	});

	const navigate = useNavigate();

	const onSubmit: SubmitHandler<FeatureListFormProps> = async (
		data: FeatureListFormProps
	) => {
		const payload = {
			title: data.title,
			description: data.description || '',
			requests: 0,
		};
		try {
			await createFeature({ orgId, data: payload });
		} catch (error) {
			console.error('Error creating feature list:', error);
		} finally {
			cancelCreation();
		}
	};

	const cancelCreation = () => {
		reset();
		descriptionField.field.value = '';
		navigate(`/${orgId}/features`);
	};
	return (
		<div
			className={`absolute max-w-2xl h-[calc(100vh_-_170px)] z-50 -top-3 right-0 bg-white px-4 py-2 rounded-md shadow-md transition-all duration-300 ${
				show
					? 'translate-x-0'
					: 'translate-x-[800px] opacity-0 pointer-events-none'
			}`}
		>
			<form onSubmit={handleSubmit(onSubmit)} className="h-full flex flex-col">
				<Grid container spacing={2}>
					<Grid item xs={12}>
						<div className="flex gap-4 justify-between">
							<FormControl
								sx={{
									width: '100%',
								}}
							>
								<TextField
									variant="outlined"
									size="small"
									margin="dense"
									fullWidth
									label="Title"
									id="title"
									required
									{...register('title')}
								></TextField>
							</FormControl>
						</div>
					</Grid>

					<Grid item xs={12}>
						<DescriptionRichEditor
							onChange={descriptionField.field.onChange}
							value={descriptionField.field.value}
						/>
					</Grid>
				</Grid>
				<Box
					sx={{
						display: 'flex',
						justifyContent: 'flex-end',
						gap: '1rem',
						marginTop: 'auto',
					}}
				>
					<Button
						variant="contained"
						sx={{ backgroundColor: 'neutral.lightest', color: 'black' }}
						color="neutral"
						onClick={() => {
							cancelCreation();
						}}
					>
						Cancel
					</Button>
					<Button variant="contained" type="submit">
						Create Feature
					</Button>
				</Box>
			</form>
		</div>
	);
});

CreateFeature.displayName = 'CreateFeatureList';

export default CreateFeature;
