import { Link } from 'react-router-dom';
import { Epic } from '../../epics/Epics';

type Props = {
	epic: Epic;
	orgId: string;
};
export const EpicItem = ({ epic, orgId }: Props) => {
	return (
		<div className="shadow-sm p-5 border rounded-lg relative border-neutral-regular">
			<Link
				to={`/${orgId}/epics/${epic.id}`}
				className="text-neutral-dark hover:text-neutral-regular "
			>
				<h6 className="text-left font-semibold truncate">
					#{epic.id} - {epic.name}
				</h6>
			</Link>
		</div>
	);
};
