import { UniqueIdentifier } from '@dnd-kit/core';

export type SortableItem = {
	id: UniqueIdentifier;
	content: React.ReactNode;
	title?: string;
};
