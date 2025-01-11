import { Grid, FormControl, TextField, Box, Button } from '@mui/material';
import { memo, useEffect, useState } from 'react';

import DescriptionRichEditor from '../../components/DescriptionRichEditor';

import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { RotateRight } from '@mui/icons-material';
import { updateFeatureList } from '../../api/featureLists';

export type FeatureListFormProps = {
	title: string;
	id: number;
	description: string | null;
	requests: number | null;
	priority: string | null;
};
let debounceTimeId;
const FeatureList = memo(
	({
		show,
		featureList,
	}: {
		show: boolean;
		featureList: FeatureListFormProps | null;
	}) => {
		const orgId = useParams().orgId as string;

		const [title, setTitle] = useState<string>('');
		const [description, setDescription] = useState<string>('');
		const [isLoading, setIsLoading] = useState(false);

		const navigate = useNavigate();
		const queryClient = useQueryClient();

		const { mutate: patchFeatureList } = useMutation({
			mutationFn: updateFeatureList,
			onError: () => {
				console.error('wuhh');
				setIsLoading(false);
			},
			onSuccess: async () => {
				await queryClient.invalidateQueries({
					queryKey: ['feature-list', orgId],
				});
				cancelEdition();
				setTimeout(() => {
					setIsLoading(false);
				}, 1000);
			},
		});

		useEffect(() => {
			if (featureList) {
				setTitle(() => featureList.title);
				setDescription(() => featureList.description ?? '');
			} else {
				clearValues();
			}
		}, [featureList]);

		const cancelEdition = () => {
			clearValues();
			navigate(`/${orgId}/feature-list`);
		};

		const clearValues = () => {
			setTitle(() => '');
			setDescription(() => '');
		};

		const handlePatchFeatureRequest = (data) => {
			if (debounceTimeId) {
				clearTimeout(debounceTimeId);
			}
			setIsLoading(true);
			debounceTimeId = setTimeout(() => {
				patchFeatureList({
					orgId,
					featureId: (featureList as FeatureListFormProps).id,
					data,
				});
				setIsLoading(true);
			}, 400);
		};

		const handleEditTitle = (value: string) => {
			setTitle(value);
			if (debounceTimeId) {
				clearTimeout(debounceTimeId);
			}
		};

		const handleEditDescription = (value: string) => {
			setDescription(value);
		};

		const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
			e.preventDefault();
			const payload = {
				description,
				title: featureList?.title,
				requests: featureList?.requests,
			};
			if (title && title !== featureList?.title) {
				payload.title = title;
			}

			handlePatchFeatureRequest(payload);
		};

		return (
			<div
				className={`absolute max-w-2xl h-[calc(100vh_-_90px)] z-50 -top-3 -right-3 bg-white px-4 py-2 rounded-md shadow-md transition-all duration-300 ${
					show ? 'translate-x-0' : 'translate-x-[800px]'
				}`}
			>
				<form
					onSubmit={(e) => handleSubmit(e)}
					className="h-full flex flex-col"
				>
					<Grid container spacing={2}>
						<Grid item xs={12}>
							<div className="flex gap-4 justify-between">
								<FormControl
									sx={{
										width: '100%',
										display: 'flex',
										gap: '4px',
										alignItems: 'center',
										flexDirection: 'row',
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
										value={title}
										onChange={(v) => handleEditTitle(v.currentTarget.value)}
									></TextField>
									<RotateRight
										className="duration-500 text-neutral-regular transition-all animate-spin"
										style={{
											opacity: isLoading ? 1 : 0,
										}}
									/>
								</FormControl>
							</div>
						</Grid>
						<Grid item xs={12}>
							<DescriptionRichEditor
								onChange={handleEditDescription}
								value={description}
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
								cancelEdition();
							}}
						>
							Close
						</Button>
						<Button variant="contained" type="submit" disabled={isLoading}>
							Save changes
						</Button>
					</Box>
				</form>
			</div>
		);
	}
);

FeatureList.displayName = 'EditFeatureRequest';

export default FeatureList;
