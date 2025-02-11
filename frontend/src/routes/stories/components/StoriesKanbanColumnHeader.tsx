import { snakeCaseToTitleCase } from '../../../shared/utils';

type Props = {
	columnTitle: string;
	storiesCount: number;
};
export const StoriesKanbanColumnHeader = ({
	columnTitle,
	storiesCount,
}: Props) => {
	return (
		<h2 className="flex items-center gap-3 bg-gray-50 mx-2  py-1.5 px-2 justify-between">
			{snakeCaseToTitleCase(columnTitle)}
			<span className="text-xs flex items-center justify-center font-medium text-neutral-700 px-2 py-0.5 rounded-md bg-neutral-200">
				{storiesCount}
			</span>
		</h2>
	);
};
