import {
	DndContext,
	closestCenter,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
	DragEndEvent,
} from '@dnd-kit/core';
import {
	arrayMove,
	SortableContext,
	sortableKeyboardCoordinates,
	rectSortingStrategy,
} from '@dnd-kit/sortable';
import SortableItem from '../../components/SortableItem';
import { useState } from 'react';
import RoadmapView from './RoadMapView';
import TodoList from './TodoLists';
import { Grid } from '@mui/material';
type DashboardModule = {
	id: number;
	title: string;
	content: JSX.Element;
};

const DASHBOARD_MODULES: DashboardModule[] = [
	{
		id: 1,
		title: 'Epics',
		content: <RoadmapView />,
	},
	{
		id: 2,
		title: 'Tickets Assigned to me',
		content: <TodoList />,
	},
	{
		id: 3,
		title: 'Recently created feature requests',
		content: <TodoList />,
	},
	{
		id: 4,
		title: 'Feature requests that do not have a feature assigned',
		content: <TodoList />,
	},
	{
		id: 5,
		title: 'Overdue Stories',
		content: <TodoList />,
	},
	{
		id: 6,
		title: 'Current sprint status',
		content: <TodoList />,
	},
	{
		id: 7,
		title: 'Critical tickets',
		content: <TodoList />,
	},
	{
		id: 8,
		title: 'Feature by Requestor',
		content: <TodoList />,
	},
];

const DashboardV2 = () => {
	const [items, setItems] = useState<DashboardModule[]>(DASHBOARD_MODULES);
	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		})
	);

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;
		if (!over || !active) {
			return;
		}

		if (active.id !== over.id) {
			setItems((items) => {
				const oldIndex = items.findIndex(
					(item: DashboardModule) => item.id === active.id
				);
				const newIndex = items.findIndex(
					(item: DashboardModule) => item.id === over.id
				);

				return arrayMove(items, oldIndex, newIndex);
			});
		}
	};

	const handleRemoveItem = (id: number) => {
		setItems((items) => items.filter((item) => item.id !== id));
	};

	return (
		<div>
			<DndContext
				sensors={sensors}
				collisionDetection={closestCenter}
				onDragEnd={handleDragEnd}
			>
				<SortableContext items={items} strategy={rectSortingStrategy}>
					<Grid container spacing={2}>
						{items.map((item, index) => (
							<Grid key={item.id} item xs={12} sm={index % 2 === 0 ? 8 : 4}>
								<SortableItem
									id={item.id}
									onRemoveItem={() => handleRemoveItem(item.id)}
								>
									{item.title}
									{item.content}
								</SortableItem>
							</Grid>
						))}
					</Grid>
				</SortableContext>
			</DndContext>
		</div>
	);
};

export default DashboardV2;
