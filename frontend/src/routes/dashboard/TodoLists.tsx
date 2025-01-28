import { DashboardItemIcon } from '../../icons/icons';
import { useQuery } from '@tanstack/react-query';
import { useParams, useRouteLoaderData } from 'react-router-dom';
import { getStoriesAssignedToMe } from '../../api/stories';
import { User } from '../../api/users';
import { StoryItem } from './components/StoryItem';

const TodoList: React.FC = () => {
	const params = useParams();
	const { id: userId } = useRouteLoaderData('user') as User;
	const { data } = useQuery({
		queryKey: ['storiesAssignedToMe'],
		queryFn: async () => getStoriesAssignedToMe(params.orgId as string, userId),
	});

	const items = data ?? [];

	return (
		<div className="p-6 bg-white font-poppins h-full w-full">
			<div className="flex flex-col gap-y-1.5">
				<div className="flex flex-row gap-x-2 pb-2">
					<DashboardItemIcon />
					<h2 className="text-lg font-bold font-poppins">
						Tickets assigned to me
					</h2>
				</div>
			</div>

			{/* Container for tasks with vertical scroll */}
			<div className="max-h-[340px] !overflow-y-auto space-y-4 scrollbar-hide pr-3 truncate">
				{items.map((story) => (
					<StoryItem
						key={'story-' + story.id}
						story={story}
						orgId={params.orgId as string}
					/>
				))}
			</div>
		</div>
	);
};

export default TodoList;
