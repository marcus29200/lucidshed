import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
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
import { Container, ContainerProps } from './Container';
import { Item } from './Item';
import { type SortableItem } from './item.model';

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
	const {
		active,
		attributes,
		isDragging,
		listeners,
		over,
		setNodeRef,
		transition,
		transform,
	} = useSortable({
		id,
		data: {
			type: 'container',
			children: items,
		},
		animateLayoutChanges,
	});
	const isOverContainer = over
		? (id === over.id && active?.data.current?.type !== 'container') ||
		  items.some((item) => item.id === over.id)
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
			handleProps={{
				...attributes,
				...listeners,
			}}
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

export type MultipleContainerItem = {
	label: string;
	id: string;
	items: SortableItem[];
};

type Items = Record<UniqueIdentifier, MultipleContainerItem>;

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
	itemCount?: number;
	items?: Items;
	handle?: boolean;
	renderItem?;
	strategy?: SortingStrategy;
	modifiers?: Modifiers;
	minimal?: boolean;
	scrollable?: boolean;
	vertical?: boolean;
	wrapperItemClassName?: string;
	onOrderChange?: (items: Items) => void;
}

export const TRASH_ID = 'void';
const PLACEHOLDER_ID = 'placeholder';

export function MultipleContainers({
	adjustScale = false,
	cancelDrop,
	columns,
	handle = false,
	items: initialItems,
	containerStyle,
	coordinateGetter = multipleContainersCoordinateGetter,
	getItemStyles = () => ({}),
	wrapperStyle = () => ({}),
	minimal = false,
	modifiers,
	renderItem,
	strategy = verticalListSortingStrategy,
	vertical = false,
	scrollable,
	wrapperItemClassName,
	onOrderChange,
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

	useEffect(() => {
		setItems(initialItems ?? {});
	}, [initialItems]);

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
				if (overId in items) {
					const containerItems = items[overId];

					// If a container is matched and it contains items (columns 'A', 'B', 'C')
					if (containerItems.items.length > 0) {
						// Return the closest droppable within that container
						overId = closestCenter({
							...args,
							droppableContainers: args.droppableContainers.filter(
								(container) =>
									container.id !== overId &&
									containerItems.items.some((item) => item.id === container.id)
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
			items[key].items.some((item) => item.id === id)
		)!;
	};

	const getIndex = (id: UniqueIdentifier) => {
		const container = findContainer(id);

		if (!container) {
			return -1;
		}

		const index = items[container].items.findIndex((item) => item.id === id);

		return index;
	};

	const findItem = (itemId: UniqueIdentifier) => {
		const containerId = findContainer(itemId);

		if (clonedItems) {
			const itemFromCloned = clonedItems![containerId].items.find(
				(childItem) => childItem && childItem.id === itemId
			);
			if (itemFromCloned) {
				return itemFromCloned;
			}
		}
		const itemFromOriginal = items[containerId].items.find(
			(childItem) => childItem && childItem.id === itemId
		);
		return itemFromOriginal as SortableItem;
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

	useEffect(() => {
		requestAnimationFrame(() => {
			recentlyMovedToNewContainer.current = false;
		});
	}, [items]);

	useEffect(() => {
		if (!activeId && onOrderChange) {
			onOrderChange(items);
		}
	}, [items, activeId, onOrderChange]);

	return (
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
						const activeItems = items[activeContainer].items;
						const overItems = items[overContainer].items;

						const overIndex = overItems.findIndex((item) => item.id === overId);
						const activeIndex = activeItems.findIndex(
							(item) => item.id === active.id
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
							[activeContainer]: {
								label: items[activeContainer].label,
								id: items[activeContainer].id,
								items: activeItems.filter((item) => item.id !== active.id),
							},
							[overContainer]: {
								label: items[overContainer].label,
								id: items[overContainer].id,
								items: [
									...overItems.slice(0, newIndex),
									activeItems[activeIndex],
									...overItems.slice(newIndex, overItems.length),
								],
							},
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

				const overContainer = findContainer(overId);

				if (overContainer) {
					const activeIndex = items[activeContainer].items.findIndex(
						(item) => item.id === active.id
					);
					const overIndex = items[overContainer].items.findIndex(
						(item) => item.id === overId
					);

					if (activeIndex !== overIndex) {
						setItems((items) => ({
							...items,
							[overContainer]: {
								label: items[overContainer].label,
								id: items[overContainer].id,
								items: arrayMove(
									items[overContainer].items,
									activeIndex,
									overIndex
								),
							},
						}));
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
					display: 'inline-grid',
					boxSizing: 'border-box',
					padding: 20,
					gridAutoFlow: vertical ? 'row' : 'column',
					gap: 24,
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
					{containers.map((containerId) => (
						<DroppableContainer
							key={containerId}
							id={containerId}
							label={minimal ? undefined : items[containerId].label}
							columns={columns}
							items={items[containerId].items}
							scrollable={scrollable}
							style={containerStyle}
							unstyled={minimal}
						>
							<SortableContext
								items={items[containerId].items}
								strategy={strategy}
							>
								{items[containerId].items.map((item, index) => {
									return (
										<SortableItem
											disabled={isSortingContainer}
											key={item.id}
											id={item.id}
											index={index}
											handle={handle}
											style={getItemStyles}
											wrapperStyle={wrapperStyle}
											wrapperItemClassName={wrapperItemClassName}
											renderItem={renderItem}
											containerId={containerId}
											getIndex={getIndex}
											item={item}
										/>
									);
								})}
							</SortableContext>
						</DroppableContainer>
					))}
				</SortableContext>
			</div>
			{createPortal(
				<DragOverlay adjustScale={adjustScale} dropAnimation={dropAnimation}>
					{activeId
						? containers.includes(activeId)
							? renderContainerDragOverlay(activeId)
							: renderSortableItemDragOverlay(findItem(activeId))
						: null}
				</DragOverlay>,
				document.body
			)}
		</DndContext>
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
				wrapperItemClassName={wrapperItemClassName}
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
				{items[containerId].items.map((item, index) => (
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
						wrapperItemClassName={wrapperItemClassName}
						wrapperStyle={wrapperStyle({ index })}
						renderItem={renderItem}
					/>
				))}
			</Container>
		);
	}
}

interface SortableItemProps {
	containerId: UniqueIdentifier;
	id: UniqueIdentifier;
	index: number;
	item: SortableItem;
	handle: boolean;
	disabled?: boolean;
	style(args): React.CSSProperties;
	getIndex(id: UniqueIdentifier): number;
	renderItem(): React.ReactElement;
	wrapperStyle({ index }: { index: number }): React.CSSProperties;
	wrapperItemClassName?: string;
}

function SortableItem({
	disabled,
	id,
	index,
	handle,
	renderItem,
	style,
	containerId,
	item,
	getIndex,
	wrapperStyle,
	wrapperItemClassName,
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
			wrapperItemClassName={wrapperItemClassName}
			transition={transition}
			transform={transform}
			fadeIn={mountedWhileDragging}
			listeners={listeners}
			renderItem={renderItem}
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
