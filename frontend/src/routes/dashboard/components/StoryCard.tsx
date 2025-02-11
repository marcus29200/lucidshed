import { Link } from 'react-router-dom';
import { StoryDueDate } from './StoryDueDate';
import { Story } from '../../stories/Stories';

type TaskProps = {
	story: Story;
	orgId: string;
};
const statusColors = {
	'in-progress': '#E5B710',
	done: '#20A224',
	'not-started': '#717584',
};

const StoryCard: React.FC<TaskProps> = ({ story, orgId }) => {
	return (
		<div
			className="shadow-sm p-5 border rounded-lg relative truncate "
			style={{
				borderColor: statusColors[story.status] ?? '#717584',
			}}
		>
			<h6 className="text-left font-semibold truncate">
				<Link
					to={`/${orgId}/stories/${story.id}`}
					className="text-neutral-dark hover:text-neutral-regular truncate"
				>
					{story.name}
				</Link>
			</h6>
			<div className="flex flex-row justify-between w-full flex-wrap items-center">
				<p className="text-xs">
					<span className="text-neutral-regular">Ticket#:</span> {story.id}
				</p>
				<div className="flex items-center flex-row gap-x-1 !text-xs">
					Due: <StoryDueDate story={story} className="text-xs" />
				</div>
			</div>
		</div>
	);
};

export default StoryCard;
