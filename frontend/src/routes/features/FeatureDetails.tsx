import { Grid, FormControl, TextField, Box, Button } from '@mui/material';
import { useEffect, useState } from 'react';

import DescriptionRichEditor from '../../components/DescriptionRichEditor';

import { useLoaderData, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ExpandMore, RotateRight } from '@mui/icons-material';
import { updateFeature } from '../../api/features';

export type FeatureListFormProps = {
	title: string;
	id: number;
	description: string | null;
	requests: number | null;
	priority: string | null;
	feature_assigned: string | null;
};
let debounceTimeId;
const DESCRIPTION_EXPANDED_KEY = 'feature-description-expanded';

const FeatureDetail = () => {
	const orgId = useParams().orgId as string;
	const featureList = useLoaderData() as FeatureListFormProps;
	const [title, setTitle] = useState<string>('');
	const [description, setDescription] = useState<string>('');
	const [isLoading, setIsLoading] = useState(false);

	const [descriptionExpanded, setDescriptionExpanded] = useState(
		!localStorage.getItem(DESCRIPTION_EXPANDED_KEY) ||
			localStorage.getItem(DESCRIPTION_EXPANDED_KEY) === '1'
	);

	const navigate = useNavigate();
	const queryClient = useQueryClient();

	useEffect(() => {
		if (featureList) {
			setTitle(featureList.title);
			setDescription(featureList.description || '');
		}
	}, [featureList]);

	useEffect(() => {
		localStorage.setItem(
			DESCRIPTION_EXPANDED_KEY,
			descriptionExpanded ? '1' : '0'
		);
	}, [descriptionExpanded]);

	const { mutate: patchFeatureList } = useMutation({
		mutationFn: updateFeature,
		onError: () => {
			console.error('wuhh');
			setIsLoading(false);
		},
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: ['features', orgId],
			});
			setTimeout(() => {
				setIsLoading(false);
			}, 600);
		},
	});

	const cancelEdition = () => {
		clearValues();
		navigate(`/${orgId}/features`);
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
			...featureList,
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
		<>
			<div className="bg-white p-6 rounded-md">
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
									{isLoading && (
										<RotateRight
											className="duration-500 text-neutral-regular transition-all animate-spin"
											style={{
												opacity: isLoading ? 1 : 0,
											}}
										/>
									)}
								</FormControl>
							</div>
						</Grid>
						<Grid item xs={12}>
							<div
								className="collapsible-header text-left flex items-center gap-2"
								aria-expanded={descriptionExpanded}
							>
								<Button onClick={() => setDescriptionExpanded((prev) => !prev)}>
									Description
									<ExpandMore />
								</Button>
							</div>
							<div className="collapsible-content p-1">
								<DescriptionRichEditor
									onChange={handleEditDescription}
									value={description}
								/>
							</div>
						</Grid>
					</Grid>
					<Box
						sx={{
							display: 'flex',
							justifyContent: 'flex-end',
							gap: '1rem',
							marginTop: 'auto',
							paddingTop: '16px',
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
							Go back
						</Button>
						<Button variant="contained" type="submit" disabled={isLoading}>
							Save changes
						</Button>
					</Box>
				</form>
			</div>
			<div className="bg-white p-6 rounded-md mt-4">Request items</div>
		</>
	);
};

export default FeatureDetail;
