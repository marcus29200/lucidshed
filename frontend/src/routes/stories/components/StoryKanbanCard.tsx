import clsx from 'clsx';
import { snakeCaseToTitleCase } from '../../../shared/utils';
import { Story } from '../Stories';
import dayjs from 'dayjs';
import { StoryDueDate } from '../../dashboard/components/StoryDueDate';
import { IconButton } from '@mui/material';
import { Visibility } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';

const statusColors = {
	'in-progress': 'bg-secondary',
	done: 'bg-primary',
	'not-started': 'bg-neutral-regular',
};

type Props = {
	story: Story;
};
export const StoryKanbanCard = ({ story }: Props) => {
	const navigate = useNavigate();
	const orgId = useParams().orgId as string;
	const handleViewStory = (
		event: React.MouseEvent<HTMLButtonElement, MouseEvent>
	) => {
		event.stopPropagation();
		navigate(`/${orgId}/stories/${story.id}`);
	};
	return (
		<div className="bg-white rounded shadow-sm space-y-3 p-4 mb-1.5">
			<div className="flex flex-col gap-4">
				<div className="flex gap-2 items-center">
					<p
						className={clsx(
							`${statusColors[story.status] || 'bg-white'}`,
							'text-xs px-2 py-1 rounded text-white font-medium'
						)}
					>
						{snakeCaseToTitleCase(story.status)}
					</p>
					<p className="text-sm line-clamp-2">
						<span className="text-neutral-regular">Ticket#:</span> {story.id}
					</p>
					<div className="ml-auto">
						<IconButton onClick={handleViewStory}>
							<Visibility />
						</IconButton>
					</div>
				</div>
				<p className="text-left line-clamp-2">{story.name}</p>

				<div className="flex gap-2 items-start justify-between border-t-2 border-dashed pt-1">
					<p className="flex flex-col items-start">
						<span>Created</span>
						<span className="text-neutral-regular flex gap-2 text-sm items-center">
							{dayjs(story.createdDate).format('MMM DD, YYYY')}
						</span>
					</p>
					{story.targetDate && (
						<div className="flex flex-col items-start ">
							<span>Due</span>
							<div className="text-neutral-regular flex gap-2 text-sm items-center">
								<StoryDueDate story={story} />
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};
