import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Close, DragIndicator } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import clsx from 'clsx';

const SortableItem = ({
	id,
	children,
	onRemoveItem,
}: {
	id: string | number;
	children: React.ReactNode;
	onRemoveItem?: () => void;
}) => {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id });

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	};

	return (
		<div
			ref={setNodeRef}
			style={style}
			{...attributes}
			className={clsx('cursor-default', isDragging && 'opacity-50')}
		>
			<div>
				{!!onRemoveItem && (
					<IconButton onClick={onRemoveItem}>
						<Close />
					</IconButton>
				)}

				<IconButton {...listeners}>
					<DragIndicator />
				</IconButton>
			</div>
			<div>{children}</div>
		</div>
	);
};

export default SortableItem;
