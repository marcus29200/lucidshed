import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { getSprints, getStoriesForSprint } from '../../api/sprints';
import dayjs from 'dayjs';
import { DashboardItemIcon } from '../../icons/icons';
import { useState } from 'react';
import { LinearProgress } from '@mui/material';
import { getStoriesProgress } from '../../shared/stories.mapper';
import { CalendarMonth, OpenInNew } from '@mui/icons-material';

export const ActiveSprint = () => {
	const orgId = useParams().orgId as string;
	const [sprintProgress, setSprintProgress] = useState<number>(0);
	const { data } = useQuery({
		queryKey: ['sprints'],
		queryFn: async () => await getSprints(orgId),
	});
	const today = new Date().toISOString();

	const activeSprint = (data ?? []).find(
		(sprint) => today >= sprint.startDate && today <= sprint.endDate
	);
	if (activeSprint) {
		getStoriesForSprint({ orgId, sprintId: activeSprint.id }).then(
			(stories) => {
				setSprintProgress(getStoriesProgress(stories ?? []).progress);
				return stories;
			}
		);
	}

	return (
		<div className="p-6 bg-white font-poppins h-full w-full text-left">
			<div className="flex flex-col gap-y-1.5 pb-2">
				<div className="flex flex-row gap-x-2 ">
					<DashboardItemIcon />
					<h2 className="text-lg font-bold font-poppins">Current Sprint</h2>
				</div>
			</div>
			{activeSprint ? (
				<>
					<h2 className="text-lg font-semibold font-poppins pb-2">
						<Link
							to={`/${orgId}/sprints?sprintId=${activeSprint.id}`}
							target="_blank"
							rel="noopener noreferrer"
						>
							{activeSprint.title}
							<OpenInNew />
						</Link>
					</h2>
					<div className="grid grid-cols-12">
						<div className="flex flex-col gap-1 col-span-12 sm:col-span-3">
							<p className="font-semibold text-base flex items-center gap-2">
								<CalendarMonth />
								Start Date:
								<span className="font-normal text-neutral-regular">
									{dayjs(activeSprint.startDate).format('MMM DD, YYYY')}
								</span>
							</p>
							<p className="font-semibold text-base flex items-center gap-2">
								<CalendarMonth />
								End Date:
								<span className="font-normal text-neutral-regular">
									{dayjs(activeSprint.endDate).format('MMM DD, YYYY')}
								</span>
							</p>
						</div>
						<div className="flex flex-col gap-2.5 col-span-12 sm:col-span-9 text-left">
							<div className="text-base font-semibold">
								{sprintProgress.toFixed(2)}% to complete
							</div>
							<LinearProgress
								sx={{
									'&.MuiLinearProgress-root': {
										background: '#d1d5db',
										height: '12px',
										borderRadius: '90px',
									},
								}}
								variant="determinate"
								value={sprintProgress}
							/>
						</div>
					</div>
				</>
			) : (
				'No active sprint'
			)}
		</div>
	);
};
