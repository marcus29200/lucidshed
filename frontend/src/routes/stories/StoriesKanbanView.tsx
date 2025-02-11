import { Story } from './Stories';
import { useMutation } from '@tanstack/react-query';

import {
	DragDropContext,
	Draggable,
	Droppable,
	DropResult,
} from '@hello-pangea/dnd';

import { updateStory } from '../../api/stories';
import { queryClient } from '../../router';
import { StoryStatus } from './stories.model';
import { useCallback, useEffect, useState } from 'react';
import { StoriesKanbanColumnHeader } from './components/StoriesKanbanColumnHeader';
import { StoryKanbanCard } from './components/StoryKanbanCard';

type Props = {
	stories: Story[];
	orgId: string;
	onChange?: (stories: Story[]) => void;
};

type StoryState = {
	[key in StoryStatus]: Story[];
};
const boards: StoryStatus[] = [
	StoryStatus.NOT_STARTED,
	StoryStatus.IN_PROGRESS,
	StoryStatus.DONE,
];

export const StoriesKanbanView = ({ stories, orgId, onChange }: Props) => {
	const [storiesState, setStoriesState] = useState<StoryState>(() => {
		const initialState: StoryState = {
			[StoryStatus.NOT_STARTED]: [],
			[StoryStatus.IN_PROGRESS]: [],
			[StoryStatus.DONE]: [],
		};
		stories.forEach((story) => {
			initialState[story.status].push(story);
		});

		return initialState;
	});

	useEffect(() => {
		const newStories: StoryState = {
			[StoryStatus.NOT_STARTED]: [],
			[StoryStatus.IN_PROGRESS]: [],
			[StoryStatus.DONE]: [],
		};

		stories.forEach((story) => {
			newStories[story.status].push(story);
		});
		setStoriesState(newStories);
	}, [stories]);

	const { mutate: patchStory } = useMutation({
		mutationFn: updateStory,
		onError: () => {
			console.error('wuhh');
		},
		onSuccess: async () => {
			const updatedStories: Story[] = [];
			const updated = Object.keys(storiesState).flatMap(
				(status) => storiesState[status]
			);
			for (let i = 0; i < updated.length; i++) {
				const element = updated[i];
				updatedStories.push({ ...element });
			}
			onChange?.(updatedStories);
			await queryClient.invalidateQueries(
				{ queryKey: ['stories', orgId] },
				{ throwOnError: true }
			);
		},
	});

	const handleOnDragEnd = useCallback(
		async (result: DropResult) => {
			if (!result.destination) return;
			const { source, destination } = result;
			const sourceStatus = source.droppableId as StoryStatus;
			const destinationStatus = destination.droppableId as StoryStatus;

			let storyId = 0;

			setStoriesState((prevStories) => {
				const newState = { ...prevStories };

				const sourceColumn = [...newState[sourceStatus]];
				const [movedStory] = sourceColumn.splice(source.index, 1);
				newState[sourceStatus] = sourceColumn;
				if (!movedStory) {
					console.error('Moved story not found');
					return prevStories;
				}

				const updatedMovedStory =
					sourceStatus !== destinationStatus
						? { ...movedStory, status: destinationStatus }
						: movedStory;

				// update the source column, story removed
				newState[sourceStatus] = sourceColumn;

				// add removed story to the destination column
				const destinationColumn = [...newState[destinationStatus]];
				destinationColumn.splice(destination.index, 0, updatedMovedStory);
				storyId = updatedMovedStory.id;

				newState[destinationStatus] = destinationColumn;

				return newState;
			});
			// only call backend when stories are moved between columns
			if (sourceStatus === destinationStatus) return;
			setTimeout(() => {
				if (storyId) {
					patchStory({
						orgId,
						storyId,
						data: {
							status: destinationStatus,
						},
					});
				}
			}, 400);
		},
		[patchStory]
	);

	return (
		<DragDropContext onDragEnd={handleOnDragEnd}>
			<div className="flex overflow-x-auto justify-center p-4">
				{boards.map((column) => (
					<div
						key={column}
						className="flex-1 mx-2 bg-neutral-50 rounded-md max-w-[360px] shadow-sm"
					>
						<StoriesKanbanColumnHeader
							columnTitle={column}
							storiesCount={storiesState[column].length}
						/>
						<Droppable droppableId={column}>
							{(provided) => (
								<div
									{...provided.droppableProps}
									ref={provided.innerRef}
									className="min-h-[200px] py-1.5 px-4"
								>
									{storiesState[column].map((story, index) => (
										<Draggable
											key={story.id}
											draggableId={story.id.toString()}
											index={index}
										>
											{(provided) => (
												<div
													{...provided.draggableProps}
													{...provided.dragHandleProps}
													ref={provided.innerRef}
													className="cursor-pointer"
												>
													<StoryKanbanCard story={story} />
												</div>
											)}
										</Draggable>
									))}
									{provided.placeholder}
								</div>
							)}
						</Droppable>
					</div>
				))}
			</div>
		</DragDropContext>
	);
};
