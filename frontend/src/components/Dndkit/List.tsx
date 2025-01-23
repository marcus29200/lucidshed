import React, { forwardRef } from 'react';
import classNames from 'clsx';

import styles from './List.module.css';

export type SortableListProps = {
	children: React.ReactNode;
	columns?: number;
	style?: React.CSSProperties;
	horizontal?: boolean;
};

export const List = forwardRef<HTMLUListElement, SortableListProps>(
	({ children, columns = 1, horizontal, style }: SortableListProps, ref) => {
		return (
			<ul
				ref={ref}
				style={
					{
						...style,
						'--columns': columns,
					} as React.CSSProperties
				}
				className={classNames(styles.List, horizontal && styles.horizontal)}
			>
				{children}
			</ul>
		);
	}
);
