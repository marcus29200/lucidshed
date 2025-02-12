import { Button } from '@mui/material';
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { TableViewIcon, KanbanViewIcon } from '../../../icons/icons';
import { StoriesView } from '../stories.model';

export const StoriesViewSwitcher = ({
	id,
	onChange,
}: {
	id: string;
	onChange: (view: StoriesView) => void;
}) => {
	const userPreferredView = localStorage.getItem(id) || 'table';
	const [selectedView, setSelectedView] = useState<StoriesView>(
		userPreferredView as StoriesView
	);
	const location = useLocation();
	const navigate = useNavigate();
	const handleSelectView = (view: StoriesView) => {
		setSelectedView(view);
	};
	useEffect(() => {
		const queryParams = new URLSearchParams(location.search);
		const viewFromQuery = queryParams.get('view') as StoriesView | null;
		if (viewFromQuery && ['table', 'kanban'].includes(viewFromQuery)) {
			setSelectedView(viewFromQuery);
		} else {
			// If the query param is not valid or missing, use the stored preference
			const userPreferredView = localStorage.getItem(id) || 'table';
			setSelectedView(userPreferredView as StoriesView);
		}
	}, [location.search, id]);

	useEffect(() => {
		const queryParams = new URLSearchParams(location.search);
		queryParams.set('view', selectedView);
		navigate({ search: queryParams.toString() }, { replace: true });
		localStorage.setItem(id, selectedView);
	}, [selectedView, navigate, id]);

	useEffect(() => {
		onChange(selectedView);
	}, [selectedView]);

	return (
		<div className="flex items-center gap-4">
			<Button
				variant={selectedView === 'table' ? 'contained' : 'text'}
				color="primary"
				startIcon={<TableViewIcon />}
				onClick={() => handleSelectView('table')}
			>
				Table
			</Button>
			<Button
				variant={selectedView === 'kanban' ? 'contained' : 'text'}
				color="primary"
				startIcon={<KanbanViewIcon />}
				onClick={() => handleSelectView('kanban')}
			>
				Kanban
			</Button>
		</div>
	);
};
