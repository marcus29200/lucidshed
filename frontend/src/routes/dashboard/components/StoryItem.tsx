import dayjs from 'dayjs';
import { Story } from '../../stories/Stories';
import StoryCard from './StoryCard';

type Props = {
	story: Story;
	orgId: string;
};

export const StoryItem = ({ story, orgId }: Props) => {
	return (
		<StoryCard
			title={story.name}
			ticket={story.id.toString()}
			due={
				story.targetDate ? dayjs(story.targetDate).format('MMM DD, YYYY') : '-'
			}
			status={story.status}
			completed={story.status === 'done'}
			orgId={orgId}
		/>
	);
};
