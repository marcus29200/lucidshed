import { DashboardItemIcon } from '../../icons/icons';
import { useParams } from 'react-router-dom';

import { STORY_PRIORITY_VALUE } from '../stories/stories.model';
import { StoriesByPriority } from './components/StoriesByPriority';

const HighPriorityStories: React.FC = () => {
	const params = useParams();

	return (
		<div className="p-6 bg-white font-poppins h-full w-full">
			<div className="flex flex-col gap-y-1.5 pb-2">
				<div className="flex flex-row gap-x-2 ">
					<DashboardItemIcon />
					<h2 className="text-lg font-bold font-poppins truncate">
						High Priority Tickets
					</h2>
				</div>
			</div>

			{/* Container for tasks with vertical scroll */}
			<div className="max-h-[340px] !overflow-y-auto space-y-4 scrollbar-hide pr-3 truncate">
				<StoriesByPriority
					priority={STORY_PRIORITY_VALUE.high}
					orgId={params.orgId as string}
				/>
			</div>
		</div>
	);
};

export default HighPriorityStories;
