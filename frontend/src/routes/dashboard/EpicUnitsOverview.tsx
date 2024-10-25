import { useParams } from 'react-router-dom';
import { DashboardItemIcon } from '../../icons/icons';
import Donut from './Donut';
import { useState, useEffect } from 'react';
import { getStories } from '../../api/stories';

// TODO: for the moment we're using stories instead of epics
const EpicUnitsOverview = () => {
	const { orgId } = useParams();
	const [completed, setCompleted] = useState<number>(0);
	const [inProgress, setInProgress] = useState<number>(0);
	const [notStarted, setNotStarted] = useState<number>(0);
	const [total, setTotal] = useState<number>(0);
	const [loading, setLoading] = useState<boolean>(true);
	useEffect(() => {
		// fetch stories from API and update state
		if (orgId) {
			// TODO: use queryClient
			getStories(orgId).then((data) => {
				const { completed, inProgress, notStarted, total } = data.reduce(
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
				setCompleted(completed);
				setInProgress(inProgress);
				setNotStarted(notStarted);
				setTotal(total);
				setLoading(false);
			});
		}
	}, [orgId]);
	return (
		<div className="p-6 bg-white rounded-lg shadow-md border-1 border-gray-200 h-full">
			<div className="flex flex-col gap-y-1.5">
				<div className="flex flex-row gap-x-2 ">
					{' '}
					<DashboardItemIcon />
					<h2 className="text-lg font-bold font-poppins">
						Story Units Overview
					</h2>
				</div>

				<p className="text-sm ml-10 text-gray-400 font-semibold mb-4 font-poppins">
					All Assigns Story Overview
				</p>
			</div>

			{!loading && (
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
