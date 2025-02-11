import React, { useEffect } from 'react';
import type { DraggableSyntheticListeners } from '@dnd-kit/core';
import type { Transform } from '@dnd-kit/utilities';

import styles from './Item.module.css';
import { IconButton } from '@mui/material';
import { Close, DragIndicator } from '@mui/icons-material';
import clsx from 'clsx';

export interface Props {
	dragOverlay?: boolean;
	color?: string;
	disabled?: boolean;
	dragging?: boolean;
	handle?: boolean;
	handleProps?: { ref: (element: HTMLElement | null) => void };
	height?: number;
	index?: number;
	fadeIn?: boolean;
	transform?: Transform | null;
	listeners?: DraggableSyntheticListeners;
	sorting?: boolean;
	style?: React.CSSProperties;
	transition?: string | null;
	wrapperStyle?: React.CSSProperties;
	value: React.ReactNode;
	onRemove?(): void;
	renderItem?(args: {
		dragOverlay: boolean;
		dragging: boolean;
		sorting: boolean;
		index: number | undefined;
		fadeIn: boolean;
		listeners: DraggableSyntheticListeners;
		ref: React.Ref<HTMLElement>;
		style: React.CSSProperties | undefined;
		transform: Props['transform'];
		transition: Props['transition'];
		value: Props['value'];
		title?: string;
	}): React.ReactElement;
	title?: string;
	actionsEnabled?: boolean;
	wrapperItemClassName?: string;
}

export const Item = React.memo(
	React.forwardRef<HTMLLIElement, Props>(
		(
			{
				color,
				dragOverlay,
				dragging,
				disabled,
				fadeIn,
				handle,
				handleProps,
				height,
				index,
				listeners,
				onRemove,
				renderItem,
				sorting,
				style,
				transition,
				transform,
				value,
				wrapperStyle,
				title,
				actionsEnabled,
				wrapperItemClassName,
				...props
			},
			ref
		) => {
			useEffect(() => {
				if (!dragOverlay) {
					return;
				}

				document.body.style.cursor = 'grabbing';

				return () => {
					document.body.style.cursor = '';
				};
			}, [dragOverlay]);

			return renderItem ? (
				renderItem({
					dragOverlay: Boolean(dragOverlay),
					dragging: Boolean(dragging),
					sorting: Boolean(sorting),
					index,
					fadeIn: Boolean(fadeIn),
					listeners,
					ref,
					style,
					transform,
					transition,
					value,
					title,
				})
			) : (
				<li
					className={clsx(
						styles.Wrapper,
						fadeIn && styles.fadeIn,
						sorting && styles.sorting,
						dragOverlay && styles.dragOverlay
					)}
					style={
						{
							...wrapperStyle,
							transition: [transition, wrapperStyle?.transition]
								.filter(Boolean)
								.join(', '),
							'--translate-x': transform
								? `${Math.round(transform.x)}px`
								: undefined,
							'--translate-y': transform
								? `${Math.round(transform.y)}px`
								: undefined,
							'--scale-x': transform?.scaleX
								? `${transform.scaleX}`
								: undefined,
							'--scale-y': transform?.scaleY
								? `${transform.scaleY}`
								: undefined,
							'--index': index,
							'--color': color,
						} as React.CSSProperties
					}
					ref={ref}
				>
					<div
						className={clsx(
							styles.Item,
							dragging && styles.dragging,
							handle && styles.withHandle,
							dragOverlay && styles.dragOverlay,
							disabled && styles.disabled,
							color && styles.color,
							wrapperItemClassName
						)}
						{...(!handle ? listeners : undefined)}
						{...props}
						tabIndex={!handle ? 0 : undefined}
					>
						{actionsEnabled && (
							<div className={styles.Actions} style={{ position: 'sticky' }}>
								{onRemove ? (
									<IconButton onClick={onRemove}>
										<Close />
									</IconButton>
								) : null}
								{handle ? (
									<IconButton {...handleProps} {...listeners}>
										<DragIndicator />
									</IconButton>
								) : null}
							</div>
						)}
						<div style={style} className="w-full h-full">
							{value}
						</div>
					</div>
				</li>
			);
		}
	)
);
