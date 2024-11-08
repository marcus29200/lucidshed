import { CalendarMonth } from '@mui/icons-material';
import { DashboardItemIcon } from '../../icons/icons';
import { useQuery } from '@tanstack/react-query';
import { Link, useParams, useRouteLoaderData } from 'react-router-dom';
import { getStoriesAssignedToMe } from '../../api/stories';
import { User } from '../../api/users';
import dayjs from 'dayjs';

interface TaskProps {
	title: string;
	ticket: string;
	due: string;
	orgId: string;
	completed?: boolean; // This is optional because not all tasks are completed
}

const TodoList: React.FC = () => {
	const params = useParams();
	const { id: userId } = useRouteLoaderData('user') as User;
	const { data } = useQuery({
		queryKey: ['storiesAssignedToMe'],
		queryFn: async () => getStoriesAssignedToMe(params.orgId as string, userId),
	});

	const items = data ?? [];
	items.sort((a, b) =>
		a.targetDate && b.targetDate
			? dayjs(a.targetDate).diff(dayjs(b.targetDate))
			: a.targetDate && !b.targetDate
			? 1
			: 0
	);
	return (
		<div className="p-6 bg-white rounded-lg shadow-md border-1 border-gray-200 font-poppins h-full">
			<div className="flex flex-col gap-y-1.5">
				<div className="flex flex-row gap-x-2 ">
					<DashboardItemIcon />
					<h2 className="text-lg font-bold font-poppins">Todo List</h2>
				</div>

				<p className="text-sm text-gray-400 font-semibold mb-4 font-poppins text-left">
					Tickets assigned to me
				</p>
			</div>

			{/* Container for tasks with vertical scroll */}
			<div className="max-h-[340px] overflow-y-auto space-y-4 scrollbar-hide pr-3 truncate">
				{items.map((story) => (
					<Task
						key={'story-' + story.id}
						title={story.name}
						ticket={story.id.toString()}
						due={dayjs(story.targetDate).format('MMM DD, YYYY')}
						completed={story.status === 'done'}
						orgId={params.orgId as string}
					/>
				))}
			</div>
		</div>
	);
};

// Define the Task component that accepts TaskProps as props
const Task: React.FC<TaskProps> = ({ title, ticket, due, orgId }) => (
	<div className="shadow-sm p-5 border rounded-lg border-neutral-regular relative">
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

export default TodoList;
