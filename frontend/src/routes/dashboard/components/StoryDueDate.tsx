import dayjs from 'dayjs';
import { Story } from '../../stories/Stories';
import clsx from 'clsx';
const MAX_DAYS_OFFSET = 5;
type Props = {
	story: Story;
	className?: string;
};
export const StoryDueDate: React.FC<Props> = ({ story, className }: Props) => {
	const completed = story.status === 'done';
	const due = story.targetDate;
	if (!due) {
		return '-';
	}
	// TODO: dates comparison might need the UTC module
	const today = dayjs();
	const dueDate = dayjs(due);
	const isOverdue = !completed && dueDate.diff(today, 'day') <= 0;
	const isDueSoon = !completed && dueDate.diff(today, 'day') <= MAX_DAYS_OFFSET;
	const isNotDueSoon =
		!completed && dueDate.diff(today, 'day') > MAX_DAYS_OFFSET;
	let dueColor = completed ? 'text-neutral-regular' : 'text-error';
	if (isNotDueSoon) {
		dueColor = 'text-neutral-regular';
	} else if (!isOverdue && isDueSoon) {
		dueColor = 'text-secondary';
	}
	return (
		<span className={clsx('text-sm', dueColor, className && className)}>
			{dayjs(due).format('MMM DD, YYYY')}
		</span>
	);
};
