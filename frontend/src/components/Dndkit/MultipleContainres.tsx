import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal, unstable_batchedUpdates } from 'react-dom';
import {
	CancelDrop,
	closestCenter,
	pointerWithin,
	rectIntersection,
	CollisionDetection,
	DndContext,
	DragOverlay,
	DropAnimation,
	getFirstCollision,
	KeyboardSensor,
	MouseSensor,
	TouchSensor,
	Modifiers,
	useDroppable,
	UniqueIdentifier,
	useSensors,
	useSensor,
	MeasuringStrategy,
	KeyboardCoordinateGetter,
	defaultDropAnimationSideEffects,
} from '@dnd-kit/core';
import {
	AnimateLayoutChanges,
	SortableContext,
	useSortable,
	arrayMove,
	defaultAnimateLayoutChanges,
	verticalListSortingStrategy,
	SortingStrategy,
	horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { coordinateGetter as multipleContainersCoordinateGetter } from './multipleContainersKeyboardCoordinates';
import { Item } from './Item';
import { Container, ContainerProps } from './Container';

import { type SortableItem } from './item.model';
import { ConfirmationDialog } from '../ConfirmationDialog';

export default {
	title: 'Presets/Sortable/Multiple Containers',
};

const animateLayoutChanges: AnimateLayoutChanges = (args) =>
	defaultAnimateLayoutChanges({ ...args, wasDragging: true });

function DroppableContainer({
	children,
	columns = 1,
	disabled,
	id,
	items,
	style,
	...props
}: ContainerProps & {
	disabled?: boolean;
	id: UniqueIdentifier;
	items: SortableItem[];
	style?: React.CSSProperties;
}) {
	const { active, isDragging, over, setNodeRef, transition, transform } =
		useSortable({
			id,
			data: {
				type: 'container',
				children: items,
			},
			animateLayoutChanges,
		});

	const isOverContainer = over
		? (id === over.id && active?.data.current?.type !== 'container') ||
		  items.some(
				(childItem) =>
					!!childItem && childItem.id.toString().includes(over.id.toString())
		  )
		: false;

	return (
		<Container
			ref={disabled ? undefined : setNodeRef}
			style={{
				...style,
				transition,
				transform: CSS.Translate.toString(transform),
				opacity: isDragging ? 0.5 : undefined,
			}}
			hover={isOverContainer}
			columns={columns}
			{...props}
		>
			{children}
		</Container>
	);
}

const dropAnimation: DropAnimation = {
	sideEffects: defaultDropAnimationSideEffects({
		styles: {
			active: {
				opacity: '0.5',
			},
		},
	}),
};

type Items = Record<UniqueIdentifier, SortableItem[]>;

interface Props {
	adjustScale?: boolean;
	cancelDrop?: CancelDrop;
	columns?: number;
	containerStyle?: React.CSSProperties;
	coordinateGetter?: KeyboardCoordinateGetter;
	getItemStyles?(args: {
		value: UniqueIdentifier;
		index: number;
		overIndex: number;
		isDragging: boolean;
		containerId: UniqueIdentifier;
		isSorting: boolean;
		isDragOverlay: boolean;
	}): React.CSSProperties;
	wrapperStyle?(args: { index: number }): React.CSSProperties;
	items?: Items;
	handle?: boolean;
	renderItem?;
	strategy?: SortingStrategy;
	modifiers?: Modifiers;
	minimal?: boolean;
	trashable?: boolean;
	scrollable?: boolean;
	vertical?: boolean;
	onOrderChange?: (items: Items) => void;
	itemActionsEnabled?: boolean; // false drop and drag not visible
	confirmDeletion?: boolean;
}

export const TRASH_ID = 'void';
const PLACEHOLDER_ID = 'placeholder';
const empty: SortableItem[] = [];

export function MultipleContainers({
	adjustScale = false,
	cancelDrop,
	columns,
	handle = false,
	items: initialItems,
	coordinateGetter = multipleContainersCoordinateGetter,
	getItemStyles = () => ({}),
	wrapperStyle = () => ({}),
	minimal = false,
	modifiers,
	renderItem,
	strategy = verticalListSortingStrategy,
	trashable = false,
	vertical = false,
	scrollable,
	onOrderChange,
	itemActionsEnabled = true,
	confirmDeletion,
}: Props) {
	const [items, setItems] = useState<Items>(() => initialItems ?? {});
	const [containers, setContainers] = useState(
		Object.keys(items) as UniqueIdentifier[]
	);
	const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
	const lastOverId = useRef<UniqueIdentifier | null>(null);
	const recentlyMovedToNewContainer = useRef(false);
	const isSortingContainer =
		activeId != null ? containers.includes(activeId) : false;

	// Confirmation dialog state
	const [confirmationOpen, setConfirmationOpen] = useState(false);
	const [itemToRemove, setItemToRemove] = useState<
		(SortableItem & { containerId: UniqueIdentifier }) | null
	>(null);

	useEffect(() => {
		if (initialItems) {
			setItems(() => initialItems);
		}
	}, [initialItems]);

	useEffect(() => {
		if (onOrderChange) {
			onOrderChange(items);
		}
	}, [items, onOrderChange]);

	/**
	 * Custom collision detection strategy optimized for multiple containers
	 *
	 * - First, find any droppable containers intersecting with the pointer.
	 * - If there are none, find intersecting containers with the active draggable.
	 * - If there are no intersecting containers, return the last matched intersection
	 *
	 */
	const collisionDetectionStrategy: CollisionDetection = useCallback(
		(args) => {
			if (activeId && activeId in items) {
				return closestCenter({
					...args,
					droppableContainers: args.droppableContainers.filter(
						(container) => container.id in items
					),
				});
			}

			// Start by finding any intersecting droppable
			const pointerIntersections = pointerWithin(args);
			const intersections =
				pointerIntersections.length > 0
					? // If there are droppables intersecting with the pointer, return those
					  pointerIntersections
					: rectIntersection(args);
			let overId = getFirstCollision(intersections, 'id');

			if (overId != null) {
				if (overId === TRASH_ID) {
					// If the intersecting droppable is the trash, return early
					// Remove this if you're not using trashable functionality in your app
					return intersections;
				}

				if (overId in items) {
					const containerItems = items[overId];

					// If a container is matched and it contains items (columns 'A', 'B', 'C')
					if (containerItems.length > 0) {
						// Return the closest droppable within that container
						overId = closestCenter({
							...args,
							droppableContainers: args.droppableContainers.filter(
								(container) =>
									!!container &&
									container.id !== overId &&
									containerItems.some(
										(childItem) =>
											!!childItem &&
											childItem.id.toString().includes(container.id.toString())
									)
							),
						})[0]?.id;
					}
				}

				lastOverId.current = overId;

				return [{ id: overId }];
			}

			// When a draggable item moves to a new container, the layout may shift
			// and the `overId` may become `null`. We manually set the cached `lastOverId`
			// to the id of the draggable item that was moved to the new container, otherwise
			// the previous `overId` will be returned which can cause items to incorrectly shift positions
			if (recentlyMovedToNewContainer.current) {
				lastOverId.current = activeId;
			}

			// If no droppable is matched, return the last match
			return lastOverId.current ? [{ id: lastOverId.current }] : [];
		},
		[activeId, items]
	);
	const [clonedItems, setClonedItems] = useState<Items | null>(null);
	const sensors = useSensors(
		useSensor(MouseSensor),
		useSensor(TouchSensor),
		useSensor(KeyboardSensor, {
			coordinateGetter,
		})
	);
	const findContainer = (id: UniqueIdentifier) => {
		if (id in items) {
			return id;
		}

		return Object.keys(items).find((key) =>
			items[key].some(
				(childItem) =>
					!!childItem && childItem.id.toString().includes(id.toString())
			)
		);
	};

	const findItem = (id: UniqueIdentifier) => {
		const containerId = id.toString().slice(0, 1);

		if (clonedItems) {
			const itemFromCloned = clonedItems![containerId].find(
				(childItem) => childItem && childItem.id === id
			);
			if (itemFromCloned) {
				return itemFromCloned;
			}
		}
		const itemFromOriginal = items[containerId].find(
			(childItem) => childItem && childItem.id === id
		);
		return itemFromOriginal as SortableItem;
	};

	const getIndex = (id: UniqueIdentifier) => {
		const container = findContainer(id);

		if (!container || !Object.keys(items[container]).length) {
			return -1;
		}

		const index = items[container].findIndex(
			(childItem) => childItem && childItem.id === id
		);

		return index;
	};

	const onDragCancel = () => {
		if (clonedItems) {
			// Reset items to their original state in case items have been
			// Dragged across containers
			setItems(clonedItems);
		}

		setActiveId(null);
		setClonedItems(null);
	};

	// Cancel the removal of the component
	const cancelRemove = () => {
		setConfirmationOpen(false); // Close confirmation dialog
		setItemToRemove(null); // Reset the  being removed
	};

	// Confirm the removal of the item
	const confirmRemove = () => {
		setItems((items) => ({
			...items,
			[itemToRemove!.containerId]: items[itemToRemove!.containerId].filter(
				(childItem) => childItem && childItem.id !== itemToRemove!.id
			),
		}));
		setActiveId(null);
		setConfirmationOpen(false); // Close confirmation dialog
		setItemToRemove(null); // Reset the component being removed
	};

	useEffect(() => {
		requestAnimationFrame(() => {
			recentlyMovedToNewContainer.current = false;
		});
	}, [items]);

	return (
		<>
			<DndContext
				sensors={sensors}
				collisionDetection={collisionDetectionStrategy}
				measuring={{
					droppable: {
						strategy: MeasuringStrategy.Always,
					},
				}}
				onDragStart={({ active }) => {
					setActiveId(active.id);
					setClonedItems(items);
				}}
				onDragOver={({ active, over }) => {
					const overId = over?.id;

					if (overId == null || overId === TRASH_ID || active.id in items) {
						return;
					}

					const overContainer = findContainer(overId);
					const activeContainer = findContainer(active.id);

					if (!overContainer || !activeContainer) {
						return;
					}

					if (activeContainer !== overContainer) {
						setItems((items) => {
							const activeItems = items[activeContainer];
							const overItems = items[overContainer];
							const overIndex = overItems.findIndex(
								(childItem) => childItem && childItem.id === overId
							);
							const activeIndex = activeItems.findIndex(
								(childItem) => childItem && childItem.id === active.id
							);

							let newIndex: number;

							if (overId in items) {
								newIndex = overItems.length + 1;
							} else {
								const isBelowOverItem =
									over &&
									active.rect.current.translated &&
									active.rect.current.translated.top >
										over.rect.top + over.rect.height;

								const modifier = isBelowOverItem ? 1 : 0;

								newIndex =
									overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
							}

							recentlyMovedToNewContainer.current = true;

							return {
								...items,
								[activeContainer]: items[activeContainer].filter(
									(item) => item && item.id !== active.id
								),
								[overContainer]: [
									...items[overContainer].slice(0, newIndex),
									items[activeContainer][activeIndex],
									...items[overContainer].slice(
										newIndex,
										items[overContainer].length
									),
								],
							};
						});
					}
				}}
				onDragEnd={({ active, over }) => {
					if (active.id in items && over?.id) {
						setContainers((containers) => {
							const activeIndex = containers.indexOf(active.id);
							const overIndex = containers.indexOf(over.id);

							return arrayMove(containers, activeIndex, overIndex);
						});
					}

					const activeContainer = findContainer(active.id);

					if (!activeContainer) {
						setActiveId(null);
						return;
					}

					const overId = over?.id;

					if (overId == null) {
						setActiveId(null);
						return;
					}

					if (overId === TRASH_ID) {
						setItems((items) => ({
							...items,
							[activeContainer]: items[activeContainer].filter(
								(childItem) => childItem && childItem.id !== activeId
							),
						}));
						setActiveId(null);
						return;
					}

					if (overId === PLACEHOLDER_ID) {
						const newContainerId = getNextContainerId();

						unstable_batchedUpdates(() => {
							setContainers((containers) => [...containers, newContainerId]);
							setItems((items) => ({
								...items,
								[activeContainer]: items[activeContainer].filter(
									(childItem) => childItem && childItem.id !== activeId
								),
								[newContainerId]: [
									items[activeContainer].find(
										(childItem) => childItem && childItem.id === active.id
									) as SortableItem,
								],
							}));
							setActiveId(null);
						});
						return;
					}

					const overContainer = findContainer(overId);

					if (overContainer) {
						const activeIndex = items[activeContainer].findIndex(
							(childItem) => childItem && childItem.id === active.id
						);
						const overIndex = items[overContainer].findIndex(
							(childItem) => childItem && childItem.id === overId
						);

						if (activeIndex !== overIndex) {
							setItems((items) => {
								const item = items[overContainer].find(
									(item) => item && item.id === active.id
								);
								if (item) {
									item.id = `${overContainer}${item.id.toString().slice(1)}`;
								}
								return {
									...items,
									[overContainer]: arrayMove(
										items[overContainer],
										activeIndex,
										overIndex !== -1 ? overIndex : 0
									),
								};
							});
						} else {
							setItems((items) => {
								const item = items[overContainer].find(
									(item) => item.id === active.id
								);
								if (item) {
									item.id = `${overContainer}${item.id.toString().slice(1)}`;
								}
								return {
									...items,
								};
							});
						}
					}

					setActiveId(null);
				}}
				cancelDrop={cancelDrop}
				onDragCancel={onDragCancel}
				modifiers={modifiers}
			>
				<div
					style={{
						display: 'grid',
						boxSizing: 'border-box',
						padding: 20,
						gridAutoFlow: vertical ? 'row' : 'column',
						gridTemplateColumns: 'repeat(12, minmax(0, 1fr))',
						gap: 16,
					}}
				>
					<SortableContext
						items={[...containers, PLACEHOLDER_ID]}
						strategy={
							vertical
								? verticalListSortingStrategy
								: horizontalListSortingStrategy
						}
					>
						{containers.map((containerId, index) => (
							<DroppableContainer
								key={containerId}
								id={containerId}
								columns={columns}
								items={items[containerId]}
								scrollable={scrollable}
								style={{
									gridColumn:
										index === 0 ? 'span 8 / span 8' : 'span 4 / span 4',
								}}
								unstyled={minimal}
							>
								<SortableContext items={items[containerId]} strategy={strategy}>
									{items[containerId].map((value, index) => {
										return value ? (
											<SortableItem
												disabled={isSortingContainer}
												key={value.id}
												id={value.id}
												index={index}
												handle={handle}
												itemActionsEnabled={itemActionsEnabled}
												item={value}
												style={getItemStyles}
												wrapperStyle={wrapperStyle}
												renderItem={renderItem}
												containerId={containerId}
												getIndex={getIndex}
												onRemove={() =>
													handleRemoveItem({
														...value,
														containerId: containerId,
													})
												}
											/>
										) : undefined;
									})}
								</SortableContext>
							</DroppableContainer>
						))}
						{minimal ? undefined : (
							<DroppableContainer
								id={PLACEHOLDER_ID}
								disabled={isSortingContainer}
								items={empty}
								onClick={handleAddColumn}
								placeholder
							>
								+ Add column
							</DroppableContainer>
						)}
					</SortableContext>
				</div>
				{createPortal(
					<DragOverlay adjustScale={adjustScale} dropAnimation={dropAnimation}>
						{activeId
							? containers.includes(activeId)
								? renderContainerDragOverlay(activeId)
								: findItem(activeId)
								? renderSortableItemDragOverlay(findItem(activeId))
								: null
							: null}
					</DragOverlay>,
					document.body
				)}
				{trashable && activeId && !containers.includes(activeId) ? (
					<Trash id={TRASH_ID} />
				) : null}
			</DndContext>

			<ConfirmationDialog
				open={confirmationOpen}
				onConfirm={confirmRemove}
				onClose={cancelRemove}
				title="Are you sure you want to continue?"
			>
				<p className="font-poppins">
					You are about to remove <strong>{itemToRemove?.title}</strong>. Do you
					want to proceed?
				</p>
			</ConfirmationDialog>
		</>
	);

	function renderSortableItemDragOverlay(item: SortableItem) {
		return (
			<Item
				value={item.content}
				handle={handle}
				style={getItemStyles({
					containerId: findContainer(item.id) as UniqueIdentifier,
					overIndex: -1,
					index: getIndex(item.id),
					value: item.id,
					isSorting: true,
					isDragging: true,
					isDragOverlay: true,
				})}
				wrapperStyle={wrapperStyle({ index: 0 })}
				renderItem={renderItem}
				dragOverlay
			/>
		);
	}

	function renderContainerDragOverlay(containerId: UniqueIdentifier) {
		return (
			<Container
				label={`Column ${containerId}`}
				columns={columns}
				style={{
					height: '100%',
				}}
				shadow
				unstyled={false}
			>
				{items[containerId].map((item, index) => (
					<Item
						key={item.id}
						value={item.content}
						handle={handle}
						style={getItemStyles({
							containerId,
							overIndex: -1,
							index: getIndex(item.id),
							value: item.id,
							isDragging: false,
							isSorting: false,
							isDragOverlay: false,
						})}
						wrapperStyle={wrapperStyle({ index })}
						renderItem={renderItem}
					/>
				))}
			</Container>
		);
	}

	function handleRemoveItem(
		item: SortableItem & { containerId: UniqueIdentifier }
	) {
		setItemToRemove(item);
		confirmDeletion ? setConfirmationOpen(true) : confirmRemove();
	}

	function handleAddColumn() {
		const newContainerId = getNextContainerId();

		unstable_batchedUpdates(() => {
			setContainers((containers) => [...containers, newContainerId]);
			setItems((items) => ({
				...items,
				[newContainerId]: [],
			}));
		});
	}

	function getNextContainerId() {
		const containerIds = Object.keys(items);
		const lastContainerId = containerIds[containerIds.length - 1];

		return String.fromCharCode(lastContainerId.charCodeAt(0) + 1);
	}
}

function Trash({ id }: { id: UniqueIdentifier }) {
	const { setNodeRef, isOver } = useDroppable({
		id,
	});

	return (
		<div
			ref={setNodeRef}
			style={{
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				position: 'fixed',
				left: '50%',
				marginLeft: -150,
				bottom: 20,
				width: 300,
				height: 60,
				borderRadius: 5,
				border: '1px solid',
				borderColor: isOver ? 'red' : '#DDD',
			}}
		>
			Drop here to delete
		</div>
	);
}

interface SortableItemProps {
	containerId: UniqueIdentifier;
	id: UniqueIdentifier;
	index: number;
	handle: boolean;
	disabled?: boolean;
	item: SortableItem;
	style(args): React.CSSProperties;
	getIndex(id: UniqueIdentifier): number;
	renderItem(): React.ReactElement;
	onRemove?(): void;
	wrapperStyle({ index }: { index: number }): React.CSSProperties;
	itemActionsEnabled?: boolean;
}

function SortableItem({
	disabled,
	id,
	index,
	handle,
	renderItem,
	style,
	containerId,
	getIndex,
	item,
	wrapperStyle,
	onRemove,
	itemActionsEnabled,
}: SortableItemProps) {
	const {
		setNodeRef,
		setActivatorNodeRef,
		listeners,
		isDragging,
		isSorting,
		over,
		overIndex,
		transform,
		transition,
	} = useSortable({
		id,
	});
	const mounted = useMountStatus();
	const mountedWhileDragging = isDragging && !mounted;

	return (
		<Item
			ref={disabled ? undefined : setNodeRef}
			value={item.content}
			dragging={isDragging}
			sorting={isSorting}
			handle={handle}
			handleProps={handle ? { ref: setActivatorNodeRef } : undefined}
			index={index}
			wrapperStyle={wrapperStyle({ index })}
			style={style({
				index,
				value: id,
				isDragging,
				isSorting,
				overIndex: over ? getIndex(over.id) : overIndex,
				containerId,
			})}
			transition={transition}
			transform={transform}
			fadeIn={mountedWhileDragging}
			listeners={listeners}
			renderItem={disabled ? undefined : renderItem}
			onRemove={onRemove}
			actionsEnabled={itemActionsEnabled}
		/>
	);
}

function useMountStatus() {
	const [isMounted, setIsMounted] = useState(false);

	useEffect(() => {
		const timeout = setTimeout(() => setIsMounted(true), 500);

		return () => clearTimeout(timeout);
	}, []);

	return isMounted;
}
