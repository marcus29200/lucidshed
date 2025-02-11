import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { getStories, mapRawStory } from '../../../api/stories';
import StoryCard from './StoryCard';

type Props = {
	priority: number;
	orgId: string;
};
export const StoriesByPriority = ({ orgId, priority }: Props) => {
	const { data } = useQuery({
		queryKey: ['stories'],
		queryFn: async () => (await getStories(orgId)).map(mapRawStory),
	});

	const items = (data ?? []).filter((story) => story.priority === priority);
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
	if (!items.length) {
		return <div className="pt-2 italic">No items found</div>;
	}
	return (
		<>
			{items.map((story) => (
				<StoryCard key={'story-' + story.id} story={story} orgId={orgId} />
			))}
		</>
	);
};
