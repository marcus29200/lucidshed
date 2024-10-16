import { QueryClient, queryOptions } from '@tanstack/react-query';
import {
	Link,
	LoaderFunctionArgs,
	useLoaderData,
	useNavigate,
	useParams,
} from 'react-router-dom';
import { getSprints, Sprint } from '../../api/sprints';
import { Box, Button, Grid, TextField, Typography } from '@mui/material';
import SprintStoryTable from './SprintStoryTable';
import { useState } from 'react';
import { DatePicker } from '@mui/x-date-pickers';
import { SprintRow } from './SprintRow';
import { Settings } from '@mui/icons-material';
import { HomeIcon } from '../../icons/icons';
import SprintSearchInput from './SprintSearchInput';

export const getSprintsQuery = (orgId: string) =>
	queryOptions({
		queryKey: ['sprints'],
		queryFn: async () => getSprints(orgId),
	});

export const loader = (queryClient: QueryClient) => {
	return async ({ params }: LoaderFunctionArgs) => {
		if (!params.orgId) {
			throw new Error('no org id');
		}
		// something is fucked up with the queryKey...
		return getSprints(params.orgId);
		// return queryClient.ensureQueryData(getSprintsQuery(params.orgId))
	};
};
export const Sprints = () => {
	const sprints = useLoaderData() as Sprint[];
	const { orgId } = useParams();
	const navigate = useNavigate();
	const [selectedSprint, setSelectedSprint] = useState<Sprint>(sprints[0]);
	if (!sprints.length) {
		return (
			<>
				<div className="flex justify-end">
					<SprintSearchInput redirectOnSelect={true} sprint={null} />
				</div>
				<div className="rounded-xl flex items-center justify-center mt-8 bg-white h-80">
					<p className="text-base text-neutral-regular">
						There are currently no existing Sprints, Start <br /> creating a
						sprint from the drop down or menu.
					</p>
				</div>
			</>
		);
	}
	console.log(sprints);

	return (
		<>
			<div className="flex gap-x-4 pb-4 w-full">
				<Link to={`/${orgId}/sprints`}>
					<button className="flex gap-x-1 justify-center items-center px-24 py-3 transition bg-green-500 border-none text-white rounded-md font-bold hover:border-none hover:bg-green-600/80 relative">
						<HomeIcon className="text-white -ml-3" />
						<span className="mt-1">Stories</span>
						<div className="absolute -bottom-1 rounded h-0.5 w-full bg-green-500"></div>
					</button>
				</Link>
				<Link to={`/${orgId}/sprints/dashboard`}>
					<button className="flex gap-x-1 justify-center items-center px-24 py-3 bg-gray-50 text-gray-300 rounded-md font-bold border-none hover:border-none shadow-neutral">
						<Settings className="text-gray-300 -ml-3" />
						Reporting
					</button>
				</Link>
				<div className="ml-auto flex-1">
					<SprintSearchInput
						redirectOnNew={true}
						sprint={selectedSprint}
						setSprint={setSelectedSprint}
					/>
				</div>
			</div>
			<Box>
				<Typography variant="h6" fontSize={16} fontWeight={700} align="left">
					{selectedSprint.title}
				</Typography>
				<div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
					<Grid container spacing={2} sx={{ flexGrow: 1 }}>
						<Grid item xs={8}>
							<TextField
								sx={{
									'& .MuiInputBase-root': {
										background: 'white',
									},
								}}
								variant="outlined"
								size="small"
								margin="dense"
								fullWidth
								label="Description"
								id="description"
								name="description"
								multiline
								value={selectedSprint.description}
								onChange={(evt) =>
									setSelectedSprint((prev) => ({
										...prev,
										description: evt.target.value,
									}))
								}
								minRows={8}
							></TextField>
						</Grid>
						<Grid item xs={4}>
							<DatePicker
								label="Sprint Start date"
								name="startDate"
								slotProps={{
									textField: {
										variant: 'outlined',
										size: 'small',
										margin: 'dense',
										fullWidth: true,
										sx: {
											'& .MuiInputBase-root': {
												background: 'white',
											},
										},
									},
								}}
								value={new Date(selectedSprint.startDate) as any}
								onChange={(evt) =>
									setSelectedSprint((prev) => ({
										...prev,
										startDate: evt.toString(),
									}))
								}
							></DatePicker>
							<DatePicker
								label="Sprint End date"
								name="endDate"
								slotProps={{
									textField: {
										variant: 'outlined',
										size: 'small',
										margin: 'dense',
										fullWidth: true,
										sx: {
											'& .MuiInputBase-root': {
												background: 'white',
											},
										},
									},
								}}
								value={new Date(selectedSprint.endDate) as any}
								onChange={(evt) =>
									setSelectedSprint((prev) => ({
										...prev,
										endDate: evt.toString(),
									}))
								}
							></DatePicker>
						</Grid>
					</Grid>
				</div>

				{/* Progress Bar */}
				<div className="w-full text-left pb-8">
					<div className="py-2">
						<label className="text-xs text-neutral-regular block">
							Sprint Status
						</label>
						<div className="text-base font-semibold">{0}% to complete</div>
					</div>
					<div className="bg-gray-300 rounded-full h-2.5">
						<div
							className="bg-green-500 h-2.5 rounded-full"
							style={{ width: `calc(100% - ${100 - 0}%)` }}
						></div>
					</div>
				</div>
			</Box>
			{/* stories talbe */}
			<div className="rounded-xl bg-white">
				<Box
					sx={{
						display: 'flex',
						justifyContent: 'space-between',
						alignItems: 'center',
						paddingX: '12px',
						paddingY: '6px',
					}}
				>
					<Typography variant="h6">Epic Overview</Typography>
				</Box>
				<SprintStoryTable>
					{sprints.map((story) => (
						<SprintRow story={story} key={story.id} />
					))}
				</SprintStoryTable>
			</div>
		</>
	);
};
