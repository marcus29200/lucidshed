import { rectSortingStrategy } from '@dnd-kit/sortable';
import { useEffect, useState } from 'react';
import RoadmapView from './RoadMapView';
import TodoList from './TodoLists';

import OverdueStories from './OverdueStories';
import { MultipleContainers } from '../../components/Dndkit/MultipleContainres';
import { UniqueIdentifier } from '@dnd-kit/core';
import { SortableItem } from '../../components/Dndkit/item.model';

const DASHBOARD_MODULES = {
	A: [
		{
			id: 'A1',
			title: 'Epics',
			content: <RoadmapView />,
		},
		{
			id: 'A5',
			title: 'Overdue Stories',
			content: <OverdueStories />,
		},
		{
			id: 'A3',
			title: 'Recently created feature requests',
			content: <TodoList />,
		},
		{
			id: 'A4',
			title: 'Feature requests that do not have a feature assigned',
			content: <TodoList />,
		},
	],
	B: [
		{
			id: 'B2',
			title: 'Tickets Assigned to me',
			content: <TodoList />,
		},
		{
			id: 'B6',
			title: 'Current sprint status',
			content: <TodoList />,
		},
		{
			id: 'B7',
			title: 'Critical tickets',
			content: <TodoList />,
		},
		{
			id: 'B8',
			title: 'Feature by Requestor',
			content: <TodoList />,
		},
	],
};

const DashboardV2 = () => {
	const [items] =
		useState<Record<UniqueIdentifier, SortableItem[]>>(DASHBOARD_MODULES);

	useEffect(() => {
		console.log('items', items);
	}, [items]);

	return (
		<MultipleContainers
			columns={1}
			strategy={rectSortingStrategy}
			wrapperStyle={() => ({})}
			minimal
			items={items}
		/>
		// <Sortable
		// 	{...props}
		// 	items={items}
		// 	wrapperStyle={({ index }) => {
		// 		if (index % 2 === 0) {
		// 			return {
		// 				gridRowStart: 'span 2',
		// 				gridColumnStart: 'span 2',
		// 			};
		// 		}
		// 		return {};
		// 	}}
		// 	strategy={rectSwappingStrategy}
		// 	reorderItems={arraySwap}
		// 	getNewIndex={({ id, items, activeIndex, overIndex }) =>
		// 		arraySwap(items, activeIndex, overIndex).indexOf(id)
		// 	}
		// 	handle
		// 	removable
		// />
	);
};

export default DashboardV2;
