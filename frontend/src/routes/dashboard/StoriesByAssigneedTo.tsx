import { DashboardItemIcon } from '../../icons/icons';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { getStories, mapRawStory } from '../../api/stories';

import dayjs from 'dayjs';
import { StoryItem } from './components/StoryItem';
import { Story } from '../stories/Stories';
import React from 'react';
import { UsersContext } from '../../hooks/users';
import clsx from 'clsx';

const MAX_STORIES_BY_USER = 5;

const StoriesByAssignedTo: React.FC = () => {
	const params = useParams();
	const users = React.useContext(UsersContext);
	const { data } = useQuery({
		queryKey: ['stories'],
		queryFn: async () =>
			(await getStories(params.orgId as string)).map(mapRawStory),
	});

	const items = (data ?? []).filter((item) => !!item.assignedToId);
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

	const getUserName = (id: string): string => {
		return users.find((user) => user.id === id)?.fullName ?? '--';
	};

	const groupedItems: Partial<Record<string, Story[]>> = Object.groupBy(
		items,
		(item) => item.assignedToId!
	);

	return (
		<div className="p-6 bg-white font-poppins h-full w-full">
			<div className="flex flex-col gap-y-1.5 pb-2">
				<div className="flex flex-row gap-x-2 ">
					<DashboardItemIcon />
					<h2 className="text-lg font-bold font-poppins">
						Tickets assigned by team member{' '}
						<span className="text-base text-neutral-regular">
							(top {MAX_STORIES_BY_USER} overdue)
						</span>
					</h2>
				</div>
			</div>
			{!items.length ? (
				<div className="pt-2 italic">No items found</div>
			) : (
				<div className="space-y-4 scrollbar-hide pr-3 truncate">
					{Object.entries(groupedItems).map(([userId, stories], index) => (
						<div key={'group-' + userId} className="flex flex-col gap-y-4">
							<h3
								className={clsx(
									'text-base font-semibold text-left pt-2',
									index !== 0 ? 'border-t' : ''
								)}
							>
								{getUserName(userId)}
							</h3>
							{stories!.slice(0, MAX_STORIES_BY_USER).map((story) => (
								<StoryItem
									key={'story-' + story.id}
									story={story}
									orgId={params.orgId as string}
								/>
							))}
						</div>
					))}
				</div>
			)}
		</div>
	);
};

export default StoriesByAssignedTo;
