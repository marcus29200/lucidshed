import { DashboardItemIcon } from '../../icons/icons';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { getStories, mapRawStory } from '../../api/stories';

import dayjs from 'dayjs';
import StoryCard from './components/StoryCard';

const OverdueStories: React.FC = () => {
	const params = useParams();
	const { data } = useQuery({
		queryKey: ['stories'],
		queryFn: async () =>
			(await getStories(params.orgId as string)).map(mapRawStory),
	});

	const items = (data ?? []).filter((item) => item.status !== 'done');
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
					<h2 className="text-lg font-bold font-poppins truncate">
						Overdue Stories
					</h2>
				</div>
			</div>

			{/* Container for tasks with vertical scroll */}
			<div className="max-h-[340px] !overflow-y-auto space-y-4 scrollbar-hide pr-3 truncate">
				{items.map((story) => (
					<StoryCard
						key={'story-' + story.id}
						story={story}
						orgId={params.orgId as string}
					/>
				))}
			</div>
		</div>
	);
};

export default OverdueStories;
