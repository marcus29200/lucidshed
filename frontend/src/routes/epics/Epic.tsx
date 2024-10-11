import { Typography, TextField, Grid } from '@mui/material';
import { Link, LoaderFunctionArgs, useLoaderData } from 'react-router-dom';

import { QueryClient, queryOptions } from '@tanstack/react-query';
import { getEpic } from '../../api/epics';
import { HomeIcon } from '../../icons/icons';
import { CalendarMonthRounded, Settings } from '@mui/icons-material';
import dayjs from 'dayjs';
import { buildStyles, CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import EpicStories from './EpicStories';
import { ApiEpic } from './Epics';

export const epicDetailQuery = (orgId: string, epicId: string) =>
	queryOptions({
		queryKey: ['epics', 'detail', orgId, epicId],
		queryFn: async () => getEpic({ orgId, epicId }),
	});

export const loader = (queryClient: QueryClient) => {
	return async ({ params }: LoaderFunctionArgs) => {
		if (!params.orgId) {
			throw new Error('No org id provided');
		}
		if (!params.epicId) {
			throw new Error('No epic id provided');
		}
		return queryClient.ensureQueryData(
			epicDetailQuery(params.orgId, params.epicId)
		);
	};
};

export const Epic = () => {
	const epic = useLoaderData() as ApiEpic;

	return (
		<>
			<div className="flex space-x-4 pb-4">
				<Link to={`/${epic.organization_id}/epics/${epic.id}`}>
					<button className="flex gap-x-1 justify-center items-center px-24 py-3 transition bg-green-500 border-none text-white rounded-md font-bold hover:border-none hover:bg-green-600/80 relative">
						<HomeIcon className="text-white -ml-3" />
						<span className="mt-1">Stories</span>
						<div className="absolute -bottom-1 rounded h-0.5 w-full bg-green-500"></div>
					</button>
				</Link>
				<Link to={`/${epic.organization_id}/epics/${epic.id}/dashboard`}>
					<button className="flex gap-x-1 justify-center items-center px-24 py-3 bg-gray-50 text-gray-300 rounded-md font-bold border-none hover:border-none shadow-neutral">
						<Settings className="text-gray-300 -ml-3" />
						Reporting
					</button>
				</Link>
			</div>
			<div className="rounded-xl bg-white">
				<Grid container sx={{ padding: '16px', borderRadius: '16px' }}>
					<Grid item xs={6}>
						<Typography variant="h4" align="left">
							{epic.title}
						</Typography>
						<TextField
							variant="outlined"
							size="small"
							margin="dense"
							fullWidth
							label="Description"
							id="description"
							name="description"
							multiline
							minRows={8}
							value={epic.description}
						></TextField>
					</Grid>
					<Grid item xs={6}>
						<div className="flex">
							<div className="w-1/2 flex flex-row justify-between ">
								<div className="w-full pl-6">
									<div className="flex justify-between">
										{/* Estimated Completion */}
										<div className="mb-4">
											<p className="text-gray-500">Estimated Completion</p>
											<div className="flex items-center space-x-2">
												<span className=" text-lg">
													{epic &&
														dayjs(epic.estimated_completion_date).format(
															'MMM DD, YYYY'
														)}
												</span>
												<CalendarMonthRounded className="text-gray-400" />
											</div>
										</div>

										{/* Progress Indicator */}
									</div>

									{/* Priority/Ranking */}
									<div className="mb-4">
										<p className="text-gray-500 text-left">Priority/Ranking</p>
										<div className="flex items-center space-x-2 text-left">
											<span className="text-lg capitalize text-left">
												{epic && epic.priority}
											</span>
										</div>
									</div>

									{/* Product Area/Category */}
									<div className="mb-4">
										<p className="text-gray-500 text-left">
											Product Area/Category
										</p>
										<p className="text-lg text-left">-</p>
									</div>

									{/* Attachments/Files */}
									<div className="mb-4">
										<p className="text-gray-500 text-left">Attachments/Files</p>
										<div className="flex flex-wrap gap-2 mt-2">-</div>
									</div>
								</div>
							</div>
							<div className="flex items-center flex-col gap-4 w-1/2">
								<Typography variant="h4" align="left">
									Progress
								</Typography>

								<CircularProgressbar
									className="!w-48"
									value={60}
									text={`${60}% `}
									styles={buildStyles({
										// Rotation of path and trail, in number of turns (0-1)
										rotation: 0.25,

										// Whether to use rounded or flat corners on the ends - can use 'butt' or 'round'
										strokeLinecap: 'round',

										// Text size
										textSize: '16px',

										// How long animation takes to go from one percentage to another, in seconds
										pathTransitionDuration: 0.5,

										// Can specify path transition in more detail, or remove it entirely
										// pathTransition: 'none',

										// Colors
										pathColor: `#22C55E`,
										textColor: '#000000',

										backgroundColor: '#ccc',
									})}
								/>
								<p className="text-gray-500 text-left mt-2">
									0/20 Stories Completed
								</p>
							</div>
						</div>
					</Grid>
				</Grid>
			</div>
			<br />
			<EpicStories epic={epic} />
		</>
	);
};
