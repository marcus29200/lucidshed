import React, { forwardRef } from 'react';
import classNames from 'clsx';

import styles from './Container.module.css';
import { IconButton } from '@mui/material';
import { Close, DragIndicator } from '@mui/icons-material';
import {
	DraggableAttributes,
	DraggableSyntheticListeners,
} from '@dnd-kit/core';

export type ContainerProps = {
	children: React.ReactNode;
	columns?: number;
	label?: string;
	style?: React.CSSProperties;
	horizontal?: boolean;
	hover?: boolean;
	handleProps?: DraggableAttributes;
	listeners?: DraggableSyntheticListeners;
	scrollable?: boolean;
	shadow?: boolean;
	placeholder?: boolean;
	unstyled?: boolean;
	onClick?(): void;
	onRemove?(): void;
};

export const Container = forwardRef<HTMLDivElement, ContainerProps>(
	(
		{
			children,
			columns = 1,
			handleProps,
			horizontal,
			hover,
			onClick,
			onRemove,
			label,
			placeholder,
			style,
			scrollable,
			shadow,
			unstyled,
			listeners,
			...props
		}: ContainerProps,
		ref
	) => {
		return (
			<div
				{...props}
				ref={ref}
				style={
					{
						...style,
						'--columns': columns,
					} as React.CSSProperties
				}
				className={classNames(
					styles.Container,
					unstyled && styles.unstyled,
					horizontal && styles.horizontal,
					hover && styles.hover,
					placeholder && styles.placeholder,
					scrollable && styles.scrollable,
					shadow && styles.shadow
				)}
				onClick={onClick}
				tabIndex={onClick ? 0 : undefined}
			>
				{label ? (
					<div className={styles.Header}>
						{label}
						<div className={styles.Actions} style={{ marginLeft: 'auto' }}>
							{onRemove ? (
								<IconButton onClick={onRemove}>
									<Close />
								</IconButton>
							) : undefined}
							{handleProps && listeners && (
								<IconButton {...handleProps} {...listeners}>
									<DragIndicator />
								</IconButton>
							)}
						</div>
					</div>
				) : null}
				<div className="px-4 pb-6 pt-2">
					{placeholder ? children : <ul>{children}</ul>}
				</div>
			</div>
		);
	}
);
