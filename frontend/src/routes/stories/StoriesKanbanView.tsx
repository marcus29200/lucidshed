import { rectSortingStrategy } from '@dnd-kit/sortable';

import { Story } from './Stories';
import { MultipleContainers } from '../../components/Dndkit/MultipleContainers';

type Props = {
	stories: Story[];
};
export const StoriesKanbanView = ({ stories }: Props) => {
	const groups = {
		A: stories.filter((s) => s.status === 'not-started').map((s) => `A${s.id}`),
		B: stories.filter((s) => s.status === 'in-progress').map((s) => `B${s.id}`),
		C: stories.filter((s) => s.status === 'done').map((s) => `C${s.id}`),
	};

	return (
		<MultipleContainers
			columns={1}
			strategy={rectSortingStrategy}
			handle
			items={groups}
			containerStyle={{
				backgroundColor: 'white',
				border: '1px solid #E9EAEC',
				borderRadius: 12,
				gap: 16,
			}}
		/>
	);
};
