import { useParams } from 'react-router-dom';
import { DashboardItemIcon } from '../../icons/icons';
import Donut from './Donut';
import { getStories } from '../../api/stories';
import { CircularProgress } from '@mui/material';
import { useQuery } from '@tanstack/react-query';

// TODO: for the moment we're using stories instead of epics
const EpicUnitsOverview = () => {
	const { orgId } = useParams();
	const { data, isLoading } = useQuery({
		queryKey: ['stories'],
		queryFn: async () => getStories(orgId as string),
	});
	const stories = data ?? [];
	const { completed, inProgress, notStarted, total } = stories.reduce(
		(summary, story) => {
			if (story.status === 'in-progress') {
				summary.inProgress += 1;
			} else if (story.status === 'not-started') {
				summary.notStarted += 1;
			} else {
				summary.completed += 1;
			}
			summary.total += 1;
			return summary;
		},
		{ completed: 0, inProgress: 0, notStarted: 0, total: 0 }
	);

	return (
		<div className="p-6 bg-white rounded-lg shadow-md border-1 border-gray-200 h-full">
			<div className="flex flex-col gap-y-1.5">
				<div className="flex flex-row gap-x-2 ">
					{' '}
					<DashboardItemIcon />
					<h2 className="text-lg font-bold font-poppins">
						Story Units Overview{' '}
						{isLoading && <CircularProgress color="inherit" size={20} />}
					</h2>
				</div>

				<p className="text-sm ml-10 text-gray-400 font-semibold mb-4 font-poppins">
					All Assigns Story Overview
				</p>
			</div>

			{!isLoading && (
				<Donut
					completed={completed}
					inProgress={inProgress}
					notStarted={notStarted}
					total={total}
				/>
			)}
		</div>
	);
};

export default EpicUnitsOverview;
