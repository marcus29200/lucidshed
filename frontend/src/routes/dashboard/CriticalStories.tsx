import { CalendarMonth } from '@mui/icons-material';
import { DashboardItemIcon } from '../../icons/icons';
import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { getStories, mapRawStory } from '../../api/stories';

import dayjs from 'dayjs';
import { STORY_PRIORITY_VALUE, StoryStatus } from '../stories/stories.model';

interface TaskProps {
	title: string;
	ticket: string;
	due: string;
	orgId: string;
	completed?: boolean; // This is optional because not all tasks are completed
	status: StoryStatus;
}
const statusColors = {
	'in-progress': '#E5B710',
	done: '#20A224',
	'not-started': '#717584',
};
const CriticalStories: React.FC = () => {
	const params = useParams();
	const { data } = useQuery({
		queryKey: ['stories'],
		queryFn: async () =>
			(await getStories(params.orgId as string)).map(mapRawStory),
	});

	const items = (data ?? []).filter(
		(story) => story.priority === STORY_PRIORITY_VALUE.critical
	);
	// put the ticket with the oldest target date at the top
	items.sort((a, b) =>
		a.targetDate && b.targetDate
			? dayjs(a.targetDate).isAfter(dayjs(b.targetDate))
				? 1
				: -1
			: a.targetDate && !b.targetDate
			? -1
			: 1
	);
	return (
		<div className="p-6 bg-white font-poppins h-full w-full">
			<div className="flex flex-col gap-y-1.5 pb-2">
				<div className="flex flex-row gap-x-2 ">
					<DashboardItemIcon />
					<h2 className="text-lg font-bold font-poppins">Critical Tickets</h2>
				</div>
			</div>

			{/* Container for tasks with vertical scroll */}
			<div className="max-h-[340px] !overflow-y-auto space-y-4 scrollbar-hide pr-3 truncate">
				{items.map((story) => (
					<Task
						key={'story-' + story.id}
						title={story.name}
						ticket={story.id.toString()}
						due={
							story.targetDate
								? dayjs(story.targetDate).format('MMM DD, YYYY')
								: '-'
						}
						status={story.status}
						completed={story.status === 'done'}
						orgId={params.orgId as string}
					/>
				))}
			</div>
		</div>
	);
};

// Define the Task component that accepts TaskProps as props
const Task: React.FC<TaskProps> = ({ title, ticket, due, orgId, status }) => (
	<div
		className="shadow-sm p-5 border rounded-lg relative"
		style={{
			borderColor: statusColors[status] ?? '#717584',
		}}
	>
		<Link
			to={`/${orgId}/stories/${ticket}`}
			className="text-neutral-dark hover:text-neutral-regular "
		>
			<h6 className="text-left font-semibold truncate">{title}</h6>
		</Link>
		<div className="flex flex-row justify-between w-full flex-wrap items-center">
			<p className="text-xs">
				<span className="text-neutral-regular">Ticket#:</span> {ticket}
			</p>
			<div className="flex items-center flex-row gap-x-1">
				<CalendarMonth className=" text-neutral-regular" />
				<p className="text-xs text-neutral-regular">Due: {due}</p>
			</div>
		</div>
	</div>
);

export default CriticalStories;
