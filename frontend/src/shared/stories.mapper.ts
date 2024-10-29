import { Story } from '../routes/stories/Stories';

export type StoriesProgress = {
	progress: number;
	completed: number;
	total: number;
};

export const getStoriesProgress = (stories: Story[]): StoriesProgress => {
	let completed = 0;
	let inProgress = 0;
	const total = stories.length;
	stories.forEach((story) => {
		if (story.status === 'done') {
			completed++;
		} else if (story.status === 'in-progress') {
			inProgress++;
		}
	});
	const progress = ((completed + inProgress / 2) / total) * 100;
	return { progress, completed, total };
};
