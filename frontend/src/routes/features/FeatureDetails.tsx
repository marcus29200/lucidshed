import { Grid, FormControl, TextField, Box, Button } from '@mui/material';
import { useEffect, useState } from 'react';

import DescriptionRichEditor from '../../components/DescriptionRichEditor';

import { useLoaderData, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ExpandMore, RotateRight } from '@mui/icons-material';
import {
	getAssignedRequestsToFeature,
	updateFeature,
} from '../../api/features';
import FeatureRequest, {
	FeatureRequestFormProps,
} from '../featureRequests/FeatureRequest';
import { FeatureRequestTable } from '../featureRequests/FeatureRequestTable';

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
const FEATURE_REQUESTS_TABLE_ID = 'feature-requests-assigned-table';

const FeatureDetail = () => {
	const orgId = useParams().orgId as string;
	const featureList = useLoaderData() as FeatureListFormProps;
	const [title, setTitle] = useState<string>('');
	const [description, setDescription] = useState<string>('');
	const [isLoading, setIsLoading] = useState(false);
	const [selectedRow, setSelectedRow] =
		useState<FeatureRequestFormProps | null>(null);
	const [showEditRequest, setShowEditRequest] = useState(false);
	const featureRequestId = useParams().featureRequestId as string;

	const basePath = `features/${featureList.id}/requests`;

	const [descriptionExpanded, setDescriptionExpanded] = useState(
		!localStorage.getItem(DESCRIPTION_EXPANDED_KEY) ||
			localStorage.getItem(DESCRIPTION_EXPANDED_KEY) === '1'
	);

	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const { data: requestsData } = useQuery({
		queryKey: ['feature-requests-assigned', orgId, featureList.id],
		queryFn: async () =>
			getAssignedRequestsToFeature(orgId, featureList.id.toString()),
	});

	const requests: FeatureRequestFormProps[] = requestsData ?? [];

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

	useEffect(() => {
		if (debounceTimeId) {
			clearTimeout(debounceTimeId);
		}
		setSelectedRow(() => null);
		debounceTimeId = setTimeout(() => {
			if (featureRequestId) {
				const row = requests.find(
					(featureRequest) => featureRequest.id === +featureRequestId
				);
				if (row) {
					setSelectedRow(() => row);
					setShowEditRequest(true);
				} else {
					navigate(`/${orgId}/${basePath}`);
				}
			} else {
				setShowEditRequest(false);
			}
		}, 200);
	}, [featureRequestId, requests]);

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

	const navigateBack = () => {
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

	const handleSelectRow = (row: FeatureRequestFormProps) => {
		setSelectedRow(row);
		navigate(`/${orgId}/${basePath}/${row.id}`);
	};

	const columns = [
		{
			header: 'Title',
			id: 'title',
			accessorKey: 'title',
			enableColumnActions: false,
			enableColumnFilter: false,
		},
		{
			header: 'Submitted by',
			id: 'submittedBy',
			accessorKey: 'submittedBy',
			enableColumnActions: false,
			enableColumnFilter: false,
		},
		{
			header: 'Submitted date',
			id: 'submittedDate',
			accessorKey: 'submittedDate',
			enableColumnActions: false,
			enableColumnFilter: false,
		},
	];

	return (
		<div className="relative">
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
							onClick={navigateBack}
						>
							Go back
						</Button>
						<Button variant="contained" type="submit" disabled={isLoading}>
							Save changes
						</Button>
					</Box>
				</form>
			</div>
			<div className="mt-4 ">
				<h2 className="text-left p-4 bg-white rounded-xl font-semibold text-lg">
					Requests assigned
				</h2>
				<FeatureRequestTable
					tableId={FEATURE_REQUESTS_TABLE_ID}
					requests={requests}
					handleRowClick={handleSelectRow}
					enabledColumns={columns}
				/>
			</div>
			<FeatureRequest
				show={showEditRequest}
				featureRequest={selectedRow}
				basePath={basePath}
				enableEditAssignedFeature={false}
			/>
		</div>
	);
};

export default FeatureDetail;
