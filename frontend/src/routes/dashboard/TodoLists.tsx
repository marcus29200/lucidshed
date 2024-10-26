import { CalendarMonth, CheckCircle } from '@mui/icons-material';
import { DashboardItemIcon } from '../../icons/icons';
import { useQuery } from '@tanstack/react-query';
import { Link, useParams, useRouteLoaderData } from 'react-router-dom';
import { getStoriesAssignedToMe } from '../../api/stories';
import { User } from '../../api/users';
import dayjs from 'dayjs';
import { FormControl, Radio } from '@mui/material';

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

				<p className="text-sm ml-10 text-gray-400 font-semibold mb-4 font-poppins">
					Tasks need your immediate attention
				</p>
			</div>

			{/* Container for tasks with vertical scroll */}
			<div className="max-h-[340px] overflow-y-auto space-y-4 scrollbar-hide custom-scrollbar pr-3">
				{items.map((story) => (
					<Task
						key={'story-' + story.storyId}
						title={story.name}
						ticket={story.storyId.toString()}
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
const Task: React.FC<TaskProps> = ({
	title,
	ticket,
	due,
	completed,
	orgId,
}) => (
	<div className="flex flex-col gap-y-4 justify-center items-start w-full mb-4">
		<div className="flex flex-row justify-between w-full">
			<div className="flex flex-col gap-y-2">
				<span
					className={`text-sm bg-[#FBD9E0] p-2 rounded-lg w-max ${
						completed ? 'text-pink-600' : 'text-pink-600'
					}`}
				>
					{completed ? 'Completed' : 'Upcoming'}
				</span>
				<Link to={`/${orgId}/stories/${ticket}`}>
					<p className="font-semibold text-black">{title}</p>
				</Link>
			</div>
			<FormControl>
				<Radio
					size="small"
					checked={completed}
					readOnly={true}
					checkedIcon={<CheckCircle />}
				/>
			</FormControl>
		</div>
		<div className="flex flex-row justify-between w-full">
			<p className="text-xs text-gray-400">Ticket#: {ticket}</p>
			<div className="flex items-center flex-row gap-x-1">
				<CalendarMonth className="mr-1 text-gray-300" />
				<p className="text-xs text-gray-400 mr-4">Due: {due}</p>
			</div>
		</div>
	</div>
);

export default TodoList;
