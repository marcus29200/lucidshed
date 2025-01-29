import { Link } from 'react-router-dom';
import { StoryStatus } from '../../stories/stories.model';
import { CalendarMonth } from '@mui/icons-material';
import dayjs from 'dayjs';

type TaskProps = {
	title: string;
	ticket: string;
	due: string;
	orgId: string;
	completed: boolean; // status === 'done'
	status: StoryStatus;
};
const statusColors = {
	'in-progress': '#E5B710',
	done: '#20A224',
	'not-started': '#717584',
};
const MAX_DAYS_OFFSET = 5;

const StoryCard: React.FC<TaskProps> = ({
	title,
	ticket,
	due,
	orgId,
	status,
	completed,
}) => {
	// TODO: dates comparison might need the UTC module
	const today = dayjs();
	const dueDate = dayjs(due);
	const isOverdue = !completed && dueDate.diff(today, 'day') <= 0;
	const isDueSoon = !completed && dueDate.diff(today, 'day') <= MAX_DAYS_OFFSET;
	const isNotDueSoon =
		!completed && dueDate.diff(today, 'day') > MAX_DAYS_OFFSET;
	let dueColor = completed ? 'text-neutral-regular' : 'text-error';
	if (isNotDueSoon) {
		dueColor = 'text-primary';
	} else if (!isOverdue && isDueSoon) {
		dueColor = 'text-secondary';
	}

	return (
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
					<CalendarMonth className={dueColor} />
					<p className={`text-xs ${dueColor}`}>Due: {due}</p>
				</div>
			</div>
		</div>
	);
};

export default StoryCard;
